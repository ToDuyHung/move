import pandas as pd
import os

path = "/home/hungtd/Commercial Aerospace/PoC/demo/Part Capability.xlsx"
try:
    xl = pd.ExcelFile(path, engine='openpyxl')
    for sheet_name in xl.sheet_names:
        df = xl.parse(sheet_name)
        # Search all cells
        mask = df.apply(lambda x: x.astype(str).str.contains("Annual|FH", case=False, na=False))
        if mask.any().any():
            print(f"Found match in sheet: {sheet_name}")
            # Find the location
            for col in df.columns[mask.any()]:
                rows = df.index[mask[col]]
                for r in rows:
                    print(f"  [{r}, {col}]: {df.at[r, col]}")
except Exception as e:
    print("Error:", e)
