"use client"

import { Play, Square, Coffee, RotateCcw } from 'lucide-react'
import { WorkStatus } from './AttendanceSystem'

type Props = {
  status: WorkStatus
  onAction: (type: '出勤' | '退勤' | '休憩開始' | '休憩終了') => void
}

export function ClockInButtons({ status, onAction }: Props) {
  const canClockIn = status === 'NOT_STARTED'
  const canClockOut = status === 'WORKING' || status === 'ON_BREAK'
  const canStartBreak = status === 'WORKING'
  const canEndBreak = status === 'ON_BREAK'

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <button
        onClick={() => onAction('出勤')}
        disabled={!canClockIn}
        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 ${
          canClockIn 
            ? 'bg-white border-indigo-100 text-indigo-700 hover:bg-indigo-50/50 hover:border-indigo-300 shadow-sm hover:shadow-md hover:-translate-y-0.5' 
            : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-60'
        }`}
      >
        <div className={`p-3 rounded-full mb-3 ${canClockIn ? 'bg-indigo-100' : 'bg-slate-100'}`}>
          <Play className={`h-6 w-6 ${canClockIn ? 'text-indigo-600' : 'text-slate-400'}`} fill={canClockIn ? "currentColor" : "none"} />
        </div>
        <span className="font-bold text-lg">出勤</span>
      </button>

      <button
        onClick={() => onAction('休憩開始')}
        disabled={!canStartBreak}
        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 ${
          canStartBreak 
            ? 'bg-white border-amber-100 text-amber-700 hover:bg-amber-50/50 hover:border-amber-300 shadow-sm hover:shadow-md hover:-translate-y-0.5' 
            : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-60'
        }`}
      >
        <div className={`p-3 rounded-full mb-3 ${canStartBreak ? 'bg-amber-100' : 'bg-slate-100'}`}>
          <Coffee className={`h-6 w-6 ${canStartBreak ? 'text-amber-600' : 'text-slate-400'}`} />
        </div>
        <span className="font-bold text-lg">休憩開始</span>
      </button>

      <button
        onClick={() => onAction('休憩終了')}
        disabled={!canEndBreak}
        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 ${
          canEndBreak 
            ? 'bg-white border-teal-100 text-teal-700 hover:bg-teal-50/50 hover:border-teal-300 shadow-sm hover:shadow-md hover:-translate-y-0.5' 
            : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-60'
        }`}
      >
        <div className={`p-3 rounded-full mb-3 ${canEndBreak ? 'bg-teal-100' : 'bg-slate-100'}`}>
          <RotateCcw className={`h-6 w-6 ${canEndBreak ? 'text-teal-600' : 'text-slate-400'}`} />
        </div>
        <span className="font-bold text-lg">休憩終了</span>
      </button>

      <button
        onClick={() => onAction('退勤')}
        disabled={!canClockOut}
        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 ${
          canClockOut 
            ? 'bg-white border-rose-100 text-rose-700 hover:bg-rose-50/50 hover:border-rose-300 shadow-sm hover:shadow-md hover:-translate-y-0.5' 
            : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-60'
        }`}
      >
        <div className={`p-3 rounded-full mb-3 ${canClockOut ? 'bg-rose-100' : 'bg-slate-100'}`}>
          <Square className={`h-6 w-6 ${canClockOut ? 'text-rose-600' : 'text-slate-400'}`} fill={canClockOut ? "currentColor" : "none"} />
        </div>
        <span className="font-bold text-lg">退勤</span>
      </button>
    </div>
  )
}
