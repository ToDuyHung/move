import { Check, Loader2, Circle, XCircle } from 'lucide-react';
import { TaskStep } from '../types';

interface TaskStepListProps {
  steps: TaskStep[];
}

export default function TaskStepList({ steps }: TaskStepListProps) {
  const getIcon = (status: TaskStep['status']) => {
    switch (status) {
      case 'completed':
        return <Check size={16} className="text-green-600" />;
      case 'running':
        return <Loader2 size={16} className="text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Circle size={16} className="text-gray-300" />;
    }
  };

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(step.status)}
          </div>
          <span className={`text-sm ${
            step.status === 'completed' ? 'text-gray-900' :
            step.status === 'running' ? 'text-gray-400 italic' :
            step.status === 'failed' ? 'text-red-700' :
            'text-gray-300'
          }`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
