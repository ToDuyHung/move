import { Download } from 'lucide-react';
import FileUploadChip from './FileUploadChip';
import { FileCategory, UploadedFiles } from '../types';

interface FileToolbarProps {
  uploadedFiles: UploadedFiles;
  activeTab: string;
  onFileSelect: (category: FileCategory, file: File) => void;
  onExport: () => void;
}

const tabFileConfig: Record<string, { category: FileCategory; label: string }[]> = {
  provisioning: [
    { category: 'partNumbers', label: 'Part Numbers' },
    { category: 'partCapability', label: 'Part Capability' },
    { category: 'parameters', label: 'Parameters' },
  ],
  inHousePool: [
    { category: 'partNumbers', label: 'Part Numbers' },
    { category: 'inhousePoolInfo', label: 'Inhouse Pool Info' },
    { category: 'acrdData', label: 'Aircraft Component Replacement Data' },
  ],
  poolBuyScenarios: [
    { category: 'partNumbers', label: 'Part Numbers' },
    { category: 'partCapability', label: 'Part Capability' },
    { category: 'parameters', label: 'Parameters' },
    { category: 'inhousePoolInfo', label: 'Inhouse Pool Info' },
    { category: 'currentMbhFleet', label: 'Current MBH Fleet' },
  ]
};

export default function FileToolbar({ uploadedFiles, activeTab, onFileSelect, onExport }: FileToolbarProps) {
  const fileSlots = tabFileConfig[activeTab] || [];

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 border-b gap-4">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap">
        <span className="font-semibold text-gray-700 whitespace-nowrap mr-2">Files:</span>
        {fileSlots.map((slot) => (
          <FileUploadChip
            key={slot.category}
            category={slot.category}
            label={slot.label}
            uploaded={uploadedFiles[slot.category]?.uploaded || false}
            onFileSelect={onFileSelect}
          />
        ))}
      </div>
      <button
        onClick={onExport}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
      >
        <Download size={18} />
        Export .xlsx
      </button>
    </div>
  );
}
