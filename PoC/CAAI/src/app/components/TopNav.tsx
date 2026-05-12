import { FileText, TrendingUp, Database, FileBarChart } from 'lucide-react';

interface TopNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'provisioning', label: 'Provisioning', icon: FileText },
  { id: 'inHousePool', label: 'In-house Pool Recommendation', icon: Database },
  { id: 'poolBuyScenarios', label: 'Pool Buy Scenarios', icon: TrendingUp },
];

export default function TopNav({ activeTab, onTabChange }: TopNavProps) {
  return (
    <div className="w-full bg-blue-600 text-white px-6 py-3">
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full transition-all
                ${isActive
                  ? 'bg-white/20 border-2 border-white/40'
                  : 'hover:bg-white/10'
                }
              `}
            >
              <Icon size={18} />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
