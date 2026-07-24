'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { showToast } from '@/components/ModernToast'
import { 
  MessageSquare,
  Send,
  Search,
  Clock,
  User,
  Building2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Phone,
  Mail,
  MoreVertical,
  Paperclip,
  Smile,
  X,
  Headphones,
  Shield
} from 'lucide-react'

interface ChatSession {
  sessionId: string
  ticketNumber: string
  subject: string
  lastMessage: {
    message: string
    timestamp: Date
    sender: string
    isFromSupport: boolean
  }
  unreadCount: number
  status: 'open' | 'in_progress' | 'waiting' | 'resolved'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: Date
}

interface ChatMessage {
  id: string
  sender: {
    name: string
    role: string
  }
  message: string
  timestamp: Date
  isFromSupport: boolean
  messageType: 'text' | 'file' | 'system'
}

export default function TenantChatPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [newChatSubject, setNewChatSubject] = useState('')
  const [newChatPriority, setNewChatPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchChatSessions()
    const interval = setInterval(fetchChatSessions, 10000) // Refresh every 10 seconds for real-time updates
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedChat) {
      // PRIORITY FIX: Use MongoDB ObjectId (id) first, then fallback to custom sessionId
      // This ensures we use the same identifier that platform support uses
      const sessionIdentifier = selectedChat.id || selectedChat.sessionId;

      fetchChatHistory(sessionIdentifier);
      
      // Set up interval to refresh messages every 5 seconds when a chat is selected
      const messageInterval = setInterval(() => {
        fetchChatHistory(sessionIdentifier);
      }, 5000)
      
      return () => clearInterval(messageInterval)
    }
  }, [selectedChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChatSessions = async () => {
    setRefreshing(true);

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

      // Method 3: From auth store
      if (!token && user) {
        const authStore = localStorage.getItem('auth-storage');
        if (authStore) {
          const parsedStore = JSON.parse(authStore);
          token = parsedStore.state?.token;
        }
      }

      if (!token) {
        router.push('/auth/login');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

      const response = await fetch(`${API_URL}/tenant/chat/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const sessions = data.data.sessions || [];
          setChatSessions(sessions);
        }
      } else {
        showToast.error(`Failed to load chat sessions (${response.status})`);
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error)
      showToast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchChatHistory = async (sessionId: string) => {
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

      if (!token) {
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

      const response = await fetch(`${API_URL}/tenant/chat/${sessionId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()

        if (data.success) {
          const newMessages = data.data.messages || []

          // Preserve optimistic messages (messages with temp IDs) during refresh
          setMessages(prev => {
            const optimisticMessages = prev.filter(msg => msg.id.startsWith('temp_'))

            // Show notification if new messages arrived
            if (prev.length > 0 && newMessages.length > (prev.length - optimisticMessages.length)) {
              const newMessageCount = newMessages.length - (prev.length - optimisticMessages.length)
              showToast.info(`${newMessageCount} new message(s) from support`)
            }

            // Merge server messages with optimistic messages, sorted by timestamp
            return [...newMessages, ...optimisticMessages]
              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          })
        }
      } else {
        console.error('Chat history API error:', response.status);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return

    const messageText = newMessage.trim()
    // PRIORITY FIX: Use MongoDB ObjectId (id) first, then fallback to custom sessionId
    const sessionId = selectedChat.id || selectedChat.sessionId;

    // Create optimistic message with a unique temporary ID
    const optimisticId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      sender: { name: user?.name || 'You', role: 'tenant_admin' },
      message: messageText,
      timestamp: new Date(),
      isFromSupport: false,
      messageType: 'text'
    }

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage])
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

      if (!token) {
        showToast.error('Authentication required. Please refresh the page.');
        // Remove the optimistic message since we can't send
        setMessages(prev => prev.filter(msg => msg.id !== optimisticId))
        setNewMessage(messageText) // Restore the message text
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${API_URL}/tenant/chat/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          messageType: 'text'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.message) {
          // Replace optimistic message with real message from server
          setMessages(prev => prev.map(msg => 
            msg.id === optimisticId ? {
              id: data.data.message.id || `msg_${Date.now()}`,
              sender: data.data.message.sender || { name: user?.name || 'You', role: 'tenant_admin' },
              message: data.data.message.message || messageText,
              timestamp: new Date(data.data.message.timestamp || Date.now()),
              isFromSupport: data.data.message.isFromSupport || false,
              messageType: data.data.message.messageType || 'text'
            } : msg
          ))
          showToast.success('Message sent successfully!')
          
          // Force a refresh of chat history after successful send to ensure sync
          setTimeout(() => {
            fetchChatHistory(sessionId)
          }, 1000)
        } else {
          // API returned success: false, remove optimistic message
          setMessages(prev => prev.filter(msg => msg.id !== optimisticId))
          showToast.error('Failed to send message: ' + (data.message || 'Unknown error'))
          setNewMessage(messageText) // Restore the message text
        }
      } else {
        // Remove optimistic message on API error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticId))
        showToast.error(`Failed to send message (${response.status}). Please try again.`)
        setNewMessage(messageText) // Restore the message text
      }
    } catch (error) {
      console.error('Error sending message:', error)
      showToast.error('Network error. Please check your connection and try again.')
      
      // Remove the optimistic message on network error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticId))
      setNewMessage(messageText) // Restore the message text
    }
  }

  const createNewChat = async () => {
    if (!newChatSubject.trim()) {
      return;
    }

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

      if (!token) {
        showToast.error('Authentication required. Please login again.');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

      const requestBody = {
        subject: newChatSubject,
        priority: newChatPriority,
        initialMessage: `Hi, I need help with: ${newChatSubject}`
      };

      const response = await fetch(`${API_URL}/tenant/chat/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        const data = await response.json()

        if (data.success) {
          showToast.success('Chat session created successfully!');

          // If the API returns the created chat, add it immediately
          if (data.data && data.data.session) {
            setChatSessions(prev => [data.data.session, ...prev]);
            setSelectedChat(data.data.session); // Auto-select the new chat
          }

          setShowNewChatModal(false)
          setNewChatSubject('')
          setNewChatPriority('medium')

          // Refresh the list to ensure we have the latest data
          setTimeout(() => {
            fetchChatSessions()
          }, 1000);
        } else {
          showToast.error('Failed to create chat: ' + (data.message || 'Unknown error'));
        }
      } else {
        showToast.error(`Failed to create chat. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating new chat:', error)
      showToast.error('Network error: ' + error.message);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700'
      case 'in_progress': return 'bg-yellow-100 text-yellow-700'
      case 'waiting': return 'bg-orange-100 text-orange-700'
      case 'resolved': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const filteredChats = chatSessions.filter(chat => {
    // Add null safety checks
    if (!chat) return false;
    
    const subject = chat.subject || '';
    const ticketNumber = chat.ticketNumber || chat.ticketId || chat.sessionId || chat.id || '';
    
    return (
      subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Headphones className="w-7 h-7 mr-3 text-blue-600" />
              Platform Support Chat
            </h1>
            <p className="text-gray-600 mt-1">
              Get help from our platform support team
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowNewChatModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>New Chat</span>
            </button>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {filteredChats.length} Conversations
            </span>
            <button
              onClick={fetchChatSessions}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Chat Sessions */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => {
                // Handle different possible ID fields from backend
                const sessionId = chat.sessionId || chat.id || chat._id;
                const ticketNumber = chat.ticketNumber || chat.ticketId || `CHAT-${sessionId?.slice(-6)}`;
                
                return (
                <div
                  key={sessionId}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChat?.sessionId === sessionId || selectedChat?.id === sessionId ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-blue-600">{ticketNumber}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(chat.priority || 'medium')}`}>
                        {chat.priority || 'medium'}
                      </span>
                    </div>
                    {(chat.unreadCount || 0) > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {chat.unreadCount || 0}
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-2">
                    <p className="font-medium text-gray-900 text-sm line-clamp-1">{chat.subject || 'No Subject'}</p>
                    <p className="text-xs text-gray-500">
                      Created {chat.createdAt ? new Date(chat.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm text-gray-700 line-clamp-2">{chat.lastMessage?.message || 'No messages yet'}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(chat.status || 'active')}`}>
                      {(chat.status || 'active').replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {chat.lastMessage?.timestamp ? new Date(chat.lastMessage.timestamp).toLocaleTimeString() : 'No time'}
                    </span>
                  </div>
                </div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No conversations found</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start New Chat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedChat.subject || 'No Subject'}</h3>
                      <p className="text-sm text-gray-500">Ticket: {selectedChat.ticketNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedChat.status || 'active')}`}>
                      {(selectedChat.status || 'active').replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(selectedChat.priority || 'medium')}`}>
                      {selectedChat.priority || 'medium'} priority
                    </span>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isFromSupport ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isFromSupport
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.message || 'No message content'}</p>
                      <p className={`text-xs mt-1 ${
                        message.isFromSupport
                          ? 'text-gray-500'
                          : 'text-blue-200'
                      }`}>
                        {message.sender?.name || 'Unknown'} • {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : 'No time'}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={2}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Headphones className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Platform Support</h3>
                <p className="text-gray-500 mb-4">Select a conversation or start a new chat to get help</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Start New Chat</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={newChatSubject}
                  onChange={(e) => setNewChatSubject(e.target.value)}
                  placeholder="Describe your issue briefly..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={newChatPriority}
                  onChange={(e) => setNewChatPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNewChat}
                disabled={!newChatSubject.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}