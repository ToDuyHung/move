export type FileCategory = 
  | 'partNumbers' 
  | 'partCapability' 
  | 'parameters'
  | 'inhousePoolInfo'
  | 'acrdData'
  | 'currentMbhFleet';

export interface UploadedFile {
  name: string;
  data: any;
  uploaded: boolean;
  rawFile?: File;
}

export interface UploadedFiles {
  partNumbers: UploadedFile | null;
  partCapability: UploadedFile | null;
  parameters: UploadedFile | null;
  inhousePoolInfo: UploadedFile | null;
  acrdData: UploadedFile | null;
  currentMbhFleet: UploadedFile | null;
}

export type TaskStepStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface DiagnosticIssue {
  severity: 'CRITICAL' | 'WARNING' | 'ASSUMPTION';
  message: string;
  type: string;
}

export interface ImpactSummary {
  partsProcessed: number;
  sparesRecommended: number;
  reviewRequired: number;
  coveragePercent: number;
  businessRationale?: string;
  totalBuyValue?: number;
  essMetrics?: {
    [key: string]: {
      actual: number;
      desired: number;
      status: 'Passed' | 'Failed';
      recommendation?: string;
      targetCell?: string;
      suggestedValue?: number;
    };
  };
}

export interface TaskStep {
  label: string;
  status: TaskStepStatus;
  agent?: string;
  tool?: string;
  phase?: 'Planning' | 'Modeling' | 'Validation';
  rationale?: string;
}

export interface Task {
  command: string;
  prompt: string;
  steps: TaskStep[];
  goal?: string;
  diagnostics?: DiagnosticIssue[];
  impactSummary?: ImpactSummary;
}

export interface SpreadsheetRange {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

export type RangeStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface AiEditPreviewState {
  range: SpreadsheetRange | null;
  status: RangeStatus;
}

export type Command =
  | 'VLOOKUP'
  | 'Provisioning'
  | 'ACRD-based Recommendation'
  | 'AI-based Recommendation'
  | 'Generate Report'
  | 'Scenario Analysis'
  | 'Fill Missing Values'
  | 'Match Part Number'
  | 'Pool Buy Scenarios';

export interface CellData {
  value: string | number;
  formula?: string;
  stepLabel?: string;
}

export interface SheetData {
  name: string;
  data: CellData[][];
}

export interface WorkbookData {
  sheets: SheetData[];
  activeSheetIndex: number;
}
