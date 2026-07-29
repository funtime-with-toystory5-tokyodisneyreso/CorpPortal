'use client'
import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope)
      }).catch((error) => {
        console.error('Service Worker registration failed:', error)
      })
    } else if ('serviceWorker' in navigator && process.env.NODE_ENV === 'development') {
      // Allow testing in development if desired by changing this
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('Service Worker registered with scope (dev):', registration.scope)
      }).catch((error) => {
        console.error('Service Worker registration failed (dev):', error)
      })
    }
  }, [])
  
  return null
}
