import { ArrowLeft, Receipt, Calendar, FileText, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'
import { getExpense, updateExpenseStatus } from '@/app/actions/expenses'
import { getProfile } from '@/app/actions/profile'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const expense = await getExpense(id)
  const profile = await getProfile()

  if (!expense) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case '完了': return 'bg-emerald-50 text-emerald-700'
      case '差し戻し': return 'bg-rose-50 text-rose-700'
      default: return 'bg-amber-50 text-amber-700'
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-6 h-full flex flex-col relative">
      <div className="flex items-center space-x-4">
        <Link href="/expenses" className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center">
          経費の詳細
        </h1>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-6 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-bold text-slate-400 mb-1 font-mono">ID: {expense.id.toUpperCase()}</div>
            <h2 className="text-2xl font-black text-slate-800">{expense.description || '用途未入力'}</h2>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${getStatusColor(expense.status)}`}>
            {expense.status}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          <div>
            <div className="flex items-center text-sm font-bold text-slate-500 mb-1">
              <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
              申請日
            </div>
            <div className="text-lg font-bold text-slate-800">{expense.date}</div>
          </div>
          <div>
            <div className="flex items-center text-sm font-bold text-slate-500 mb-1">
              <Receipt className="w-4 h-4 mr-2 text-indigo-500" />
              種別
            </div>
            <div className="text-lg font-bold text-slate-800">{expense.category}</div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <div className="text-sm font-bold text-slate-500 mb-1">申請金額</div>
          <div className="text-4xl font-black text-slate-800 tabular-nums">
            ¥{expense.amount.toLocaleString()}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center text-sm font-bold text-slate-500 mb-3">
            <FileText className="w-4 h-4 mr-2 text-indigo-500" />
            添付された領収書
          </div>
          {expense.receipt_image_url ? (
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 relative group">
              <img 
                src={expense.receipt_image_url} 
                alt="領収書" 
                className="w-full h-auto object-contain max-h-96"
              />
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-center">
              <p className="text-sm font-bold text-slate-500">領収書の添付はありません</p>
            </div>
          )}
        </div>
      </div>

      {profile && profile.role !== '一般' && expense.status === '承認待ち' && (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-xl p-6">
          <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-indigo-500" />
            管理者アクション
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <form action={updateExpenseStatus.bind(null, id, '承認済')} className="flex-1">
              <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98]">
                承認する
              </button>
            </form>
            <form action={updateExpenseStatus.bind(null, id, '差し戻し')} className="flex-1">
              <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98]">
                差し戻し
              </button>
            </form>
            <form action={updateExpenseStatus.bind(null, id, '却下')} className="flex-1">
              <button type="submit" className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98]">
                却下
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Background Blob */}
      <div className="fixed top-40 right-0 w-96 h-96 bg-blue-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-60 translate-x-1/2 pointer-events-none -z-10"></div>
    </div>
  )
}
