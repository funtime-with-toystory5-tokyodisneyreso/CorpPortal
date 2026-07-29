"use client"

import { Clock, Receipt, FileText, Settings, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getProfile } from '@/app/actions/profile'
import { useState, useEffect } from 'react'

const defaultMenuItems = [
  { name: '勤怠管理', icon: Clock, href: '/' },
  { name: '経費申請', icon: Receipt, href: '/expenses' },
  { name: '稟議申請', icon: FileText, href: '/approvals' },
  { name: '設定', icon: Settings, href: '/settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [menuItems, setMenuItems] = useState(defaultMenuItems)

  useEffect(() => {
    getProfile().then(profile => {
      if (profile && profile.role !== '一般') {
        setMenuItems([
          ...defaultMenuItems.slice(0, 3),
          { name: '承認トレイ', icon: CheckSquare, href: '/management' },
          defaultMenuItems[3]
        ])
      }
    })
  }, [])

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
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
