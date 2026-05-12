import pandas as pd
import sys
import os

def verify_mlp():
    file_path = '/home/hungtd/Commercial Aerospace/PoC/Part_Numbers.xlsx'
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return

    try:
        # Read the file
        df = pd.read_excel(file_path)
        
        # Get column 7 (index 6)
        # Assuming headers are in row 0
        if len(df.columns) < 7:
            print(f"Error: File only has {len(df.columns)} columns.")
            return
            
        mlp_col = df.iloc[:, 6]
        header_name = df.columns[6]
        
        print(f"File: {os.path.basename(file_path)}")
        print(f"Column 7 Name: '{header_name}'")
        print(f"Total Rows: {len(df)}")
        
        # Clean and convert to numeric
        numeric_vals = pd.to_numeric(mlp_col, errors='coerce').fillna(0)
        total_sum = numeric_vals.sum()
        
        print(f"\n--- Statistics ---")
        print(f"Total Sum: {total_sum:,.2f}")
        print(f"Average: {numeric_vals.mean():,.2f}")
        print(f"Max: {numeric_vals.max():,.2f}")
        print(f"Min: {numeric_vals.min():,.2f}")
        
        print(f"\n--- Top 10 Highest Values ---")
        top_10 = df.copy()
        top_10['MLP_Numeric'] = numeric_vals
        top_10 = top_10.sort_values(by='MLP_Numeric', ascending=False).head(10)
        
        # Find PN column (index 0 usually)
        pn_col_name = df.columns[0]
        
        for idx, row in top_10.iterrows():
            print(f"Row {idx+2}: PN={row[pn_col_name]}, Value={row['MLP_Numeric']:,.2f}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    verify_mlp()
