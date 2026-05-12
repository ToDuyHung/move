import { Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import CommandDropdown from './CommandDropdown';
import { Command } from '../types';

interface ChatComposerProps {
  selectedCommand: Command;
  activeTab: string;
  onCommandChange: (command: Command) => void;
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
  lastPrompt?: string;
}

const tabCommandConfig: Record<string, Command[]> = {
  provisioning: ['Provisioning'],
  inHousePool: ['ACRD-based Recommendation', 'AI-based Recommendation'],
  poolBuyScenarios: ['Pool Buy Scenarios', 'Provisioning']
};

export default function ChatComposer({
  selectedCommand,
  activeTab,
  onCommandChange,
  onSubmit,
  disabled = false,
  lastPrompt = ''
}: ChatComposerProps) {
  const [prompt, setPrompt] = useState('');
  const isProvisioning = selectedCommand === 'Provisioning';
  const isACRD = selectedCommand === 'ACRD-based Recommendation';
  const isPoolBuy = activeTab === 'poolBuyScenarios';
  
  // Only lock prompt for Provisioning and ACRD. Pool Buy needs custom input.
  const isFixedPrompt = (isProvisioning || isACRD) && !isPoolBuy;
  const availableCommands = tabCommandConfig[activeTab] || [];

  // When disabled starts, we might want to keep the current prompt visible
  // But usually, App passes currentTask.prompt which becomes lastPrompt.

  const handleSubmit = () => {
    if ((isFixedPrompt || prompt.trim() || isPoolBuy) && !disabled) {
      onSubmit(isFixedPrompt ? selectedCommand : prompt);
      setPrompt('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-200">
      <CommandDropdown 
        value={selectedCommand} 
        onChange={onCommandChange} 
        options={availableCommands}
      />

      <div className="mt-3 relative">
        <textarea
          value={isFixedPrompt ? "" : (disabled ? (lastPrompt || prompt) : prompt)}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isFixedPrompt ? "" : 
            isPoolBuy 
              ? "Set ESS1/ESS2/ESS3 protection levels:\n- IP1: 98/93/90%\n- IP2: 98/94/90%\n- IP3: 98/95/90%" 
              : "Type your instruction here..."
          }
          disabled={disabled || isFixedPrompt}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm text-gray-700 whitespace-pre overflow-y-auto"
          rows={4}
          style={{ maxHeight: '150px' }}
        />

        <button
          onClick={handleSubmit}
          disabled={(!isFixedPrompt && !prompt.trim()) || disabled}
          className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
