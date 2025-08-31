import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

function MessageArea({ messages, currentUser }) {
  const scrollAreaRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true
    
    const currentDate = new Date(currentMessage.created_at).toDateString()
    const previousDate = new Date(previousMessage.created_at).toDateString()
    
    return currentDate !== previousDate
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={message.id}>
              {/* Date separator */}
              {shouldShowDateSeparator(message, messages[index - 1]) && (
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDate(message.created_at)}
                  </div>
                </div>
              )}

              {/* Message */}
              <div
                className={`flex ${
                  message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender_id === currentUser.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  {/* Sender name for group chats (only for other users) */}
                  {message.group_id && message.sender_id !== currentUser.id && (
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      {message.sender_username}
                    </div>
                  )}
                  
                  {/* Message content */}
                  <div className="break-words">{message.content}</div>
                  
                  {/* Timestamp */}
                  <div
                    className={`text-xs mt-1 ${
                      message.sender_id === currentUser.id
                        ? 'text-blue-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}

export default MessageArea

