'use client'
import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface AIResponse {
  message: string
  suggestions: string[]
  action?: {
    type: 'search' | 'book' | 'navigate'
    data: any
  }
  needsHumanAgent?: boolean
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m Grace 😊 I\'m here to help you find amazing hotels and services across Lagos, Owerri, Port Harcourt, and Abuja. What can I help you with today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // GPT-4 powered response generation
  const generateAIResponse = async (userMessage: string): Promise<AIResponse> => {
    try {
      // Build conversation history for GPT-4
      const conversationHistory = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }))

      // Build customer context
      const customerContext = {
        sessionId: sessionStorage.getItem('chatbot-session') || `session_${Date.now()}`,
        platform: 'web',
        preferredLanguage: 'english',
        location: null, // Could detect from browser or ask user
        previousBookings: [], // Could load from user account
        currentSearch: null // Could get from URL params or local storage
      }

      // Save session ID
      sessionStorage.setItem('chatbot-session', customerContext.sessionId)

      // Call GPT-4 API
      const response = await fetch('/api/chat-gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
          customerContext
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'API request failed')
      }

      return {
        message: data.response,
        suggestions: data.suggestions || [],
        action: data.action || null,
        needsHumanAgent: data.needsHumanAgent || false
      }

    } catch (error) {
      console.error('GPT-4 API Error:', error)
      
      // Fallback to basic responses if GPT-4 fails
      return {
        message: "I'm experiencing some technical difficulties right now. For immediate assistance, please contact our support team on WhatsApp at +2347077775545, or I can help you with basic information about our services.",
        suggestions: [
          'Contact WhatsApp Support',
          'Browse Hotels Manually', 
          'View Services',
          'Try Again'
        ],
        needsHumanAgent: true
      }
    }
  }

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input
    if (!text.trim()) return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Human-like typing delay: Grace is "thinking" and "typing"
    const thinkingTime = Math.random() * 1200 + 800; // 0.8-2.0s thinking
    const typingTime = Math.max(500, text.length * 50); // Based on response length
    
    setTimeout(async () => {
      const aiResponse = await generateAIResponse(text)
      
      // Show typing for realistic duration
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse.message,
          timestamp: new Date(),
          suggestions: aiResponse.suggestions
        }
        
        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
      }, typingTime)
      
    }, thinkingTime)
  }

  // Handle feedback for AI responses
  const handleFeedback = async (messageId: string, type: 'positive' | 'negative') => {
    try {
      const message = messages.find(m => m.id === messageId)
      if (!message) return

      const rating = type === 'positive' ? 5 : 2
      const sessionId = sessionStorage.getItem('chatbot-session') || `session_${Date.now()}`

      // Find the user message that prompted this AI response
      const messageIndex = messages.findIndex(m => m.id === messageId)
      const userMessage = messageIndex > 0 ? messages[messageIndex - 1] : null

      const feedback = {
        conversationId: sessionId,
        userMessage: userMessage?.content || '',
        aiResponse: message.content,
        userRating: rating,
        culturalAccuracy: rating,
        responseRelevance: rating,
        improvements: type === 'negative' ? ['Improve response accuracy', 'Better Nigerian context'] : []
      }

      // Send feedback to API
      const response = await fetch('/api/chat-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      })

      if (response.ok) {
        // Show feedback success
        const feedbackMessage: ChatMessage = {
          id: `feedback_${Date.now()}`,
          role: 'assistant',
          content: type === 'positive' 
            ? "Thank you for the feedback! 🙏 I'm learning to serve you better."
            : "Thank you for letting me know. I'm learning from this to improve my responses. 📚",
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, feedbackMessage])
      }

    } catch (error) {
      console.error('Feedback error:', error)
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-brand-green text-white rounded-full shadow-lg hover:bg-brand-dark transition-all duration-300 flex items-center justify-center group hover:scale-105"
        >
          <div className="relative">
            <span className="text-2xl">👩🏾‍💼</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </button>
        <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-lg p-3 max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="text-sm font-medium text-gray-800">Hi! I'm Grace 😊</div>
          <div className="text-xs text-gray-600 mt-1">Your Nigerian hospitality specialist for Lagos, Owerri, Port Harcourt & Abuja</div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-brand-green text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              👩🏾‍💼
            </div>
            <div>
              <div className="font-semibold">Grace</div>
              <div className="text-xs opacity-90 flex items-center gap-1">
                {isTyping ? (
                  <>
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                    <span>typing...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                    <span>Online - Lagos, Owerri, PH, Abuja specialist</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-brand-green text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="text-sm">{message.content}</div>
              
              {/* AI Suggestions */}
              {message.role === 'assistant' && message.suggestions && (
                <div className="mt-3 space-y-1">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(suggestion)}
                      className="block w-full text-left text-xs bg-white/80 hover:bg-white p-2 rounded border text-gray-700 hover:text-brand-green transition-colors"
                    >
                      💡 {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Feedback Buttons for AI Messages */}
              {message.role === 'assistant' && !message.content.includes('Thank you for') && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Helpful?</span>
                  <button
                    onClick={() => handleFeedback(message.id, 'positive')}
                    className="px-2 py-1 rounded bg-green-100 hover:bg-green-200 text-green-700 transition-colors text-xs"
                  >
                    👍 Yes
                  </button>
                  <button
                    onClick={() => handleFeedback(message.id, 'negative')}
                    className="px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 transition-colors text-xs"
                  >
                    👎 No
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Grace typing indicator - looks human */}
        {isTyping && (
          <div className="flex justify-start items-end gap-2">
            <div className="w-6 h-6 bg-brand-green/10 rounded-full flex items-center justify-center">
              <span className="text-xs">👩🏾‍💼</span>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-xs text-gray-500">Grace is typing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about hotels, services, or events..."
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-green"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}