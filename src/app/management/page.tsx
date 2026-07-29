import { CheckSquare, FileText, Receipt, User, Building, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getPendingExpenses, getExpenseHistory } from '@/app/actions/expenses'
import { getPendingApprovals, getApprovalHistory } from '@/app/actions/approvals'
import { getProfile } from '@/app/actions/profile'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ManagementPage({ searchParams }: { searchParams: Promise<{ tab?: string, filter?: string }> }) {
  const { tab, filter } = await searchParams;
  const currentTab = tab || 'approvals';
  const currentFilter = filter || 'pending';
  const profile = await getProfile();

  if (!profile || profile.role === '一般') {
    redirect('/');
  }

  // Fetch pending always to show the count badge at the top
  const pendingExpenses = await getPendingExpenses();
  const pendingApprovals = await getPendingApprovals();

  // Fetch history if needed
  const approvals = currentFilter === 'history' ? await getApprovalHistory() : pendingApprovals;
  const expenses = currentFilter === 'history' ? await getExpenseHistory() : pendingExpenses;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '承認済':
      case '完了': return 'bg-emerald-100 text-emerald-800'
      case '差し戻し': return 'bg-amber-100 text-amber-800'
      case '却下': return 'bg-rose-100 text-rose-800'
      case '承認待ち': return 'bg-indigo-50 text-indigo-600'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6 relative h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <CheckSquare className="w-8 h-8 text-indigo-600 mr-3" />
            承認トレイ
            <span className="ml-3 px-2.5 py-0.5 bg-rose-100 text-rose-700 text-sm rounded-full font-bold">
              未処理 {pendingExpenses.length + pendingApprovals.length}件
            </span>
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">
            部下や他部門からの申請内容を確認し、承認・却下を行います。
          </p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <Link 
          href={`/management?tab=approvals&filter=${currentFilter}`} 
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${currentTab === 'approvals' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          稟議申請 ({pendingApprovals.length})
        </Link>
        <Link 
          href={`/management?tab=expenses&filter=${currentFilter}`} 
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${currentTab === 'expenses' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          経費申請 ({pendingExpenses.length})
        </Link>
      </div>

      <div className="flex bg-slate-100/80 p-1.5 rounded-xl w-full sm:w-fit border border-slate-200/50">
        <Link
          href={`/management?tab=${currentTab}&filter=pending`}
          className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all text-center ${currentFilter === 'pending' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          未処理
        </Link>
        <Link
          href={`/management?tab=${currentTab}&filter=history`}
          className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all text-center ${currentFilter === 'history' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          過去の履歴
        </Link>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        {currentTab === 'approvals' && (
          <>
            {/* Mobile view: Cards */}
            <div className="md:hidden flex flex-col p-4 space-y-4">
              {approvals.length === 0 ? (
                <div className="text-center py-10 text-slate-500 font-medium">
                  {currentFilter === 'history' ? '過去の履歴はありません' : '現在、承認待ちの稟議はありません'}
                </div>
              ) : (
                approvals.map((approval) => (
                  <div key={approval.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-800 flex items-center mb-1">
                          <User className="w-3 h-3 mr-1 text-slate-400" />
                          {approval.applicant_name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center">
                          <Building className="w-3 h-3 mr-1 text-slate-400" />
                          {approval.applicant_department}・{new Date(approval.created_at).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {approval.priority === '至急' && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black rounded-sm">HIGH</span>
                        )}
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-sm ${getStatusBadge(approval.status)}`}>
                          {approval.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">{approval.title}</h3>
                      <p className="text-xs font-medium text-slate-500 mt-1">ルート: {approval.approver_route}</p>
                    </div>
                    <div className="flex justify-between items-end border-t border-slate-50 pt-3">
                      <div className="font-black text-slate-800 tabular-nums text-lg">
                        {approval.amount ? `¥${parseInt(approval.amount).toLocaleString()}` : '-'}
                      </div>
                      <Link href={`/approvals/${approval.id}`} className="inline-flex items-center justify-center px-5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-sm rounded-lg transition-colors">
                        詳細を見る
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop view: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">状態 / 申請者 / 日付</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">件名</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">金額</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">アクション</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvals.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-500 font-medium">
                        {currentFilter === 'history' ? '過去の履歴はありません' : '現在、承認待ちの稟議はありません'}
                      </td>
                    </tr>
                  ) : (
                    approvals.map((approval) => (
                      <tr key={approval.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`px-2 py-0.5 text-[10px] font-black rounded-sm ${getStatusBadge(approval.status)}`}>
                              {approval.status}
                            </span>
                          </div>
                          <div className="font-bold text-slate-800 flex items-center mb-0.5">
                            <User className="w-3 h-3 mr-1 text-slate-400" />
                            {approval.applicant_name}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center">
                            <Building className="w-3 h-3 mr-1 text-slate-400" />
                            {approval.applicant_department}・{new Date(approval.created_at).toLocaleDateString('ja-JP')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 mb-1">
                            {approval.priority === '至急' && (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black rounded-sm">HIGH</span>
                            )}
                            <h3 className="font-bold text-slate-800 text-base">{approval.title}</h3>
                          </div>
                          <p className="text-xs font-medium text-slate-500">ルート: {approval.approver_route}</p>
                        </td>
                        <td className="px-6 py-4 font-black text-slate-800 tabular-nums text-right text-base whitespace-nowrap">
                          {approval.amount ? `¥${parseInt(approval.amount).toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <Link href={`/approvals/${approval.id}`} className="inline-flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-lg transition-colors">
                            詳細を見る
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {currentTab === 'expenses' && (
          <>
            {/* Mobile view: Cards */}
            <div className="md:hidden flex flex-col p-4 space-y-4">
              {expenses.length === 0 ? (
                <div className="text-center py-10 text-slate-500 font-medium">
                  {currentFilter === 'history' ? '過去の履歴はありません' : '現在、承認待ちの経費はありません'}
                </div>
              ) : (
                expenses.map((expense) => (
                  <div key={expense.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-800 flex items-center mb-1">
                          <User className="w-3 h-3 mr-1 text-slate-400" />
                          {expense.applicant_name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center">
                          <Building className="w-3 h-3 mr-1 text-slate-400" />
                          {expense.applicant_department}・{expense.date}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-sm ${getStatusBadge(expense.status)}`}>
                          {expense.status}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-sm">
                          {expense.category}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-base">{expense.description || '用途未入力'}</div>
                    </div>
                    <div className="flex justify-between items-end border-t border-slate-50 pt-3">
                      <div className="font-black text-slate-800 tabular-nums text-lg">
                        ¥{expense.amount.toLocaleString()}
                      </div>
                      <Link href={`/expenses/${expense.id}`} className="inline-flex items-center justify-center px-5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-sm rounded-lg transition-colors">
                        詳細を見る
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop view: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">状態 / 申請者 / 申請日</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">用途 / 種別</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">金額</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">アクション</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-500 font-medium">
                        {currentFilter === 'history' ? '過去の履歴はありません' : '現在、承認待ちの経費はありません'}
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`px-2 py-0.5 text-[10px] font-black rounded-sm ${getStatusBadge(expense.status)}`}>
                              {expense.status}
                            </span>
                          </div>
                          <div className="font-bold text-slate-800 flex items-center mb-0.5">
                            <User className="w-3 h-3 mr-1 text-slate-400" />
                            {expense.applicant_name}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center">
                            <Building className="w-3 h-3 mr-1 text-slate-400" />
                            {expense.applicant_department}・{expense.date}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-slate-800 text-base mb-1">{expense.description || '用途未入力'}</div>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-sm inline-block">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-slate-800 tabular-nums text-right text-base whitespace-nowrap">
                          ¥{expense.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <Link href={`/expenses/${expense.id}`} className="inline-flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-lg transition-colors">
                            詳細を見る
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Background Blob */}
      <div className="fixed top-40 left-0 w-96 h-96 bg-indigo-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-60 -translate-x-1/2 pointer-events-none -z-10"></div>
    </div>
  )
}
