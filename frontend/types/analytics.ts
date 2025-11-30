export interface AnalyticsSummary {
  total_traces: number
  total_llm_calls: number
  total_tool_calls: number
  total_input_tokens: number
  total_output_tokens: number
  total_tokens: number
  total_cost: number
  avg_duration_ms: number
  min_duration_ms: number
  max_duration_ms: number
  total_duration_ms: number
  unique_projects: number
}

export interface TrendData {
  timestamp: string
  input_tokens: number
  output_tokens: number
  total_tokens: number
  cost: number
  trace_count: number
}

export interface TrendsResponse {
  data: TrendData[]
  granularity: string
}

export interface ModelBreakdown {
  model_name: string
  provider: string
  total_cost: number
  cost_percentage: number
  input_tokens: number
  output_tokens: number
  total_tokens: number
  call_count: number
}

export interface TopTrace {
  trace_id: string
  name: string
  total_tokens: number
  total_cost: number
  duration_ms: number
  llm_call_count: number
  start_time: string
  project_name: string
  status: string
}


export interface AnalyticsFilters {
  timeRange: 'last_24h' | 'last_7d' | 'last_30d' | 'all_time' | 'custom'
  customStartDate: Date | null
  customEndDate: Date | null
  selectedProjects: string[]
}
