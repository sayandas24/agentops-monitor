'use client'

import { useState } from 'react'
import { Calendar, RefreshCw, X } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Project } from '@/types'

interface FilterPanelProps {
  timeRange: string
  onTimeRangeChange: (range: string) => void
  customStartDate: Date | null
  customEndDate: Date | null
  onCustomDateChange: (start: Date | null, end: Date | null) => void
  selectedProjects: string[]
  onProjectsChange: (projects: string[]) => void
  projects: Project[]
  onRefresh: () => void
}

export function FilterPanel({
  timeRange,
  onTimeRangeChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
  selectedProjects,
  onProjectsChange,
  projects,
  onRefresh,
}: FilterPanelProps) {
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)

  const timeRangeOptions = [
    { value: 'last_24h', label: 'Last 24 hours' },
    { value: 'last_7d', label: 'Last 7 days' },
    { value: 'last_30d', label: 'Last 30 days' },
    { value: 'all_time', label: 'All time' },
    { value: 'custom', label: 'Custom range' },
  ]

  const handleProjectToggle = (projectId: string) => {
    if (selectedProjects.includes(projectId)) {
      onProjectsChange(selectedProjects.filter((id) => id !== projectId))
    } else {
      onProjectsChange([...selectedProjects, projectId])
    }
  }

  const handleClearFilters = () => {
    onTimeRangeChange('all_time')
    onCustomDateChange(null, null)
    onProjectsChange([])
  }

  const hasActiveFilters =
    timeRange !== 'all_time' ||
    selectedProjects.length > 0 ||
    customStartDate ||
    customEndDate

  const getTimeRangeLabel = () => {
    const option = timeRangeOptions.find((opt) => opt.value === timeRange)
    return option?.label || 'All time'
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Time Range:</span>
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Range Pickers */}
        {timeRange === 'custom' && (
          <>
            <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[180px] justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {customStartDate ? (
                    format(customStartDate, 'PPP')
                  ) : (
                    <span>Start date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={customStartDate || undefined}
                  onSelect={(date) => {
                    onCustomDateChange(date || null, customEndDate)
                    setIsStartDateOpen(false)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[180px] justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {customEndDate ? (
                    format(customEndDate, 'PPP')
                  ) : (
                    <span>End date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={customEndDate || undefined}
                  onSelect={(date) => {
                    onCustomDateChange(customStartDate, date || null)
                    setIsEndDateOpen(false)
                  }}
                  initialFocus
                  disabled={(date) =>
                    customStartDate ? date < customStartDate : false
                  }
                />
              </PopoverContent>
            </Popover>
          </>
        )}

        {/* Project Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Projects:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-start">
                {selectedProjects.length === 0
                  ? 'All Projects'
                  : `${selectedProjects.length} selected`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-3" align="start">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Select Projects</span>
                  {selectedProjects.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onProjectsChange([])}
                      className="h-auto p-1 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-1">
                  {projects.map((project) => (
                    <label
                      key={project.id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => handleProjectToggle(project.id)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{project.name}</span>
                    </label>
                  ))}
                  {projects.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No projects available
                    </p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          title="Refresh data"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-gray-600"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          
          {timeRange !== 'all_time' && (
            <Badge variant="secondary" className="gap-1">
              {getTimeRangeLabel()}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  onTimeRangeChange('all_time')
                  onCustomDateChange(null, null)
                }}
              />
            </Badge>
          )}

          {selectedProjects.map((projectId) => {
            const project = projects.find((p) => p.id === projectId)
            return (
              <Badge key={projectId} variant="secondary" className="gap-1">
                {project?.name || projectId}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleProjectToggle(projectId)}
                />
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
