import sys
import os

# Add the correct directory to path
sys.path.append(os.path.join(os.getcwd(), "backend", "services"))
sys.path.append(os.path.join(os.getcwd(), "backend"))

try:
    from vlookup_service import match_scenario
except ImportError:
    # Try another path if run from backend/scratch
    sys.path.append(os.path.join(os.getcwd(), "..", "services"))
    from vlookup_service import match_scenario

import json

scenarios_path = os.path.join(os.getcwd(), "backend", "vlookup_scenarios.json")
if not os.path.exists(scenarios_path):
    scenarios_path = "../vlookup_scenarios.json"

with open(scenarios_path, 'r') as f:
    scenarios = json.load(f)

prompts = [
    "lookup anual FH & buy price",
    "lookup SPC and ESS",
    "lookup SPC and annual FH",
    "lookup anual FH & SPC",
    "lookup SPC and anual FH"
]

for p in prompts:
    matched = match_scenario(scenarios, p)
    # Find the key for this scenario
    matched_key = next(k for k, v in scenarios.items() if v == matched)
    print(f"Prompt: '{p}' -> Matched: '{matched_key}'")
