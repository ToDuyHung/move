from fastapi import FastAPI, UploadFile, Form, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import Optional

from models.task_models import TaskResponse
from services.workbook_parser import parse_excel_file
from services.column_detection import detect_columns
from services.vlookup_service import (
    generate_vlookup_workbooks, 
    generate_fallback_workbooks,
    load_scenarios,
    match_scenario,
    TaskAnalyzer
)

app = FastAPI(title="CAAI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/task", response_model=TaskResponse)
async def execute_task(
    command: str = Form(...),
    prompt: str = Form(...),
    partNumbersFile: Optional[UploadFile] = File(None),
    partCapabilityFile: Optional[UploadFile] = File(None),
    parametersFile: Optional[UploadFile] = File(None),
    inhousePoolFile: Optional[UploadFile] = File(None),
    acrdDataFile: Optional[UploadFile] = File(None),
    currentMbhFleetFile: Optional[UploadFile] = File(None),
    autoFix: Optional[str] = Form(None)
):
    try:
        files_data = {}
        if partNumbersFile:
            files_data['partNumbers'] = parse_excel_file(await partNumbersFile.read())
        if partCapabilityFile:
            files_data['partCapability'] = parse_excel_file(await partCapabilityFile.read())
        if parametersFile:
            files_data['parameters'] = parse_excel_file(await parametersFile.read())
        if inhousePoolFile:
            files_data['inhousePoolInfo'] = parse_excel_file(await inhousePoolFile.read())
        if acrdDataFile:
            files_data['acrdData'] = parse_excel_file(await acrdDataFile.read())
        if currentMbhFleetFile:
            files_data['currentMbhFleet'] = parse_excel_file(await currentMbhFleetFile.read())
            
        auto_fix_obj = None
        if autoFix:
            import json
            auto_fix_obj = json.loads(autoFix)

        if command in ['VLOOKUP', 'Provisioning', 'ACRD-based Recommendation', 'AI-based Recommendation', 'Pool Buy Scenarios']:
            # Use the multi-file vlookup logic
            preview_wb, export_wb, impact_summary = generate_vlookup_workbooks(files_data, prompt, auto_fix=auto_fix_obj, command=command)
        else:
            preview_wb, export_wb = generate_fallback_workbooks(command, prompt)
            impact_summary = None
            
        return TaskResponse(
            status="completed",
            command=command,
            prompt=prompt,
            resultWorkbookForPreview=preview_wb,
            resultWorkbookForExport=export_wb,
            impactSummary=impact_summary
        )
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return TaskResponse(
            status="failed",
            command=command,
            prompt=prompt,
            errorMessage=str(e)
        )

@app.post("/api/analyze-task")
async def analyze_task(
    command: str = Form(...),
    prompt: str = Form(...),
    partNumbersFile: Optional[UploadFile] = File(None),
    partCapabilityFile: Optional[UploadFile] = File(None),
    parametersFile: Optional[UploadFile] = File(None),
    inhousePoolFile: Optional[UploadFile] = File(None),
    acrdDataFile: Optional[UploadFile] = File(None),
    currentMbhFleetFile: Optional[UploadFile] = File(None)
):
    try:
        from services.workbook_parser import parse_excel_headers
        files_headers = {}
        if partNumbersFile:
            files_headers['partNumbers'] = [parse_excel_headers(await partNumbersFile.read())]
        if partCapabilityFile:
            files_headers['partCapability'] = [parse_excel_headers(await partCapabilityFile.read())]
        if parametersFile:
            files_headers['parameters'] = [parse_excel_headers(await parametersFile.read())]
        if inhousePoolFile:
            files_headers['inhousePoolInfo'] = [parse_excel_headers(await inhousePoolFile.read())]
        if acrdDataFile:
            files_headers['acrdData'] = [parse_excel_headers(await acrdDataFile.read())]
        if currentMbhFleetFile:
            files_headers['currentMbhFleet'] = [parse_excel_headers(await currentMbhFleetFile.read())]
            
        scenarios = load_scenarios()
        if command and command in scenarios:
            scenario = scenarios[command]
        else:
            scenario = match_scenario(scenarios, prompt)
        
        analyzer = TaskAnalyzer(files_headers, scenario)
        report = analyzer.analyze()
        
        return {
            "status": "success",
            "report": report
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=6767, reload=True)
