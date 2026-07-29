"use client"

import { Clock, Receipt, FileText, Settings, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getProfile } from '@/app/actions/profile'
import { useState, useEffect } from 'react'

const defaultMenuItems = [
  { name: '勤怠', icon: Clock, href: '/' },
  { name: '経費', icon: Receipt, href: '/expenses' },
  { name: '稟議', icon: FileText, href: '/approvals' },
  { name: '設定', icon: Settings, href: '/settings' },
]

export function BottomNav() {
  const pathname = usePathname()
  const [menuItems, setMenuItems] = useState(defaultMenuItems)

  useEffect(() => {
    getProfile().then(profile => {
      if (profile && profile.role !== '一般') {
        setMenuItems([
          ...defaultMenuItems.slice(0, 3),
          { name: '管理', icon: CheckSquare, href: '/management' },
          defaultMenuItems[3]
        ])
      }
    })
  }, [])

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center px-2 pb-safe z-50 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
      {menuItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <div key={item.name} className="flex-1 flex justify-center">
            <Link
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 w-full h-full transition-colors ${
                isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-full ${isActive ? 'bg-indigo-50' : ''}`}>
                <item.icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-semibold ${isActive ? 'text-indigo-600' : ''}`}>{item.name}</span>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
