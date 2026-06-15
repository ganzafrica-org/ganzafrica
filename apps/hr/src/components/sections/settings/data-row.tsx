interface DataRowProps {
  label: string;
  value: string | React.ReactNode;
  variant?: 'default' | 'muted';
}

export function DataRow({ label, value, variant = 'default' }: DataRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span
        className={`text-sm font-medium ${
          variant === 'muted' ? 'text-gray-600' : 'text-gray-700'
        }`}
      >
        {label}
      </span>
      <span
        className={`text-sm ${
          variant === 'muted'
            ? 'text-gray-500'
            : 'text-gray-900 font-semibold'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
