# Aerospace Provisioning & Pool Buy Copilot - Technical Documentation

Build a modern web application that allows users to generate and manipulate XLSX files via a chatbot interface, while showing a spreadsheet-like XLSX viewer on the main canvas. This application is specifically optimized for Commercial Aerospace Initial Provisioning (IP) and Pool Buy Scenario modeling.

## GENERAL PRODUCT IDEA
- **AI-Assisted Spreadsheet Workspace**: Users upload source XLSX files, select a command (Provisioning, Pool Buy, etc.), and the AI engine processes the request with deterministic accuracy.
- **Dual-Zone UI**:
  1. **Large Spreadsheet Workspace**: Interactive grid on the left for data visualization.
  2. **Assistant Sidebar**: Chatbot and real-time Technical Activity Log on the right.

## CORE WORKFLOWS

### 1. Provisioning (Legacy Logic)
- **Modular Pipeline**: Executes a 30+ column automated workflow based on legacy Excel formulas.
- **Formula Resolution**: Supports nested `VLOOKUP` inside `IF` conditions for status checks (e.g., `IF(Deviation > VLOOKUP(...), "Re-Calculate", "OK")`).
- **TAT Logic**: Implements `SPT + 11 + 7` (18-day overhead) across all rows.
- **ESS Metrics**: Calculates fill rates for ESS1 (98%), ESS2 (95%), and ESS3 (92%) with automated "Auto-fix" recommendations if targets are missed.

### 2. Pool Buy Scenarios (Deterministic Poisson)
- **Parameter Injection**: Dynamically parses prompt inputs for IP targets (e.g., `IP1: 98,93,90`).
- **Strict ESS Mapping**: Maps ESS values ("1", "2", "3" or "ESS1", "ESS2", "ESS3") to specific protection level targets.
- **Mathematical Ground Truth**: Achieves a deterministic **1,025-unit** target for standard datasets by utilizing a Poisson CDF model rounded to exactly 2 decimal places.
- **Logic**: `Qty = n where CDF(n, Lambda) >= (Target PL - MAD)`.

### 3. ACRD-based Recommendation (In-house Pool)
- **Fuzzy File Matching**: Detects lookup files using substring matching (e.g., matching `Part_Numbers.xlsx` to `partNumbers` scenario key).
- **ACRD Replacement Logic**:
  - Identifies replacement Part Numbers (PNs) from `ACRD.xlsx` (Requested PN in Col 0 -> Replacement PN in Col 2).
  - **Adjusted Total Calculation**: `(Original FA PN Qty) + (Sum of FA PN Qty of all replacements)`.
- **FamClass Lookups**: Utilizes FAM Class from `Part_Numbers` to perform auxiliary lookups in `Inhouse Pool Info`.

## BACKEND ARCHITECTURE (FASTAPI)

### Scenario-Based Engine (`vlookup_scenarios.json`)
Driven by a declarative JSON configuration, allowing for complex multi-step pipelines without modifying core Python code.

### High-Performance Lookups
- **Pre-built Dictionaries**: Builds memory-mapped maps (`pool_qty_map`, `acrd_map`, `cap_lookup_cache`) before the row-processing loop to achieve **O(1)** lookup performance.
- **Data Normalization**: `normalize_key` function strips spaces, underscores, hyphens, and extensions to ensure reliable cross-file references.

### UI-Backend Synchronization Contract
- **Metadata-Rich Headers**: Backend injects `stepLabel`, `agent`, and `tool` metadata into the header row's `CellData`.
- **Tick Mark Logic**: The UI (`AssistantSidebar.tsx`) matches the `stepLabel` from the header cell to the initial execution plan.
- **Completion Hook**: UI hardcodes a check for `Calculate Recommended Qty` to trigger the "Analysis Completed" state and transition the Spares card to "Verified".

## UI/UX FEATURES

### Spreadsheet Viewer
- **Dynamic Column Generator**: Supports infinite horizontal scaling (A, B, C... AA, AB... etc.).
- **Visual Feedback**: Pulsing gradient overlays indicate which column the AI is currently calculating.
- **Auto-Formatting**:
  - **Prices**: Round to 2 decimals with "$" symbol.
  - **Percentages**: Formatted as `XX.X%` (e.g., Actual P.L.).
  - **High-Precision**: Demand and TRT metrics use 4-5 decimal places for auditability.

### Assistant Sidebar
- **Business Rationale Section**: Displays ESS fill rate cards and Total Spares Units.
- **Technical Activity Log**: A real-time, mono-spaced log showing which Agent (Data Mapping, Policy, Analytics) and Tool (CrossRef_Engine, Poisson_Engine) is currently active.

## TECHNICAL STACK
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide icons.
- **Backend**: Python 3.9+, FastAPI, Pandas, Openpyxl, Math (Poisson).
- **Configuration**: JSON-driven scenario architecture.
