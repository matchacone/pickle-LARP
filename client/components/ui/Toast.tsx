'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  title: string
  message?: string
  type: ToastType
}

interface ToastContextType {
  toast: (title: string, message?: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (title: string, message?: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, message, type }])
    
    // Auto remove
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto min-w-[300px] max-w-[400px] bg-surface border border-outline rounded-lg shadow-lift p-4 flex gap-3 animate-fade-up">
            {t.type === 'success' && <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={20} />}
            {t.type === 'error' && <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />}
            {t.type === 'info' && <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />}
            
            <div className="flex-1">
              <h4 className="text-sm font-bold">{t.title}</h4>
              {t.message && <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{t.message}</p>}
            </div>
            
            <button onClick={() => removeToast(t.id)} className="text-on-surface-variant hover:bg-surface-low rounded p-1 shrink-0 self-start -mt-1 -mr-1">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context.toast
}
