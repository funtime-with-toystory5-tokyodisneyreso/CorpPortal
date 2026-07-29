"use client"

import { FileText, Plus, CheckCircle2, XCircle, Search, AlertCircle, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getApprovals } from '@/app/actions/approvals'

export const dynamic = 'force-dynamic'

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getApprovals().then(data => {
      setApprovals(data)
      setLoading(false)
    })
  }, [])
  
  const getStatusIcon = (status: string) => {
    if (status === '承認済') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    if (status === '却下') return <XCircle className="w-5 h-5 text-rose-500" />
    if (status === '差し戻し') return <AlertCircle className="w-5 h-5 text-amber-500" />
    return <Clock className="w-5 h-5 text-indigo-500" />
  }

  const getStatusColor = (status: string) => {
    if (status === '承認済') return 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100'
    if (status === '却下') return 'bg-rose-50 text-rose-700 group-hover:bg-rose-100'
    if (status === '差し戻し') return 'bg-amber-50 text-amber-700 group-hover:bg-amber-100'
    return 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100'
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6 relative h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center">
            稟議申請
            <span className="ml-3 px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-sm rounded-full font-bold">
              {approvals.length}件
            </span>
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">
            決裁が必要な事項の申請と履歴の確認を行います。
          </p>
        </div>
        
        {/* Desktop New Button */}
        <Link href="/approvals/new" className="hidden md:flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          <span>新規申請</span>
        </Link>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button className="pb-3 text-sm font-bold border-b-2 border-indigo-600 text-indigo-600">
          送信済み (申請履歴)
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500 font-medium">読み込み中...</div>
      ) : (
        <>
          {/* Mobile Card List */}
          <div className="md:hidden space-y-3 flex-1">
            {approvals.length === 0 ? (
              <div className="text-center py-10 text-slate-500 font-medium">申請データがありません</div>
            ) : (
              approvals.map((approval) => (
                <div key={approval.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] active:scale-[0.98] transition-transform">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                        {getStatusIcon(approval.status)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          {approval.priority === '至急' && (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black rounded-sm">HIGH</span>
                          )}
                          <span className="text-xs font-bold text-slate-400">
                            {new Date(approval.created_at).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(approval.status)}`}>
                      {approval.status}
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base mb-1 leading-tight">{approval.title}</h3>
                  <p className="text-xs font-medium text-slate-500 mb-2">ルート: {approval.approver_route}</p>
                  {approval.amount && (
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-800 tabular-nums">¥{parseInt(approval.amount).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block flex-1 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">申請ID / 日付</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">件名</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">金額</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">ステータス</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvals.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-500 font-medium">申請データがありません</td>
                    </tr>
                  ) : (
                    approvals.map((approval) => (
                      <tr key={approval.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                        <td className="px-6 py-4">
                          <div className="font-mono text-xs text-slate-400 mb-0.5">{approval.id.slice(0, 8).toUpperCase()}</div>
                          <div className="font-medium text-slate-700">{new Date(approval.created_at).toLocaleDateString('ja-JP')}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 mb-1">
                            {approval.priority === '至急' && (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black rounded-sm">HIGH</span>
                            )}
                            <h3 className="font-bold text-slate-800 text-base">{approval.title}</h3>
                          </div>
                          <p className="text-xs font-medium text-slate-500">ルート: {approval.approver_route}</p>
                        </td>
                        <td className="px-6 py-4 font-black text-slate-800 tabular-nums text-right text-base">
                          {approval.amount ? `¥${parseInt(approval.amount).toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {getStatusIcon(approval.status)}
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm ${getStatusColor(approval.status)}`}>
                              {approval.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Mobile FAB */}
      <Link href="/approvals/new" className="md:hidden fixed bottom-20 right-4 z-50 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(79,70,229,0.4)] active:scale-90 transition-transform">
        <Plus className="w-6 h-6" />
      </Link>

      {/* Background Blob */}
      <div className="fixed top-40 left-0 w-96 h-96 bg-purple-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-60 -translate-x-1/2 pointer-events-none -z-10"></div>
    </div>
  )
}
