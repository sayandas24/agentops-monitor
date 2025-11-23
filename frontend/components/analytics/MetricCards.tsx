"use client";

import {
  Activity,
  Clock,
  DollarSign,
  Hash,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsSummary } from "@/types/analytics";

interface MetricCardsProps {
  summary: AnalyticsSummary | null;
  isLoading: boolean;
}

interface MetricCardData {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

export function MetricCards({ summary, isLoading }: MetricCardsProps) {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`;
    } else if (ms < 3600000) {
      return `${(ms / 60000).toFixed(2)}m`;
    } else {
      return `${(ms / 3600000).toFixed(2)}h`;
    }
  };

  const metrics: MetricCardData[] = summary
    ? [
        {
          title: "Total Tokens",
          value: formatNumber(summary.total_tokens),
          icon: <Hash className="h-4 w-4 text-blue-600" />,
          description: `${formatNumber(
            summary.total_input_tokens
          )} in / ${formatNumber(summary.total_output_tokens)} out`,
        },
        {
          title: "Total Cost",
          value: formatCurrency(summary.total_cost),
          icon: <DollarSign className="h-4 w-4 text-green-600" />,
          description: "Across all traces",
        },
        {
          title: "Total Traces",
          value: formatNumber(summary.total_traces),
          icon: <Activity className="h-4 w-4 text-purple-600" />,
          description: `${formatNumber(summary.total_llm_calls)} LLM calls`,
        },
        {
          title: "Avg Duration",
          value: formatDuration(summary.avg_duration_ms),
          icon: <Clock className="h-4 w-4 text-orange-600" />,
          description: `Min: ${formatDuration(
            summary.min_duration_ms
          )} / Max: ${formatDuration(summary.max_duration_ms)}`,
        },
        {
          title: "Input Tokens",
          value: formatNumber(summary.total_input_tokens),
          icon: <TrendingUp className="h-4 w-4 text-indigo-600" />,
          description: "Total input tokens",
        },
        {
          title: "Output Tokens",
          value: formatNumber(summary.total_output_tokens),
          icon: <TrendingUp className="h-4 w-4 text-pink-600" />,
          description: "Total output tokens",
        },
        {
          title: "Tool Calls",
          value: formatNumber(summary.total_tool_calls),
          icon: <Zap className="h-4 w-4 text-yellow-600" />,
          description: "Total tool executions",
        },
        {
          title: "Total Duration",
          value: formatDuration(summary.total_duration_ms),
          icon: <Clock className="h-4 w-4 text-red-600" />,
          description: "Cumulative execution time",
        },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            {metric.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            {metric.description && (
              <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
