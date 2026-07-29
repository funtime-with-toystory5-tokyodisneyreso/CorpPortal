"use client"

import { ArrowLeft, FileText, UploadCloud, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { insertApproval } from '@/app/actions/approvals'
import { useRouter } from 'next/navigation'

export default function NewApprovalPage() {
  const router = useRouter()
  const [priority, setPriority] = useState('通常')
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-6 h-full flex flex-col relative">
      <div className="flex items-center space-x-4">
        <Link href="/approvals" className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center">
          新規稟議の作成
        </h1>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-6 flex-1">
        
        <form ref={formRef} action={async (formData) => {
          setSubmitting(true)
          try {
            await insertApproval(formData)
            router.push('/approvals')
          } catch (e) {
            alert('保存に失敗しました')
            setSubmitting(false)
          }
        }} className="space-y-5">
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">件名 <span className="text-rose-500 text-xs ml-1">必須</span></label>
            <input name="title" required type="text" placeholder="例: 開発用新規SaaSツールの導入について" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-slate-800" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">決済希望額</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">¥</span>
                <input name="amount" type="number" placeholder="0" className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-slate-800 tabular-nums" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">優先度</label>
              <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-200">
                <input type="hidden" name="priority" value={priority} />
                <button 
                  type="button"
                  onClick={() => setPriority('通常')}
                  className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${priority === '通常' ? 'bg-white text-slate-700 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}>
                  通常
                </button>
                <button 
                  type="button"
                  onClick={() => setPriority('至急')}
                  className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${priority === '至急' ? 'bg-rose-50 text-rose-700 shadow-sm border border-rose-100' : 'text-slate-500 hover:text-slate-700'}`}>
                  至急 (HIGH)
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">決裁者 (承認ルート)</label>
            <select name="approver_route" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-slate-800">
              <option>課長 承認 → 部長 承認</option>
              <option>部長 直接承認</option>
              <option>役員 承認</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">稟議内容 / 理由</label>
            <textarea 
              name="description"
              rows={5} 
              placeholder="導入の背景や費用対効果などを記載してください" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-slate-800 resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">添付資料 (見積書など)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 hover:border-indigo-300 transition-colors cursor-pointer group">
              <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-sm font-bold text-slate-700">資料を追加</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end space-x-3">
            <Link href="/approvals" className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
              キャンセル
            </Link>
            <button disabled={submitting} className="px-5 py-2.5 bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">
              {submitting ? '申請中...' : '稟議を申請する'}
            </button>
          </div>
        </form>

      </div>
      
      {/* Background Blob */}
      <div className="fixed top-40 left-0 w-96 h-96 bg-purple-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-60 -translate-x-1/2 pointer-events-none -z-10"></div>
    </div>
  )
}
