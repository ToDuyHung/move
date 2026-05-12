# AI Spreadsheet Chatbot - Architecture

## Overview
This application is an AI-assisted spreadsheet workspace built with React, TypeScript, and Tailwind CSS. Users can upload XLSX files, execute spreadsheet commands through a chatbot interface, and view/export results in a spreadsheet viewer.

## Component Structure

### Core Components

1. **App.tsx** - Main application container
   - Manages global state (uploaded files, workbook data, current task)
   - Coordinates data flow between components
   - Handles XLSX file parsing and export

2. **TopNav.tsx** - Navigation bar
   - Displays 4 main tabs (Provisioning, Scenario, Avail Pool Rec, IP Report)
   - Handles tab switching with active state

3. **FileToolbar.tsx** - File management toolbar
   - Contains 4 file upload slots (Fleet, Price, In-house, Part Number)
   - Export button for downloading results

4. **FileUploadChip.tsx** - Individual file upload control
   - Shows upload status with visual indicators
   - Accepts .xlsx/.xls files

5. **SpreadsheetViewer.tsx** - Excel-like grid display
   - Renders column headers (A, B, C...) and row numbers
   - Displays cell data in scrollable grid
   - Supports multiple sheets

6. **AssistantSidebar.tsx** - Right panel container
   - Houses TaskSummaryCard and ChatComposer
   - Manages chat interface layout

7. **TaskSummaryCard.tsx** - Current task display
   - Shows command pill (e.g., "VLOOKUP")
   - Displays user prompt
   - Contains TaskStepList for progress tracking

8. **TaskStepList.tsx** - Task execution progress
   - Shows step-by-step status with icons
   - Animates running steps with spinner
   - Color-coded status indicators

9. **ChatComposer.tsx** - User input interface
   - Command dropdown selector
   - Text area for natural language prompts
   - Send button with keyboard support

10. **CommandDropdown.tsx** - Command selector
    - Lists 8 available commands
    - Dropdown UI with active state highlighting

## State Management

### Main State (App.tsx)
```typescript
- activeTab: string
- uploadedFiles: UploadedFiles (4 file categories)
- selectedCommand: Command
- currentTask: Task | null
- workbookData: WorkbookData
- isProcessing: boolean
```

### State Flow
1. User uploads file → parseXLSXFile → updates uploadedFiles state
2. User selects command → updates selectedCommand
3. User submits prompt → executeTask creates Task → updates currentTask
4. Task execution simulates steps → updates task.steps statuses
5. Task completes → generateMockResultData → updates workbookData
6. Spreadsheet viewer re-renders with new data

## Data Flow

```
User Input (File Upload)
  ↓
FileUploadChip → handleFileSelect
  ↓
xlsxUtils.parseXLSXFile (parse XLSX)
  ↓
Update uploadedFiles state
  ↓
Store parsed sheet data

User Input (Chat)
  ↓
ChatComposer → handleSubmitPrompt
  ↓
executeTask (async simulation)
  ↓
Update currentTask with steps
  ↓
Simulate step execution (1.5s + 1s per step)
  ↓
generateMockResultData
  ↓
Update workbookData
  ↓
SpreadsheetViewer renders new data
```

## XLSX Handling

### Parsing (xlsxUtils.ts)
- Uses SheetJS (xlsx library)
- Reads binary file data
- Converts sheets to JSON arrays
- Maps to internal CellData structure

### Export
- Converts CellData back to arrays
- Creates workbook with XLSX.utils
- Triggers browser download

### Mock Data Generation
- Creates sample spreadsheet results
- Simulates AI processing output
- Includes headers and 15 data rows

## Task Execution System

### Mock Implementation
- Currently simulates AI processing with timeouts
- Steps progress: pending → running → completed
- Each step takes ~2.5 seconds (1.5s + 1s)
- Different commands have different step sequences

### Step Types by Command
- **VLOOKUP/HLOOKUP**: Search formula → Match values → Populate results
- **Merge**: Identify columns → Combine datasets → Validate
- **Clean Data**: Detect issues → Remove duplicates → Standardize
- **Default**: Search formula → Calculate → Analyze

## Future Backend Integration

### API Integration Points

1. **File Upload Endpoint**
   ```typescript
   POST /api/upload
   Body: FormData with file + category
   Response: { fileId, sheets }
   ```

2. **Task Execution Endpoint**
   ```typescript
   POST /api/execute
   Body: { command, prompt, fileIds[] }
   Response: { taskId }
   ```

3. **Task Status Polling**
   ```typescript
   GET /api/task/:taskId
   Response: { status, steps[], result? }
   ```

4. **Result Download**
   ```typescript
   GET /api/result/:taskId
   Response: XLSX file buffer
   ```

### LLM Integration
- Send command + prompt + file context to LLM
- LLM generates spreadsheet formulas/operations
- Backend executes operations on actual data
- Return processed workbook

### Recommended Changes for Backend
1. Replace `executeTask` with API calls
2. Use WebSocket or polling for real-time step updates
3. Store uploaded files on server with IDs
4. Stream large workbook results
5. Add authentication and file access control

## Type Definitions

All types defined in `types.ts`:
- FileCategory, UploadedFile, UploadedFiles
- TaskStep, TaskStepStatus, Task
- Command (union of 8 command strings)
- CellData, SheetData, WorkbookData

## Styling

- Tailwind CSS v4 for all styling
- Color scheme:
  - Primary: Blue/Indigo (bg-blue-600)
  - Success: Green (text-green-600)
  - Neutral: Gray scale
- Rounded corners (rounded-lg, rounded-xl, rounded-full)
- Subtle shadows for depth
- Hover states for interactivity

## Future Enhancements

1. **Spreadsheet Features**
   - Cell editing
   - Formula support
   - Multiple sheet tabs
   - Cell selection/highlighting
   - Copy/paste

2. **File Management**
   - File preview before upload
   - Remove/replace files
   - File validation

3. **Chat History**
   - Save previous tasks
   - Task history panel
   - Re-run past commands

4. **Advanced Commands**
   - Custom formulas
   - Pivot tables
   - Charts and visualizations
   - Data validation rules

5. **Collaboration**
   - Share workbooks
   - Real-time collaboration
   - Comments and annotations
