def generate_vlookup_workbooks(files_data: Dict[str, List[List[Any]]], prompt: str, auto_fix: Optional[Dict[str, Any]] = None, command: Optional[str] = None):
    """
    Generates preview and export WorkbookData based on scenarios defined in vlookup_scenarios.json.
    """
    # 1. Apply auto_fix if provided
    if auto_fix and 'parameters' in files_data:
        try:
            cell = auto_fix.get("cell", "")
            val = auto_fix.get("value")
            if cell and val is not None:
                match = re.match(r"([A-Z]+)(\d+)", cell)
                if match:
                    col_str, row_str = match.groups()
                    col_idx = 0
                    for char in col_str:
                        col_idx = col_idx * 26 + (ord(char) - ord('A'))
                    row_idx = int(row_str) - 1
                    files_data['parameters'][row_idx][col_idx] = val
                    print(f"DEBUG: Applied auto-fix to {cell}: set value to {val}")
        except Exception as e:
            print(f"DEBUG: Failed to apply auto-fix: {e}")

    # 2. Scenario Analysis Parameter Parsing
    pl_params = {}
    if command == "Pool Buy Scenarios":
        try:
            ip_matches = re.findall(r"IP(\d+):\s*([\d,\s]+)", prompt, re.IGNORECASE)
            for ip_num, values_str in ip_matches:
                vals = [float(v.strip()) / 100.0 for v in values_str.split(",") if v.strip().isdigit()]
                if vals:
                    pl_params[f"PL{ip_num}"] = vals
                    print(f"DEBUG POOL BUY: Detected PL{ip_num} -> {vals}")
        except Exception as e:
            print(f"DEBUG POOL BUY: Error parsing prompt: {e}")

    # 3. Load Scenarios and Match
    scenarios = load_scenarios()
    if command and command in scenarios:
        scenario = json.loads(json.dumps(scenarios[command]))
    else:
        scenario = match_scenario(scenarios, prompt)
    
    # 4. Dynamic Column Reordering based on Prompt
    prompt_lower = prompt.lower()
    cols = scenario["target_columns"]
    fixed_cols = [cols[0]] if cols and cols[0]["type"] == "source" else []
    remaining_cols = cols[1:] if fixed_cols else cols
    for col in remaining_cols:
        header = col["header"].lower()
        pos = 9999
        search_terms = [header]
        if "annual fh" in header: search_terms.extend(["annual", "fh"])
        if "buy price" in header: search_terms.extend(["buy", "price"])
        for term in search_terms:
            idx = prompt_lower.find(term)
            if idx != -1 and idx < pos: pos = idx
        col["_pos"] = pos
    remaining_cols.sort(key=lambda x: x["_pos"])
    scenario["target_columns"] = fixed_cols + remaining_cols

    # 5. Data Preparation
    source_file_key = scenario["source_file"]
    source_data = files_data.get(source_file_key)
    if not source_data: raise ValueError(f"Source file '{source_file_key}' not provided")
    source_headers = [str(h).strip() for h in source_data[0]]
    
    sheet_name_map = {"partNumbers": "PartNumbers", "partCapability": "PartCapability", "parameters": "Parameters"}
    result_headers = [
        CellData(value=col["header"], stepLabel=col.get("step_label"), agent=col.get("agent"), tool=col.get("tool"), phase=col.get("phase")) 
        for col in scenario["target_columns"]
    ]
    result_preview_data = [result_headers]
    result_export_data = [result_headers]

    # 6. Build Lookup Cache
    lookup_info = []
    for col in scenario["target_columns"]:
        # (Standard lookup preparation logic omitted for brevity in this scratch, but implemented in main file)
        # For simplicity in this rewrite, we'll keep it standard.
        lookup_info.append({"type": col["type"]}) # Minimal placeholder

    # --- Pre-calculate Scenario Cache (Optimized with correct headers) ---
    cap_lookup_cache = {} # PN -> {ESS, MTBUR, QPA, TAT, SPC}
    cap_data = files_data.get('partCapability')
    if cap_data and len(cap_data) > 1:
        c_headers = [str(h).strip().upper() for h in cap_data[0]]
        # CORRECT HEADERS from inspection: PNR, SPC, ESS, MTBUR, QPA, SPT
        pn_idx = get_column_index(c_headers, "PNR")
        ess_idx = get_column_index(c_headers, "ESS")
        mtbur_idx = get_column_index(c_headers, "MTBUR")
        qpa_idx = get_column_index(c_headers, "QPA")
        tat_idx = get_column_index(c_headers, "SPT")
        spc_idx = get_column_index(c_headers, "SPC")
        
        for r in cap_data[1:]:
            if len(r) > pn_idx and pn_idx != -1:
                c_pn = str(r[pn_idx]).strip()
                if c_pn.endswith(".0"): c_pn = c_pn[:-2]
                cap_lookup_cache[c_pn] = {
                    "ESS": str(r[ess_idx]).strip() if ess_idx != -1 else "ESS1",
                    "MTBUR": clean_num(r[mtbur_idx]) if mtbur_idx != -1 else 100000,
                    "QPA": clean_num(r[qpa_idx]) if qpa_idx != -1 else 1,
                    "TAT": clean_num(r[tat_idx]) if tat_idx != -1 else 30,
                    "SPC": clean_num(r[spc_idx]) if spc_idx != -1 else 1
                }

    # 7. Generate Rows
    for i in range(1, len(source_data)):
        source_row = source_data[i]
        preview_row = []
        export_row = []
        row_index_in_excel = i + 1
        
        for col_idx, col_config in enumerate(scenario["target_columns"]):
            if col_config["type"] == "source":
                s_idx = get_column_index(source_headers, col_config.get("column", ""))
                val = source_row[s_idx] if s_idx != -1 and s_idx < len(source_row) else ""
                preview_row.append(CellData(value=val))
                export_row.append(CellData(value=val))
            
            elif col_config["type"] == "constant":
                val = col_config.get("value", 0)
                preview_row.append(CellData(value=val))
                export_row.append(CellData(value=val))

            elif col_config["type"] == "scenario_qty":
                try:
                    pn_val = str(preview_row[0].value).strip()
                    if pn_val.endswith(".0"): pn_val = pn_val[:-2]
                    pl_key = col_config.get("pl_key", "PL1")
                    current_pl_set = pl_params.get(pl_key, [0.98, 0.94, 0.90])
                    
                    fh_val = clean_num(source_row[get_column_index(source_headers, "Annual FH")])
                    rri_val = clean_num(source_row[get_column_index(source_headers, "RRI")])
                    ac_val = clean_num(source_row[get_column_index(source_headers, "Aircraft Count")])
                    
                    cap_info = cap_lookup_cache.get(pn_val, {"ESS": "ESS1", "MTBUR": 100000, "QPA": 1, "TAT": 30, "SPC": 1})
                    
                    # Poisson Formula
                    mtbur_final = cap_info["MTBUR"] if cap_info["MTBUR"] > 0 else 100000
                    dann = (fh_val * cap_info["QPA"] * ac_val) / (mtbur_final * (10 ** rri_val))
                    lambda_val = (dann * (cap_info["TAT"] + 18)) / 365
                    
                    ess_str = cap_info["ESS"].upper()
                    p_idx = 1 if "ESS2" in ess_str else (2 if "ESS3" in ess_str else 0)
                    target_pl = current_pl_set[p_idx] if p_idx < len(current_pl_set) else current_pl_set[-1]
                    
                    qty_result = 0
                    if lambda_val > 0:
                        cdf, pmf = 0.0, math.exp(-lambda_val)
                        for n in range(101):
                            cdf += pmf
                            if round(cdf, 3) >= target_pl:
                                qty_result = n
                                break
                            pmf = pmf * lambda_val / (n + 1)
                    preview_row.append(CellData(value=int(qty_result)))
                    export_row.append(CellData(value=int(qty_result)))
                except:
                    preview_row.append(CellData(value=0))
                    export_row.append(CellData(value=0))
            
            elif col_config["type"] == "vlookup":
                # Simplified vlookup for this command
                l_file = col_config.get("lookup_file")
                l_data = files_data.get(l_file)
                found_val = "N/A"
                if l_data:
                    search_key = str(preview_row[0].value).strip()
                    if search_key.endswith(".0"): search_key = search_key[:-2]
                    # Direct lookup from cache for efficiency if it's Capability
                    if l_file == "partCapability":
                        found_val = cap_lookup_cache.get(search_key, {}).get("Grp A,B,C", "C- Others")
                preview_row.append(CellData(value=found_val))
                export_row.append(CellData(value=found_val))

        result_preview_data.append(preview_row)
        result_export_data.append(export_row)

    # 8. Final Summary and Workbook Construction
    impact_summary = {"partsProcessed": len(result_preview_data) - 1, "columnSums": {}, "status": "success"}
    print(f"\n--- Summary for scenario: {prompt} ---")
    for c_idx in range(len(result_preview_data[0])):
        h_name = str(result_preview_data[0][c_idx].value).upper()
        if h_name in ["PN", "FAM CLASS"]: continue
        total = 0.0
        is_num = False
        for r_idx in range(1, len(result_preview_data)):
            try:
                v = str(result_preview_data[r_idx][c_idx].value).replace(",", "")
                total += float(v)
                is_num = True
            except: pass
        if is_num:
            impact_summary["columnSums"][h_name] = total
            print(f"- Sum of {h_name}: {total:,.2f}")

    preview_sheets = [SheetData(name="VLOOKUP_Result", data=result_preview_data)]
    export_sheets = [SheetData(name="VLOOKUP_Result", data=result_export_data)]
    return WorkbookData(sheets=preview_sheets, activeSheetIndex=0), WorkbookData(sheets=export_sheets, activeSheetIndex=0), impact_summary
