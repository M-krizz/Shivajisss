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

  const send = useCallback((message: Record<string, any>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  useEffect(() => {
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5

    const connect = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return

      try {
        setStatus("connecting")
        const ws = new WebSocket(`${WS_BASE}/ws`)

        ws.onopen = () => {
          setStatus("connected")
          reconnectAttempts = 0
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
          if (reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts++
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
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [onEvent])

  return { status, lastEvent, send }
}
