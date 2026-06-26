import { useState, useCallback } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((type, title, desc = '') => {
    const id = Date.now()
    const map = {
      success: { icon: '✓', cat: 'Sucesso',  color: '#2ecc72', iconBg: '#0d2e1a' },
      warn:    { icon: '⚠', cat: 'Atenção',  color: '#f0a500', iconBg: '#2e1f00' },
      error:   { icon: '✕', cat: 'Erro',     color: '#e84545', iconBg: '#2e0c0c' },
      info:    { icon: 'ℹ', cat: 'Info',     color: '#3d9cf0', iconBg: '#0a1f3d' },
    }
    const t = { id, title, desc, duration: 4000, ...map[type] }
    setToasts(prev => [...prev, t])
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4300)
  }, [])

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, toast, remove }
}
