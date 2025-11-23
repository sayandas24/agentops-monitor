"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { tracesAPI } from "@/lib/api";
import { Trace, Span } from "@/types";
import { formatDate, formatCost, getStatusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LLMCallCard } from "@/components/smallComponents/LLMCallCard";
import { ToolCallCard } from "@/components/smallComponents/ToolCallCard";
import { TraceStats } from "@/components/smallComponents/TraceStats";
import Link from "next/link";

interface TraceDetail {
  trace: Trace;
  spans: Span[];
}

export default function TraceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const traceId = params.traceId as string;

  const [traceDetail, setTraceDetail] = useState<TraceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTraceDetail() {
      setLoading(true);
      setError(null);
      try {
        const data = await tracesAPI.getDetail(traceId);
        console.log(data, "data")
        setTraceDetail(data);
      } catch (err: any) {
        setError(err.message || "Failed to load trace details");
      } finally {
        setLoading(false);
      }
    }
    fetchTraceDetail();
  }, [traceId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading trace details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-600 bg-red-50 p-3 rounded mb-4">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (!traceDetail) {
    return (
      <div className="container mx-auto p-6">
        <p>Trace not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const { trace, spans } = traceDetail;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          ← Back to Traces
        </Button>
        <h1 className="text-3xl font-bold">{trace.name}</h1>
        <p className="text-sm text-muted-foreground">Trace ID: {trace.trace_id}</p>
      </div>

      {/* Trace Summary Card */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Trace Summary</h2>
          <Badge className={getStatusColor(trace.status)}>
            {trace.status.toUpperCase()}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Started</p>
            <p>{formatDate(trace.start_time)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ended</p>
            <p>{trace.end_time ? formatDate(trace.end_time) : "Running..."}</p>
          </div>
        </div>
        {trace.tags.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Tags</p>
            <div className="flex gap-2">
              {trace.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Statistics */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Statistics</h2>
        <TraceStats trace={trace} spans={spans} />
      </div>

      {/* Execution Timeline */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Execution Timeline</h2>
        {spans.length === 0 ? (
          <p className="text-muted-foreground">No spans found for this trace.</p>
        ) : (
          <div className="space-y-6">
            {/* LLM Calls Section */}
            {spans.some(s => s.llm_call) && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="text-blue-600">🤖</span>
                  LLM Calls ({spans.filter(s => s.llm_call).length})
                </h3>
                <div className="space-y-4">
                  {spans
                    .filter(s => s.llm_call)
                    .map((span) => (
                      <LLMCallCard
                        key={span.id}
                        llmCall={span.llm_call!}
                        spanName={span.name}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Tool Calls Section */}
            {spans.some(s => s.tool_call) && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="text-green-600">🔧</span>
                  Tool Calls ({spans.filter(s => s.tool_call).length})
                </h3>
                <div className="space-y-4">
                  {spans
                    .filter(s => s.tool_call)
                    .map((span) => (
                      <ToolCallCard
                        key={span.id}
                        toolCall={span.tool_call!}
                        spanName={span.name}
                        duration={span.duration_ms}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Other Spans Section */}
            {spans.some(s => !s.llm_call && !s.tool_call) && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="text-gray-600">⚙️</span>
                  Other Operations ({spans.filter(s => !s.llm_call && !s.tool_call).length})
                </h3>
                <div className="space-y-4">
                  {spans
                    .filter(s => !s.llm_call && !s.tool_call)
                    .map((span) => (
                      <Card key={span.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{span.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Type: {span.type} | Span ID: {span.span_id}
                            </p>
                          </div>
                          <Badge className={getStatusColor(span.status)}>
                            {span.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Duration</p>
                            <p className="text-sm">
                              {span.duration_ms ? `${(span.duration_ms / 1000).toFixed(3)}s` : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Started</p>
                            <p className="text-sm">{formatDate(span.start_time)}</p>
                          </div>
                          {span.end_time && (
                            <div>
                              <p className="text-sm text-muted-foreground">Ended</p>
                              <p className="text-sm">{formatDate(span.end_time)}</p>
                            </div>
                          )}
                        </div>

                        {span.error && (
                          <div className="mt-3 p-3 bg-red-50 rounded">
                            <p className="text-sm font-semibold text-red-600">Error:</p>
                            <p className="text-sm text-red-600">{span.error}</p>
                          </div>
                        )}

                        {span.inputs && Object.keys(span.inputs).length > 0 && (
                          <details className="mt-3">
                            <summary className="cursor-pointer text-sm font-semibold">
                              Inputs
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                              {JSON.stringify(span.inputs, null, 2)}
                            </pre>
                          </details>
                        )}

                        {span.outputs && Object.keys(span.outputs).length > 0 && (
                          <details className="mt-3">
                            <summary className="cursor-pointer text-sm font-semibold">
                              Outputs
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                              {JSON.stringify(span.outputs, null, 2)}
                            </pre>
                          </details>
                        )}

                        {span.meta && Object.keys(span.meta).length > 0 && (
                          <details className="mt-3">
                            <summary className="cursor-pointer text-sm font-semibold">
                              Metadata
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                              {JSON.stringify(span.meta, null, 2)}
                            </pre>
                          </details>
                        )}
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
