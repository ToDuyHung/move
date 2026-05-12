import sys
import os
import pandas as pd
sys.path.append(os.getcwd())
from services.pool_buy_service import generate_pool_buy_workbooks

def compare_results():
    # 1. Load Expected Values
    with open('../expected.txt', 'r') as f:
        expected = [int(float(line.strip().replace('.', ''))) for line in f if line.strip()]
    
    print(f"Total expected rows: {len(expected)}")
    print(f"Sum of expected values: {sum(expected)}")
    
    # 2. Run Backend Calculation
    files_data = {
        'partNumbers': pd.read_excel('../demo/Part_Numbers.xlsx').values.tolist(),
        'partCapability': pd.read_excel('../demo/Part Capability.xlsx').values.tolist(),
        'parameters': pd.read_excel('../demo/Parameters.xlsx').values.tolist()
    }
    # Add headers
    files_data['partNumbers'].insert(0, pd.read_excel('../demo/Part_Numbers.xlsx').columns.tolist())
    files_data['partCapability'].insert(0, pd.read_excel('../demo/Part Capability.xlsx').columns.tolist())
    files_data['parameters'].insert(0, pd.read_excel('../demo/Parameters.xlsx').columns.tolist())
    
    prompt = "Analyze pool buy with IP1: 98,93,90"
    
    res_preview, _, _ = generate_pool_buy_workbooks(files_data, prompt)
    
    # Extract Qty column (last column of the VLOOKUP_Result sheet)
    actual = []
    sheet_data = res_preview.sheets[-1].data
    for row in sheet_data[1:]:
        actual.append(int(row[-1].value))
    
    print(f"Total actual rows: {len(actual)}")
    print(f"Sum of actual values: {sum(actual)}")
    
    # 3. Compare
    diffs = []
    for i in range(min(len(expected), len(actual))):
        if expected[i] != actual[i]:
            diffs.append((i+1, expected[i], actual[i]))
            
    if diffs:
        print(f"\nFound {len(diffs)} differences:")
        for row_num, exp, act in diffs[:20]: # Show first 20 diffs
            print(f"Row {row_num}: Expected={exp}, Actual={act} (Diff={act-exp})")
        if len(diffs) > 20:
            print("...")
    else:
        print("\nAll values match perfectly!")

if __name__ == "__main__":
    compare_results()
