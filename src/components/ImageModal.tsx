"use client"

import { Search } from 'lucide-react'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'

export function ImageModal({ src, alt }: { src: string, alt: string }) {
  return (
    <PhotoProvider
      speed={() => 300}
      maskOpacity={0.9}
      pullClosable={true}
    >
      <PhotoView src={src}>
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 relative group cursor-pointer">
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-auto object-contain max-h-96 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 bg-white/90 p-3 rounded-full shadow-lg transform scale-95 group-hover:scale-100 transition-all flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-800" />
              <span className="text-sm font-bold text-slate-800 pr-2">タップして拡大</span>
            </div>
          </div>
        </div>
      </PhotoView>
    </PhotoProvider>
  )
}
