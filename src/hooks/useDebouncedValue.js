import { useEffect, useState } from 'react'

export function useDebouncedValue(value, delay = 60) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [delay, value])

  return debounced
}
