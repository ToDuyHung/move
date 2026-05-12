import pandas as pd

# Load files
pn_df = pd.read_excel('/home/hungtd/Commercial Aerospace/PoC/demo/Part_Numbers.xlsx')
cap_df = pd.read_excel('/home/hungtd/Commercial Aerospace/PoC/demo/Part_Capability.xlsx')

# Clean headers
pn_df.columns = [str(c).strip() for c in pn_df.columns]
cap_df.columns = [str(c).strip() for c in cap_df.columns]

# Create lookup dict for Buy Price (Column 11 is index 11? Let's check names)
# cap_df columns: ['No', 'PNR', 'OEM', 'ATA', 'ADT', 'SPC', 'ESS', 'MTBUR', 'QPA', 'MLP', 'MLP Source', 'Buy Price', ...]
# Index 11 is 'Buy Price'

# Normalize PNs
pn_df['PN'] = pn_df['PN'].astype(str).str.strip()
cap_df['PNR'] = cap_df['PNR'].astype(str).str.strip()

# Drop duplicates in capability to simulate Excel VLOOKUP (takes first match)
cap_lookup = cap_df.drop_duplicates(subset=['PNR'])
cap_map = dict(zip(cap_lookup['PNR'], cap_lookup['Buy Price']))

total_buy_price = 0
found_count = 0
missing = []

for pn in pn_df['PN']:
    price = cap_map.get(pn, 0)
    if pn in cap_map:
        total_buy_price += float(price) if not pd.isna(price) else 0
        found_count += 1
    else:
        missing.append(pn)

print(f"Total Buy Price Sum: ${total_buy_price:,.2f}")
print(f"Parts found in Capability: {found_count} / {len(pn_df)}")
print(f"Missing parts: {len(missing)}")

# Check Aircraft Count sum
ac_sum = pn_df['Aircraft Count'].sum()
print(f"Aircraft Count Sum from Source: {ac_sum}")
