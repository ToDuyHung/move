import { AiEditPreviewState } from '../types';

interface AiEditPreviewRangeProps {
  previewState: AiEditPreviewState;
}

export default function AiEditPreviewRange({ previewState }: AiEditPreviewRangeProps) {
  const { range, status } = previewState;

  if (!range || status === 'idle') {
    return null;
  }

  // Calculate position based on the grid layout
  // Column header row height: h-8 (32px)
  // Row number column width: w-12 (48px)
  // Standard cell width: w-32 (128px)
  // Standard cell height: h-8 (32px)

  const CELL_WIDTH = 160;
  const CELL_HEIGHT = 32;
  const ROW_HEADER_WIDTH = 48;
  // The grid data rows start immediately, but we need to position absolute to the parent container.
  // Wait, if the parent container is relative and includes the column header, we need to add 32px for the header.
  // Assuming the absolute positioned element is a child of the min-w-max container which holds both header and rows.
  const HEADER_HEIGHT = 32;

  const top = HEADER_HEIGHT + (range.startRow - 1) * CELL_HEIGHT;
  const left = ROW_HEADER_WIDTH + (range.startCol - 1) * CELL_WIDTH;
  const width = (range.endCol - range.startCol + 1) * CELL_WIDTH;
  const height = (range.endRow - range.startRow + 1) * CELL_HEIGHT;

  let className = 'ai-edit-preview-range';
  if (status === 'running') className += ' running';
  if (status === 'failed') className += ' failed';
  if (status === 'completed') className += ' completed';

  return (
    <div
      className={className}
      style={{
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
}
