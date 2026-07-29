"use client"

import { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'

export function ImageModal({ src, alt }: { src: string, alt: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div 
        className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 relative group cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-auto object-contain max-h-96 transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 bg-white/90 p-3 rounded-full shadow-lg transform scale-95 group-hover:scale-100 transition-all">
            <ZoomIn className="w-6 h-6 text-slate-800" />
          </div>
        </div>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative max-w-5xl w-full max-h-full flex items-center justify-center">
            <button 
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  )
}
