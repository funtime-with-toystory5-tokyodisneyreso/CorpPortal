import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CorpPortal - 業務効率化ツール',
  description: '社内の業務効率化ツール',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CorpPortal',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#f8fafc',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-slate-50 text-slate-900 flex h-[100dvh] overflow-hidden overscroll-none`}>
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        <div className="flex-1 flex flex-col min-w-0 h-full relative pb-16 md:pb-0">
          <Header />
          <main className="flex-1 overflow-auto p-4 md:p-6 w-full max-w-7xl mx-auto">
            {children}
          </main>
        </div>
        
        {/* Mobile Bottom Navigation (hidden on desktop) */}
        <BottomNav />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
