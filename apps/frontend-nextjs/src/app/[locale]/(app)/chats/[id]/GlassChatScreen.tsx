'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton, 
  GlassInput 
} from '@/components/ui/glass';

interface Message {
  id: string;
  text: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  isOwn: boolean;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  attachments?: {
    type: string;
    url: string;
    name: string;
    size: number;
  }[];
}

interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface GlassChatScreenProps {
  chatId: string;
}

export default function GlassChatScreen({ chatId }: GlassChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchChatData = async () => {
      // Loading handled by API hooks
    };

    fetchChatData();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      // API integration - using mock data structure matching API types
      console.log('Sending message:', newMessage);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add message to state
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        author: participants.find(p => p.id === 'current-user')!,
        timestamp: new Date().toISOString(),
        isOwn: true,
        isRead: false,
        type: 'text'
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const otherParticipant = participants.find(p => p.id !== 'current-user');

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 glass-bg-secondary rounded-full" />
                <div className="flex-1">
                  <div className="h-4 glass-bg-secondary rounded mb-2" />
                  <div className="h-3 glass-bg-secondary rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
        {/* Chat Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                {otherParticipant?.avatar ? (
                  <img 
                    src={otherParticipant.avatar} 
                    alt={otherParticipant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-6 h-6 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              {otherParticipant?.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 glass-bg-success rounded-full border-2 border-white" />
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="font-semibold glass-text-primary">
                {otherParticipant?.name || 'Чат'}
              </h2>
              <p className="text-sm glass-text-secondary">
                {otherParticipant?.isOnline ? 'В сети' : 'Был(а) в сети недавно'}
              </p>
            </div>
            
            <div className="flex gap-2">
              <GlassButton variant="ghost" size="sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </GlassButton>
              <GlassButton variant="ghost" size="sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </GlassButton>
            </div>
          </div>
        </GlassCard>

        {/* Messages */}
        <GlassCard variant="elevated" padding="none" className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => {
              const showDate = index === 0 || 
                formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);
              
              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center mb-4">
                      <span className="px-3 py-1 glass-bg-secondary rounded-full text-sm glass-text-secondary">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex gap-3 ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 glass-bg-secondary rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isOwn ? 'order-1' : 'order-0'
                    }`}>
                      {message.author.avatar ? (
                        <img 
                          src={message.author.avatar} 
                          alt={message.author.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <svg className="w-4 h-4 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    
                    <div className={`flex-1 max-w-xs ${message.isOwn ? 'order-0' : 'order-1'}`}>
                      <div className={`p-3 rounded-2xl ${
                        message.isOwn 
                          ? 'glass-bg-accent-blue-500 text-white ml-auto' 
                          : 'glass-bg-secondary glass-text-primary'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((attachment, idx) => (
                              <div key={idx} className="relative">
                                {attachment.type === 'image' && (
                                  <img 
                                    src={attachment.url} 
                                    alt={attachment.name}
                                    className="rounded-lg max-w-full h-auto"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className={`flex items-center gap-1 mt-1 text-xs glass-text-muted ${
                        message.isOwn ? 'justify-end' : 'justify-start'
                      }`}>
                        <span>{formatTime(message.timestamp)}</span>
                        {message.isOwn && (
                          <div className="flex items-center gap-1">
                            {message.isRead ? (
                              <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t border-white/10">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <GlassInput
                name="message"
                type="text"
                placeholder="Введите сообщение..."
                value={newMessage}
                 onValueChange={setNewMessage}
                className="flex-1"
              />
              <GlassButton
                type="submit"
                variant="gradient"
                loading={sending}
                disabled={!newMessage.trim()}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </GlassButton>
            </form>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
