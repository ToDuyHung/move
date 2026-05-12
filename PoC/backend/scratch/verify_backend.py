import requests
import os

BASE_URL = "http://localhost:6767/api/task"
DEMO_DIR = "/home/hungtd/Commercial Aerospace/PoC/demo"

def test_scenario(prompt, pn_file, cap_file=None):
    print(f"\n--- Testing Scenario: {prompt} ---")
    files = {}
    if pn_file:
        files['partNumbersFile'] = open(os.path.join(DEMO_DIR, pn_file), 'rb')
    if cap_file:
        files['partCapabilityFile'] = open(os.path.join(DEMO_DIR, cap_file), 'rb')
    
    data = {
        'command': 'VLOOKUP',
        'prompt': prompt
    }
    
    response = requests.post(BASE_URL, data=data, files=files)
    if response.status_code == 200:
        result = response.json()
        if result['status'] == 'completed':
            print("Success!")
            wb = result['resultWorkbookForPreview']
            res_sheet = next(s for s in wb['sheets'] if s['name'] == 'VLOOKUP_Result')
            print("Headers:", [c['value'] for c in res_sheet['data'][0]])
            print("Row 1:", [c['value'] for c in res_sheet['data'][1]])
            
            export_wb = result['resultWorkbookForExport']
            export_res_sheet = next(s for s in export_wb['sheets'] if s['name'] == 'VLOOKUP_Result')
            print("Formula Row 1 Col B:", export_res_sheet['data'][1][1].get('formula', 'No Formula'))
        else:
            print("Failed:", result['errorMessage'])
    else:
        print("HTTP Error:", response.status_code, response.text)

if __name__ == "__main__":
    try:
        test_scenario("lookup anual FH & buy price", "Part Numbers.xlsx")
        test_scenario("lookup SPC and ESS", "Part Numbers.xlsx", "Part Capability.xlsx")
        test_scenario("lookup SPC and annual FH", "Part Numbers.xlsx", "Part Capability.xlsx")
    except Exception as e:
        print("Error during test:", e)
