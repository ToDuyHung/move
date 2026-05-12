import requests
import json

url = "http://localhost:6767/api/analyze-task"
data = {
    "command": "Provisioning",
    "prompt": "run provisioning for current parts"
}

try:
    response = requests.post(url, data=data)
    print(f"Status: {response.status_code}")
    result = response.json()
    if result.get("status") == "success":
        report = result.get("report", {})
        print(f"Goal: {report.get('goal')}")
        print(f"Plan steps count: {len(report.get('plan', []))}")
        for i, step in enumerate(report.get('plan', [])[:5]):
            print(f"  Step {i+1}: {step.get('goal')} ({step.get('agent')})")
    else:
        print(f"Error: {result.get('message')}")
except Exception as e:
    print(f"Failed: {e}")
