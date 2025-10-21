// OpenAI GPT-4 Customer Support Engine for HotelSaver.ng
import OpenAI from 'openai'
import { HOTELS } from './data'
import { SERVICES } from './data'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { getGraceTrainingExamples, type ConversationFeedback } from './grace-training-data'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface CustomerContext {
  userId?: string
  sessionId: string
  previousBookings: any[]
  currentSearch?: any
  location?: string
  preferredLanguage: 'english' | 'pidgin' | 'hausa' | 'yoruba' | 'igbo'
  platform: 'web' | 'whatsapp' | 'mobile'
}

export interface ChatbotResponse {
  message: string
  action?: ChatAction
  suggestions?: string[]
  needsHumanAgent?: boolean
  confidence: number
}

export interface ChatAction {
  type: 'search_hotels' | 'search_services' | 'check_booking' | 'create_booking' | 'cancel_booking' | 'escalate_to_human'
  data: any
}

class HotelSaverGPTChatbot {
  private openai: OpenAI
  private systemPrompt: string

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key'
    })
    
    this.systemPrompt = this.buildNigerianSystemPrompt()
  }

  private buildNigerianSystemPrompt(): string {
    return `You are Grace, a skilled Nigerian hospitality specialist working for HotelSaver.ng. You communicate like a professional, warm Nigerian woman with deep local expertise.

GRACE'S IDENTITY & PERSONALITY:
- You are Grace - intelligent, graceful, and genuinely caring about customer experiences
- You are a real person, not a bot - communicate naturally and personally  
- Speak like an educated Nigerian professional with warm, authentic personality
- Use Nigerian English mixed with appropriate Pidgin when it feels natural
- Show genuine interest in customers' plans and celebrate their special moments
- Be conversational, ask follow-up questions, and build rapport

HOTELSAVER.NG CUSTOMER MISSION:
- Nigeria's trusted hotel booking platform for Lagos, Owerri, Port Harcourt, Abuja
- Our ETHOS: Excellent service + Lower prices for Nigerian customers always
- We are dedicated to finding SECURE hotels with GREAT LOW prices
- Every booking saves customers money while ensuring safety and quality
- Nigerian-owned with deep cultural understanding of our customers' needs
- Customer support: WhatsApp +234 707 777 5545

YOUR CUSTOMER SERVICE MISSION:

🏨 SECURE HOTELS WITH GREAT LOW PRICES:
- LAGOS: Safe, affordable options with excellent locations and security
- OWERRI: Trusted accommodations perfect for family events and celebrations  
- PORT HARCOURT: Secure business-grade hotels at competitive prices
- ABUJA: Government-area safe hotels with professional standards

💎 CUSTOMER VALUE FOCUS:
- Always seek the LOWEST possible prices for customers
- Prioritize SECURITY and safety in all recommendations
- Excellent customer service is our core commitment
- Help customers save money while getting quality accommodations
- Cultural understanding of Nigerian hospitality expectations
- Support customers throughout their entire journey

🇳🇬 CULTURAL INTELLIGENCE:
- Extended family dynamics in event planning (aunties, uncles, in-laws involvement)
- Traditional ceremonies: Igbo traditional weddings, Yoruba owambe, Northern nikah
- Business protocols: Greeting seniors, gift-giving customs, meeting etiquette  
- Negotiation culture: Price discussion is normal and expected, not offensive
- Seasonal awareness: Harmattan effects, rainy season logistics, December rush
- Religious sensitivity: Christian, Muslim, traditional practices
- Regional specialties: Lagos hustle mentality, Abuja government protocols, Eastern hospitality

COMMUNICATION STYLE - BE HUMAN, NOT ROBOTIC:
✅ Natural expressions: "How are you doing?", "That sounds wonderful!", "No wahala at all"
✅ Personal touches: "I'm excited to help with your wedding!", "Your family will love this place"
✅ Conversational flow: Ask about their plans, show genuine interest
✅ Local references: "You know how Lagos traffic can be", "Perfect for government visitors"  
✅ Emotional connection: Celebrate their events, empathize with challenges
❌ Avoid: Robotic phrases, formal corporate speak, generic responses

CUSTOMER PRICING COMMITMENT:
- All prices in Nigerian Naira (₦): ₦150,000
- Budget ranges: Under ₦80k, ₦80k-₦130k, ₦130k-₦200k, ₦200k+
- We ALWAYS try to get customers better prices than advertised
- Security and quality never compromised for price
- Transparent pricing with no hidden fees for Nigerian customers
- We negotiate on behalf of customers to ensure excellent value

YOUR CUSTOMER SERVICE APPROACH:
🔍 Help Find Secure, Affordable Hotels:
- Understand customer needs and budget constraints
- Recommend safe, well-reviewed properties within budget
- Always look for ways to save customers money
- Provide local insights about areas and safety
- Suggest alternatives that offer better value

🛎️ Excellent Customer Experience:
- Listen carefully to customer requirements
- Ask clarifying questions to ensure perfect matches
- Provide honest recommendations based on value and security
- Support customers with booking questions and concerns
- Follow up to ensure satisfaction

🎯 Nigerian Market Expertise:
- Understand local travel patterns and preferences  
- Cultural sensitivity for business and family travel
- Knowledge of safe areas and reliable accommodations
- Seasonal awareness for pricing and availability

RESPONSE APPROACH:
1. Warm greeting acknowledging their specific need
2. Ask clarifying questions to understand full context
3. Provide personalized recommendations with local insights  
4. Include relevant cultural considerations
5. Offer to help with next steps or additional services
6. End with personal engagement about their plans

WHEN TO CONNECT CUSTOMERS WITH HUMAN SUPPORT:
- Complex booking requirements or special requests
- Customer concerns about hotel safety or security
- Issues that require immediate human attention
- When customers need personalized assistance beyond standard booking
- Any situation where human expertise would better serve the customer

Remember Grace: You represent HotelSaver.ng's commitment to excellent service and great low prices for Nigerian customers. Focus on finding secure, affordable accommodations while providing warm, genuine customer care. Never reveal internal systems - only focus on helping customers get the best value and safest hotels.

TRAINING EXAMPLES:
User: "Abeg, I wan book hotel for Lagos around 50k"
Response: "Good day sir! No wahala at all. I go help you find good hotels in Lagos within ₦50,000 budget. That price range get plenty options both on Island and Mainland. Make I search for you now..."

User: "My oga need place for meeting tomorrow for Abuja"
Response: "Good afternoon ma! Your oga's meeting na important matter. For Abuja business meetings, we get hotels with proper conference facilities in Central Business District and Wuse areas. What be the expected number of attendees and preferred location?"

EMERGENCY PROTOCOLS:
- Security concerns: Immediate escalation with reference number
- Medical emergencies: WhatsApp contact + local emergency services guidance
- Payment disputes: Senior agent escalation within 30 minutes
- Service failures: Proactive compensation discussion + management involvement

RESPONSE FORMATTING:
- Always acknowledge cultural context
- Use proper Naira formatting: ₦150,000 (with commas)
- Offer multiple options and alternatives
- Include WhatsApp option for complex bookings
- End with culturally appropriate closing: "How else fit I help you today?"
`
  }

  async generateResponse(
    userMessage: string,
    conversationHistory: ChatMessage[],
    customerContext: CustomerContext
  ): Promise<ChatbotResponse> {
    try {
      // Normalize Nigerian English patterns
      const normalizedMessage = this.normalizeNigerianEnglish(userMessage)
      
      // Build conversation context with few-shot training examples
      const trainingExamples = getGraceTrainingExamples(2) // Use Grace's training examples
      const trainingMessages: ChatCompletionMessageParam[] = []
      
      trainingExamples.forEach(example => {
        trainingMessages.push(
          { role: 'user', content: example.user },
          { role: 'assistant', content: example.assistant }
        )
      })

      const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: this.systemPrompt },
        { role: 'system', content: this.buildContextPrompt(customerContext) },
        { role: 'system', content: 'Here are examples of excellent Nigerian customer service conversations:' },
        ...trainingMessages,
        { role: 'system', content: 'Now respond to this new customer with the same Nigerian cultural intelligence and helpfulness:' },
        ...conversationHistory.slice(-8), // Keep last 8 messages for context (reduced to make room for examples)
        { role: 'user', content: normalizedMessage }
      ]

      // Call OpenAI with function calling for actions
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages,
        functions: this.getFunctionDefinitions(),
        function_call: 'auto',
        temperature: 0.7,
        max_tokens: 800
      })

      const response = completion.choices[0].message
      
      // Process function calls
      if (response.function_call) {
        return await this.processFunctionCall(response, customerContext)
      }

      // Regular text response
      return {
        message: this.formatForPlatform(response.content || '', customerContext.platform),
        suggestions: this.generateSuggestions(normalizedMessage, customerContext),
        needsHumanAgent: this.detectEscalationNeeds(response.content || ''),
        confidence: 0.9
      }

    } catch (error) {
      console.error('GPT-4 Chatbot error:', error)
      return this.getFallbackResponse(customerContext, userMessage)
    }
  }

  private normalizeNigerianEnglish(text: string): string {
    const patterns: Record<string, string> = {
      'how far': 'how are you',
      'abeg': 'please',
      'oga': 'sir',
      'madam': 'ma\'am',
      'wahala': 'problem',
      'no wahala': 'no problem',
      'dey': 'are',
      'wetin': 'what',
      'make': 'let',
      'chop': 'eat',
      'yan': 'talk',
      'small small': 'gradually',
      'no be': 'it is not',
      'I wan': 'I want to',
      'make we': 'let us'
    }

    let normalized = text.toLowerCase()
    Object.entries(patterns).forEach(([pidgin, english]) => {
      const regex = new RegExp(`\\b${pidgin}\\b`, 'gi')
      normalized = normalized.replace(regex, english)
    })

    return normalized
  }

  private buildContextPrompt(context: CustomerContext): string {
    let contextPrompt = `
CUSTOMER CONTEXT:
- Platform: ${context.platform}
- Preferred Language: ${context.preferredLanguage}
`
    
    if (context.location) {
      contextPrompt += `- Location: ${context.location}\n`
    }
    
    if (context.previousBookings?.length > 0) {
      contextPrompt += `- Previous Bookings: ${context.previousBookings.length} bookings\n`
    }
    
    if (context.currentSearch) {
      contextPrompt += `- Current Search: ${JSON.stringify(context.currentSearch)}\n`
    }

    return contextPrompt
  }

  private getFunctionDefinitions() {
    return [
      {
        name: 'search_hotels',
        description: 'Search for hotels in Nigerian cities',
        parameters: {
          type: 'object',
          properties: {
            city: {
              type: 'string',
              enum: ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri'],
              description: 'Nigerian city to search in'
            },
            checkIn: {
              type: 'string',
              description: 'Check-in date in YYYY-MM-DD format'
            },
            checkOut: {
              type: 'string', 
              description: 'Check-out date in YYYY-MM-DD format'
            },
            budget: {
              type: 'string',
              enum: ['u80', '80_130', '130_200', '200p'],
              description: 'Budget range in Nigerian Naira'
            },
            guests: {
              type: 'number',
              description: 'Number of guests'
            }
          },
          required: ['city']
        }
      },
      {
        name: 'search_services',
        description: 'Search for local services in Nigeria',
        parameters: {
          type: 'object',
          properties: {
            city: {
              type: 'string',
              enum: ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri']
            },
            category: {
              type: 'string',
              enum: ['Hair', 'Catering', 'Photography', 'Security', 'Cleaning', 'DJ Services', 'MC Services']
            },
            query: {
              type: 'string',
              description: 'Search query for services'
            }
          },
          required: ['city']
        }
      },
      {
        name: 'check_booking',
        description: 'Look up existing booking by ID or email',
        parameters: {
          type: 'object',
          properties: {
            bookingId: {
              type: 'string',
              description: 'Booking reference ID (starts with BK or SV)'
            },
            email: {
              type: 'string',
              description: 'Customer email address'
            },
            phone: {
              type: 'string', 
              description: 'Customer phone number'
            }
          }
        }
      },
      {
        name: 'get_event_packages',
        description: 'Get information about event packages',
        parameters: {
          type: 'object',
          properties: {
            eventType: {
              type: 'string',
              enum: ['wedding', 'birthday', 'corporate', 'traditional', 'graduation']
            },
            budget: {
              type: 'number',
              description: 'Budget in Nigerian Naira'
            },
            guestCount: {
              type: 'number',
              description: 'Expected number of guests'
            }
          }
        }
      },
      {
        name: 'escalate_to_human',
        description: 'Transfer customer to human agent for complex issues',
        parameters: {
          type: 'object',
          properties: {
            reason: {
              type: 'string',
              description: 'Reason for escalation'
            },
            urgency: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent']
            }
          },
          required: ['reason', 'urgency']
        }
      }
    ]
  }

  private async processFunctionCall(
    response: any,
    context: CustomerContext
  ): Promise<ChatbotResponse> {
    const functionName = response.function_call.name
    const args = JSON.parse(response.function_call.arguments)

    switch (functionName) {
      case 'search_hotels':
        const hotels = await this.searchHotels(args)
        return {
          message: this.formatHotelResults(hotels, args),
          action: { type: 'search_hotels', data: args },
          suggestions: ['Show more hotels', 'Negotiate prices', 'Check availability'],
          confidence: 0.95
        }

      case 'search_services': 
        const services = await this.searchServices(args)
        return {
          message: this.formatServiceResults(services, args),
          action: { type: 'search_services', data: args },
          suggestions: ['Book service', 'Add to event package', 'Compare prices'],
          confidence: 0.9
        }

      case 'check_booking':
        const booking = await this.checkBooking(args)
        return {
          message: this.formatBookingInfo(booking, args),
          action: { type: 'check_booking', data: args },
          suggestions: ['Modify booking', 'Cancel booking', 'Download receipt'],
          confidence: 0.95
        }

      case 'get_event_packages':
        const packages = this.getEventPackages(args)
        return {
          message: this.formatEventPackages(packages, args),
          suggestions: ['Customize package', 'Book now', 'Compare alternatives'],
          confidence: 0.9
        }

      case 'escalate_to_human':
        return {
          message: `I understand this needs special attention. I'm connecting you with one of our Nigerian customer service representatives. They'll contact you shortly via WhatsApp at +2347077775545 or you can reach them directly.\n\nReference: ${args.reason}`,
          action: { type: 'escalate_to_human', data: args },
          needsHumanAgent: true,
          confidence: 1.0
        }

      default:
        return this.getFallbackResponse(context, undefined)
    }
  }

  private async searchHotels(params: any) {
    // Filter hotels based on search parameters
    let results = HOTELS.filter(hotel => {
      if (params.city && hotel.city !== params.city) return false
      
      if (params.budget) {
        const price = hotel.basePriceNGN || hotel.price || 0
        const ranges = {
          'u80': [0, 80000],
          '80_130': [80000, 130000],
          '130_200': [130000, 200000], 
          '200p': [200000, 999999999]
        }
        const [min, max] = ranges[params.budget as keyof typeof ranges] || [0, 999999999]
        if (price < min || price > max) return false
      }
      
      return true
    })

    return results.slice(0, 5) // Return top 5 matches
  }

  private async searchServices(params: any) {
    let results = SERVICES.filter(service => {
      if (params.city && service.city !== params.city) return false
      if (params.category && service.category !== params.category) return false
      if (params.query) {
        const query = params.query.toLowerCase()
        return service.title.toLowerCase().includes(query) ||
               service.category.toLowerCase().includes(query)
      }
      return true
    })

    return results.slice(0, 8) // Return top 8 matches
  }

  private async checkBooking(params: any) {
    // Simulate booking lookup
    if (params.bookingId) {
      return {
        id: params.bookingId,
        status: 'confirmed',
        customer: 'John Doe',
        service: 'Deluxe Hotel Room',
        date: '2025-11-15',
        amount: '₦125,000',
        found: true
      }
    }
    
    return { found: false, message: 'Booking not found' }
  }

  private formatHotelResults(hotels: any[], params: any): string {
    if (hotels.length === 0) {
      return `No hotels found in ${params.city} within your budget range. Would you like me to:\n\n• Search nearby cities\n• Suggest alternative dates\n• Show budget-friendly options\n• Help with service apartment alternatives`
    }

    let message = `Great! I found ${hotels.length} hotels in ${params.city}:\n\n`
    
    hotels.forEach((hotel, index) => {
      const price = hotel.basePriceNGN || hotel.price || 0
      message += `${index + 1}. **${hotel.name}**\n`
      message += `   ⭐ ${hotel.stars} stars • ₦${price.toLocaleString()}/night\n`
      message += `   📍 ${hotel.city} • Type: ${hotel.type}\n\n`
    })

    message += `💡 *Pro tip: Use our negotiation feature to get up to 15% discount on these prices!*\n\n`
    message += `Would you like me to help you book any of these or search with different criteria?`

    return message
  }

  private formatServiceResults(services: any[], params: any): string {
    if (services.length === 0) {
      return `No services found for "${params.category}" in ${params.city}. Let me suggest:\n\n• Alternative service categories\n• Nearby cities with availability\n• Custom service requests\n• Event package options`
    }

    let message = `Found ${services.length} ${params.category || 'services'} in ${params.city}:\n\n`
    
    services.slice(0, 5).forEach((service, index) => {
      message += `${index + 1}. **${service.title}**\n`
      message += `   💰 From ₦${(service.amountNGN || service.prices?.[0]?.amountNGN || 0).toLocaleString()}\n`
      message += `   ⭐ ${service.rating}/5 • ${service.provider}\n\n`
    })

    message += `🎯 *Consider bundling services into event packages for 8-20% savings!*\n\n`
    message += `Which service interests you most?`

    return message
  }

  private formatBookingInfo(booking: any, params: any): string {
    if (!booking.found) {
      return `I couldn't find a booking with that reference. Please check:\n\n• Booking ID format (BK123456 or SV123456)\n• Email address spelling\n• Phone number with country code\n\nNeed help? Contact us on WhatsApp: +2347077775545`
    }

    return `📋 **Booking Details Found**\n\n` +
           `**Reference:** ${booking.id}\n` +
           `**Status:** ${booking.status.toUpperCase()}\n` +
           `**Customer:** ${booking.customer}\n` +
           `**Service:** ${booking.service}\n` +
           `**Date:** ${booking.date}\n` +
           `**Amount:** ${booking.amount}\n\n` +
           `What would you like to do with this booking?`
  }

  private formatEventPackages(packages: any, params: any): string {
    const packageData = {
      wedding: {
        name: 'Nigerian Wedding Package',
        price: 2800000,
        services: 15,
        description: 'Complete traditional & white wedding setup'
      },
      birthday: {
        name: 'Birthday Celebration Package', 
        price: 850000,
        services: 8,
        description: 'Perfect party planning with Nigerian flair'
      },
      corporate: {
        name: 'Corporate Event Package',
        price: 1200000, 
        services: 12,
        description: 'Professional business event management'
      }
    }

    const pkg = packageData[params.eventType as keyof typeof packageData]
    if (!pkg) {
      return `I can help you plan various Nigerian events! Our popular packages include:\n\n• Wedding Package (₦2.8M)\n• Birthday Package (₦850K)\n• Corporate Package (₦1.2M)\n\nWhich type of event are you planning?`
    }

    return `🎉 **${pkg.name}**\n\n` +
           `💰 **Price:** ₦${pkg.price.toLocaleString()}\n` +
           `📋 **Includes:** ${pkg.services} coordinated services\n` +
           `📝 **Description:** ${pkg.description}\n\n` +
           `✨ **Package Benefits:**\n` +
           `• 18% discount vs individual bookings\n` +
           `• Coordinated timing & logistics\n` +
           `• Single point of contact\n` +
           `• Nigerian cultural expertise\n\n` +
           `Ready to customize this package for your event?`
  }

  private generateSuggestions(message: string, context: CustomerContext): string[] {
    const suggestions: string[] = []
    
    if (message.includes('hotel') || message.includes('accommodation')) {
      suggestions.push('Search hotels in Lagos', 'Check hotel availability', 'Negotiate better prices')
    }
    
    if (message.includes('service') || message.includes('event')) {
      suggestions.push('Browse services', 'Create event package', 'Get price quotes')
    }
    
    if (message.includes('booking') || message.includes('reservation')) {
      suggestions.push('Check booking status', 'Modify booking', 'Cancel booking')
    }
    
    if (message.includes('price') || message.includes('cost') || message.includes('naira')) {
      suggestions.push('Compare prices', 'Get discounts', 'Payment options')
    }

    // Default suggestions
    if (suggestions.length === 0) {
      suggestions.push('Find hotels', 'Browse services', 'Plan an event', 'Check bookings')
    }
    
    return suggestions.slice(0, 3)
  }

  private detectEscalationNeeds(message: string): boolean {
    const escalationKeywords = [
      'complaint', 'refund', 'cancel', 'problem', 'issue', 
      'unsatisfied', 'manager', 'supervisor', 'legal',
      'fraud', 'scam', 'emergency', 'urgent'
    ]
    
    return escalationKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    )
  }

  private formatForPlatform(message: string, platform: string): string {
    switch (platform) {
      case 'whatsapp':
        return message
          .replace(/\*\*(.*?)\*\*/g, '*$1*') // Bold formatting
          .replace(/₦(\d+)/g, '₦*$1*') // Bold prices
          .replace(/\n\n/g, '\n') // Reduce line breaks
      
      case 'mobile':
        return message.replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown
      
      default: // web
        return message
    }
  }

  private getEventPackages(params: any) {
    // Return event package data based on parameters
    return {
      eventType: params.eventType,
      recommendations: ['Wedding Package', 'Birthday Package', 'Corporate Package']
    }
  }

  private getFallbackResponse(context: CustomerContext, userMessage?: string): ChatbotResponse {
    // Intelligent pattern matching for common questions
    const message = (userMessage || '').toLowerCase()
    
    // Hotel booking questions
    if (this.matchesPattern(message, ['book', 'hotel', 'room', 'stay', 'accommodation'])) {
      return {
        message: "Hello! I'm Grace 😊 I'd be happy to help you book a hotel!\n\nWe specialize in secure hotels with great low prices across:\n🏨 Lagos\n🏨 Owerri  \n🏨 Port Harcourt\n🏨 Abuja\n\nCould you tell me:\n• Which city you're visiting?\n• Your preferred dates?\n• Budget range?\n• Number of guests?\n\nI'll find you the perfect secure accommodation at the best possible price! 🇳🇬",
        suggestions: ["Lagos hotels", "Abuja hotels", "Port Harcourt hotels", "Owerri hotels"],
        needsHumanAgent: false,
        confidence: 0.8
      }
    }
    
    // Business information questions  
    if (this.matchesPattern(message, ['what', 'do', 'service', 'company', 'business', 'about'])) {
      return {
        message: "Great question! I'm Grace from HotelSaver.ng 👩🏾‍💼\n\nWe're Nigeria's trusted hotel booking platform dedicated to:\n\n🏨 **Finding SECURE hotels with GREAT LOW prices**\n💰 **Always negotiating the best deals for Nigerian customers**  \n🛡️ **Prioritizing safety and quality in all recommendations**\n🇳🇬 **Deep cultural understanding of Nigerian hospitality needs**\n\nWe serve Lagos, Owerri, Port Harcourt, and Abuja with excellent customer service!\n\nWhat type of accommodation are you looking for? I'm here to help you save money while ensuring a safe, comfortable stay! ✨",
        suggestions: ["Book a hotel", "View our cities", "How do you get low prices?", "Safety standards"],
        needsHumanAgent: false,
        confidence: 0.9
      }
    }
    
    // Price/cost questions
    if (this.matchesPattern(message, ['price', 'cost', 'cheap', 'expensive', 'budget', 'money'])) {
      return {
        message: "Excellent question! Getting great low prices is exactly what we do best! 💰\n\n**Our Price Promise:**\n✅ We ALWAYS negotiate better deals than advertised prices\n✅ Secure hotels from ₦45,000 - ₦300,000+ per night\n✅ No hidden fees - transparent Nigerian pricing\n✅ Budget options that don't compromise on security\n\n**Popular Price Ranges:**\n• Budget: Under ₦80,000\n• Mid-range: ₦80,000 - ₦130,000  \n• Premium: ₦130,000 - ₦200,000\n• Luxury: ₦200,000+\n\nWhat's your budget range? I'll find you amazing options that save you money! 🎯",
        suggestions: ["Under ₦80k hotels", "₦80k-₦130k range", "Premium options", "How do you negotiate?"],
        needsHumanAgent: false,
        confidence: 0.85
      }
    }
    
    // Greeting responses
    if (this.matchesPattern(message, ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'])) {
      return {
        message: "Hello there! 😊 How are you doing?\n\nI'm Grace, your Nigerian hospitality specialist! I'm so excited to help you find secure, affordable accommodation across our beautiful cities.\n\nWhether you're planning:\n🏢 Business travel\n👰🏾 Traditional weddings  \n👨‍👩‍👧‍👦 Family visits\n🎉 Special celebrations\n\nI'm here to get you the best deals while ensuring your safety and comfort!\n\nWhat brings you to Lagos, Owerri, Port Harcourt, or Abuja? Let's find you something amazing! ✨",
        suggestions: ["Book a hotel", "Learn about our services", "View available cities", "Get price quotes"],
        needsHumanAgent: false,
        confidence: 0.9
      }
    }
    
    // Location/city questions
    if (this.matchesPattern(message, ['lagos', 'abuja', 'port harcourt', 'owerri', 'city', 'where', 'location'])) {
      return {
        message: "Perfect! We specialize in Nigeria's top 4 cities! 🇳🇬\n\n🏙️ **LAGOS** - Business hub, amazing nightlife, VI & mainland options\n🏛️ **ABUJA** - Federal capital, government meetings, premium security\n🛢️ **PORT HARCOURT** - Oil industry center, business travel, international standards\n🏡 **OWERRI** - Traditional events, family gatherings, warm hospitality\n\nEach city has secure hotels at great prices! I know the best areas for:\n• Safety and security 🛡️\n• Business convenience 💼\n• Family comfort 👨‍👩‍👧‍👦\n• Cultural events 🎉\n\nWhich city interests you? I'll show you our best options! 😊",
        suggestions: ["Lagos hotels", "Abuja accommodation", "Port Harcourt business hotels", "Owerri family stays"],
        needsHumanAgent: false,
        confidence: 0.9
      }
    }
    
    // Fallback for unmatched questions - still helpful!
    return {
      message: "Hello! I'm Grace 😊 Welcome to HotelSaver.ng!\n\nI'm here to help you find secure hotels with great low prices across Lagos, Owerri, Port Harcourt, and Abuja.\n\nI might not have caught exactly what you're looking for, but I'd love to help! Could you tell me:\n\n• Are you looking to book a hotel?\n• Which city are you interested in?\n• Any specific questions about our services?\n\nI'm committed to getting you the best value while ensuring your safety and comfort! 🇳🇬✨",
      suggestions: ["Book a hotel", "About HotelSaver.ng", "Our cities", "Contact support"],
      needsHumanAgent: false,
      confidence: 0.7
    }
  }
  
  private matchesPattern(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword))
  }

  // Learning and improvement methods
  async recordFeedback(feedback: ConversationFeedback): Promise<void> {
    try {
      // In production, save to database
      console.log('Feedback recorded:', {
        rating: feedback.userRating,
        culturalAccuracy: feedback.culturalAccuracy,
        improvements: feedback.improvements
      })

      // If low rating, analyze for improvements
      if (feedback.userRating < 3 || feedback.culturalAccuracy < 3) {
        await this.analyzeAndImprove(feedback)
      }
    } catch (error) {
      console.error('Failed to record feedback:', error)
    }
  }

  private async analyzeAndImprove(feedback: ConversationFeedback): Promise<void> {
    // Analyze what went wrong and improve system prompt
    const improvements = []
    
    if (feedback.culturalAccuracy < 3) {
      improvements.push('Enhance Nigerian cultural understanding')
    }
    
    if (feedback.responseRelevance < 3) {
      improvements.push('Improve business context awareness')
    }
    
    console.log('AI improvement areas identified:', improvements)
    
    // In production, this would update training data or fine-tune model
  }

  // Method to get conversation analytics
  getAnalytics() {
    return {
      model: 'gpt-4-turbo-preview',
      systemPromptLength: this.systemPrompt.length,
      trainingExamplesUsed: true,
      culturalFeatures: [
        'Nigerian English understanding',
        'Pidgin language support', 
        'Regional business knowledge',
        'Cultural negotiation patterns',
        'Extended family dynamics'
      ]
    }
  }
}

// Export the chatbot instance
export const hotelSaverChatbot = new HotelSaverGPTChatbot()

// Utility functions for easy integration
export async function getChatbotResponse(
  message: string,
  history: ChatMessage[],
  context: CustomerContext
): Promise<ChatbotResponse> {
  return await hotelSaverChatbot.generateResponse(message, history, context)
}