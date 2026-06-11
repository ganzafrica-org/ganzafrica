import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Building2, Lock, Users, Clock, FileText, Settings, ChevronRight } from 'lucide-react';

const MENU_ITEMS = [
  { id: 'main', label: 'Main settings', icon: Settings },
  {
    id: 'org-security',
    label: 'Organization & security',
    icon: Building2,
    children: [
      { id: 'organization', label: 'Organization' },
      { id: 'security', label: 'Security' },
    ],
  },
  { id: 'payroll', label: 'Payroll', icon: FileText },
  {
    id: 'hr',
    label: 'Human Resources',
    icon: Users,
    children: [
      { id: 'roles', label: 'Roles and permissions' },
      { id: 'timeoff', label: 'Time off' },
      { id: 'policies', label: 'Policies' },
    ],
  },
];

export function SettingsSidebar({ activeItem }: { activeItem: string }) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['hr']);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Settings</h2>
        <Input
          placeholder="Search settings"
          className="h-10 bg-gray-50 border-gray-300"
        />
      </div>

      <nav className="space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedGroups.includes(item.id);

          return (
            <div key={item.id}>
              <button
                onClick={() => item.children && toggleGroup(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  activeItem === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.children && (
                  <ChevronRight
                    size={16}
                    className={`transition ${isExpanded ? 'rotate-90' : ''}`}
                  />
                )}
              </button>

              {item.children && isExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      className={`w-full text-left px-4 py-2 text-sm rounded transition ${
                        activeItem === child.id
                          ? 'text-blue-600 bg-blue-50 font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
