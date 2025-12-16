import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Loader2 } from 'lucide-react';
import { chatAPI } from '../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your AshaAssist Copilot. I can help you with maternity care, palliative care, and questions about the AshaAssist platform. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close chat
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        openButtonRef.current?.focus();
      }

      // Enter to send message (when chat is open and not using Shift+Enter for new line)
      if (e.key === 'Enter' && isOpen && !e.shiftKey) {
        if (document.activeElement === textareaRef.current && inputText.trim() !== '' && !isLoading) {
          e.preventDefault();
          handleSend();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, inputText, isLoading]);

  // Focus management
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } else if (!isOpen && openButtonRef.current) {
      openButtonRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      // Call the backend API
      const response = await chatAPI.sendMessage(messageToSend);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      // Handle error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error.response?.data?.error || 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [inputText]);

  // Check if device is mobile
  const isMobile = () => {
    return window.innerWidth <= 768;
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        ref={openButtonRef}
        onClick={() => setIsOpen(true)}
        aria-label="AshaAssist Copilot"
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          border: '1px solid var(--gray-200)',
          backgroundColor: 'white',
          boxShadow: '0 8px 24px rgba(2, 8, 23, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1100,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 28px rgba(2, 8, 23, 0.18)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(2, 8, 23, 0.12)'; }}
      >
        <Bot size={24} color={'var(--blue-700)'} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            right: isMobile() ? '10px' : '24px',
            left: isMobile() ? '10px' : 'auto',
            bottom: '92px',
            width: isMobile() ? 'calc(100vw - 20px)' : '350px',
            height: isMobile() ? '70vh' : '500px',
            backgroundColor: 'white',
            border: '1px solid var(--gray-200)',
            borderRadius: '0.75rem',
            boxShadow: '0 12px 28px rgba(2, 8, 23, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1100,
            overflow: 'hidden',
            margin: isMobile() ? '0 auto' : '0'
          }}
        >
          {/* Chat Header */}
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--gray-200)',
            backgroundColor: 'var(--blue-50)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--blue-700)', fontWeight: 700 }}>
              <Bot size={18} />
              AshaAssist Copilot
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '0.25rem',
                color: 'var(--gray-600)'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: '0.5rem'
                }}
              >
                {message.sender === 'bot' && (
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--blue-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Bot size={16} color={'var(--blue-700)'} />
                  </div>
                )}
                <div style={{
                  maxWidth: '80%',
                  padding: '0.75rem 1rem',
                  borderRadius: '1rem',
                  backgroundColor: message.sender === 'user'
                    ? 'var(--blue-600)'
                    : 'var(--gray-100)',
                  color: message.sender === 'user'
                    ? 'white'
                    : 'var(--gray-800)',
                  borderBottomLeftRadius: message.sender === 'user' ? '1rem' : '0',
                  borderBottomRightRadius: message.sender === 'user' ? '0' : '1rem'
                }}>
                  <div>{message.text}</div>
                  <div style={{
                    fontSize: '0.7rem',
                    marginTop: '0.25rem',
                    opacity: 0.7,
                    textAlign: message.sender === 'user' ? 'right' : 'left'
                  }}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '1rem',
            borderTop: '1px solid var(--gray-200)',
            backgroundColor: 'white'
          }}>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-end'
            }}>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '0.5rem',
                  resize: 'none',
                  minHeight: '40px',
                  maxHeight: '100px',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit'
                }}
                rows={1}
                aria-label="Type your message"
              />
              <button
                onClick={handleSend}
                disabled={inputText.trim() === '' || isLoading}
                aria-label={isLoading ? "Sending..." : "Send message"}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1px solid var(--blue-600)',
                  backgroundColor: (inputText.trim() === '' || isLoading) ? 'var(--gray-200)' : 'var(--blue-600)',
                  color: (inputText.trim() === '' || isLoading) ? 'var(--gray-500)' : 'white',
                  cursor: (inputText.trim() === '' || isLoading) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;