"use client"

import { useState, useEffect } from 'react'
import { ClockInButtons } from './ClockInButtons'
import { AttendanceHistory } from './AttendanceHistory'

export type WorkStatus = 'NOT_STARTED' | 'WORKING' | 'ON_BREAK' | 'FINISHED'

export type LogEntry = {
  id: string;
  type: '出勤' | '退勤' | '休憩開始' | '休憩終了';
  time: string;
}

export function AttendanceSystem() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [status, setStatus] = useState<WorkStatus>('NOT_STARTED')
  const [todayLogs, setTodayLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleAction = (type: '出勤' | '退勤' | '休憩開始' | '休憩終了') => {
    if (!currentTime) return

    const timeString = currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    
    setTodayLogs(prev => [
      { id: Date.now().toString(), type, time: timeString },
      ...prev
    ])

    if (type === '出勤') setStatus('WORKING')
    else if (type === '休憩開始') setStatus('ON_BREAK')
    else if (type === '休憩終了') setStatus('WORKING')
    else if (type === '退勤') setStatus('FINISHED')
  }

  const getStatusColor = (s: WorkStatus) => {
    switch(s) {
      case 'NOT_STARTED': return 'bg-slate-100 text-slate-600 border-slate-200'
      case 'WORKING': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'ON_BREAK': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'FINISHED': return 'bg-teal-50 text-teal-700 border-teal-200'
    }
  }

  const getStatusText = (s: WorkStatus) => {
    switch(s) {
      case 'NOT_STARTED': return '未出勤'
      case 'WORKING': return '勤務中'
      case 'ON_BREAK': return '休憩中'
      case 'FINISHED': return '退勤済'
    }
  }

  return (
    <div className="space-y-8">
      {/* Realtime Clock & Status */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="text-sm font-medium text-slate-500 mb-2">
            {currentTime ? currentTime.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }) : '...'}
          </div>
          <div className="text-6xl font-black text-slate-800 tracking-tighter tabular-nums mb-6">
            {currentTime ? currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '00:00:00'}
          </div>
          <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm ${getStatusColor(status)} transition-colors duration-300`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${status === 'WORKING' ? 'bg-indigo-500 animate-pulse' : status === 'ON_BREAK' ? 'bg-amber-500' : status === 'FINISHED' ? 'bg-teal-500' : 'bg-slate-400'}`}></div>
            ステータス: {getStatusText(status)}
          </div>
        </div>
      </div>

      <ClockInButtons status={status} onAction={handleAction} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80">
              <h3 className="font-bold text-slate-800 flex items-center">
                <span className="w-1.5 h-4 bg-indigo-500 rounded-full mr-2"></span>
                本日の打刻ログ
              </h3>
            </div>
            <div className="p-5 flex-1 overflow-auto min-h-[300px]">
              {todayLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                    <span className="text-xl">🕒</span>
                  </div>
                  <p className="text-sm">まだ打刻がありません</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {todayLogs.map(log => (
                    <li key={log.id} className="flex justify-between items-center text-sm border-l-2 border-indigo-500 pl-4 py-1">
                      <span className="font-semibold text-slate-700">{log.type}</span>
                      <span className="text-slate-500 font-medium tabular-nums bg-slate-50 px-2 py-1 rounded">{log.time}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <AttendanceHistory />
        </div>
      </div>
    </div>
  )
}
