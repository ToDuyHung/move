import { useEffect, useRef } from 'react';
import { WorkbookData, AiEditPreviewState } from '../types';
import AiEditPreviewRange from './AiEditPreviewRange';

interface SpreadsheetViewerProps {
  workbookData: WorkbookData;
  previewState?: AiEditPreviewState;
}

const getColumnName = (index: number) => {
  let name = '';
  while (index >= 0) {
    name = String.fromCharCode((index % 26) + 65) + name;
    index = Math.floor(index / 26) - 1;
  }
  return name;
};

export default function SpreadsheetViewer({ workbookData, previewState }: SpreadsheetViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeSheet = workbookData.sheets[workbookData.activeSheetIndex];

  useEffect(() => {
    if (previewState?.range?.startCol && scrollRef.current) {
      const CELL_WIDTH = 160;
      const ROW_HEADER_WIDTH = 48;
      const targetLeft = ROW_HEADER_WIDTH + (previewState.range.startCol - 1) * CELL_WIDTH;
      
      const containerWidth = scrollRef.current.clientWidth;
      const currentScroll = scrollRef.current.scrollLeft;
      
      if (targetLeft + CELL_WIDTH > currentScroll + containerWidth) {
        scrollRef.current.scrollTo({
          left: targetLeft + CELL_WIDTH - containerWidth + 100,
          behavior: 'smooth'
        });
      }
    }
  }, [previewState?.range?.startCol]);

  const rows = activeSheet?.data || [];
  const displayRows = rows.length > 0 ? rows : Array(20).fill(Array(10).fill({ value: '' }));
  const maxCols = Math.max(...displayRows.map(row => row.length), 10);

  const columnNames = Array.from({ length: maxCols }, (_, i) => getColumnName(i));

  const formatCellValue = (value: any, rowIndex: number, colIndex: number) => {
    if (value === undefined || value === null) return '';
    const header = displayRows[0]?.[colIndex]?.value?.toString().toLowerCase() || '';
    
    // Don't format headers themselves
    if (rowIndex === 0) return value.toString();

    // Percentage formatting for specific columns
    if (header === 'actual p.l.' || header === 'deviation') {
      const num = parseFloat(value.toString());
      if (!isNaN(num)) {
        return (num * 100).toFixed(1).replace('.', ',') + '%';
      }
    }

    if (typeof value === 'number') {
      if (header.includes('price')) {
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      if (
        header.includes('demand') || 
        header.includes('expected') || 
        header.includes('dann') ||
        header.includes('trt') ||
        header.includes('years')
      ) {
        return value.toFixed(5);
      }
      return value.toString();
    }
    return value.toString();
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto bg-white relative scroll-smooth">
      <div className="min-w-max relative">
        {previewState && <AiEditPreviewRange previewState={previewState} />}
        {/* Column Headers */}
        <div className="flex sticky top-0 bg-gray-100 border-b border-gray-300 z-10">
          <div className="w-12 h-8 flex items-center justify-center border-r border-gray-300 bg-gray-200 shrink-0" />
          {columnNames.map((col) => (
            <div
              key={col}
              className="w-40 h-8 flex items-center justify-center border-r border-gray-300 font-semibold text-sm text-gray-700 shrink-0"
            >
              {col}
            </div>
          ))}
        </div>

        {/* Data Rows */}
        {displayRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex border-b border-gray-200 min-h-[2rem]">
            {/* Row Number */}
            <div className="w-12 flex items-center justify-center border-r border-gray-300 bg-gray-50 text-xs text-gray-500 shrink-0 sticky left-0 z-[5]">
              {rowIndex + 1}
            </div>
            {row.map((cell: any, colIndex: number) => (
              <div
                key={colIndex}
                className={`w-40 min-h-[2rem] flex items-center px-2 border-r border-gray-200 text-sm text-gray-800 whitespace-pre-wrap shrink-0 ${rowIndex === 0 ? 'bg-gray-50 font-bold' : ''}`}
              >
                {formatCellValue(cell.value, rowIndex, colIndex)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
