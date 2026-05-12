import sys
import os
import pandas as pd
import math

# Add parent directory to path to import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.vlookup_service import generate_vlookup_workbooks

def test_pool_buy_calculation():
    print("--- Testing Pool Buy Scenarios Calculation ---")
    
    # 1. Load Data from Excel files
    files_to_load = {
        "partNumbers": "../demo/Part_Numbers.xlsx",
        "partCapability": "../demo/Part Capability.xlsx",
        "parameters": "../demo/Parameters.xlsx"
    }
    
    files_data = {}
    for key, path in files_to_load.items():
        try:
            df = pd.read_excel(path)
            # Convert to List[List[Any]] format that the service expects
            headers = df.columns.tolist()
            rows = df.values.tolist()
            files_data[key] = [headers] + rows
            print(f"Loaded {key}: {len(rows)} rows")
        except Exception as e:
            print(f"Error loading {key}: {e}")
            return

    # 2. Mock Command and Prompt
    command = "Pool Buy Scenarios"
    prompt = "Analyze pool buy with IP1: 98,93,90"
    
    print(f"\nExecuting command: {command}")
    print(f"Prompt: {prompt}")

    # 3. Call Service (Returns preview_wb, export_wb, impact_summary)
    result_wb, export_wb, summary = generate_vlookup_workbooks(files_data, prompt=prompt, command=command)
    
    # 4. Extract Result Data (Sheet 1)
    if not result_wb.sheets:
        print("Error: No sheets generated")
        return
        
    print("\n--- Final Column Sums for Verification ---")
    headers = [h.value for h in result_wb.sheets[-1].data[0]]
    rows = result_wb.sheets[-1].data[1:]
    
    for col_idx, h_text in enumerate(headers):
        total = 0.0
        is_numeric = False
        for r in rows:
            v = r[col_idx].value
            try:
                num = float(str(v).replace(",", "").replace("$", ""))
                total += num
                is_numeric = True
            except: pass
        
        if is_numeric:
            print(f"> SUM OF '{h_text}': {total:,.2f}")

    print("--- Test Completed ---")

if __name__ == "__main__":
    test_pool_buy_calculation()
