'use client'

import { useState } from 'react'
import { Download, FileJson, FileSpreadsheet, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { analyticsAPI } from '@/lib/api'

interface ExportButtonProps {
  filters: {
    timeRange: string
    projects: string[]
    startDate: Date | null
    endDate: Date | null
  }
}

export function ExportButton({ filters }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | null>(null)

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true)
    setExportFormat(format)

    try {
      await analyticsAPI.exportData(
        format,
        filters.timeRange,
        filters.startDate || undefined,
        filters.endDate || undefined,
        filters.projects.length > 0 ? filters.projects : undefined
      )

      // Show success message (you can add a toast notification here)
      console.log(`Successfully exported data as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Export failed:', error)
      // Show error message (you can add a toast notification here)
      alert('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isExporting}
          className="gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting {exportFormat?.toUpperCase()}...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export Data
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="gap-2 cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('json')}
          disabled={isExporting}
          className="gap-2 cursor-pointer"
        >
          <FileJson className="h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
