import re
import math

def poisson_helper(x, mean, cumulative):
    try:
        x = int(float(x))
        mean = float(mean)
        if mean <= 0: return 0
        if cumulative:
            cdf = 0.0
            term = math.exp(-mean)
            for i in range(x + 1):
                cdf += term
                term = term * mean / (i + 1)
            return cdf
        else:
            return (math.exp(-mean) * (mean**x)) / math.factorial(x)
    except: return 0

def test_eval(template, preview_row, lookup_dict):
    eval_expr = template.replace(";", ",")
    
    # Simulate the VLOOKUP replacement logic
    if "VLOOKUP" in eval_expr:
        # Scenario: VLOOKUP({D}*1, Parameters!$F$1:$G$4, 2, FALSE)
        # We need to find {D} in the template to know which column to use
        # In the real code we use preview_row[3]
        key_val = str(preview_row[3]).strip()
        if key_val.endswith(".0"): key_val = key_val[:-2]
        lookup_res = lookup_dict.get(key_val, 0)
        
        print(f"Lookup Key: {key_val}, Result: {lookup_res}")
        
        eval_expr = re.sub(r'VLOOKUP\s*\(\s*\{D\}\s*\*1\s*,[^,]+,\s*[^,]+,\s*[^)]+\)', str(lookup_res), eval_expr, flags=re.IGNORECASE)
        eval_expr = re.sub(r'VLOOKUP\s*\(\s*\{D\}\s*,[^,]+,\s*[^,]+,\s*[^)]+\)', str(lookup_res), eval_expr, flags=re.IGNORECASE)

    print(f"After VLOOKUP replacement: {eval_expr}")

    for char in re.findall(r'\{([A-Z]+)\}', template):
        col_idx_ref = ord(char) - 65
        val_ref = preview_row[col_idx_ref] if col_idx_ref < len(preview_row) else 0
        
        if isinstance(val_ref, str) and val_ref.strip() == "":
            val_to_eval = "''"
        elif isinstance(val_ref, str):
            clean_v = re.sub(r'[^\d.-]', '', val_ref)
            if clean_v:
                val_to_eval = clean_v
            else:
                val_to_eval = f"'{val_ref}'"
        else:
            val_to_eval = str(val_ref or 0)
        eval_expr = eval_expr.replace(f'{{{char}}}', val_to_eval)

    print(f"After {char} replacement: {eval_expr}")

    while "IF(" in eval_expr:
        if_match = re.search(r'IF\(([^,]+),([^,]+),([^)]+)\)', eval_expr)
        if if_match:
            cond, val_if_true, val_if_false = if_match.groups()
            cond_python = cond.replace("=", "==").replace("====", "==").replace(">== ", ">=").replace("<== ", "<=")
            val_if_true = val_if_true.strip().replace('"', "'")
            val_if_false = val_if_false.strip().replace('"', "'")
            eval_expr = eval_expr.replace(if_match.group(0), f"({val_if_true} if {cond_python} else {val_if_false})")
        else: break

    print(f"Final eval_expr: {eval_expr}")

    try:
        res = eval(eval_expr, {"__builtins__": None}, {
            "pow": pow, "round": round, "poisson": poisson_helper,
            "TRUE": True, "FALSE": False, "True": True, "False": False
        })
        return res
    except Exception as e:
        return f"Error: {e}"

# Test Data
# D is col 3, R is col 17
template = "IF({R} > VLOOKUP({D}*1, Parameters!$F$1:$G$4, 2, FALSE), \"Re-Calculate\", \"OK\")"
preview_row = [0]*30
preview_row[3] = 2 # ESS
preview_row[17] = -0.04 # Deviation
lookup_dict = {"2": 0.05} # Tolerance for ESS 2

result = test_eval(template, preview_row, lookup_dict)
print(f"RESULT: {result}")
