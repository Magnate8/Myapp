import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export const useSocket = (user, onNewMessage) => {
  const socketRef = useRef(null)

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      socketRef.current = io('http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket', 'polling']
      })

      const socket = socketRef.current

      // Connection events
      socket.on('connect', () => {
        console.log('Connected to server')
      })

      socket.on('connected', (data) => {
        console.log('Server confirmed connection:', data.message)
      })

      socket.on('disconnect', () => {
        console.log('Disconnected from server')
      })

      // Message events
      socket.on('new_message', (message) => {
        console.log('New message received:', message)
        if (onNewMessage) {
          onNewMessage(message)
        }
      })

      // Cleanup on unmount
      return () => {
        socket.disconnect()
      }
    }
  }, [user, onNewMessage])

  const sendDirectMessage = (receiverId, content) => {
    if (socketRef.current) {
      socketRef.current.emit('send_direct_message', {
        receiver_id: receiverId,
        content: content
      })
    }
  }

  const sendGroupMessage = (groupId, content) => {
    if (socketRef.current) {
      socketRef.current.emit('send_group_message', {
        group_id: groupId,
        content: content
      })
    }
  }

  const joinGroup = (groupId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_group', {
        group_id: groupId
      })
    }
  }

  const leaveGroup = (groupId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_group', {
        group_id: groupId
      })
    }
  }

  return {
    sendDirectMessage,
    sendGroupMessage,
    joinGroup,
    leaveGroup,
    socket: socketRef.current
  }
}

