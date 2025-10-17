import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'

// Initialize OpenAI client (with fallback for build time)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

// Hotel and service context for the AI
const SYSTEM_PROMPT = `You are a helpful customer service assistant for HotelSaver.ng, a Nigerian hotel booking platform. 

KEY INFORMATION:
- We operate in Lagos, Abuja, Port Harcourt, and Owerri
- We offer hotel bookings with real-time price negotiation (up to 15% discounts)
- We also provide local services: Hair, Nails, Massage, Cleaning, Security, Catering, etc.
- All prices are in Nigerian Naira (₦)
- Bookings require contact via WhatsApp: +234 707 777 55 45
- We offer 5-minute limited-time negotiated pricing deals
- Tax rate is 7.5% VAT on multi-night stays

CAPABILITIES:
- Help users find hotels by city and budget
- Explain our negotiation process
- Assist with service bookings
- Provide pricing information
- Guide through booking process

LIMITATIONS:
- Cannot make actual bookings (direct to WhatsApp)
- Cannot access real-time availability
- Cannot process payments

Be friendly, helpful, and focus on Nigerian hospitality culture. Always encourage users to complete bookings via our platform or WhatsApp contact.`

export async function POST(req: NextRequest) {
  try {
    const { message, conversation } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Build conversation history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(conversation || []),
      { role: 'user', content: message }
    ]

    // Check if OpenAI is available
    if (!openai) {
      return NextResponse.json({
        response: "I'm currently offline. For immediate assistance, please contact us on WhatsApp: +234 707 777 55 45 or use our simple chatbot.",
        conversation: []
      })
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages as any,
      max_tokens: 500,
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not process your request.'

    return NextResponse.json({
      response: aiResponse,
      conversation: [
        ...(conversation || []),
        { role: 'user', content: message },
        { role: 'assistant', content: aiResponse }
      ]
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Fallback response for API failures
    return NextResponse.json({
      response: "I'm having trouble connecting right now. For immediate assistance, please contact us on WhatsApp: +234 707 777 55 45",
      conversation: []
    })
  }
}