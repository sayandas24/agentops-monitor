import { Trace, Span } from "@/types";
import { Card } from "@/components/ui/card";
import { formatCost } from "@/lib/utils";

interface TraceStatsProps {
  trace: Trace;
  spans: Span[];
}

export function TraceStats({ trace, spans }: TraceStatsProps) {
  // Calculate statistics - handle both formats (type field and llm_call/tool_call objects)
  const llmCallCount = spans.filter(s => s.type === 'llm_call' || s.llm_call).length;
  const toolCallCount = spans.filter(s => s.type === 'tool_call' || s.tool_call).length;
  const failedSpans = spans.filter(s => s.status === 'failed').length;
  
  const totalInputTokens = spans.reduce((sum, s) => 
    sum + (s.llm_call?.input_tokens || 0), 0
  );
  const totalOutputTokens = spans.reduce((sum, s) => 
    sum + (s.llm_call?.output_tokens || 0), 0
  );

  const avgSpanDuration = spans.length > 0
    ? spans.reduce((sum, s) => sum + (s.duration_ms || 0), 0) / spans.length
    : 0;

  const models = [...new Set(spans
    .filter(s => s.llm_call)
    .map(s => s.llm_call!.model_name)
  )];

  const tools = [...new Set(spans
    .filter(s => s.tool_call)
    .map(s => s.tool_call!.tool_name)
  )];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Execution Stats */}
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Execution</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Total Spans</span>
            <span className="font-bold text-lg">{spans.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Failed</span>
            <span className={`font-semibold ${failedSpans > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {failedSpans}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Avg Duration</span>
            <span className="font-semibold">{(avgSpanDuration / 1000).toFixed(2)}s</span>
          </div>
        </div>
      </Card>

      {/* LLM Stats */}
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">LLM Calls</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Total Calls</span>
            <span className="font-bold text-lg">{llmCallCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Input Tokens</span>
            <span className="font-semibold text-green-600">{totalInputTokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Output Tokens</span>
            <span className="font-semibold text-blue-600">{totalOutputTokens.toLocaleString()}</span>
          </div>
          {models.length > 0 && (
            <div className="pt-1 border-t">
              <span className="text-xs text-gray-600">Models: </span>
              <span className="text-xs font-mono">{models.join(", ")}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Tool Stats */}
      <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Tool Calls</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Total Calls</span>
            <span className="font-bold text-lg">{toolCallCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Unique Tools</span>
            <span className="font-semibold">{tools.length}</span>
          </div>
          {tools.length > 0 && (
            <div className="pt-1 border-t">
              <span className="text-xs text-gray-600">Tools: </span>
              <div className="text-xs font-mono mt-1 space-y-1">
                {tools.map(tool => (
                  <div key={tool} className="bg-white px-2 py-1 rounded">
                    {tool}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Cost Stats */}
      <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Cost</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-gray-600">Total</span>
            <span className="font-bold text-2xl">{formatCost(trace.total_cost)}</span>
          </div>
          {llmCallCount > 0 && (
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Per Call</span>
              <span className="font-semibold">{formatCost(trace.total_cost / llmCallCount)}</span>
            </div>
          )}
          {trace.total_tokens > 0 && (
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Per 1K Tokens</span>
              <span className="font-semibold">
                {formatCost((trace.total_cost / trace.total_tokens) * 1000)}
              </span>
            </div>
          )}
          {trace.total_cost === 0 && (
            <div className="pt-1 border-t">
              <span className="text-xs text-green-600 font-semibold">✨ Free Tier</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
