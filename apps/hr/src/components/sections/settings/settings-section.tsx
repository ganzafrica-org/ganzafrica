import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  onEdit?: () => void;
}

export function SettingsSection({
  title,
  children,
  defaultOpen = true,
  onEdit,
}: SettingsSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-card rounded-lg border border-border mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-muted/50 transition"
      >
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-3">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Edit
            </button>
          )}
          <ChevronDown
            size={20}
            className={`text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isOpen && <div className="border-t border-border p-6 bg-muted/30">{children}</div>}
    </div>
  );
}
