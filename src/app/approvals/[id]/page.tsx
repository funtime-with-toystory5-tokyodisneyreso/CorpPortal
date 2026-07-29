import { ArrowLeft, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getApproval, updateApprovalStatus } from '@/app/actions/approvals'
import { getProfile } from '@/app/actions/profile'
import { notFound } from 'next/navigation'
import { ImageModal } from '@/components/ImageModal'

export default async function ApprovalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const approval = await getApproval(id)
  const profile = await getProfile()

  if (!approval) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case '承認済': return 'bg-emerald-50 text-emerald-700'
      case '却下': return 'bg-rose-50 text-rose-700'
      case '差し戻し': return 'bg-amber-50 text-amber-700'
      default: return 'bg-indigo-50 text-indigo-700'
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-6 h-full flex flex-col relative">
      <div className="flex items-center space-x-4">
        <Link href="/approvals" className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center">
          稟議の詳細
        </h1>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-6 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-bold text-slate-400 mb-1 font-mono">ID: {approval.id.toUpperCase()}</div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              {approval.priority === '至急' && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-black rounded-sm">HIGH</span>
              )}
              {approval.title}
            </h2>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${getStatusColor(approval.status)}`}>
            {approval.status}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          <div>
            <div className="flex items-center text-sm font-bold text-slate-500 mb-1">
              申請日
            </div>
            <div className="text-lg font-bold text-slate-800">
              {new Date(approval.created_at).toLocaleDateString('ja-JP')}
            </div>
          </div>
          <div>
            <div className="flex items-center text-sm font-bold text-slate-500 mb-1">
              承認ルート
            </div>
            <div className="text-lg font-bold text-slate-800">{approval.approver_route}</div>
          </div>
        </div>

        {approval.amount && (
          <div className="pt-6 border-t border-slate-100">
            <div className="text-sm font-bold text-slate-500 mb-1">申請金額</div>
            <div className="text-4xl font-black text-slate-800 tabular-nums">
              ¥{parseInt(approval.amount).toLocaleString()}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center text-sm font-bold text-slate-500 mb-3">
            <FileText className="w-4 h-4 mr-2 text-indigo-500" />
            詳細内容
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-slate-700 whitespace-pre-wrap">{approval.description || '記載なし'}</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center text-sm font-bold text-slate-500 mb-3">
            <FileText className="w-4 h-4 mr-2 text-indigo-500" />
            添付資料
          </div>
          {approval.attachment_url ? (
            <ImageModal src={approval.attachment_url} alt="添付資料" />
          ) : (
            <div className="p-6 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-center">
              <p className="text-sm font-bold text-slate-500">添付資料はありません</p>
            </div>
          )}
        </div>
      </div>

      {profile && profile.role !== '一般' && approval.status === '承認待ち' && (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-xl p-6">
          <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-indigo-500" />
            管理者アクション
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <form action={updateApprovalStatus.bind(null, id, '承認済')} className="flex-1">
              <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98]">
                承認する
              </button>
            </form>
            <form action={updateApprovalStatus.bind(null, id, '差し戻し')} className="flex-1">
              <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98]">
                差し戻し
              </button>
            </form>
            <form action={updateApprovalStatus.bind(null, id, '却下')} className="flex-1">
              <button type="submit" className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98]">
                却下
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Background Blob */}
      <div className="fixed top-40 right-0 w-96 h-96 bg-purple-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-60 translate-x-1/2 pointer-events-none -z-10"></div>
    </div>
  )
}
