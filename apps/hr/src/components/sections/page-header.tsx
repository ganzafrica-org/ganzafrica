import { Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button"; // Standard path for shadcn UI

interface PageHeaderProps {
  title: string;
  importLabel: string;
  exportLabel: string;
  onImport?: () => void;
  onExport?: () => void;
}

export const PageHeader = ({ title, importLabel, exportLabel }: PageHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text">{title}</h1>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-green-500"
        >
          <Upload className="h-4 w-4 mr-2" />
          {importLabel}
        </Button>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          {exportLabel}
        </Button>
      </div>
    </div>
  );
};
