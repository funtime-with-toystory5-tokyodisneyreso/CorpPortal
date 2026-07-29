"use client"

import { useState, useEffect } from 'react'
import { ClockInButtons } from './ClockInButtons'
import { AttendanceHistory } from './AttendanceHistory'
import { Clock } from 'lucide-react'
import { getTodayAttendanceLogs, insertAttendanceLog, type LogEntry } from '@/app/actions/attendance'

export type WorkStatus = 'NOT_STARTED' | 'WORKING' | 'ON_BREAK' | 'FINISHED'

export function AttendanceSystem() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [status, setStatus] = useState<WorkStatus>('NOT_STARTED')
  const [todayLogs, setTodayLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Fetch initial logs
    getTodayAttendanceLogs().then((logs) => {
      setTodayLogs(logs)
      // Determine status based on last log
      if (logs.length > 0) {
        const lastLog = logs[logs.length - 1]
        if (lastLog.type === '出勤') setStatus('WORKING')
        if (lastLog.type === '休憩開始') setStatus('ON_BREAK')
        if (lastLog.type === '休憩終了') setStatus('WORKING')
        if (lastLog.type === '退勤') setStatus('FINISHED')
      }
      setLoading(false)
    })

    return () => clearInterval(timer)
  }, [])

  const handleAction = async (type: '出勤' | '退勤' | '休憩開始' | '休憩終了') => {
    setLoading(true)
    try {
      await insertAttendanceLog(type)
      const newLogs = await getTodayAttendanceLogs()
      setTodayLogs(newLogs)
      
      if (type === '出勤' || type === '休憩終了') setStatus('WORKING')
      if (type === '休憩開始') setStatus('ON_BREAK')
      if (type === '退勤') setStatus('FINISHED')
    } catch (err) {
      console.error(err)
      alert('打刻に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (s: WorkStatus) => {
    switch(s) {
      case 'NOT_STARTED': return 'bg-slate-100 text-slate-600'
      case 'WORKING': return 'bg-indigo-100 text-indigo-700'
      case 'ON_BREAK': return 'bg-amber-100 text-amber-800'
      case 'FINISHED': return 'bg-teal-100 text-teal-800'
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
    <div className="space-y-6 md:space-y-8 pb-4">
      {/* Realtime Clock & Status - Glassmorphism UI */}
      <div className="bg-white/70 backdrop-blur-xl p-8 md:py-12 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
        {/* Soft animated gradient blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/2 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-y-1/2 -translate-x-1/2 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
          <div className="flex items-center space-x-2 mb-4">
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest shadow-sm transition-colors duration-500 flex items-center ${getStatusColor(status)}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${status === 'WORKING' ? 'bg-indigo-500 animate-pulse' : status === 'ON_BREAK' ? 'bg-amber-500' : status === 'FINISHED' ? 'bg-teal-500' : 'bg-slate-400'}`}></div>
              {getStatusText(status)}
            </div>
          </div>
          
          <div className="text-6xl md:text-7xl font-black text-slate-800 tracking-tighter tabular-nums mb-2 font-mono">
            {currentTime ? currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '00:00:00'}
          </div>
          
          <div className="text-sm font-medium text-slate-500 mb-8 tracking-wide">
            {currentTime ? currentTime.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }) : '...'}
          </div>

          <ClockInButtons status={status} onAction={handleAction} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-1 h-full">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col h-[400px] lg:h-full">
            <div className="px-6 py-5 border-b border-slate-100/50 bg-white/50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center">
                <Clock className="w-5 h-5 text-indigo-500 mr-2" />
                本日の打刻ログ
              </h3>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              {todayLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center shadow-inner border border-slate-100">
                    <span className="text-2xl opacity-50">🕒</span>
                  </div>
                  <p className="text-sm font-medium">まだ打刻がありません</p>
                </div>
              ) : (
                <ul className="space-y-3 px-2">
                  {todayLogs.map((log, index) => (
                    <li key={log.id} className="flex justify-between items-center text-sm border-l-4 border-indigo-400 bg-indigo-50/30 rounded-r-xl pl-4 pr-3 py-3 shadow-sm relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="font-bold text-slate-700 relative z-10">{log.type}</span>
                      <span className="text-indigo-900 font-bold tabular-nums relative z-10 font-mono bg-white/60 px-2 py-0.5 rounded shadow-sm">{log.time}</span>
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
