import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null) {
  if (!date) return 'N/A'
  return format(new Date(date), 'MMM d, yyyy HH:mm:ss')
}

export function formatRelativeTime(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDuration(ms: number | null) {
  if (!ms) return 'N/A'
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  return `${(ms / 60000).toFixed(2)}min`
}

export function formatCost(cost: number) {
  if (cost === 0) return 'FREE'
  return `$${cost.toFixed(4)}`
}

export function formatTokens(tokens: number) {
  if (tokens < 1000) return tokens.toString()
  if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`
  return `${(tokens / 1000000).toFixed(2)}M`
}

export function getSpanIcon(type: string) {
  switch (type) {
    case 'llm_call':
      return '🤖'
    case 'tool_call':
      return '🔧'
    case 'a2a_message':
      return '📨'
    case 'runner_step':
      return '🔄'
    case 'agent_step':
      return '🎯'
    default:
      return '📍'
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'success':
      return 'text-green-600 bg-green-50'
    case 'failed':
      return 'text-red-600 bg-red-50'
    case 'running':
      return 'text-blue-600 bg-blue-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}
