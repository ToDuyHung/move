import pandas as pd

cap_df = pd.read_excel('/home/hungtd/Commercial Aerospace/PoC/demo/Part_Capability.xlsx')
print("Part_Capability Columns:")
for i, col in enumerate(cap_df.columns):
    print(f"{i}: {col}")

# Check for duplicate PNRs with different Buy Prices
pnrs = cap_df['PNR'].astype(str).str.strip()
prices = cap_df['Buy Price']

dupes = cap_df[pnrs.duplicated(keep=False)]
if not dupes.empty:
    print("\nFound Duplicate PNRs in Capability with their prices:")
    print(dupes[['PNR', 'Buy Price']].sort_values('PNR').head(10))

# Recalculate with a different logic? Maybe Column 11 is not Buy Price
# Column 11 (0-indexed) is index 11.
print(f"\nValue at index 11 for first row: {cap_df.iloc[0, 11]}")
print(f"Column name at index 11: {cap_df.columns[11]}")
