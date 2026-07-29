"use client"

import { Clock, Receipt, FileText, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { name: '勤怠管理', icon: Clock, href: '/' },
  { name: '経費申請', icon: Receipt, href: '/expenses', disabled: true },
  { name: '稟議申請', icon: FileText, href: '/approvals', disabled: true },
  { name: '設定', icon: Settings, href: '/settings', disabled: true },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <span className="text-xl font-bold text-indigo-600 tracking-tight">CorpPortal</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <div key={item.name}>
              {item.disabled ? (
                <div className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-slate-400 cursor-not-allowed group">
                  <item.icon className="mr-3 h-5 w-5 text-slate-400" />
                  <span className="flex-1">{item.name}</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-semibold tracking-wider">準備中</span>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                  {item.name}
                </Link>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
