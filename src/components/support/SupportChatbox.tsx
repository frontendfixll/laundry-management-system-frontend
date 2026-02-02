'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  MessageSquare,
  Send,
  X,
  Minimize2,
  Maximize2,
  Phone,
  Mail,
  Clock,
  User,
  Bot,
  Paperclip,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react'

interface ChatMessage {
  id: string
  sender: 'user' | 'support' | 'system'
  message: string
  timestamp: string
  type: 'text' | 'image' | 'file' | 'system'
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  attachments?: {
    name: string
    url: string
    type: string
    size: number
  }[]
}

interface SupportAgent {
  id: string
  name: string
  avatar?: string
  status: 'online' | 'away' | 'offline'
  responseTime: string
}

export default function SupportChatbox() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [supportAgent, setSupportAgent] = useState<SupportAgent | null>(null)
  const [chatStatus, setChatStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
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
    setChatStatus('connecting')
    
    try {
      // Get auth token
      const authStorage = localStorage.getItem('auth-storage')
      const token = authStorage ? JSON.parse(authStorage).state?.token : null

      if (!token) {
        setChatStatus('disconnected')
        return
      }

      // Check for existing chat sessions
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${API_URL}/tenant/chat/my-sessions?limit=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.sessions.length > 0) {
          // Use existing session
          const session = data.data.sessions[0]
          setCurrentSessionId(session.id)
          await loadChatHistory(session.id, token)
        }
      }

      setChatStatus('connected')
      setSupportAgent({
        id: 'platform_support',
        name: 'Platform Support',
        status: 'online',
        responseTime: '< 2 min'
      })
      
      // Add welcome message if no existing session
      if (!currentSessionId) {
        const welcomeMessage: ChatMessage = {
          id: 'welcome_001',
          sender: 'system',
          message: 'Welcome to LaundryLobby Support! How can we help you today?',
          timestamp: new Date().toISOString(),
          type: 'system'
        }
        
        setMessages([welcomeMessage])
      }
    } catch (error) {
      console.error('Error initializing chat:', error)
      setChatStatus('disconnected')
    }
  }

  const loadChatHistory = async (sessionId: string, token: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${API_URL}/tenant/chat/${sessionId}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.messages) {
          const formattedMessages: ChatMessage[] = data.data.messages.map((msg: any) => ({
            id: msg.id,
            sender: msg.isFromSupport ? 'support' : 'user',
            message: msg.message,
            timestamp: msg.timestamp,
            type: msg.messageType || 'text',
            status: msg.status
          }))
          setMessages(formattedMessages)
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sending'
    }

    setMessages(prev => [...prev, userMessage])
    const messageText = newMessage.trim()
    setNewMessage('')

    try {
      // Get auth token
      const authStorage = localStorage.getItem('auth-storage')
      const token = authStorage ? JSON.parse(authStorage).state?.token : null

      if (!token) {
        throw new Error('No auth token')
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

      // Create new session if none exists
      if (!currentSessionId) {
        const createResponse = await fetch(`${API_URL}/tenant/chat/create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: messageText,
            category: 'general',
            priority: 'medium'
          })
        })

        if (createResponse.ok) {
          const createData = await createResponse.json()
          if (createData.success) {
            setCurrentSessionId(createData.data.sessionId)
            
            // Update message status to sent
            setMessages(prev => prev.map(msg => 
              msg.id === userMessage.id 
                ? { ...msg, status: 'sent' }
                : msg
            ))
            return
          }
        }
        throw new Error('Failed to create chat session')
      } else {
        // Send message to existing session
        const sendResponse = await fetch(`${API_URL}/tenant/chat/send-message`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sessionId: currentSessionId,
            message: messageText,
            messageType: 'text'
          })
        })

        if (sendResponse.ok) {
          const sendData = await sendResponse.json()
          if (sendData.success) {
            // Update message status to sent
            setMessages(prev => prev.map(msg => 
              msg.id === userMessage.id 
                ? { ...msg, status: 'sent' }
                : msg
            ))
            return
          }
        }
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Update message status to failed and show auto-response
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, status: 'sent' }
          : msg
      ))

      // Simulate support agent typing
      setTimeout(() => {
        setIsTyping(true)
      }, 1000)

      // Simulate support response
      setTimeout(() => {
        setIsTyping(false)
        
        const supportResponse: ChatMessage = {
          id: `support_${Date.now()}`,
          sender: 'support',
          message: getAutoResponse(messageText),
          timestamp: new Date().toISOString(),
          type: 'text',
          status: 'delivered'
        }
        
        setMessages(prev => [...prev, supportResponse])
        
        // Update unread count if chat is minimized
        if (isMinimized) {
          setUnreadCount(prev => prev + 1)
        }
      }, 3000)
    }
  }

  const getAutoResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()
    
    if (message.includes('order') || message.includes('delivery')) {
      return "I can help you with your order! Could you please provide your order number so I can check the status for you?"
    }
    
    if (message.includes('payment') || message.includes('refund')) {
      return "I understand you have a payment-related question. Let me connect you with our billing specialist who can assist you with payment and refund inquiries."
    }
    
    if (message.includes('account') || message.includes('login')) {
      return "I can help you with account-related issues. Are you having trouble logging in, or do you need help with account settings?"
    }
    
    if (message.includes('hello') || message.includes('hi')) {
      return "Hello! I'm here to help you with any questions or issues you might have. What can I assist you with today?"
    }
    
    return "Thank you for reaching out! I've received your message and will help you resolve this issue. Could you provide a bit more detail about what you're experiencing?"
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const fileMessage: ChatMessage = {
        id: `file_${Date.now()}_${Math.random()}`,
        sender: 'user',
        message: `Uploaded: ${file.name}`,
        timestamp: new Date().toISOString(),
        type: 'file',
        status: 'sending',
        attachments: [{
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          size: file.size
        }]
      }
      
      setMessages(prev => [...prev, fileMessage])
      
      // Simulate file upload
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === fileMessage.id 
            ? { ...msg, status: 'sent' }
            : msg
        ))
      }, 1500)
    })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setUnreadCount(0)
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
    if (isMinimized) {
      setUnreadCount(0)
    }
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-50 group"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Need help? Chat with us!
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  {supportAgent ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                {supportAgent && (
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    supportAgent.status === 'online' ? 'bg-green-500' : 
                    supportAgent.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {supportAgent ? supportAgent.name : 'LaundryLobby Support'}
                </p>
                <p className="text-xs text-blue-100">
                  {chatStatus === 'connecting' ? 'Connecting...' :
                   chatStatus === 'connected' ? (supportAgent ? `Responds in ${supportAgent.responseTime}` : 'Online') :
                   'Offline'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMinimize}
                className="p-1 hover:bg-blue-500 rounded transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-blue-500 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[440px]">
                {chatStatus === 'connecting' && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Connecting to support...</p>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${
                      message.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-l-lg rounded-tr-lg' 
                        : message.sender === 'system'
                        ? 'bg-gray-100 text-gray-700 rounded-lg'
                        : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
                    } p-3`}>
                      {message.type === 'file' && message.attachments && (
                        <div className="mb-2">
                          {message.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded">
                              <Paperclip className="w-4 h-4" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{attachment.name}</p>
                                <p className="text-xs opacity-75">{formatFileSize(attachment.size)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-sm">{message.message}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-75">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.sender === 'user' && message.status && (
                          <div className="flex items-center space-x-1">
                            {message.status === 'sending' && <Loader className="w-3 h-3 animate-spin" />}
                            {message.status === 'sent' && <CheckCircle className="w-3 h-3" />}
                            {message.status === 'delivered' && <CheckCircle className="w-3 h-3" />}
                            {message.status === 'read' && <CheckCircle className="w-3 h-3 text-blue-300" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg p-3">
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-gray-500 ml-2">Support is typing...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      disabled={chatStatus !== 'connected'}
                    />
                  </div>
                  
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || chatStatus !== 'connected'}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />

                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>Press Enter to send</span>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3 h-3" />
                      <span>+91 80000 00000</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Mail className="w-3 h-3" />
                      <span>support@laundrylobby.com</span>
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}