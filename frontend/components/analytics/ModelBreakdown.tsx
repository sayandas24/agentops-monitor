'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ModelBreakdown as ModelBreakdownType } from '@/types/analytics'

interface ModelBreakdownProps {
  data: ModelBreakdownType[]
  isLoading: boolean
}

const PROVIDER_COLORS: Record<string, string> = {
  google: '#4285F4',
  openai: '#10a37f',
  anthropic: '#D4A574',
  default: '#8b5cf6',
}

export function ModelBreakdown({ data, isLoading }: ModelBreakdownProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getProviderColor = (provider: string): string => {
    return PROVIDER_COLORS[provider.toLowerCase()] || PROVIDER_COLORS.default
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cost by Model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cost by Model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">No model data available</p>
              <p className="text-sm mt-2">
                No LLM calls found in the selected time range
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((item) => ({
    name: item.model_name,
    cost: item.total_cost,
    provider: item.provider,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost by Model</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Bar Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Cost']}
              />
              <Legend />
              <Bar dataKey="cost" name="Cost" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getProviderColor(entry.provider)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Detailed Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">
              Model Details
            </h4>
            <div className="space-y-2">
              {data.map((model, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {model.model_name}
                      </span>
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: `${getProviderColor(model.provider)}20`,
                          color: getProviderColor(model.provider),
                        }}
                      >
                        {model.provider}
                      </Badge>
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-gray-600">
                      <span>
                        {formatNumber(model.total_tokens)} tokens
                      </span>
                      <span>
                        {formatNumber(model.call_count)} calls
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">
                      {formatCurrency(model.total_cost)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {model?.cost_percentage?.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
