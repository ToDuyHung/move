import { Upload, Check } from 'lucide-react';
import { FileCategory } from '../types';

interface FileUploadChipProps {
  category: FileCategory;
  label: string;
  uploaded: boolean;
  onFileSelect: (category: FileCategory, file: File) => void;
}

export default function FileUploadChip({
  category,
  label,
  uploaded,
  onFileSelect
}: FileUploadChipProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(category, file);
      // Reset input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  return (
    <label className="cursor-pointer">
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all flex-1 justify-center
        ${uploaded
          ? 'border-green-500 bg-green-50 text-green-900'
          : 'border-gray-300 bg-white text-gray-500 hover:border-blue-400'
        }
      `}>
        <Upload size={16} />
        <span className={uploaded ? 'font-semibold' : 'font-normal'}>
          {label}
        </span>
        {uploaded && <Check size={16} className="text-green-600" />}
      </div>
    </label>
  );
}
