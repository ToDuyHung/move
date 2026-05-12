import pandas as pd
import math
import re

def clean_num(v):
    if isinstance(v, (int, float)): return float(v)
    try:
        s = str(v).replace(",", "").replace("$", "").strip()
        return float(s)
    except: return 0.0

def calculate_qty(lambda_val, target_val):
    if lambda_val <= 0: return 0
    cdf = 0.0
    pmf = math.exp(-lambda_val)
    for n in range(101):
        cdf += pmf
        if round(cdf, 2) >= target_val:
            return n
        pmf = pmf * lambda_val / (n + 1)
        if pmf < 1e-12 and n > lambda_val: break
    return 0

# Load data
pn_df = pd.read_excel('/home/hungtd/Commercial Aerospace/PoC/demo/Part_Numbers.xlsx')
cap_df = pd.read_excel('/home/hungtd/Commercial Aerospace/PoC/demo/Part_Capability.xlsx')
param_df = pd.read_excel('/home/hungtd/Commercial Aerospace/PoC/demo/Parameters.xlsx', header=None)

# Pre-build lookup for Cap
cap_dict = {}
for _, row in cap_df.iterrows():
    pnr = str(row['PNR']).strip()
    cap_dict[pnr] = row

# Pre-build lookup for Params
pl_dict = {}
for r in range(8, 11): # B9:C11
    k = str(param_df.iloc[r, 1]).strip()
    v = param_df.iloc[r, 2]
    pl_dict[k] = v

mad_dict = {}
for r in range(8, 11): # B9:D11
    k = str(param_df.iloc[r, 1]).strip()
    v = param_df.iloc[r, 3]
    mad_dict[k] = v

tol_dict = {}
for r in range(1, 4): # F1:G4
    k = str(param_df.iloc[r, 5]).strip()
    if k.endswith('.0'): k = k[:-2]
    v = param_df.iloc[r, 6]
    tol_dict[k] = v

print("Testing first 5 rows:")
for i in range(min(5, len(pn_df))):
    row_pn = pn_df.iloc[i]
    pn = str(row_pn['PN']).strip()
    fh = clean_num(row_pn['Annual FH'])
    rri = clean_num(row_pn['RRI'])
    count = clean_num(row_pn['Aircraft Count'])
    
    cap = cap_dict.get(pn)
    if cap is None:
        print(f"Row {i}: {pn} not found in Capability")
        continue
        
    spc = clean_num(cap['SPC'])
    ess = str(cap['ESS']).strip()
    if ess.endswith('.0'): ess = ess[:-2]
    qpa = clean_num(cap['QPA'])
    mtbur = clean_num(cap['MTBUR'])
    spt = clean_num(cap['SPT'])
    
    # TAT
    tat = spt + 11 + 7
    
    # Annual Demand
    # {B}*{I}*{E}/({F}*POWER(10;{G}))
    dann = fh * count * qpa / (mtbur * (10**rri)) if mtbur > 0 else 0
    
    # Expected Demand (L)
    expected_demand = round(dann * tat / 365, 2)
    
    # Protection Level (M)
    pl = clean_num(pl_dict.get(ess, 0))
    
    # MAD (N)
    mad = clean_num(mad_dict.get(ess, 0))
    
    # Tolerance
    tol = clean_num(tol_dict.get(ess, 0))
    target = pl - tol
    
    # Qty
    qty = calculate_qty(expected_demand, target)
    
    print(f"Row {i}: PN={pn}, ESS={ess}, Dann={dann:.4f}, L={expected_demand:.4f}, PL={pl}, Tol={tol}, Target={target}, Qty={qty}")
