'use client'

import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import { FilterPanel } from '@/components/analytics/FilterPanel'
import { MetricCards } from '@/components/analytics/MetricCards'
import { TokenUsageChart } from '@/components/analytics/TokenUsageChart'
import { ModelBreakdown } from '@/components/analytics/ModelBreakdown'
import { TopTracesTable } from '@/components/analytics/TopTracesTable'
import { ExportButton } from '@/components/analytics/ExportButton'
import { ErrorBoundary } from '@/components/smallComponents/ErrorBoundary'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { analyticsAPI, projectsAPI } from '@/lib/api'
import {
  AnalyticsSummary,
  TrendData,
  ModelBreakdown as ModelBreakdownType,
  TopTrace,
  AnalyticsFilters,
} from '@/types/analytics'
import { Project } from '@/types'

function AnalyticsPageContent() {
  const router = useRouter()

  // Filter state
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: 'this_year',
    customStartDate: null,
    customEndDate: null,
    selectedProjects: [],
  })

  // Data state
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [trends, setTrends] = useState<TrendData[]>([])
  const [granularity, setGranularity] = useState<string>('day')
  const [modelBreakdown, setModelBreakdown] = useState<ModelBreakdownType[]>([])
  const [topTraces, setTopTraces] = useState<TopTrace[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debounce timer
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)


  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await projectsAPI.list()
        setProjects(projectsData)
      } catch (err) {
        console.error('Failed to fetch projects:', err)
      }
    }
    fetchProjects()
  }, [])

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async (forceRefresh = false) => {
    setIsLoading(true)
    setError(null)

    try {
      const projectIds =
        filters.selectedProjects.length > 0
          ? filters.selectedProjects
          : undefined

      // Fetch all analytics data in parallel
      const [summaryData, trendsData, modelsData, tracesData] =
        await Promise.all([
          analyticsAPI.getSummary(
            filters.timeRange,
            filters.customStartDate || undefined,
            filters.customEndDate || undefined,
            projectIds
          ),
          analyticsAPI.getTrends(
            filters.timeRange,
            filters.customStartDate || undefined,
            filters.customEndDate || undefined,
            projectIds
          ),
          analyticsAPI.getModels(
            filters.timeRange,
            filters.customStartDate || undefined,
            filters.customEndDate || undefined,
            projectIds
          ),
          analyticsAPI.getTopTraces(
            filters.timeRange,
            filters.customStartDate || undefined,
            filters.customEndDate || undefined,
            projectIds,
            10,
            'tokens'
          ),
        ])

        // console.log(summaryData, trendsData, modelsData, tracesData, "summaryData, trendsData, modelsData, tracesData")

      setSummary(summaryData)
      setTrends(trendsData.data)
      setGranularity(trendsData.granularity)
      setModelBreakdown(modelsData.models)
      setTopTraces(tracesData.traces)
    } catch (err: any) {
      console.error('Failed to fetch analytics data:', err)
      setError(err.message || 'Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Debounced fetch when filters change
  useEffect(() => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Set new timer for debounced fetch
    const timer = setTimeout(() => {
      fetchAnalyticsData()
    }, 300) // 300ms debounce

    setDebounceTimer(timer)

    // Cleanup
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  // Initial load
  useEffect(() => {
    fetchAnalyticsData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTimeRangeChange = (range: string) => {
    setFilters((prev) => ({
      ...prev,
      timeRange: range as AnalyticsFilters['timeRange'],
      customStartDate: range !== 'custom' ? null : prev.customStartDate,
      customEndDate: range !== 'custom' ? null : prev.customEndDate,
    }))
  }

  const handleCustomDateChange = (
    start: Date | null,
    end: Date | null
  ) => {
    setFilters((prev) => ({
      ...prev,
      customStartDate: start,
      customEndDate: end,
    }))
  }

  const handleProjectsChange = (projectIds: string[]) => {
    setFilters((prev) => ({
      ...prev,
      selectedProjects: projectIds,
    }))
  }

  const handleRefresh = () => {
    fetchAnalyticsData(true)
  }

  const handleTraceClick = (traceId: string) => {
    router.push(`/dashboard/traces/${traceId}`)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor your LLM usage, costs, and performance metrics
          </p>
        </div>
        <ExportButton
          filters={{
            timeRange: filters.timeRange,
            projects: filters.selectedProjects,
            startDate: filters.customStartDate,
            endDate: filters.customEndDate,
          }}
        />
      </div>

      {/* Filters */}
      <FilterPanel
        timeRange={filters.timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        customStartDate={filters.customStartDate}
        customEndDate={filters.customEndDate}
        onCustomDateChange={handleCustomDateChange}
        selectedProjects={filters.selectedProjects}
        onProjectsChange={handleProjectsChange}
        projects={projects}
        onRefresh={handleRefresh}
      />

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading analytics data</AlertTitle>
          <AlertDescription>
            <p className="mb-3">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAnalyticsData(true)}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !error && summary && summary.total_traces === 0 && (
        <Alert>
          <AlertTitle>No data available</AlertTitle>
          <AlertDescription>
            <p>
              No traces found matching your current filters. Try adjusting your
              time range or project selection, or create some traces to see
              analytics data.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Metric Cards */}
      <MemoizedMetricCards summary={summary} isLoading={isLoading} />

      {/* Token Usage Chart */}
      <MemoizedTokenUsageChart
        data={trends}
        isLoading={isLoading}
        granularity={granularity}
      />

      {/* Model Breakdown and Top Traces */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MemoizedModelBreakdown data={modelBreakdown} isLoading={isLoading} />
        <MemoizedTopTracesTable
          data={topTraces}
          isLoading={isLoading}
          onTraceClick={handleTraceClick}
        />
      </div>
    </div>
  )
}

// Memoized components for performance optimization
const MemoizedMetricCards = memo(MetricCards)
const MemoizedTokenUsageChart = memo(TokenUsageChart)
const MemoizedModelBreakdown = memo(ModelBreakdown)
const MemoizedTopTracesTable = memo(TopTracesTable)

export default function AnalyticsPage() {
  return (
    <ErrorBoundary>
      <AnalyticsPageContent />
    </ErrorBoundary>
  )
}
