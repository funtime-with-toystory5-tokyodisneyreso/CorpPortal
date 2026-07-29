'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

export function ExportPanel() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const url = `/api/export/expenses?${params.toString()}`

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `expenses_${startDate || 'all'}_to_${endDate || 'all'}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Error downloading Excel:', error)
      alert('ダウンロードに失敗しました。')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full md:w-auto">
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">開始日</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full sm:w-auto focus:outline-none focus:border-indigo-500"
          />
        </div>
        <span className="text-slate-400 hidden sm:inline">〜</span>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">終了日</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full sm:w-auto focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
      
      <button 
        onClick={handleExport}
        disabled={isExporting}
        className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        {isExporting ? '生成中...' : 'Excelダウンロード'}
      </button>
    </div>
  )
}
