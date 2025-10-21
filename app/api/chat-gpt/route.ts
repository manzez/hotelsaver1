// API route for GPT-4 powered customer support chatbot
import { NextRequest, NextResponse } from 'next/server'
import { getChatbotResponse, type ChatMessage, type CustomerContext } from '@/lib/gpt-chatbot'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory = [], customerContext } = body

    // Validate required fields
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Build customer context with defaults
    const context: CustomerContext = {
      sessionId: customerContext?.sessionId || `session_${Date.now()}`,
      previousBookings: customerContext?.previousBookings || [],
      currentSearch: customerContext?.currentSearch || null,
      location: customerContext?.location || null,
      preferredLanguage: customerContext?.preferredLanguage || 'english',
      platform: customerContext?.platform || 'web',
      ...customerContext
    }

    // Ensure conversation history has proper format
    const history: ChatMessage[] = conversationHistory.map((msg: any) => ({
      role: msg.role || 'user',
      content: msg.content || '',
      function_call: msg.function_call,
      name: msg.name
    }))

    // Get GPT-4 response
    const chatbotResponse = await getChatbotResponse(message, history, context)

    // Log interaction for analytics (in production, use proper logging)
    console.log('Chatbot Interaction:', {
      session: context.sessionId,
      platform: context.platform,
      language: context.preferredLanguage,
      userMessage: message,
      responseConfidence: chatbotResponse.confidence,
      actionType: chatbotResponse.action?.type,
      needsEscalation: chatbotResponse.needsHumanAgent
    })

    return NextResponse.json({
      success: true,
      response: chatbotResponse.message,
      suggestions: chatbotResponse.suggestions || [],
      action: chatbotResponse.action || null,
      needsHumanAgent: chatbotResponse.needsHumanAgent || false,
      confidence: chatbotResponse.confidence,
      sessionId: context.sessionId
    })

  } catch (error) {
    console.error('Chatbot API error:', error)
    
    // Return fallback response
    return NextResponse.json({
      success: false,
      response: "I apologize, but I'm experiencing technical difficulties. Please contact our support team on WhatsApp at +2347077775545 for immediate assistance.",
      suggestions: ['Contact WhatsApp Support', 'Try again later', 'Browse hotels manually'],
      needsHumanAgent: true,
      confidence: 0.1,
      error: 'Technical error occurred'
    }, { status: 200 }) // Return 200 to avoid breaking the UI
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'HotelSaver.ng GPT-4 Chatbot',
    timestamp: new Date().toISOString(),
    capabilities: [
      'Hotel search and booking',
      'Service discovery and booking',
      'Event package recommendations',
      'Booking management and support',
      'Nigerian market expertise',
      'Multi-language support (English, Pidgin, Hausa, Yoruba, Igbo)'
    ]
  })
}