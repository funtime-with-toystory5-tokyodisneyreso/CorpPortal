"use client"

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

export function SubmitButton({ children, formAction, className }: { children: React.ReactNode, formAction?: any, className?: string }) {
  const { pending } = useFormStatus()
  return (
    <button 
      formAction={formAction}
      disabled={pending} 
      className={className || "w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"}
    >
      {pending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
      {pending ? '処理中...' : children}
    </button>
  )
}
