import { ChevronDown } from 'lucide-react';
import { Command } from '../types';
import { useState, useRef, useEffect } from 'react';

interface CommandDropdownProps {
  value: Command;
  onChange: (command: Command) => void;
  options?: Command[];
}

export default function CommandDropdown({ value, onChange, options }: CommandDropdownProps) {
  const commands = options || [
    'VLOOKUP',
    'Provisioning',
    'Generate Report',
    'Scenario Analysis',
    'Fill Missing Values',
    'Match Part Number',
  ];
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">{value}</span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
          {commands.map((command) => (
            <button
              key={command}
              onClick={() => {
                onChange(command);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                value === command ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'
              }`}
            >
              {command}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
