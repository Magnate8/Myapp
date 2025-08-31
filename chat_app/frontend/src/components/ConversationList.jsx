import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Users, MessageCircle } from 'lucide-react'

function ConversationList({ conversations, activeConversation, onSelectConversation }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs">Start a new chat or create a group</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={`${conversation.type}-${conversation.id}`}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                activeConversation?.type === conversation.type && 
                activeConversation?.id === conversation.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  {conversation.type === 'group' ? (
                    <Users className="w-5 h-5 text-gray-600" />
                  ) : (
                    <span className="font-semibold text-gray-600">
                      {conversation.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm truncate">{conversation.name}</h3>
                    {conversation.last_message && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(conversation.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.last_message ? (
                        <>
                          {conversation.last_message.sender_username}: {conversation.last_message.content}
                        </>
                      ) : (
                        <span className="italic">No messages yet</span>
                      )}
                    </p>
                    
                    {conversation.type === 'group' && (
                      <Badge variant="secondary" className="text-xs ml-2">
                        Group
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  )
}

export default ConversationList

