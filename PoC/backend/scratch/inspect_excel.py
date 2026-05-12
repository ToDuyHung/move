import pandas as pd
import os

files = ["Part Numbers.xlsx", "Part Capability.xlsx"]
demo_path = "/home/hungtd/Commercial Aerospace/PoC/demo"

for f in files:
    path = os.path.join(demo_path, f)
    print(f"\n--- {f} ---")
    try:
        df = pd.read_excel(path, engine='openpyxl')
        print("Headers:", df.columns.tolist())
        print("First 2 rows:\n", df.head(2))
    except Exception as e:
        print("Error:", e)
