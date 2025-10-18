'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStreamMessages, sendStreamMessage } from '../api/streamApi'
import { Input } from '@/components/ui/Input'
import type { StreamMessage } from '../types/stream'

interface StreamChatProps {
  streamId: string
}

export function StreamChat({ streamId }: StreamChatProps) {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  
  const { data: messages = [] } = useQuery({
    queryKey: ['stream-messages', streamId],
    queryFn: () => getStreamMessages(streamId),
    refetchInterval: 2000, // Poll every 2 seconds
  })
  
  const sendMutation = useMutation({
    mutationFn: (text: string) =>
      sendStreamMessage({
        stream_id: streamId,
        message: text,
      }),
    onSuccess: () => {
      setMessage('')
      queryClient.invalidateQueries({ queryKey: ['stream-messages', streamId] })
    },
  })
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    sendMutation.mutate(message)
  }
  
  return (
    <div className="absolute bottom-24 left-4 right-4 max-h-64 flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-2">
        {messages.slice(-10).map((msg) => (
          <div
            key={msg.id}
            className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-sm"
          >
            <span className="font-semibold">{msg.user?.name}: </span>
            <span>{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Say something..."
          className="flex-1 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-white placeholder-gray-400 outline-none"
          maxLength={200}
        />
        <button
          type="submit"
          disabled={!message.trim() || sendMutation.isPending}
          className="px-4 py-2 bg-primary text-white rounded-full disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}

