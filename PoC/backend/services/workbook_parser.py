import pandas as pd
import io
from typing import List, Any

def parse_excel_file(file_bytes: bytes) -> List[List[Any]]:
    """
    Parses the first sheet of an Excel file and returns it as a 2D array.
    Optimized for speed by using pandas with minimal processing.
    """
    try:
        # Using pd.read_excel with engine='openpyxl' is default, 
        # but we can try to optimize by reading into memory once
        with io.BytesIO(file_bytes) as bio:
            df = pd.read_excel(bio, header=None)
            df = df.fillna("")
            return df.values.tolist()
    except Exception as e:
        print(f"Error parsing excel file: {e}")
        return []

def parse_excel_headers(file_bytes: bytes) -> List[Any]:
    """
    EXTREMELY FAST: Reads only the header row of an Excel file.
    Used for the planning/analysis phase to avoid 'Thinking' delays.
    """
    try:
        with io.BytesIO(file_bytes) as bio:
            # nrows=1 ensures we only read the first row
            df = pd.read_excel(bio, header=None, nrows=1)
            if not df.empty:
                return df.iloc[0].fillna("").tolist()
            return []
    except Exception as e:
        print(f"Error parsing headers: {e}")
        return []
