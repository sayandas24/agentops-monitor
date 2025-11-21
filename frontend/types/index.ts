export interface User {
  id: string
  email: string
  full_name: string | null
}

export interface Project {
  id: string
  name: string
  description: string | null
  api_key: string
  is_active: boolean
  created_at: string
}

export interface Trace {
  id: string
  trace_id: string
  name: string
  status: 'running' | 'success' | 'failed'
  start_time: string
  end_time: string | null
  duration_ms: number | null
  total_tokens: number
  total_cost: number
  metadata: {
    adk?: {
      agent_type: string
      model: string
      runner_type: string
    }
    a2a?: {
      agents: string[]
      messages: any[]
    }
  }
  tags: string[]
}

export interface Span {
  id: string
  span_id: string
  trace_id: string
  parent_span_id: string | null
  name: string
  type: 'llm_call' | 'tool_call' | 'agent_step' | 'a2a_message' | 'runner_step'
  status: 'running' | 'success' | 'failed'
  start_time: string
  end_time: string | null
  duration_ms: number | null
  inputs: any
  outputs: any
  metadata: any
  error: string | null
}

export interface LLMCall {
  model_name: string
  provider: string
  input_tokens: number
  output_tokens: number
  total_tokens: number
  cost: number
  prompt: string | null
  response: string | null
}

export interface ToolCall {
  tool_name: string
  tool_inputs: any
  tool_outputs: any
  error: string | null
}
