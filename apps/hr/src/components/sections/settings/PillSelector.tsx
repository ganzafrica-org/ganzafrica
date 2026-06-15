'use client'

import { cn } from '@/lib/utils'

interface PillSelectorProps {
  options: string[]
  selected: string
  onSelect: (value: string) => void
  className?: string
}

export function PillSelector({
  options,
  selected,
  onSelect,
  className,
}: PillSelectorProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={cn(
            'px-4 py-2 rounded-lg border font-medium transition-all',
            selected === option
              ? 'border-amber-600 bg-amber-600 text-white'
              : 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50 dark:hover:border-neutral-600'
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
