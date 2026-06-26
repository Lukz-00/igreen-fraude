import { useState, useCallback } from 'react'
import { SEED_TICKETS } from '../data/constants'

export function useTickets() {
  const [tickets, setTickets] = useState(SEED_TICKETS)

  const mutate = useCallback((id, patch) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
  }, [])

  const addHistory = useCallback((id, entry) => {
    setTickets(prev => prev.map(t =>
      t.id === id ? { ...t, history: [...t.history, entry] } : t
    ))
  }, [])

  const createTicket = useCallback((data) => {
    setTickets(prev => [data, ...prev])
  }, [])

  return { tickets, mutate, addHistory, createTicket }
}
