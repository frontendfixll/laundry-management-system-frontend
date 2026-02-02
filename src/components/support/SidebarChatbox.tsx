'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  MessageSquare,
  Send,
  X,
  Minimize2,
  Maximize2,
  Headphones,
  User,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface ChatMessage {
  id: string
  sender: {
    name: string
    role: string
  }
  message: string
  timestamp: Date
  isFromSupport: boolean
}

interface ChatSession {
  sessionId: string
  ticketNumber: string
  subject: string
  status: 'open' | 'in_progress' | 'waiting' | 'resolved'
  unreadCount: number
}

export default function SidebarChatbox() {
  const { user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !currentSession) {
      initializeChat()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const initializeChat = async () => {
    setLoading(true)
    try {
      // Try multiple token sources
      let token = null;
      
      // Method 1: Direct token from localStorage
      token = localStorage.getItem('token');
      
      // Method 2: From auth-storage (Zustand persist)
      if (!token) {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token;
        }
      }

      if (!token) return

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${API_URL}/tenant/chat/active-session`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.session) {
          setCurrentSession(data.data.session)
          setMessages(data.data.messages || [])
        } else {
          // Create new session
          await createNewSession()
        }
      } else {
        // Fallback to mock data
        setCurrentSession({
          sessionId: 'session_sidebar_1',
          ticketNumber: 'TKT-2026-CHAT-001',
          subject: 'Quick Support Chat',
          status: 'open',
          unreadCount: 0
        })
        setMessages([
          {
            id: 'welcome_msg',
            sender: { name: 'Platform Support', role: 'support' },
            message: 'Hello! How can I help you today?',
            timestamp: new Date(),
            isFromSupport: true
          }
        ])
      }
    } catch (error) {
      console.error('Error initializing chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNewSession = async () => {
    try {
      // Try multiple token sources
      let token = null;
      
      // Method 1: Direct token from localStorage
      token = localStorage.getItem('token');
      
      // Method 2: From auth-storage (Zustand persist)
      if (!token) {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token;
        }
      }

      if (!token) return

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${API_URL}/tenant/chat/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: 'Quick Support Chat',
          priority: 'medium',
          initialMessage: 'Hi, I need some quick help.'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCurrentSession(data.data.session)
          setMessages(data.data.messages || [])
        }
      }
    } catch (error) {
      console.error('Error creating new session:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentSession) return

    const tempMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      sender: { name: user?.name || 'You', role: 'tenant_admin' },
      message: newMessage,
      timestamp: new Date(),
      isFromSupport: false
    }

    setMessages(prev => [...prev, tempMessage])
    const messageToSend = newMessage
    setNewMessage('')

    try {
      // Try multiple token sources
      let token = null;
      
      // Method 1: Direct token from localStorage
      token = localStorage.getItem('token');
      
      // Method 2: From auth-storage (Zustand persist)
      if (!token) {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token;
        }
      }

      if (!token) return

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${API_URL}/tenant/chat/${currentSession.sessionId}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageToSend,
          messageType: 'text'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.message) {
          // Replace temp message with real message
          setMessages(prev => prev.map(msg => 
            msg.id === tempMessage.id ? data.data.message : msg
          ))
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600'
      case 'in_progress': return 'text-yellow-600'
      case 'waiting': return 'text-orange-600'
      case 'resolved': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-3 h-3" />
      case 'in_progress': return <Clock className="w-3 h-3" />
      case 'waiting': return <Clock className="w-3 h-3" />
      case 'resolved': return <CheckCircle className="w-3 h-3" />
      default: return <AlertCircle className="w-3 h-3" />
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
        >
          <Headphones className="w-6 h-6" />
          <span className="absolute right-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Platform Support
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-80 h-96'
        }`}>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Platform Support</h3>
                {currentSession && (
                  <div className="flex items-center space-x-1 text-xs">
                    <span className={getStatusColor(currentSession.status)}>
                      {getStatusIcon(currentSession.status)}
                    </span>
                    <span className="text-gray-500">{currentSession.ticketNumber}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 h-64">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isFromSupport ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            message.isFromSupport
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          <p>{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.isFromSupport ? 'text-gray-500' : 'text-blue-200'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="p-3 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}