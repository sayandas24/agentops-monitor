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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {traces.map((trace) => (
          <Link
            key={trace.id}
            href={`/dashboard/traces/${trace.trace_id}`}
            className="block"
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h2 className="mb-2 text-xl font-semibold">{trace.name}</h2>

              <p>
                Status:{" "}
                <span
                  className={`${getStatusColor(
                    trace.status
                  )} rounded px-2 py-1 text-sm font-medium`}
                >
                  {trace.status.toUpperCase()}
                </span>
              </p>

              <p>Started: {formatDate(trace.start_time)}</p>

              <p>
                Duration:{" "}
                {trace.duration_ms
                  ? `${(trace.duration_ms / 1000).toFixed(2)}s`
                  : "N/A"}
              </p>

              <p>Tokens used: {trace.total_tokens}</p>

              <p>
                Cost: <b>{formatCost(trace.total_cost)}</b>{" "}
                {trace.total_cost === 0 && (
                  <Badge variant="default">FREE (Gemini 2.0)</Badge>
                )}
              </p>

              {(trace.tags.includes("adk") || trace.meta?.adk) && (
                <Badge variant="secondary" className="mt-2 inline-block">
                  Google ADK
                </Badge>
              )}
              {trace.tags.includes("a2a") && (
                <Badge variant="secondary" className="mt-2 ml-2 inline-block">
                  A2A Protocol
                </Badge>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
