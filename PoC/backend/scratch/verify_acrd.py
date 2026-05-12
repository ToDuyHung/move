import sys
import os
import pandas as pd
sys.path.append(os.getcwd())
from services.vlookup_service import generate_vlookup_workbooks

def test_acrd():
    # 1. Load Data
    files_data = {
        'partNumbers': pd.read_excel('../demo/Part_Numbers.xlsx').values.tolist(),
        'inhousePoolInfo': pd.read_excel('../demo/Inhouse Pool Info.xlsx').values.tolist(),
        'acrd': pd.read_excel('../demo/ACRD.xlsx').values.tolist(),
        'partCapability': pd.read_excel('../demo/Part Capability.xlsx').values.tolist()
    }
    # Add headers
    files_data['partNumbers'].insert(0, pd.read_excel('../demo/Part_Numbers.xlsx').columns.tolist())
    files_data['inhousePoolInfo'].insert(0, pd.read_excel('../demo/Inhouse Pool Info.xlsx').columns.tolist())
    files_data['acrd'].insert(0, pd.read_excel('../demo/ACRD.xlsx').columns.tolist())
    files_data['partCapability'].insert(0, pd.read_excel('../demo/Part Capability.xlsx').columns.tolist())

    prompt = "In-house Pool Optimization"
    command = "ACRD-based Recommendation"
    
    res_preview, _, summary = generate_vlookup_workbooks(files_data, prompt, command=command)
    
    print(f"Status: {summary['status']}")
    print(f"Parts Processed: {summary['partsProcessed']}")
    print(f"Total Adjusted Pool Units: {summary['sparesRecommended']}")
    
    # Check specific PN from user example: Z014H010035C
    # Search for it in VLOOKUP_Result
    sheet_data = res_preview.sheets[-1].data
    found = False
    for row in sheet_data:
        if str(row[0].value) == "Z014H010035C":
            # Adjusted Total is at index 4 (Adjusted Total Avail Pool based on Pool Std)
            print(f"PN Z014H010035C: Adjusted Qty = {row[4].value}")
            found = True
            break
    if not found: print("PN Z014H010035C not found in result!")

if __name__ == "__main__":
    test_acrd()
