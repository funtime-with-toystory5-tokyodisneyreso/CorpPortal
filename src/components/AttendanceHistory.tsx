"use client"

import { useEffect, useState } from 'react'
import { getAttendanceHistory, type DailyAttendance } from '@/app/actions/attendance'

export function AttendanceHistory() {
  const [history, setHistory] = useState<DailyAttendance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAttendanceHistory().then((data) => {
      setHistory(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-slate-200/40 overflow-hidden h-full flex flex-col">
      <div className="px-6 py-5 border-b border-slate-100/50 bg-white/50">
        <h3 className="font-bold text-slate-800 text-lg flex items-center">
          <span className="w-2 h-5 bg-indigo-500 rounded-full mr-3 shadow-sm"></span>
          直近の勤怠履歴
        </h3>
      </div>
      
      {/* Mobile view: Cards (hidden on md and up) */}
      <div className="md:hidden flex-1 overflow-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          history.map((row, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col space-y-3 relative overflow-hidden">
              {/* Status indicator bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                row.status === '有休' ? 'bg-emerald-400' : 
                (row.status === '休日' || row.status === '未出勤') ? 'bg-slate-300' : 'bg-indigo-400'
              }`}></div>
              
              <div className="flex justify-between items-center pl-2">
                <div className="flex items-baseline space-x-2">
                  <span className="font-bold text-slate-700">{row.date}</span>
                  <span className="text-xs font-medium text-slate-400">({row.day})</span>
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                  row.status === '有休' ? 'bg-emerald-100 text-emerald-700' : 
                  (row.status === '休日' || row.status === '未出勤') ? 'bg-slate-100 text-slate-600' :
                  'bg-indigo-100 text-indigo-700'
                }`}>
                  {row.status}
                </span>
              </div>
              
              <div className="pl-2 grid grid-cols-2 gap-y-2 gap-x-4 text-sm pt-2 border-t border-slate-50/80">
                <div>
                  <span className="text-slate-400 text-xs block mb-0.5">出勤 - 退勤</span>
                  <span className="font-medium text-slate-700 tabular-nums">
                    {row.in} <span className="text-slate-300 font-normal">→</span> {row.out}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block mb-0.5">実働 (休憩)</span>
                  <span className="font-bold text-indigo-900 tabular-nums">
                    {row.total} <span className="text-slate-400 font-normal text-xs">({row.break})</span>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop view: Table (hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 bg-slate-50/50 uppercase border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold">日付</th>
              <th className="px-6 py-4 font-semibold">状態</th>
              <th className="px-6 py-4 font-semibold">出勤</th>
              <th className="px-6 py-4 font-semibold">退勤</th>
              <th className="px-6 py-4 font-semibold">休憩</th>
              <th className="px-6 py-4 font-semibold">実働</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  </div>
                </td>
              </tr>
            ) : (
              history.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {row.date} <span className="text-slate-400 text-xs">({row.day})</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      row.status === '有休' ? 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100' : 
                      (row.status === '休日' || row.status === '未出勤') ? 'bg-slate-50 text-slate-600 group-hover:bg-slate-100' :
                      'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 tabular-nums font-medium">{row.in}</td>
                  <td className="px-6 py-4 text-slate-600 tabular-nums font-medium">{row.out}</td>
                  <td className="px-6 py-4 text-slate-500 tabular-nums text-xs">{row.break}</td>
                  <td className="px-6 py-4 text-slate-800 font-bold tabular-nums">{row.total}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
