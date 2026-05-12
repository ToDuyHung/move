import pandas as pd
import os

files = ["Part Numbers.xlsx", "Part Capability.xlsx"]
demo_path = "/home/hungtd/Commercial Aerospace/PoC/demo"

for f in files:
    path = os.path.join(demo_path, f)
    print(f"\n--- {f} ---")
    try:
        xl = pd.ExcelFile(path, engine='openpyxl')
        for sheet_name in xl.sheet_names:
            df = xl.parse(sheet_name)
            print(f"  Sheet: {sheet_name}")
            print(f"  Headers: {df.columns.tolist()}")
    except Exception as e:
        print("Error:", e)
