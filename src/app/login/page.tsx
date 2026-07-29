import { login } from './actions'
import { Building2, Mail, Lock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { SubmitButton } from '@/components/SubmitButton'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl max-h-3xl pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8">
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">CorpPortal</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">ログインまたはアカウント作成</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm font-bold">
                {error === 'Database error saving new user' ? 'データベースのユーザー作成トリガーでエラーが発生しました。Supabaseのログを確認してください。' : error}
              </div>
            </div>
          )}

          <form className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1.5">
                メールアドレス
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="taro.yamada@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-slate-800"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-1.5">
                パスワード
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <SubmitButton formAction={login}>
                ログイン
              </SubmitButton>
            </div>
          </form>
          
          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            アカウントをお持ちでないですか？{' '}
            <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-bold">
              新規登録はこちら
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
