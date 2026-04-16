'use client';

import React, { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { processUserMessage, type AssistantClientMetrics } from './LLMService';
import { generatePlanSuggestion } from './PlanSuggestionService';
import type { AssistantMessage as Message } from '../../lib/assistant/types';
import type { AssistantPlanSuggestion } from '../../lib/assistant/types';
import { speakWithVtuber } from './vtuberSpeechBridge';

interface TimestampedMessage extends Message {
  timestamp: string;
}

const formatMs = (value: number) => `${(value / 1000).toFixed(2)}s`;

interface ChatWindowProps {
  className?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<TimestampedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<AssistantClientMetrics | null>(null);
  const [plan, setPlan] = useState<AssistantPlanSuggestion | null>(null);
  const [planEntityCount, setPlanEntityCount] = useState<number | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
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

  const handleGeneratePlan = async () => {
    setPlanLoading(true);
    setPlanError(null);

    try {
      const result = await generatePlanSuggestion(messages);
      setPlan(result.plan);
      setPlanEntityCount(result.entityCount);
    } catch (error) {
      setPlanError(
        error instanceof Error ? error.message : 'Failed to generate a personalized plan.'
      );
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div
      className={`grid h-full min-h-[720px] w-full overflow-hidden border border-white/10 bg-[rgba(8,11,18,0.46)] lg:grid-cols-[minmax(0,1fr)_360px] ${className}`}
    >
      <div className="flex min-h-0 flex-col border-b border-white/10 lg:border-b-0 lg:border-r">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Cat LLM</p>
        </div>

        <div className="flex-grow space-y-4 overflow-auto px-4 py-4" ref={chatWindowRef}>
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

      <aside className="flex min-h-0 flex-col bg-[rgba(13,17,26,0.82)]">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Plan Lab</p>
          <h2 className="mt-2 text-lg font-semibold text-white">사용자 맞춤 계획 제안</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
            Home Assistant에 올라온 엔티티만 기준으로 실행 가능한 계획을 만듭니다.
          </p>
          <button
            type="button"
            onClick={handleGeneratePlan}
            disabled={planLoading}
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-[#ff7a59]/40 bg-[#ff7a59]/15 px-4 py-3 text-sm font-medium text-[#ffd8cf] transition hover:bg-[#ff7a59]/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {planLoading ? '제안 생성 중...' : '사용자 맞춤 계획 제안'}
          </button>
        </div>

        <div className="flex-1 overflow-auto px-5 py-5">
          {planError && <p className="text-sm text-[#ff8a70]">{planError}</p>}

          {!plan && !planLoading && !planError && (
            <div className="space-y-3 text-sm leading-6 text-[var(--text-muted)]">
              <p>현재 연결된 HA 엔티티 상태를 보고 바로 실행할 수 있는 생활 계획을 제안합니다.</p>
              <p>조명, 팬, 센서, 씬, 스위치가 있으면 그 조합을 우선 활용합니다.</p>
            </div>
          )}

          {plan && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  {planEntityCount ? `${planEntityCount} entities scanned` : 'Plan summary'}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">{plan.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-200">{plan.summary}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{plan.rationale}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {plan.focusAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                  >
                    {area}
                  </span>
                ))}
              </div>

              <div className="space-y-3">
                {plan.steps.map((step, index) => (
                  <div key={`${step.title}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-white">
                        {index + 1}. {step.title}
                      </h4>
                      <span className="text-xs text-[var(--text-muted)]">{step.timeHint}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{step.detail}</p>
                    <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
                      {step.targetEntityIds.join(' · ')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm leading-6 text-[var(--text-muted)]">
                {plan.fallback}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default ChatWindow;
