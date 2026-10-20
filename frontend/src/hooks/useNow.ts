import { useEffect, useState } from 'react'

/** Trenutni čas, ki se osveži vsakih `interval` ms. */
export function useNow(interval = 250, enabled = true): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!enabled) return
    const id = window.setInterval(() => setNow(Date.now()), interval)
    return () => window.clearInterval(id)
  }, [interval, enabled])
  return now
}
