import { ToolCall } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ToolCallCardProps {
  toolCall: ToolCall;
  spanName: string;
  duration?: number | null;
}

export function ToolCallCard({ toolCall, spanName, duration }: ToolCallCardProps) {
  const hasError = !!toolCall.error;

  return (
    <Card className={`p-4 ${hasError ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-lg text-gray-900">{spanName}</h4>
          <p className="text-sm text-gray-600">Tool Call</p>
        </div>
        <Badge variant={hasError ? "destructive" : "secondary"} className={hasError ? "" : "bg-green-100 text-green-800"}>
          {hasError ? "Failed" : "Success"}
        </Badge>
      </div>

      <div className="space-y-3">
        {/* Tool Name */}
        <div className="flex items-center justify-between bg-white rounded-lg p-3">
          <span className="text-sm text-gray-600">Tool</span>
          <span className="font-mono text-sm font-semibold">{toolCall.tool_name}</span>
        </div>

        {/* Duration */}
        {duration !== null && duration !== undefined && (
          <div className="flex items-center justify-between bg-white rounded-lg p-3">
            <span className="text-sm text-gray-600">Execution Time</span>
            <span className="font-semibold">{(duration / 1000).toFixed(3)}s</span>
          </div>
        )}

        {/* Error */}
        {hasError && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-3">
            <p className="text-sm font-semibold text-red-800 mb-1">❌ Error</p>
            <p className="text-sm text-red-700">{toolCall.error}</p>
          </div>
        )}

        {/* Inputs */}
        {toolCall.tool_inputs && Object.keys(toolCall.tool_inputs).length > 0 && (
          <details className="bg-white rounded-lg">
            <summary className="cursor-pointer p-3 font-semibold text-sm hover:bg-gray-50 rounded-lg">
              📥 Inputs ({Object.keys(toolCall.tool_inputs).length} params)
            </summary>
            <div className="p-3 pt-0">
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-60">
                {JSON.stringify(toolCall.tool_inputs, null, 2)}
              </pre>
            </div>
          </details>
        )}

        {/* Outputs */}
        {!hasError && toolCall.tool_outputs && Object.keys(toolCall.tool_outputs).length > 0 && (
          <details className="bg-white rounded-lg">
            <summary className="cursor-pointer p-3 font-semibold text-sm hover:bg-gray-50 rounded-lg">
              📤 Outputs
            </summary>
            <div className="p-3 pt-0">
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-60">
                {JSON.stringify(toolCall.tool_outputs, null, 2)}
              </pre>
            </div>
          </details>
        )}
      </div>
    </Card>
  );
}
