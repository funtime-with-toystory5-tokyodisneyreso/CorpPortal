"use client"

import { Play, Square, Coffee, RotateCcw, CheckCircle2 } from 'lucide-react'
import { WorkStatus } from './AttendanceSystem'

type Props = {
  status: WorkStatus
  onAction: (type: '出勤' | '退勤' | '休憩開始' | '休憩終了') => void
}

export function ClockInButtons({ status, onAction }: Props) {
  
  if (status === 'FINISHED') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 border border-slate-200 rounded-3xl w-full">
        <CheckCircle2 className="h-16 w-16 text-teal-400 mb-4" />
        <h3 className="text-xl font-bold text-slate-700">お疲れ様でした</h3>
        <p className="text-sm text-slate-500 mt-2">本日の業務は終了しています</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center space-y-4">
      {/* Primary Action Button */}
      {status === 'NOT_STARTED' && (
        <button
          onClick={() => onAction('出勤')}
          className="relative group w-48 h-48 sm:w-56 sm:h-56 flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-xl shadow-indigo-500/30 transition-all duration-300 active:scale-95 hover:shadow-2xl hover:shadow-indigo-500/40"
        >
          <div className="absolute inset-0 rounded-full border-4 border-white/20 group-hover:scale-105 transition-transform duration-500"></div>
          <Play className="h-12 w-12 mb-2 fill-current" />
          <span className="text-2xl font-bold tracking-widest">出勤</span>
          <span className="text-xs font-medium text-indigo-100 mt-2 opacity-80">Clock In</span>
        </button>
      )}

      {status === 'WORKING' && (
        <button
          onClick={() => onAction('退勤')}
          className="relative group w-48 h-48 sm:w-56 sm:h-56 flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-xl shadow-rose-500/30 transition-all duration-300 active:scale-95 hover:shadow-2xl hover:shadow-rose-500/40"
        >
          <div className="absolute inset-0 rounded-full border-4 border-white/20 group-hover:scale-105 transition-transform duration-500"></div>
          <Square className="h-10 w-10 mb-3 fill-current" />
          <span className="text-2xl font-bold tracking-widest">退勤</span>
          <span className="text-xs font-medium text-rose-100 mt-2 opacity-80">Clock Out</span>
        </button>
      )}

      {status === 'ON_BREAK' && (
        <button
          onClick={() => onAction('休憩終了')}
          className="relative group w-48 h-48 sm:w-56 sm:h-56 flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-xl shadow-teal-500/30 transition-all duration-300 active:scale-95 hover:shadow-2xl hover:shadow-teal-500/40"
        >
          <div className="absolute inset-0 rounded-full border-4 border-white/20 group-hover:scale-105 transition-transform duration-500"></div>
          <RotateCcw className="h-10 w-10 mb-3" />
          <span className="text-2xl font-bold tracking-widest">休憩終了</span>
          <span className="text-xs font-medium text-teal-100 mt-2 opacity-80">End Break</span>
        </button>
      )}

      {/* Secondary Actions */}
      <div className="pt-6 w-full px-4">
        {status === 'WORKING' && (
          <button
            onClick={() => onAction('休憩開始')}
            className="w-full flex items-center justify-center space-x-3 p-4 rounded-2xl bg-white border-2 border-amber-100 text-amber-700 shadow-sm active:scale-95 transition-all hover:bg-amber-50"
          >
            <Coffee className="h-6 w-6" />
            <span className="font-bold text-lg">休憩に入る</span>
          </button>
        )}
        
        {status === 'ON_BREAK' && (
          <button
            disabled
            className="w-full flex items-center justify-center space-x-3 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-400 opacity-60"
          >
            <Square className="h-6 w-6" />
            <span className="font-bold text-lg">退勤できません（休憩中）</span>
          </button>
        )}
      </div>
    </div>
  )
}
