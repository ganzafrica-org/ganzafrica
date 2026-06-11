import { useEffect, useState } from "react"

export function useDebounce<T>(value: T, delay = 400) {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const handle = window.setTimeout(() => setDebounced(value), delay)
        return () => window.clearTimeout(handle)
    }, [delay, value])

    return debounced
}
