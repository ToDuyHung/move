from pydantic import BaseModel
from typing import List, Union, Optional, Any, Dict

class CellData(BaseModel):
    value: Union[str, int, float, bool, None] = ""
    formula: Optional[str] = None
    stepLabel: Optional[str] = None
    agent: Optional[str] = None
    tool: Optional[str] = None
    phase: Optional[str] = None

class SheetData(BaseModel):
    name: str
    data: List[List[CellData]]

class WorkbookData(BaseModel):
    sheets: List[SheetData]
    activeSheetIndex: int = 0

class TaskResponse(BaseModel):
    status: str
    command: str
    prompt: str
    resultWorkbookForPreview: Optional[WorkbookData] = None
    resultWorkbookForExport: Optional[WorkbookData] = None
    diagnostics: Optional[List[Dict[str, Any]]] = None
    impactSummary: Optional[Dict[str, Any]] = None
    errorMessage: Optional[str] = None
