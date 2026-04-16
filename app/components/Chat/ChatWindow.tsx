'use client';

import React, { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { processUserMessage, type AssistantClientMetrics } from './LLMService';
import type { AssistantMessage as Message } from '../../lib/assistant/types';
import { speakWithVtuber } from './vtuberSpeechBridge';

interface TimestampedMessage extends Message {
  timestamp: string;
}

const formatMs = (value: number) => `${(value / 1000).toFixed(2)}s`;

interface ChatWindowProps {
  className?: string;
  onConversationChange?: (messages: Message[]) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ className = '', onConversationChange }) => {
  const [messages, setMessages] = useState<TimestampedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<AssistantClientMetrics | null>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (messageContent: string) => {
    const userMessage: TimestampedMessage = {
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setLoading(true);
    setMetrics(null);

    const updatedMessages = [...messages, userMessage];

    try {
      const result = await processUserMessage(updatedMessages);
      const botMessage = result.message;

      setMessages((prevMessages) => [
        ...prevMessages,
        { ...botMessage, timestamp: new Date().toLocaleTimeString() },
      ]);
      setMetrics(result.metrics);

      speakWithVtuber(botMessage.content);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get a response from CatSAMA.';

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: 'assistant',
          content: `Error: ${message}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    onConversationChange?.(messages.map(({ role, content }) => ({ role, content })));
  }, [messages, onConversationChange]);

  return (
    <div
      className={`flex h-full min-h-[720px] w-full flex-col overflow-hidden border border-white/10 bg-[rgba(8,11,18,0.46)] ${className}`}
    >
      <div className="flex min-h-0 flex-1 flex-col border-b border-white/10 lg:border-b-0 lg:border-r">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Cat LLM</p>
        </div>

        <div className="min-h-0 flex-grow space-y-4 overflow-auto px-4 py-4" ref={chatWindowRef}>
          {messages
            .filter((msg) => msg.role !== 'system')
            .map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg.content}
                sender={msg.role === 'user' ? 'You' : 'Assistant'}
                timestamp={msg.timestamp}
                isOwnMessage={msg.role === 'user'}
              />
            ))}
          {loading && <div className="text-sm text-[var(--text-muted)]">Assistant is typing...</div>}
        </div>

        <ChatInput onSendMessage={handleSendMessage} />

        {metrics && (
          <div className="border-t border-white/10 px-4 py-3 text-xs text-[var(--text-muted)]">
            {`Client ${formatMs(metrics.clientTotalMs)} | Server ${formatMs(
              metrics.serverTimings.totalMs
            )} | LLM ${formatMs(metrics.serverTimings.llmMs)} | Post ${formatMs(
              metrics.serverTimings.commandMs
            )}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
