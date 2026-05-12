import pandas as pd
import os

files = ["Part Numbers.xlsx", "Part Capability.xlsx"]
demo_path = "/home/hungtd/Commercial Aerospace/PoC/demo"

for f in files:
    path = os.path.join(demo_path, f)
    try:
        xl = pd.ExcelFile(path, engine='openpyxl')
        for sheet_name in xl.sheet_names:
            df = xl.parse(sheet_name)
            for col in df.columns:
                if "FH" in str(col).upper() or "ANNUAL" in str(col).upper():
                    print(f"Found in {f} -> {sheet_name}: {col}")
    except: pass
