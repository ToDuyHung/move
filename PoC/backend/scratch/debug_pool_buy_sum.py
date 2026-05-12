import pandas as pd
import sys
import os

# Mock the clean_num function from the system
def clean_num(v):
    if isinstance(v, (int, float)): return float(v)
    try:
        s = str(v).replace(",", "").replace("$", "").strip()
        return float(s)
    except: return 0.0

def debug_pool_buy_sum():
    # We need to simulate the calculation for the 281 rows
    # I will read the Part_Numbers.xlsx for MLP (Col 7) 
    # and use the mock files for Qty calculations
    
    base_path = '/home/hungtd/Commercial Aerospace/PoC'
    part_numbers_path = os.path.join(base_path, 'Part_Numbers.xlsx')
    ip1_path = os.path.join(base_path, 'backend/mock/ip1.txt')
    ip2_path = os.path.join(base_path, 'backend/mock/ip2.txt')
    ip3_path = os.path.join(base_path, 'backend/mock/ip3.txt')
    avail_path = os.path.join(base_path, 'backend/mock/avail_pool.txt')
    
    if not all(os.path.exists(p) for p in [part_numbers_path, ip1_path, ip2_path, ip3_path, avail_path]):
        print("Missing files for simulation.")
        return

    df = pd.read_excel(part_numbers_path)
    mlp_vals = pd.to_numeric(df.iloc[:, 6], errors='coerce').fillna(0).tolist()
    
    with open(ip1_path) as f: ip1_qty = [int(float(line.strip())) for line in f if line.strip()]
    with open(ip2_path) as f: ip2_qty = [int(float(line.strip())) for line in f if line.strip()]
    with open(ip3_path) as f: ip3_qty = [int(float(line.strip())) for line in f if line.strip()]
    with open(avail_path) as f: avail_pool = [int(float(line.strip())) for line in f if line.strip()]
    
    # Simulate Column D (Aircraft Count - usually col 3 in partNumbers?)
    # Wait, in the scenario, column C is Aircraft Count. Index 2.
    ac_count = pd.to_numeric(df.iloc[:, 2], errors='coerce').fillna(0).tolist()
    
    total_val = 0
    pns = df.iloc[:, 0].astype(str).tolist()
    
    print(f"{'Row':<5} {'PN':<15} {'D':<5} {'I':<5} {'K':<5} {'M':<5} {'N':<5} {'MLP':<12} {'Buy (USD)':<15}")
    print("-" * 80)
    
    for i in range(min(len(mlp_vals), len(ip1_qty))):
        d = ac_count[i]
        f = ip3_qty[i]
        h = ip2_qty[i]
        i_val = avail_pool[i]
        
        # Column J = H - I
        j = h - i_val
        
        # Column K = IF(J<0, 0, IF(E>0, H-F, MAX(0, D-I)))
        # Wait, what is E? IP3- Adj Current Fleet only.
        # For simplicity, assume E=0 if not available or use a dummy
        e = 0 # Dummy for now
        
        k = 0
        if j < 0: k = 0
        elif e > 0: k = h - f
        else: k = max(0, d - i_val)
        
        # Column M = IF(AND(K=0, I=0, D>0), D, 0) + IF(OR(A='...', A='...'), 1, 0)
        pn = pns[i]
        m = 0
        if k == 0 and i_val == 0 and d > 0:
            m = d
        if pn in ['47145-268', '30042-0601']:
            m += 1
            
        n = k + m
        mlp = mlp_vals[i]
        buy_usd = n * mlp
        total_val += buy_usd
        
        if i < 15 or buy_usd > 1000000:
            print(f"{i+2:<5} {pn:<15} {d:<5.0f} {i_val:<5} {k:<5.0f} {m:<5.0f} {n:<5.0f} {mlp:<12,.2f} {buy_usd:<15,.2f}")

    print("-" * 80)
    print(f"TOTAL SIMULATED VALUE: ${total_val:,.2f}")

if __name__ == "__main__":
    debug_pool_buy_sum()
