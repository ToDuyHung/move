import math
from typing import List, Any

def clean_num(v):
    if isinstance(v, (int, float)): return float(v)
    try:
        s = str(v).replace(",", "").replace("$", "").strip()
        return float(s)
    except: return 0.0

def get_column_index(headers: List[Any], col_name: str) -> int:
    for i, h in enumerate(headers):
        if str(h).strip().lower() == col_name.lower(): return i
    return -1

def poisson_helper(x, mean, cumulative=True):
    try:
        if cumulative:
            cdf, term = 0.0, math.exp(-mean)
            for i in range(int(x) + 1):
                cdf += term
                term = term * mean / (i + 1)
            return cdf
        return (math.exp(-mean) * (mean**x)) / math.factorial(int(x))
    except: return 0

def normalize_key(k):
    return str(k).lower().replace(" ", "").replace("_", "").replace("-", "").replace(".xlsx", "").replace(".csv", "")
