import { Badge } from '@/components/ui/badge'
import { DepartmentTableRow, Department } from '@/types/department'

export const deptColors: Record<string, string> = {
  Agriculture: 'bg-green-100 text-green-700',
  Environment: 'bg-emerald-100 text-emerald-700',
  'Land Management': 'bg-lime-100 text-lime-700',
  'Human Resources': 'bg-blue-100 text-blue-700',
  Administration: 'bg-violet-100 text-violet-700',
  'Fellowship Program': 'bg-orange-100 text-orange-700',
  'East Africa Operations': 'bg-cyan-100 text-cyan-700',
  'Research & Development': 'bg-rose-100 text-rose-700',
}

export function getDeptInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function getDeptAvatarClass(name: string): string {
  return deptColors[name] ?? 'bg-slate-100 text-slate-600'
}

export function getDepartmentStatusBadge(status: DepartmentTableRow['status']) {
  if (status === 'Active') {
    return (
      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
        Active
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
      Inactive
    </Badge>
  )
}

export function getDepartmentHeaderStatusBadge(department: Department) {
  return (
    <Badge variant="outline" className="gap-1.5 border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Active
    </Badge>
  )
}
