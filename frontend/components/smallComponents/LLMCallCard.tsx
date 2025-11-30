import { LLMCall } from "@/types";
import { formatCost } from "@/libs/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LLMCallCardProps {
  llmCall: LLMCall;
  spanName: string;
}

export function LLMCallCard({ llmCall, spanName }: LLMCallCardProps) {
  const tokenRatio = llmCall.input_tokens > 0 
    ? (llmCall.output_tokens / llmCall.input_tokens).toFixed(2)
    : "N/A";

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-lg text-blue-900">{spanName}</h4>
          <p className="text-sm text-blue-700">LLM Call</p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {llmCall.provider}
        </Badge>
      </div>

      <div className="space-y-3">
        {/* Model Info */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Model</span>
          <span className="font-mono text-sm font-medium">{llmCall.model_name}</span>
        </div>

        {/* Token Usage */}
        <div className="bg-white rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Input Tokens</span>
            <span className="font-semibold text-green-600">{llmCall.input_tokens.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Output Tokens</span>
            <span className="font-semibold text-blue-600">{llmCall.output_tokens.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-sm font-medium text-gray-700">Total Tokens</span>
            <span className="font-bold">{llmCall.total_tokens.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Output/Input Ratio</span>
            <span className="text-sm font-medium">{tokenRatio}x</span>
          </div>
        </div>

        {/* Cost */}
        <div className="flex items-center justify-between bg-white rounded-lg p-3">
          <span className="text-sm font-medium text-gray-700">Cost</span>
          <span className="font-bold text-lg">
            {formatCost(llmCall.cost)}
            {llmCall.cost === 0 && (
              <Badge variant="default" className="ml-2 text-xs">FREE</Badge>
            )}
          </span>
        </div>

        {/* Prompt & Response */}
        {llmCall.prompt && (
          <details className="bg-white rounded-lg">
            <summary className="cursor-pointer p-3 font-semibold text-sm hover:bg-gray-50 rounded-lg">
              📝 Prompt ({llmCall.prompt.length} chars)
            </summary>
            <div className="p-3 pt-0">
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-60 whitespace-pre-wrap">
                {llmCall.prompt}
              </pre>
            </div>
          </details>
        )}

        {llmCall.response && (
          <details className="bg-white rounded-lg">
            <summary className="cursor-pointer p-3 font-semibold text-sm hover:bg-gray-50 rounded-lg">
              💬 Response ({llmCall.response.length} chars)
            </summary>
            <div className="p-3 pt-0">
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-60 whitespace-pre-wrap">
                {llmCall.response}
              </pre>
            </div>
          </details>
        )}
      </div>
    </Card>
  );
}
