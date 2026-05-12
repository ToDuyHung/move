Build a modern web application that allows users to generate and manipulate XLSX files via a chatbot interface, while showing a spreadsheet-like XLSX viewer on the main canvas.

The UI and interaction should closely follow this product concept:

GENERAL PRODUCT IDEA
- This is an AI-assisted spreadsheet workspace.
- The main experience is: user uploads source XLSX files, selects or types a spreadsheet command in a chat input, the AI processes the request, then generates or modifies spreadsheet output, and the result is reflected visually in an XLSX-like table view.
- The UI has two major zones:
  1. A large spreadsheet viewer/workspace on the left.
  2. A chatbot / task status side panel on the right.

DESIGN LANGUAGE
- Clean, minimal, modern SaaS UI.
- Soft neutral background.
- Rounded cards and pills.
- Primary brand color: blue / indigo.
- Top navigation bar uses a strong blue background.
- Components should feel lightweight, polished, and slightly enterprise-oriented.
- Use subtle shadows, clear spacing, and visual hierarchy.
- Spreadsheet should resemble a familiar Excel-like view, but does not need to implement every Excel feature.
- The visual goal is a “smart spreadsheet assistant” interface.

TOP NAVIGATION
- Add a top navigation bar spanning full width.
- Tabs:
  - Provisioning
  - Scenario
  - Avail Pool Rec
  - IP Report
- “Provisioning” is the active tab by default.
- Show tab icons if possible.
- The active tab should have a pill/outlined active state.
- Clicking tabs can change page state or route, but for MVP it is acceptable to keep a single page and only highlight the active tab.

MAIN WORKSPACE LAYOUT
- Below the top navigation bar, create a 2-column layout:
  - Left: spreadsheet area, taking around 70–75% width
  - Right: assistant sidebar, taking around 25–30% width

LEFT PANEL: FILE UPLOAD TOOLBAR
- At the top of the left panel, show a horizontal “Files:” section.
- There are exactly 4 file slots:
  1. Fleet
  2. Price
  3. In-house
  4. Part Number
- Each slot behaves like a mini upload control for an XLSX file.
- Each slot should display:
  - the file category name
  - an upload icon
  - a check icon only when a valid file is already uploaded
- Visual behavior:
  - If file is NOT uploaded:
    - text is lighter / dimmed
    - no check icon
    - upload icon is visible
  - If file IS uploaded:
    - text becomes darker/bolder
    - show a check icon
    - upload icon can still remain visible to replace the file
- Each file slot should accept .xlsx files.
- Show tooltip or label to indicate replacing file is allowed.
- Keep this toolbar compact and neat.

LEFT PANEL: EXPORT BUTTON
- On the upper right side of the left workspace toolbar, show a button:
  - Label: “Export .xlsx”
- This button exports the current spreadsheet result as an XLSX file.
- If no generated workbook exists yet, either disable the button or export the current workbook state.

LEFT PANEL: SPREADSHEET VIEWER
- Under the toolbar, render a spreadsheet-like grid.
- It should visually mimic an XLSX/Excel sheet:
  - column headers A, B, C, D...
  - row numbers 1, 2, 3...
  - visible cell gridlines
  - scrollable viewport
- For MVP, support:
  - displaying workbook content from generated/loaded sheet data
  - selecting cells
  - reading cell values
- Nice-to-have:
  - highlight active cell
  - show selected range
  - switch visible sheet if multiple sheets exist
- Default empty state:
  - show an empty sheet grid even before any file is uploaded or any command is run.
- If generated content exists, reflect it in the grid.

RIGHT PANEL: TOP TASK SUMMARY CARD
- At the top of the right sidebar, show a card that represents the current user request / current AI task.
- This card contains:
  1. A small pill label showing the chosen command, e.g. “VLOOKUP”
  2. A text area showing the full user prompt or short description of the current task
  3. A step-by-step execution status list under the description
- Example execution step list:
  - Searching for formula
  - Calculating values
  - Analyzing data
- Each step has a status icon:
  - completed step: green check icon
  - running step: loading/spinner icon
  - pending step: muted/inactive icon
  - failed step: error icon if needed
- The currently running step must animate visually.
- This card updates when the user submits a new prompt.

RIGHT PANEL: CHAT INPUT AREA
- At the bottom of the right sidebar, add a rounded chat composer box.
- The chat composer has:
  1. A dropdown / command selector at the top-left inside the box
  2. A text input area
  3. A send button at the bottom-right or right side
- The dropdown behaves similarly to slash-command selection in AI spreadsheet tools.
- Example commands:
  - VLOOKUP
  - HLOOKUP
  - Merge
  - Clean Data
  - Generate Report
  - Scenario Analysis
  - Fill Missing Values
  - Match Part Number
- The dropdown should allow selecting a command before typing.
- The input should allow freeform prompt entry.
- Example prompt:
  - “lookup current fleet”
  - “match part number from Fleet to Price and fill buy price”
  - “generate provisioning summary sheet”
- The send button submits the task.

USER FLOW
1. User uploads one or more XLSX files into the file slots.
2. User selects a command from the dropdown.
3. User types a natural language instruction.
4. User clicks send.
5. The system creates a task and displays it in the top-right task summary card.
6. The task shows execution steps and progress.
7. After processing, the spreadsheet viewer updates with the generated or modified data.
8. The user can export the result to XLSX.

FUNCTIONAL REQUIREMENTS
- Support XLSX upload for all 4 file categories.
- Store uploaded files in frontend state and/or backend.
- Parse XLSX contents so sheets can be displayed and processed.
- Maintain a workbook state for the spreadsheet viewer.
- Generate or modify workbook content based on a chatbot command.
- Display progress/status steps while a task is running.
- Allow exporting current workbook state as XLSX.

TECHNICAL PREFERENCE
- Frontend: React + TypeScript
- Styling: Tailwind CSS or equivalent
- Spreadsheet rendering: use a spreadsheet/grid library if needed, or create a custom lightweight grid for MVP
- XLSX parsing/export: use a JS XLSX library (e.g. SheetJS)
- State management: simple local state or Zustand
- Structure the code cleanly into components and hooks

RECOMMENDED COMPONENTS
- AppShell
- TopNav
- WorkspaceLayout
- FileToolbar
- FileUploadChip
- ExportButton
- SpreadsheetViewer
- AssistantSidebar
- TaskSummaryCard
- TaskStepList
- ChatComposer
- CommandDropdown

STATE MODEL
Track at least:
- activeTab
- uploadedFiles:
  - fleet
  - price
  - inHouse
  - partNumber
- selectedCommand
- userPrompt
- currentTask
- taskSteps
- workbookData
- activeSheet
- isProcessing

TASK EXECUTION BEHAVIOR
- When a user submits a command, simulate or implement an execution pipeline with step statuses:
  1. queued
  2. running step 1
  3. running step 2
  4. running step 3
  5. completed
- The UI must visibly show progress step by step.
- If backend is not available yet, create mock processing logic with time delays.

UX DETAILS
- Disabled or subdued states should be visually obvious.
- Empty states should still look intentional and polished.
- All controls should have good spacing and accessible labels.
- Use semantic naming and clean component hierarchy.

DELIVERABLES
Please:
1. Create the app structure and components.
2. Implement the UI closely matching the described layout.
3. Add mock data and mock task execution flow.
4. Implement XLSX upload, parse, preview, and export.
5. Make the right panel reactive to user input and task states.
6. Keep the code modular and production-friendly.

Also include:
- a brief explanation of the architecture
- component list
- how state flows through the app
- notes for future backend/LLM integration