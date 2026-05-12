from typing import List, Any, Tuple

import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def detect_columns(source_data: List[List[Any]], prompt: str) -> Tuple[int, List[int]]:
    """
    Detects the indices of 'PN' and target columns using OpenAI LLM.
    Returns (pn_index, [target_indices]).
    """
    if not source_data or len(source_data) == 0:
        return 0, [1]
        
    header_row = [str(h).strip() for h in source_data[0]]
    
    system_prompt = """
    You are an AI assistant helping with spreadsheet column detection.
    Given a list of column headers and a user prompt, identify:
    1. The index of the 'Part Number' (PN) column.
    2. A list of indices for any other columns the user wants to 'lookup', 'extract', or 'find'.
    
    Return ONLY a JSON object with the following keys:
    {
        "pn_index": int,
        "target_indices": [int, int, ...]
    }
    
    If you cannot find a clear match for any target column, return an empty list for "target_indices".
    If you cannot find a PN column, use 0 as default for "pn_index".
    Indices are 0-indexed.
    """
    
    user_content = f"Headers: {header_row}\nUser Prompt: {prompt}"
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        pn_idx = result.get("pn_index", 0)
        target_indices = result.get("target_indices", [])
        
        return pn_idx, target_indices
        
    except Exception as e:
        print(f"LLM Error: {e}")
        return 0, []
