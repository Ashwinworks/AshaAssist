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
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
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

  // Welcome popup on mount
  useEffect(() => {
    // Show welcome popup after a short delay
    const timer = setTimeout(() => {
      setShowWelcomePopup(true);

      // Play popup notification sound
      const audio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      audio.volume = 0.4;

      // Create a more pleasant popup sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);

      // Hide popup after 10 seconds
      setTimeout(() => {
        setShowWelcomePopup(false);
      }, 10000);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
          width: '64px',
          height: '64px',
          borderRadius: '32px',
          border: '1px solid var(--gray-200)',
          backgroundColor: 'white',
          boxShadow: '0 8px 24px rgba(2, 8, 23, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1100,
          transition: 'all 0.2s ease',
          animation: showWelcomePopup ? 'bounce 0.5s ease' : 'none'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 28px rgba(2, 8, 23, 0.18)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(2, 8, 23, 0.12)'; }}
      >
        <Bot size={28} color={'var(--blue-700)'} />
      </button>

      {/* Welcome Popup */}
      {showWelcomePopup && (
        <div
          style={{
            position: 'fixed',
            right: '100px',
            bottom: '30px',
            backgroundColor: 'white',
            border: '1px solid var(--blue-200)',
            borderRadius: '1rem',
            padding: '1rem 1.25rem',
            boxShadow: '0 8px 24px rgba(2, 8, 23, 0.15)',
            maxWidth: '280px',
            zIndex: 1099,
            animation: 'slideInRight 0.4s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--blue-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Bot size={20} color={'var(--blue-700)'} />
            </div>
            <div>
              <div style={{ fontWeight: '600', color: 'var(--gray-900)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                I'm AshaAssist Copilot!
              </div>
              <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                Do you need any help?
              </div>
            </div>
            <button
              onClick={() => setShowWelcomePopup(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                color: 'var(--gray-400)',
                marginLeft: 'auto',
                flexShrink: 0
              }}
              aria-label="Close welcome message"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

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

      {/* CSS Animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};


export default ChatBot;