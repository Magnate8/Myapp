import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { LogOut, Send, Users, MessageCircle, Plus } from 'lucide-react'
import ConversationList from './ConversationList'
import MessageArea from './MessageArea'
import CreateGroupDialog from './CreateGroupDialog'
import UserSearch from './UserSearch'
import { useSocket } from '../hooks/useSocket'

function Chat({ user, onLogout }) {
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showUserSearch, setShowUserSearch] = useState(false)

  // Handle new messages from WebSocket
  const handleNewMessage = useCallback((message) => {
    // Update messages if this message belongs to the active conversation
    if (activeConversation) {
      const isRelevantMessage = 
        (activeConversation.type === 'direct' && 
         ((message.sender_id === activeConversation.id && message.receiver_id === user.id) ||
          (message.sender_id === user.id && message.receiver_id === activeConversation.id))) ||
        (activeConversation.type === 'group' && message.group_id === activeConversation.id)
      
      if (isRelevantMessage) {
        setMessages(prev => [...prev, message])
      }
    }
    
    // Always refresh conversations to update last message
    loadConversations()
  }, [activeConversation, user.id])

  const { sendDirectMessage, sendGroupMessage, joinGroup, leaveGroup } = useSocket(user, handleNewMessage)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (activeConversation) {
      loadMessages()
      // Join the appropriate room when switching conversations
      if (activeConversation.type === 'group') {
        joinGroup(activeConversation.id)
      }
    }
  }, [activeConversation, joinGroup])

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  const loadMessages = async () => {
    if (!activeConversation) return

    try {
      const endpoint = activeConversation.type === 'group' 
        ? `/api/messages/group/${activeConversation.id}`
        : `/api/messages/direct/${activeConversation.id}`
      
      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return

    setLoading(true)
    try {
      // Send via WebSocket for real-time delivery
      if (activeConversation.type === 'group') {
        sendGroupMessage(activeConversation.id, newMessage)
      } else {
        sendDirectMessage(activeConversation.id, newMessage)
      }
      
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const startDirectChat = (otherUser) => {
    setActiveConversation({
      type: 'direct',
      id: otherUser.id,
      name: otherUser.username
    })
    setShowUserSearch(false)
    loadMessages()
  }

  const joinGroupChat = (group) => {
    setActiveConversation({
      type: 'group',
      id: group.id,
      name: group.name
    })
    setShowCreateGroup(false)
    loadMessages()
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{user.username}</span>
              <Badge variant="secondary" className="text-xs">Online</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setShowUserSearch(true)}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              New Chat
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setShowCreateGroup(true)}
            >
              <Users className="w-4 h-4 mr-1" />
              New Group
            </Button>
          </div>
        </div>

        {/* Conversations */}
        <ConversationList 
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={setActiveConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  {activeConversation.type === 'group' ? (
                    <Users className="w-5 h-5 text-gray-600" />
                  ) : (
                    <span className="font-semibold text-gray-600">
                      {activeConversation.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold">{activeConversation.name}</h2>
                  <p className="text-sm text-gray-500">
                    {activeConversation.type === 'group' ? 'Group Chat' : 'Direct Message'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <MessageArea messages={messages} currentUser={user} />

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Welcome to ChatApp</h3>
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {showCreateGroup && (
        <CreateGroupDialog 
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={joinGroupChat}
        />
      )}

      {showUserSearch && (
        <UserSearch 
          onClose={() => setShowUserSearch(false)}
          onUserSelected={startDirectChat}
          currentUser={user}
        />
      )}
    </div>
  )
}

export default Chat

