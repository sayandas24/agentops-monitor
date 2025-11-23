"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendData } from "@/types/analytics";

interface TokenUsageChartProps {
  data: TrendData[];
  isLoading: boolean;
  granularity?: string;
}

type ChartView = "total" | "input" | "output";

export function TokenUsageChart({
  data,
  isLoading,
  granularity = "day",
}: TokenUsageChartProps) {
  const [view, setView] = useState<ChartView>("total");

  const formatXAxis = (timestamp: string) => {
    try {
      const date = parseISO(timestamp);
      if (granularity === "hour") {
        return format(date, "HH:mm");
      } else if (granularity === "day") {
        return format(date, "MMM dd");
      } else {
        return format(date, "MMM dd");
      }
    } catch {
      return timestamp;
    }
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const getChartData = () => {
    return data.map((item) => ({
      timestamp: item.timestamp,
      value:
        view === "total"
          ? item.total_tokens
          : view === "input"
          ? item.input_tokens
          : item.output_tokens,
      input_tokens: item.input_tokens,
      output_tokens: item.output_tokens,
      total_tokens: item.total_tokens,
    }));
  };

  const getLineColor = () => {
    switch (view) {
      case "input":
        return "#3b82f6"; // blue
      case "output":
        return "#10b981"; // green
      case "total":
        return "#8b5cf6"; // purple
    }
  };

  const getViewLabel = () => {
    switch (view) {
      case "input":
        return "Input Tokens";
      case "output":
        return "Output Tokens";
      case "total":
        return "Total Tokens";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Usage Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Usage Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">No data available</p>
              <p className="text-sm mt-2">
                Try adjusting your filters or create some traces
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Token Usage Over Time</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={view === "total" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("total")}
            >
              Total
            </Button>
            <Button
              variant={view === "input" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("input")}
            >
              Input
            </Button>
            <Button
              variant={view === "output" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("output")}
            >
              Output
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={getChartData()}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              tickFormatter={formatYAxis}
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
              }}
              labelFormatter={(label) => {
                try {
                  return format(parseISO(label as string), "PPpp");
                } catch {
                  return label;
                }
              }}
              formatter={(value: number, name: string) => {
                if (name === "value") {
                  return [formatTooltipValue(value), getViewLabel()];
                }
                return [formatTooltipValue(value), name];
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke={getLineColor()}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name={getViewLabel()}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
