import { Receipt, Plus, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { getExpenses } from '@/app/actions/expenses'
import { ClickableRow } from '@/components/ClickableRow'

export const dynamic = 'force-dynamic'

export default async function ExpensesPage() {
  const expenses = await getExpenses()

  const getStatusColor = (status: string) => {
    switch (status) {
      case '完了': return 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100'
      case '差し戻し': return 'bg-rose-50 text-rose-700 group-hover:bg-rose-100'
      default: return 'bg-amber-50 text-amber-700 group-hover:bg-amber-100'
    }
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6 relative h-full flex flex-col">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center">
            経費申請
            <span className="ml-3 px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-sm rounded-full font-bold">
              {expenses.length}件
            </span>
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">
            交通費・交際費などの立替経費を申請します。
          </p>
        </div>
        
        {/* Desktop New Button */}
        <Link href="/expenses/new" className="hidden md:flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          <span>新規申請</span>
        </Link>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="申請を検索..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-slate-700"
          />
        </div>
        <button className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">
          <Filter className="w-4 h-4" />
          <span>絞り込み</span>
        </button>
      </div>

      {/* Mobile Card List (Hidden on Desktop) */}
      <div className="md:hidden space-y-3 flex-1">
        {expenses.length === 0 ? (
          <div className="text-center py-10 text-slate-500 font-medium">申請データがありません</div>
        ) : (
          expenses.map((expense) => (
            <Link key={expense.id} href={`/expenses/${expense.id}`} className="block">
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-indigo-200 active:scale-[0.98] transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 mb-1 inline-block">
                        {expense.category}
                      </span>
                      <p className="text-xs font-bold text-slate-400">{expense.date}</p>
                    </div>
                  </div>
                  <div className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(expense.status)}`}>
                    {expense.status}
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-2">{expense.description || '用途未入力'}</h3>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-800 tabular-nums">¥{expense.amount.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Desktop Table (Hidden on Mobile) */}
      <div className="hidden md:block flex-1 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">申請ID / 日付</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">種別</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">用途</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">金額</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500 font-medium">申請データがありません</td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <ClickableRow key={expense.id} href={`/expenses/${expense.id}`} className="hover:bg-indigo-50/30 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-slate-400 mb-0.5">{expense.id.slice(0, 8).toUpperCase()}</div>
                      <div className="font-medium text-slate-700">{expense.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {expense.description || '用途未入力'}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-800 tabular-nums text-right text-base">
                      ¥{expense.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm ${getStatusColor(expense.status)}`}>
                        {expense.status}
                      </span>
                    </td>
                  </ClickableRow>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <Link href="/expenses/new" className="md:hidden fixed bottom-20 right-4 z-50 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(79,70,229,0.4)] active:scale-90 transition-transform">
        <Plus className="w-6 h-6" />
      </Link>

      {/* Background decoration */}
      <div className="fixed top-20 right-0 w-96 h-96 bg-indigo-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-x-1/2 pointer-events-none -z-10"></div>
    </div>
  )
}
