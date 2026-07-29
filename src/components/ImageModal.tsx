"use client"

import { useState } from 'react'
import { X, ZoomIn, ZoomOut, RotateCcw, Search } from 'lucide-react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

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
          <div className="opacity-0 group-hover:opacity-100 bg-white/90 p-3 rounded-full shadow-lg transform scale-95 group-hover:scale-100 transition-all flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-800" />
            <span className="text-sm font-bold text-slate-800 pr-2">拡大して見る</span>
          </div>
        </div>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 z-[60] p-2 sm:p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          
          <div 
            className="w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={5}
              centerOnInit={true}
              wheel={{ step: 0.1 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <div className="relative w-full h-full flex flex-col">
                  {/* Zoom Controls Overlay */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl">
                    <button 
                      onClick={() => zoomOut()}
                      className="p-3 text-white hover:bg-white/20 rounded-xl transition-colors"
                      title="縮小"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </button>
                    <div className="w-[1px] h-6 bg-white/20 mx-1"></div>
                    <button 
                      onClick={() => resetTransform()}
                      className="p-3 text-white hover:bg-white/20 rounded-xl transition-colors"
                      title="リセット"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <div className="w-[1px] h-6 bg-white/20 mx-1"></div>
                    <button 
                      onClick={() => zoomIn()}
                      className="p-3 text-white hover:bg-white/20 rounded-xl transition-colors"
                      title="拡大"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden">
                    <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                      <img 
                        src={src} 
                        alt={alt} 
                        className="max-w-full max-h-screen object-contain pointer-events-none select-none"
                      />
                    </TransformComponent>
                  </div>
                </div>
              )}
            </TransformWrapper>
          </div>
        </div>
      )}
    </>
  )
}
