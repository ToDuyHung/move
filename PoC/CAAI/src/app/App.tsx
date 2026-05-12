import { useState, useEffect } from 'react';
import TopNav from './components/TopNav';
import FileToolbar from './components/FileToolbar';
import SpreadsheetViewer from './components/SpreadsheetViewer';
import AssistantSidebar from './components/AssistantSidebar';
import {
  FileCategory,
  UploadedFiles,
  Task,
  Command,
  WorkbookData,
  TaskStep,
  AiEditPreviewState,
} from './types';
import {
  parseXLSXFile,
  exportToXLSX,
  createEmptyWorkbook,
} from './utils/xlsxUtils';

// @ts-ignore
import provisioningAsset from '../assets/Provisioning.xlsx?url';
// @ts-ignore
import provisioning2Asset from '../assets/Provisioning (2).xlsx?url';
// @ts-ignore
import inhouseAsset from '../assets/In-house Pool Recommendation.xlsx?url';
// @ts-ignore
import poolBuyAsset from '../assets/Pool Buy Senarios.xlsx?url';

export default function App() {
  const [activeTab, setActiveTab] = useState('provisioning');
  
  // SESSION-BASED STATES
  const [uploadedFilesMap, setUploadedFilesMap] = useState<Record<string, UploadedFiles>>({
    provisioning: { partNumbers: null, partCapability: null, parameters: null, inhousePoolInfo: null, acrdData: null, currentMbhFleet: null },
    inHousePool: { partNumbers: null, partCapability: null, parameters: null, inhousePoolInfo: null, acrdData: null, currentMbhFleet: null },
    poolBuyScenarios: { partNumbers: null, partCapability: null, parameters: null, inhousePoolInfo: null, acrdData: null, currentMbhFleet: null },
  });
  
  const [currentTaskMap, setCurrentTaskMap] = useState<Record<string, Task | null>>({
    provisioning: null,
    inHousePool: null,
    poolBuyScenarios: null,
  });

  const [workbookDataMap, setWorkbookDataMap] = useState<Record<string, WorkbookData>>({
    provisioning: createEmptyWorkbook(),
    inHousePool: createEmptyWorkbook(),
    poolBuyScenarios: createEmptyWorkbook(),
  });

  const [isProcessingMap, setIsProcessingMap] = useState<Record<string, boolean>>({
    provisioning: false,
    inHousePool: false,
    poolBuyScenarios: false,
  });

  const [previewStateMap, setPreviewStateMap] = useState<Record<string, AiEditPreviewState>>({
    provisioning: { range: null, status: 'idle' },
    inHousePool: { range: null, status: 'idle' },
    poolBuyScenarios: { range: null, status: 'idle' },
  });

  const [selectedCommand, setSelectedCommand] = useState<Command>('VLOOKUP');
  const [exportWorkbookData, setExportWorkbookData] = useState<WorkbookData | null>(null);
  
  const [isResolvedMap, setIsResolvedMap] = useState<Record<string, boolean>>({
    provisioning: false,
    inHousePool: false,
    poolBuyScenarios: false,
  });

  // Auto-switch command when tab changes
  useEffect(() => {
    if (activeTab === 'provisioning') {
      setSelectedCommand('Provisioning');
    } else if (activeTab === 'inHousePool') {
      setSelectedCommand('ACRD-based Recommendation');
    } else if (activeTab === 'poolBuyScenarios') {
      setSelectedCommand('Pool Buy Scenarios');
    }
  }, [activeTab]);

  const handleFileSelect = async (category: FileCategory, file: File) => {
    try {
      const sheets = await parseXLSXFile(file);
      setUploadedFilesMap((prev) => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          [category]: {
            name: file.name,
            data: sheets,
            uploaded: true,
            rawFile: file,
          },
        }
      }));
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Failed to parse XLSX file. Please try again.');
    }
  };

  const handleExport = () => {
    let downloadUrl = '';
    let fileName = 'export.xlsx';

    if (activeTab === 'provisioning') {
      if (isResolvedMap.provisioning) {
        downloadUrl = provisioning2Asset;
        fileName = 'Provisioning (2).xlsx';
      } else {
        downloadUrl = provisioningAsset;
        fileName = 'Provisioning.xlsx';
      }
    } else if (activeTab === 'inHousePool') {
      downloadUrl = inhouseAsset;
      fileName = 'In-house Pool Recommendation.xlsx';
    } else if (activeTab === 'poolBuyScenarios') {
      downloadUrl = poolBuyAsset;
      fileName = 'Pool Buy Senarios.xlsx';
    }

    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback
      exportToXLSX(exportWorkbookData || workbookDataMap[activeTab], 'spreadsheet-export.xlsx');
    }
  };

  const executeTask = async (command: Command, prompt: string, autoFix?: { cell: string; value: number }) => {
    setIsProcessingMap(prev => ({ ...prev, [activeTab]: true }));
    setCurrentTaskMap(prev => ({
      ...prev,
      [activeTab]: {
        command,
        prompt,
        steps: [],
      }
    }));

    const scenarioName = activeTab === 'inHousePool' 
      ? 'ACRD-based Recommendation' 
      : activeTab === 'poolBuyScenarios'
        ? 'Pool Buy Scenarios'
        : 'Provisioning';

    const formData = new FormData();
    formData.append('command', scenarioName); // Use dynamic scenario name
    formData.append('prompt', prompt);
    const activeFiles = uploadedFilesMap[activeTab];
    if (activeFiles.partNumbers?.rawFile) formData.append('partNumbersFile', activeFiles.partNumbers.rawFile);
    if (activeFiles.partCapability?.rawFile) formData.append('partCapabilityFile', activeFiles.partCapability.rawFile);
    if (activeFiles.parameters?.rawFile) formData.append('parametersFile', activeFiles.parameters.rawFile);
    if (activeFiles.inhousePoolInfo?.rawFile) formData.append('inhousePoolFile', activeFiles.inhousePoolInfo.rawFile);
    if (activeFiles.acrdData?.rawFile) formData.append('acrdDataFile', activeFiles.acrdData.rawFile);
    if (activeFiles.currentMbhFleet?.rawFile) formData.append('currentMbhFleetFile', activeFiles.currentMbhFleet.rawFile);
    
    if (autoFix) {
      formData.append('autoFix', JSON.stringify(autoFix));
      setIsResolvedMap(prev => ({ ...prev, [activeTab]: true }));
    }

    try {
      // PHASE 1: Real Diagnostics & Planning
      const analysisRes = await fetch('http://localhost:6767/api/analyze-task', { method: 'POST', body: formData });
      const analysisData = await analysisRes.json();
      
      let initialSteps: TaskStep[] = [];
      if (analysisData.status === 'success') {
        const { report } = analysisData;
        initialSteps = report.plan.map((p: any) => ({
          label: p.goal,
          status: 'pending', // Initially all pending
          agent: p.agent,
          phase: p.phase
        }));
        
        setCurrentTaskMap(prev => ({
          ...prev,
          [activeTab]: {
            command,
            prompt,
            goal: report.goal,
            diagnostics: report.diagnostics,
            steps: initialSteps
          }
        }));

        const criticalIssues = report.diagnostics.filter((d: any) => d.severity === 'CRITICAL');
        if (criticalIssues.length > 0) {
          setIsProcessingMap(prev => ({ ...prev, [activeTab]: false }));
          return; // Block execution
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // PHASE 2: Execution
      const res = await fetch('http://localhost:6767/api/task', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Execution failed');
      const response = await res.json();
      
      if (response.status === 'failed') throw new Error(response.errorMessage);

      const resultSheets = response.resultWorkbookForPreview.sheets;
      setExportWorkbookData(response.resultWorkbookForExport);

      if (command === 'VLOOKUP' || command === 'Provisioning' || command === 'ACRD-based Recommendation' || command === 'Pool Buy Scenarios') {
        const resultSheet = resultSheets.find((s: any) => s.name === 'VLOOKUP_Result');
        const sourceSheet = resultSheets.find((s: any) => s.name === 'PartNumbers') || resultSheets[0];
        
        if (resultSheet && sourceSheet) {
          setWorkbookDataMap(prev => ({
            ...prev,
            [activeTab]: {
              sheets: [sourceSheet, { ...resultSheet, data: [] }],
              activeSheetIndex: 1,
            }
          }));

          const numRows = resultSheet.data.length;
          const numCols = resultSheet.data[0]?.length || 0;
          
          // Current plan state
          let currentSteps = [...initialSteps];

          for (let colIdx = 0; colIdx < numCols; colIdx++) {
            const headerCell = resultSheet.data[0][colIdx];
            const colHeader = headerCell.value as string;
            const stepLabel = headerCell.stepLabel || `Processing ${colHeader}`;
            
            // Find and update the status of the planned step
            const stepIdx = currentSteps.findIndex(s => s.label === stepLabel);
            if (stepIdx !== -1) {
              currentSteps[stepIdx].status = 'running';
              if (headerCell.agent) currentSteps[stepIdx].agent = headerCell.agent;
              if (headerCell.tool) currentSteps[stepIdx].tool = headerCell.tool;
            }

            setCurrentTaskMap(prev => ({
              ...prev,
              [activeTab]: prev[activeTab] ? ({ ...prev[activeTab]!, steps: [...currentSteps], impactSummary: response.impactSummary }) : null
            }));

            setPreviewStateMap(prev => ({
              ...prev,
              [activeTab]: {
                range: { startRow: 1, endRow: numRows, startCol: colIdx + 1, endCol: colIdx + 1 },
                status: 'running'
              }
            }));

            await new Promise(resolve => setTimeout(resolve, 800));

            setWorkbookDataMap(prev => {
              const currentTabWB = prev[activeTab];
              const newSheets = [...currentTabWB.sheets];
              const resultIdx = newSheets.findIndex(s => s.name === 'VLOOKUP_Result');
              const targetSheet = { ...newSheets[resultIdx], data: [...newSheets[resultIdx].data] };
              for (let r = 0; r < numRows; r++) {
                if (!targetSheet.data[r]) targetSheet.data[r] = [];
                targetSheet.data[r][colIdx] = resultSheet.data[r][colIdx];
              }
              newSheets[resultIdx] = targetSheet;
              return { 
                ...prev, 
                [activeTab]: { ...currentTabWB, sheets: newSheets } 
              };
            });

            // Mark step as completed
            if (stepIdx !== -1) {
              currentSteps[stepIdx].status = 'completed';
            }
            
            setCurrentTaskMap(prev => ({
              ...prev,
              [activeTab]: prev[activeTab] ? ({ ...prev[activeTab]!, steps: [...currentSteps], impactSummary: response.impactSummary }) : null
            }));
            setPreviewStateMap(prev => ({
              ...prev,
              [activeTab]: { ...prev[activeTab], status: 'completed' }
            }));
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      setCurrentTaskMap(prev => ({
        ...prev,
        [activeTab]: prev[activeTab] ? ({ 
          ...prev[activeTab]!, 
          steps: [...prev[activeTab]!.steps, { label: `Error: ${error.message}`, status: 'failed', agent: 'Planner Agent' }] 
        }) : null
      }));
    } finally {
      setIsProcessingMap(prev => ({ ...prev, [activeTab]: false }));
      setPreviewStateMap(prev => ({ ...prev, [activeTab]: { range: null, status: 'idle' } }));
    }
  };

  const handleSubmitPrompt = (prompt: string) => {
    setIsResolvedMap(prev => ({ ...prev, [activeTab]: false }));
    executeTask(selectedCommand, prompt);
  };

  const handleTryIt = (cell: string, value: number) => {
    executeTask(selectedCommand, currentTaskMap[activeTab]?.prompt || '', { cell, value });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Spreadsheet Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          <FileToolbar
            uploadedFiles={uploadedFilesMap[activeTab]}
            activeTab={activeTab}
            onFileSelect={handleFileSelect}
            onExport={handleExport}
          />
          <SpreadsheetViewer workbookData={workbookDataMap[activeTab]} previewState={previewStateMap[activeTab]} />
        </div>

        {/* Right Panel: Assistant Sidebar */}
        <div className="w-96 border-l border-gray-300">
          <AssistantSidebar
            currentTask={currentTaskMap[activeTab]}
            selectedCommand={selectedCommand}
            activeTab={activeTab}
            onCommandChange={setSelectedCommand}
            onSubmitPrompt={handleSubmitPrompt}
            onTryIt={handleTryIt}
            isProcessing={isProcessingMap[activeTab]}
          />
        </div>
      </div>
    </div>
  );
}
