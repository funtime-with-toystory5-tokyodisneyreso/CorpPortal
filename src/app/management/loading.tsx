import { CheckSquare, FileText, User, Building, Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center">
            <CheckSquare className="w-8 h-8 text-slate-300 mr-3" />
            <div className="h-8 w-40 bg-slate-200 rounded-md animate-pulse"></div>
          </div>
          <div className="h-4 w-64 bg-slate-100 rounded-md mt-3 animate-pulse"></div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 pb-3">
        <div className="h-5 w-24 bg-slate-200 rounded-md animate-pulse"></div>
        <div className="h-5 w-24 bg-slate-200 rounded-md animate-pulse"></div>
      </div>

      <div className="flex bg-slate-100/80 p-1.5 rounded-xl w-full sm:w-fit border border-slate-200/50">
        <div className="flex-1 sm:flex-none px-6 py-2 h-9 w-24 bg-white rounded-lg shadow-sm"></div>
        <div className="flex-1 sm:flex-none px-6 py-2 h-9 w-24"></div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden p-4 min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-400" />
          <p className="font-bold text-sm">データを読み込んでいます...</p>
        </div>
      </div>

      {/* Background Blob */}
      <div className="fixed top-40 left-0 w-96 h-96 bg-indigo-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-60 -translate-x-1/2 pointer-events-none -z-10"></div>
    </div>
  )
}
