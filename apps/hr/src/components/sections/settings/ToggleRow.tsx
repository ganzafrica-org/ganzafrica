'use client'

import { Switch } from '@/components/ui/switch'

interface ToggleRowProps {
  label: string
  description: string
  enabled: boolean
  onToggle: (enabled: boolean) => void
  isLast?: boolean
}

export function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
  isLast,
}: ToggleRowProps) {
  return (
    <>
      <div className="flex items-center justify-between py-4">
        <div className="flex-1">
          <div className="font-semibold text-neutral-900 dark:text-neutral-50">
            {label}
          </div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            {description}
          </div>
        </div>
        <div className="ml-4">
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>
      </div>
      {!isLast && <div className="border-t border-neutral-200 dark:border-neutral-800" />}
    </>
  )
}
