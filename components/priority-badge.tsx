import type { Priority } from '@/lib/types'

export function PriorityBadge({ priority }: { priority: Priority }) {
  const styles = {
    urgent: 'bg-red-100 text-red-700',
    moderate: 'bg-yellow-100 text-yellow-700',
    low: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}
