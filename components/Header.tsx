"use client"

import { User } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const [userRole, setUserRole] = useState('general')

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-6 shrink-0">
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <User className="h-4 w-4 mr-2 text-slate-500" />
          <select 
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="bg-transparent border-none text-sm font-medium focus:ring-0 focus:outline-none cursor-pointer"
          >
            <option value="general">一般社員 (テスト 太郎)</option>
            <option value="approver">承認者 (テスト 花子)</option>
          </select>
        </div>
      </div>
    </header>
  )
}
