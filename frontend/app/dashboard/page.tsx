"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tracesAPI, projectsAPI } from "@/libs/api";
import { Trace, Project } from "@/types";
import { formatCost, getStatusColor } from "@/libs/utils";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();

  // Helper function to format dates in IST with UTC
  const formatDateIST = (dateString: string): string => {
    try {
      // Ensure timestamp is treated as UTC by appending 'Z' if not present
      const utcString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
      const date = parseISO(utcString);
      const istTime = formatInTimeZone(date, 'Asia/Kolkata', 'MMM dd, yyyy HH:mm');
      const utcTime = formatInTimeZone(date, 'UTC', 'HH:mm');
      return `${istTime} IST (${utcTime} UTC)`;
    } catch {
      return dateString;
    }
  };

  // Replace this with actual project ID from user projects or context
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);

  const [traces, setTraces] = useState<Trace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Get current project ID from context/props/login
    // For demo, set manually or redirect to projects page
    const storedProjectId = localStorage.getItem("currentProjectId");
    const storedProjectName = localStorage.getItem("currentProjectName");
    const storedApiKey = localStorage.getItem("currentProjectApiKey");
    
    if (!storedProjectId) {
      router.push("/projects");
    } else {
      setProjectId(storedProjectId);
      // Set project details from localStorage
      if (storedProjectName && storedApiKey) {
        setProject({
          id: storedProjectId,
          name: storedProjectName,
          api_key: storedApiKey,
          description: null,
          is_active: true,
          created_at: new Date().toISOString(),
        });
      }
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
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchTraces();
  }, [projectId]);

  // Mask API key - show first 8 and last 4 characters
  const maskApiKey = (key: string) => {
    if (key.length <= 12) return key;
    return `${key.slice(0, 8)}${'•'.repeat(key.length - 12)}${key.slice(-4)}`;
  };

  const copyApiKey = async () => {
    if (project?.api_key) {
      await navigator.clipboard.writeText(project.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Project Traces</h1>

      {/* API Key Display */}
      {project && (
        <Card className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">API Key</p>
              <div className="flex items-center gap-3">
                <code className="text-sm font-mono bg-white px-3 py-1.5 rounded border border-blue-200">
                  {maskApiKey(project.api_key)}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyApiKey}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <p className="font-medium">{project.name}</p>
            </div>
          </div>
        </Card>
      )}

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
                  <span>{formatDateIST(trace.start_time)}</span>
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
