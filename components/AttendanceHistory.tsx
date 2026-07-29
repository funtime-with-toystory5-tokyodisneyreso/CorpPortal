const dummyHistory = [
  { date: '2026-07-26 (日)', status: '休日', in: '-', out: '-', break: '-', total: '-' },
  { date: '2026-07-25 (土)', status: '休日', in: '-', out: '-', break: '-', total: '-' },
  { date: '2026-07-24 (金)', status: '出勤', in: '09:05', out: '17:55', break: '1:00', total: '7:50' },
  { date: '2026-07-23 (木)', status: '有休', in: '-', out: '-', break: '-', total: '-' },
  { date: '2026-07-22 (水)', status: '出勤', in: '08:50', out: '19:00', break: '1:00', total: '9:10' },
]

export function AttendanceHistory() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80">
        <h3 className="font-bold text-slate-800 flex items-center">
          <span className="w-1.5 h-4 bg-indigo-500 rounded-full mr-2"></span>
          直近の勤怠履歴
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 bg-slate-50/50 uppercase border-b border-slate-100">
            <tr>
              <th className="px-5 py-4 font-semibold">日付</th>
              <th className="px-5 py-4 font-semibold">状態</th>
              <th className="px-5 py-4 font-semibold">出勤</th>
              <th className="px-5 py-4 font-semibold">退勤</th>
              <th className="px-5 py-4 font-semibold">休憩</th>
              <th className="px-5 py-4 font-semibold">実働</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dummyHistory.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4 font-medium text-slate-700">{row.date}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold ${
                    row.status === '有休' ? 'bg-emerald-100 text-emerald-700' : 
                    row.status === '休日' ? 'bg-slate-100 text-slate-600' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-600 tabular-nums">{row.in}</td>
                <td className="px-5 py-4 text-slate-600 tabular-nums">{row.out}</td>
                <td className="px-5 py-4 text-slate-600 tabular-nums">{row.break}</td>
                <td className="px-5 py-4 text-slate-700 font-bold tabular-nums">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
