'use client'

/**
 * Socket.IO Singleton Context
 * ONE socket shared across all admin components - prevents 240+ duplicate connections
 */
import React, { createContext, useContext, useRef, useEffect, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'

interface SocketIOContextValue {
  socket: Socket | null
  isConnected: boolean
  connect: () => void
  disconnect: () => void
}

const SocketIOContext = createContext<SocketIOContextValue | null>(null)

export function SocketIOProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore()
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const [contextValue, setContextValue] = useState<SocketIOContextValue>({
    socket: null,
    isConnected: false,
    connect: () => {},
    disconnect: () => {}
  })

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
      setContextValue(prev => ({ ...prev, socket: null, isConnected: false }))
    }
  }, [])

  const connect = useCallback(() => {
    if (!user || !token) return
    if (socketRef.current?.connected) return

    if (socketRef.current) {
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
      socketRef.current = null
    }

    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      auth: { token },
      query: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: false
    })

    socket.on('connect', () => setIsConnected(true))
    socket.on('disconnect', () => setIsConnected(false))

    socketRef.current = socket
    setContextValue({
      socket,
      isConnected: socket.connected,
      connect,
      disconnect
    })
  }, [user, token, disconnect])

  useEffect(() => {
    if (user && token) connect()
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [user?._id, token, connect])

  return (
    <SocketIOContext.Provider value={contextValue}>
      {children}
    </SocketIOContext.Provider>
  )
}

export function useSocketIOContext() {
  return useContext(SocketIOContext)
}
