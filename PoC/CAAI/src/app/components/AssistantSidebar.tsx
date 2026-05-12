import { Task, Command, TaskStep, DiagnosticIssue } from '../types';
import ChatComposer from './ChatComposer';
import { useRef, useState } from 'react';
import { 
  Activity, Terminal, ChevronDown, ChevronUp,
  AlertCircle, Info, CheckCircle2, Loader2, Sparkles
} from 'lucide-react';

interface AssistantSidebarProps {
  currentTask: Task | null;
  selectedCommand: Command;
  onCommandChange: (command: Command) => void;
  onSubmitPrompt: (prompt: string) => void;
  onTryIt: (cell: string, value: number) => void;
  isProcessing: boolean;
  activeTab: string;
}

const SeverityIcon = ({ severity }: { severity: DiagnosticIssue['severity'] }) => {
  switch (severity) {
    case 'CRITICAL': return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'WARNING': return <AlertCircle className="w-4 h-4 text-orange-500" />;
    case 'ASSUMPTION': return <Info className="w-4 h-4 text-blue-500" />;
    default: return <Activity className="w-4 h-4 text-gray-400" />;
  }
};

const EssCard = ({ essKey, metrics, isAllEssCompleted, onTryIt }: { 
  essKey: string, 
  metrics: any, 
  isAllEssCompleted: boolean, 
  onTryIt: (cell: string, value: number) => void 
}) => {
  const label = essKey.toUpperCase();
  const isPassed = metrics?.status === 'Passed';
  
  return (
    <div className={`p-4 bg-white border rounded-xl shadow-sm transition-all ${
      !isPassed && isAllEssCompleted ? 'border-red-200 ring-1 ring-red-50' : 'border-gray-100'
    }`}>
      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Actual Fill Rate for {label}</span>
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">
            {isAllEssCompleted && metrics ? (
              `${metrics.actual.toFixed(2)}%`
            ) : (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            )}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">Target: {metrics?.desired}%</span>
        </div>
        
        <div className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-tight ${
          isAllEssCompleted && metrics
            ? (isPassed ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100')
            : 'bg-gray-50 text-gray-400 border-gray-100'
        }`}>
          {isAllEssCompleted && metrics ? metrics.status : "Calculating"}
        </div>
      </div>
      {!isPassed && isAllEssCompleted && metrics && (
        <div className="mt-3 p-2 bg-indigo-50/30 rounded-lg border border-indigo-100 flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <div className="mt-0.5">
              <Sparkles className="w-3 h-3 text-indigo-400" />
            </div>
            <p className="text-[11px] text-indigo-500 font-medium italic leading-tight flex-1">
              {metrics.recommendation}
            </p>
          </div>
          <button 
            onClick={() => metrics.targetCell && metrics.suggestedValue && onTryIt(metrics.targetCell, metrics.suggestedValue)}
            className="self-end px-3 py-1 bg-white border border-indigo-100 text-[10px] font-medium text-indigo-500 rounded-md hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
          >
            Resolve
          </button>
        </div>
      )}
    </div>
  );
};

export default function AssistantSidebar({
  currentTask,
  selectedCommand,
  onCommandChange,
  onSubmitPrompt,
  onTryIt,
  isProcessing,
  activeTab
}: AssistantSidebarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTechnicalLog, setShowTechnicalLog] = useState(true);

  const activeStep = currentTask?.steps.find(s => s.status === 'running');
  const isQtyCompleted = currentTask?.steps.some(s => 
    (s.label === 'Calculate Recommended Qty' || s.label === 'Calculate Pool Buy Qty') && 
    s.status === 'completed'
  );
  const isAllEssCompleted = currentTask?.steps.find(s => s.label === 'Calculate ESS3 Actual Annual Demand')?.status === 'completed';

  return (
    <div className="w-full h-full flex flex-col bg-white text-gray-800 overflow-hidden border-l border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3 h-6">
          <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
            {selectedCommand}
          </span>
        </div>
        {isProcessing && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 scroll-smooth">

        {/* Diagnostics */}
        {currentTask?.diagnostics && currentTask.diagnostics.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-3 h-3" /> Diagnostics
            </h3>
            <div className="space-y-1.5">
              {currentTask.diagnostics.map((diag, idx) => (
                <div key={idx} className={`p-3 rounded-lg border flex items-start gap-3 ${diag.severity === 'CRITICAL' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                  <div className="mt-0.5">
                    <SeverityIcon severity={diag.severity} />
                  </div>
                  <p className={`text-[11px] leading-relaxed ${diag.severity === 'CRITICAL' ? 'text-red-700' : 'text-blue-700'}`}>
                    {diag.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Business Rationale Section */}
        {(currentTask || isProcessing) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3 h-3" /> Business Rationale
              </h3>
              {isProcessing && <span className="text-[9px] text-indigo-500 animate-pulse font-bold uppercase">Processing...</span>}
            </div>

            <div className="space-y-3">
               {/* Current Status Card */}
               <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-lg">
                  <span className="text-[9px] font-bold text-indigo-400 uppercase">Current Action</span>
                  <div className="flex items-center gap-2 mt-1">
                    {isProcessing && <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />}
                    <p className="text-xs text-indigo-900 font-medium truncate">
                      {isProcessing ? (activeStep?.label || 'Thinking...') : 'Analysis Completed'}
                    </p>
                  </div>
               </div>

               {/* Metrics Grid */}
               <div className="grid grid-cols-1 gap-3">
                  {/* 1. Render ONLY Failed ESS cards first (Top Priority) */}
                  {selectedCommand !== 'Pool Buy Scenarios' && currentTask?.impactSummary?.essMetrics && (
                    <>
                      {['ess1', 'ess2', 'ess3'].map((key) => {
                        const metrics = currentTask?.impactSummary?.essMetrics?.[key];
                        if (metrics?.status !== 'Failed' || !isAllEssCompleted) return null;
                        return <EssCard key={key} essKey={key} metrics={metrics} isAllEssCompleted={isAllEssCompleted} onTryIt={onTryIt} />;
                      })}
                    </>
                  )}

                  {/* 2. Total Units Card (Middle) */}
                  <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      {activeTab === 'inHousePool' ? 'Total Available Pool Units' : (selectedCommand === 'Pool Buy Scenarios' ? 'Pool Buy Qty' : 'Total Spares Units')}
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {isQtyCompleted && currentTask?.impactSummary ? (
                          currentTask.impactSummary.sparesRecommended.toLocaleString()
                        ) : (
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        )}
                      </span>
                      <div className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-tight ${
                        isQtyCompleted ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                        {isQtyCompleted ? "Verified" : "Calculating"}
                      </div>
                    </div>
                  </div>

                  {/* Total Value Card (USD) - ONLY for Pool Buy Scenarios */}
                  {selectedCommand === 'Pool Buy Scenarios' && (
                    <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        Total Purchase Value (USD)
                      </span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xl font-bold text-indigo-600">
                          {isQtyCompleted && currentTask?.impactSummary?.totalBuyValue !== undefined ? (
                            `$${currentTask.impactSummary.totalBuyValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          ) : (
                            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                          )}
                        </span>
                        <div className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-tight ${
                          isQtyCompleted ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                        }`}>
                          {isQtyCompleted ? "Estimated" : "Calculating"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Render Remaining ESS cards (Passed or Calculating) */}
                  {selectedCommand !== 'Pool Buy Scenarios' && currentTask?.impactSummary?.essMetrics && (
                    <>
                      {['ess1', 'ess2', 'ess3'].map((key) => {
                        const metrics = currentTask?.impactSummary?.essMetrics?.[key];
                        if (isAllEssCompleted && metrics?.status === 'Failed') return null;
                        if (!metrics) return null;
                        return <EssCard key={key} essKey={key} metrics={metrics} isAllEssCompleted={isAllEssCompleted} onTryIt={onTryIt} />;
                      })}
                    </>
                  )}
               </div>
            </div>
          </div>
        )}

        {/* Processing Details */}
        {(isProcessing || currentTask) && (
          <div className="space-y-3">
            <button 
              onClick={() => setShowTechnicalLog(!showTechnicalLog)}
              className="w-full flex items-center justify-between py-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-3 h-3" /> Processing Details
              </div>
              {showTechnicalLog ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showTechnicalLog && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-4 font-mono text-[10px] border border-gray-100 max-h-[400px] overflow-y-auto custom-scrollbar">
                {currentTask?.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      {step.status === 'completed' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      ) : step.status === 'running' ? (
                        <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-gray-200 bg-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[9px] text-gray-400 mb-0.5">
                        <span className="truncate">{step.agent || 'System Agent'}</span>
                        {step.tool && <span className="bg-gray-100 px-1 rounded lowercase">{step.tool}</span>}
                      </div>
                      <p className={`leading-relaxed ${step.status === 'running' ? 'text-indigo-600 font-bold' : 'text-gray-600'}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer Section */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <ChatComposer
          selectedCommand={selectedCommand}
          activeTab={activeTab}
          onCommandChange={onCommandChange}
          onSubmit={onSubmitPrompt}
          disabled={isProcessing}
          lastPrompt={currentTask?.prompt}
        />
      </div>
    </div>
  );
}
