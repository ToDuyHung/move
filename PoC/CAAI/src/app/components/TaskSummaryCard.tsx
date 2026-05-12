import { Task } from '../types';
import TaskStepList from './TaskStepList';

interface TaskSummaryCardProps {
  task: Task | null;
}

export default function TaskSummaryCard({ task }: TaskSummaryCardProps) {
  if (!task) {
    return (
      <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <p className="text-gray-500 text-center">No active task</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="mb-4">
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
          {task.command}
        </span>
      </div>

      <p className="text-gray-700 mb-4 text-sm leading-relaxed">
        {task.prompt}
      </p>

      <div className="border-t pt-4">
        <TaskStepList steps={task.steps} />
      </div>
    </div>
  );
}
