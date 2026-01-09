"use client"

import { useEffect, useRef, useState, useCallback } from "react"

const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE ?? "ws://127.0.0.1:8000"

export type RealtimeEvent = {
  type: string
  data: Record<string, any>
  timestamp: string
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error"

export function useRealtime(onEvent?: (event: RealtimeEvent) => void) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected")
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      setStatus("connecting")
      const ws = new WebSocket(`${WS_BASE}/ws`)

      ws.onopen = () => {
        setStatus("connected")
        reconnectAttempts.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const data: RealtimeEvent = JSON.parse(event.data)
          setLastEvent(data)
          onEvent?.(data)
        } catch (e) {
          console.error("Failed to parse WebSocket message:", e)
        }
      }

      ws.onclose = () => {
        setStatus("disconnected")
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        }
      }

      ws.onerror = () => {
        setStatus("error")
      }

      wsRef.current = ws
    } catch (e) {
      setStatus("error")
    }
  }, [onEvent])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setStatus("disconnected")
  }, [])

  const send = useCallback((message: Record<string, any>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return { status, lastEvent, send, reconnect: connect, disconnect }
}

// Hook for polling fallback when WebSocket is not available
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  intervalMs: number = 5000,
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const result = await fetchFn()
      setData(result)
      setError(null)
    } catch (e: any) {
      setError(e.message ?? "Failed to fetch")
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  useEffect(() => {
    if (!enabled) return

    fetchData()
    const interval = setInterval(fetchData, intervalMs)

    return () => clearInterval(interval)
  }, [fetchData, intervalMs, enabled])

  return { data, loading, error, refetch: fetchData }
}
