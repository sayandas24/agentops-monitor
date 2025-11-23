'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TopTrace } from '@/types/analytics'

interface TopTracesTableProps {
  data: TopTrace[]
  isLoading: boolean
  onTraceClick: (trace_id: string) => void
}

type SortField = 'total_tokens' | 'total_cost' | 'duration_ms'
type SortDirection = 'asc' | 'desc'

export function TopTracesTable({
  data,
  isLoading,
  onTraceClick,
}: TopTracesTableProps) {
  const [sortField, setSortField] = useState<SortField>('total_tokens')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showAll, setShowAll] = useState(false)

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDuration = (ms: number): string => {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`
    } else {
      return `${(ms / 60000).toFixed(2)}m`
    }
  }

  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm')
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      success: { variant: 'default', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      failed: { variant: 'destructive', className: '' },
      running: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
    }

    const config = variants[status] || variants.success

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    )
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    )
  }

  const sortedData = [...data].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1
    return (a[sortField] - b[sortField]) * multiplier
  })

  const displayData = showAll ? sortedData : sortedData.slice(0, 10)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Traces</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Traces</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg font-medium">No traces found</p>
            <p className="text-sm mt-2">
              No traces match your current filters
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Traces</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trace Name</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('total_tokens')}
                      className="h-8 px-2"
                    >
                      Tokens
                      {getSortIcon('total_tokens')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('total_cost')}
                      className="h-8 px-2"
                    >
                      Cost
                      {getSortIcon('total_cost')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('duration_ms')}
                      className="h-8 px-2"
                    >
                      Duration
                      {getSortIcon('duration_ms')}
                    </Button>
                  </TableHead>
                  <TableHead>LLM Calls</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((trace) => (
                  <TableRow
                    key={trace.trace_id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => onTraceClick(trace.trace_id)}
                  >
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {trace.name}
                    </TableCell>
                    <TableCell>{formatNumber(trace.total_tokens)}</TableCell>
                    <TableCell>{formatCurrency(trace.total_cost)}</TableCell>
                    <TableCell>{formatDuration(trace.duration_ms)}</TableCell>
                    <TableCell>{formatNumber(trace.llm_call_count)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(trace.start_time)}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {trace.project_name}
                    </TableCell>
                    <TableCell>{getStatusBadge(trace.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {data.length > 10 && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Show Less' : `Show All (${data.length} traces)`}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
