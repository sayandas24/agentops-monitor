"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tracesAPI } from "@/lib/api";
import { Trace } from "@/types";
import { formatDate, formatCost, getStatusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();

  // Replace this with actual project ID from user projects or context
  const [projectId, setProjectId] = useState<string | null>(null);

  const [traces, setTraces] = useState<Trace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Get current project ID from context/props/login
    // For demo, set manually or redirect to projects page
    const storedProjectId = localStorage.getItem("currentProjectId");
    if (!storedProjectId) {
      router.push("/projects");
    } else {
      setProjectId(storedProjectId);
    }
  }, [router]);

  useEffect(() => {
    async function fetchTraces() {
      if (!projectId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await tracesAPI.list(projectId);
        setTraces(data);
      } catch (err: any) {
        setError(err.message || "Failed to load traces");
      } finally {
        setLoading(false);
      }
    }
    fetchTraces();
  }, [projectId]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Project Traces</h1>

      {loading && <p>Loading traces...</p>}
      {error && (
        <p className="text-red-600 bg-red-50 p-3 rounded mb-4">{error}</p>
      )}

      {!loading && !error && traces.length === 0 && (
        <p>No traces found for this project.</p>
      )}

      {/* Summary Stats */}
      {traces.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Traces</p>
            <p className="text-2xl font-bold">{traces.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Tokens</p>
            <p className="text-2xl font-bold">
              {traces.reduce((sum, t) => sum + t.total_tokens, 0).toLocaleString()}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="text-2xl font-bold">
              {formatCost(traces.reduce((sum, t) => sum + t.total_cost, 0))}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="text-2xl font-bold">
              {((traces.filter(t => t.status === 'success').length / traces.length) * 100).toFixed(0)}%
            </p>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {traces.map((trace) => (
          <Link
            key={trace.id}
            href={`/dashboard/traces/${trace.trace_id}`}
            className="block"
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-xl font-semibold">{trace.name}</h2>
                <Badge className={getStatusColor(trace.status)}>
                  {trace.status.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Started</span>
                  <span>{formatDate(trace.start_time)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">
                    {trace.duration_ms
                      ? `${(trace.duration_ms / 1000).toFixed(2)}s`
                      : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tokens</span>
                  <span className="font-medium">{trace.total_tokens.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cost</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{formatCost(trace.total_cost)}</span>
                    {trace.total_cost === 0 && (
                      <Badge variant="default" className="text-xs">FREE</Badge>
                    )}
                  </div>
                </div>
              </div>

              {trace.tags.length > 0 && (
                <div className="mt-4 flex gap-2 flex-wrap">
                  {trace.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
