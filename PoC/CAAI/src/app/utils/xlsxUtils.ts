import * as XLSX from 'xlsx';
import { SheetData, WorkbookData, UploadedFiles } from '../types';

export async function parseXLSXFile(file: File): Promise<SheetData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        const sheets: SheetData[] = workbook.SheetNames.map((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const cellData = (jsonData as any[][]).map((row) =>
            row.map((cell) => ({ value: cell ?? '' }))
          );

          return {
            name: sheetName,
            data: cellData,
          };
        });

        resolve(sheets);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
}

export function exportToXLSX(workbookData: WorkbookData, filename: string = 'export.xlsx') {
  const wb = XLSX.utils.book_new();

  workbookData.sheets.forEach((sheet) => {
    const wsData = sheet.data.map((row) => row.map((cell) => {
      if (cell.formula) {
        return { v: cell.value, f: cell.formula };
      }
      return cell.value;
    }));
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });

  XLSX.writeFile(wb, filename);
}

export function createEmptyWorkbook(): WorkbookData {
  return {
    sheets: [
      {
        name: 'Sheet1',
        data: Array(20).fill(null).map(() =>
          Array(10).fill(null).map(() => ({ value: '' }))
        ),
      },
    ],
    activeSheetIndex: 0,
  };
}

export function generateMockResultData(command: string, prompt: string): SheetData[] {
  const mockData: any[][] = [];
  mockData.push(['Part Number', 'Description', 'Price', 'Quantity', 'Total', 'Status']);
  for (let i = 1; i <= 15; i++) {
    mockData.push([
      `PN-${1000 + i}`,
      `Component ${i}`,
      (Math.random() * 1000).toFixed(2),
      Math.floor(Math.random() * 100),
      (Math.random() * 10000).toFixed(2),
      i % 3 === 0 ? 'Available' : 'In Stock',
    ]);
  }
  return [
    {
      name: 'Result',
      data: mockData.map((row) => row.map((cell) => ({ value: cell }))),
    },
  ];
}

export interface BackendResponse {
  status: string;
  command: string;
  prompt: string;
  resultWorkbookForPreview: WorkbookData;
  resultWorkbookForExport: WorkbookData;
}

export function simulateBackendProcessing(
  command: string,
  prompt: string,
  uploadedFiles: UploadedFiles
): BackendResponse {
  if (command === 'VLOOKUP') {
    // Expected behavior: read TEST.xlsx from partNumber slot
    const partNumberFile = uploadedFiles.partNumber;
    
    let sourceData: any[][] = [];
    if (partNumberFile && partNumberFile.data && partNumberFile.data.length > 0) {
      // Just take the first sheet's data
      const firstSheet = partNumberFile.data[0];
      sourceData = firstSheet.data.map((row: any) => row.map((cell: any) => cell.value));
    } else {
      // Mock source data if file is not uploaded for testing
      sourceData = [
        ['PN', 'Buy Price (USD)'],
        ['PN001', 120.5],
        ['PN002', 88.0],
      ];
    }

    // Sheet 1: Source_PartNumber
    const sourceSheetData: SheetData = {
      name: 'Source_PartNumber',
      data: sourceData.map((row) => row.map((val) => ({ value: val }))),
    };

    // Sheet 2: VLOOKUP_Result
    // Extract PN column from sourceData (assuming it's the first column)
    const resultPreviewData: any[][] = [['PN', 'Buy Price (USD)']];
    const resultExportData: any[][] = [['PN', 'Buy Price (USD)']];

    for (let i = 1; i < sourceData.length; i++) {
      const pn = sourceData[i][0] || '';
      const mockPrice = sourceData[i][1] || (Math.random() * 1000).toFixed(2);
      const rowIndex = i + 1; // 1-based index for Excel rows

      // Preview row (computed values)
      resultPreviewData.push([pn, mockPrice]);

      // Export row (formulas)
      resultExportData.push([
        { value: pn },
        { value: mockPrice, formula: `VLOOKUP(A${rowIndex},Source_PartNumber!$A:$B,2,FALSE)` }
      ]);
    }

    const previewSheetData: SheetData = {
      name: 'VLOOKUP_Result',
      data: resultPreviewData.map((row) => row.map((val) => ({ value: val }))),
    };

    const exportSheetData: SheetData = {
      name: 'VLOOKUP_Result',
      data: resultExportData.map((row) => row.map((cell) => {
        if (typeof cell === 'object' && cell !== null && 'value' in cell) {
          return cell;
        }
        return { value: cell };
      })),
    };

    return {
      status: 'completed',
      command,
      prompt,
      resultWorkbookForPreview: {
        sheets: [sourceSheetData, previewSheetData],
        activeSheetIndex: 1, // Focus on VLOOKUP_Result
      },
      resultWorkbookForExport: {
        sheets: [sourceSheetData, exportSheetData],
        activeSheetIndex: 1,
      },
    };
  }

  // Fallback for other commands
  const mockSheets = generateMockResultData(command, prompt);
  return {
    status: 'completed',
    command,
    prompt,
    resultWorkbookForPreview: {
      sheets: mockSheets,
      activeSheetIndex: 0,
    },
    resultWorkbookForExport: {
      sheets: mockSheets,
      activeSheetIndex: 0,
    },
  };
}

