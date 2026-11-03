'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Minimize2,
  HelpCircle,
  ShieldCheck,
  Flame,
  Wifi,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelUsed?: string;
  timestamp: string;
}

const DEFAULT_SUGGESTIONS = [
  { label: 'How does urgency scoring work?', icon: Flame },
  { label: 'What are category base weights?', icon: ShieldCheck },
  { label: 'Campus Wi-Fi disconnect troubleshooting', icon: Wifi },
  { label: 'How does priority tie-breaking work?', icon: HelpCircle },
];

/**
 * Parses and renders message text cleanly into HTML elements
 * Eliminates raw markdown characters like ** and formats bold, code, and lists naturally.
 */
function FormattedMessage({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  const parseInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;
    const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/;

    while (remaining.length > 0) {
      const match = remaining.match(tokenRegex);
      if (!match || match.index === undefined) {
        parts.push(remaining);
        break;
      }

      if (match.index > 0) {
        parts.push(remaining.substring(0, match.index));
      }

      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={`b-${keyIdx++}`} className="font-bold text-slate-900">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code
            key={`c-${keyIdx++}`}
            className="bg-slate-100 text-[#007A78] font-mono px-1 py-0.5 rounded text-[11px] font-semibold"
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={`em-${keyIdx++}`} className="italic text-slate-800">
            {token.slice(1, -1)}
          </em>
        );
      } else {
        parts.push(token);
      }

      remaining = remaining.substring(match.index + token.length);
    }

    return parts;
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listBuffer: React.ReactNode[] = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-1.5 pl-4 list-disc space-y-1 text-slate-700">
          {listBuffer}
        </ul>
      );
      listBuffer = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      elements.push(<div key={`sp-${index}`} className="h-1" />);
      return;
    }

    // Heading ###
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h5 key={`h-${index}`} className="font-bold text-slate-900 text-xs mt-2 mb-1">
          {parseInline(trimmed.replace(/^###\s+/, ''))}
        </h5>
      );
      return;
    }

    // Bullet list items
    if (/^[-*•]\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^[-*•]\s+/, '');
      listBuffer.push(
        <li key={`li-${index}`} className="leading-relaxed">
          {parseInline(itemText)}
        </li>
      );
      return;
    }

    // Numbered list items
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      flushList();
      elements.push(
        <div key={`num-${index}`} className="flex items-start gap-1.5 my-1 text-slate-700 leading-relaxed">
          <span className="font-bold text-[#007A78] shrink-0">{numMatch[1]}.</span>
          <div>{parseInline(numMatch[2])}</div>
        </div>
      );
      return;
    }

    // Standard paragraph
    flushList();
    elements.push(
      <p key={`p-${index}`} className="leading-relaxed mb-1.5 last:mb-0 text-slate-800">
        {parseInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-0.5">{elements}</div>;
}

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am Grivex Campus Assistant, your student and staff grievance helpdesk. How can I help you today? You can ask me how complaint priority is calculated, get troubleshooting tips for Wi-Fi or hostel issues, or let me assist you in drafting your complaint description.',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<string>('Nemotron 3 Nano Omni');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();

      if (res.ok && data.text) {
        const shortModelName = data.model
          ? data.model.split('/')[1]?.split(':')[0] || data.model
          : 'Nemotron 3 Nano Omni';

        setActiveModel(shortModelName);

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.text,
          modelUsed: shortModelName,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `${data.error || 'The campus helpdesk service is currently busy. Please try asking again in a moment.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Unable to reach the server. Please check your network connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: 'Conversation cleared. How can I assist you with campus complaints today?',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button (Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-[#007A78] hover:bg-[#0b6664] text-white rounded-full shadow-lg shadow-teal-900/20 transition-all duration-200 hover:scale-105 active:scale-95 group"
          title="Open Grivex AI Campus Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-teal-100 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-tight">AI Assistant</span>
        </button>
      )}

      {/* Slide-Up Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#007A78] text-white px-4 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-teal-100">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white leading-tight">
                    Grivex Campus Assistant
                  </h4>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-white/20 text-teal-100 uppercase tracking-wider">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-teal-100/90 font-medium">
                  Model: {activeModel}
                </p>
              </div>
            </div>

            {/* Header controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Minimize chat"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 text-xs">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-[#007A78] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="max-w-[85%] space-y-1">
                    <div
                      className={`p-3 rounded-2xl leading-relaxed ${
                        isUser
                          ? 'bg-[#007A78] text-white rounded-tr-xs shadow-xs font-medium'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      <FormattedMessage content={m.content} isUser={isUser} />
                    </div>

                    <div
                      className={`flex items-center gap-1.5 text-[10px] text-slate-400 px-1 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>{m.timestamp}</span>
                      {m.modelUsed && <span>• via {m.modelUsed}</span>}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#007A78] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-xs shadow-2xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#007A78] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-[#007A78] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-[#007A78] rounded-full animate-bounce" />
                  <span className="text-[11px] text-slate-500 font-medium ml-1">
                    Thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Pills */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {DEFAULT_SUGGESTIONS.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(s.label)}
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#007A78] bg-[#F0FDFA] hover:bg-[#CCFBF1] border border-[#99F6E4] rounded-full transition"
                  >
                    <Icon className="w-3 h-3" />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about complaints, rules, or urgency..."
                className="flex-1 px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A78]/20 focus:border-[#007A78] transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 text-white bg-[#007A78] hover:bg-[#0b6664] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-xs transition active:scale-95 shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
