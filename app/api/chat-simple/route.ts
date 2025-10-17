import { NextRequest, NextResponse } from 'next/server'
import { HOTELS } from '@/lib/data'

// Enhanced context-aware chatbot without OpenAI dependency
export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const userMessage = message.toLowerCase().trim()
    let response = ''

    // Intent detection and responses
    if (userMessage.includes('hotel') && (userMessage.includes('lagos') || userMessage.includes('abuja') || userMessage.includes('port harcourt') || userMessage.includes('owerri'))) {
      const city = userMessage.includes('lagos') ? 'Lagos' : 
                   userMessage.includes('abuja') ? 'Abuja' :
                   userMessage.includes('port harcourt') ? 'Port Harcourt' : 'Owerri'
      
      const cityHotels = HOTELS.filter(h => h.city === city).slice(0, 3)
      response = `Here are some great hotels in ${city}:\n\n${cityHotels.map(h => 
        `• ${h.name} - ${h.stars}★ hotel starting from ₦${h.basePriceNGN?.toLocaleString() || 'N/A'} per night`
      ).join('\n')}\n\nWould you like to negotiate prices? I can help you save up to 15% off these rates! 🏨✨`
    
    } else if (userMessage.includes('negotiate') || userMessage.includes('discount') || userMessage.includes('price')) {
      response = `🎯 Our Price Negotiation Process:\n\n1. Browse hotels in Lagos, Abuja, Port Harcourt, or Owerri\n2. Click "Negotiate Price" on any hotel\n3. Get instant discounts up to 15% off!\n4. You have 5 minutes to complete booking\n\nNegotiated prices are limited-time offers. Ready to save money on your next stay? 💰`
    
    } else if (userMessage.includes('service') && (userMessage.includes('massage') || userMessage.includes('hair') || userMessage.includes('nail'))) {
      response = `🌟 Popular Nigerian Services Available:\n\n• Hair Styling & Braiding - Starting ₦50,000\n• Relaxation Massage - From ₦65,000  \n• Nail Care Services - From ₦35,000\n• Cleaning Services - From ₦40,000\n• Private Chef - From ₦80,000\n\nAll services include verified 5⭐ providers. Which service interests you? I can help you book! 💅✨`
    
    } else if (userMessage.includes('whatsapp') || userMessage.includes('contact') || userMessage.includes('phone')) {
      response = `📱 Contact HotelSaver.ng Support:\n\n• WhatsApp: +234 707 777 55 45\n• Available 24/7 for bookings & support\n• Fast response time\n\nFor immediate assistance with bookings, pricing, or any questions, our team is ready to help via WhatsApp! 🇳🇬`
    
    } else if (userMessage.includes('book') || userMessage.includes('reservation')) {
      response = `📅 Booking Process:\n\n1. Search hotels by city and budget\n2. Negotiate your price (save up to 15%!)\n3. Complete booking with your contact details\n4. Receive confirmation via email\n\nFor complex bookings or group reservations, contact our WhatsApp: +234 707 777 55 45 🏨`
    
    } else if (userMessage.includes('city') || userMessage.includes('location')) {
      response = `🇳🇬 We Serve Major Nigerian Cities:\n\n• Lagos - Commercial hub, 400+ hotels\n• Abuja - Federal capital, government district\n• Port Harcourt - Oil industry center\n• Owerri - Eastern Nigeria regional hub\n\nEach city has premium hotels, apartments, and local services. Which city are you visiting? 🌆`
    
    } else if (userMessage.includes('price') && userMessage.includes('range')) {
      response = `💰 Hotel Price Ranges in Nigeria:\n\n• Budget: Under ₦80,000/night\n• Mid-Range: ₦80,000 - ₦130,000/night\n• Premium: ₦130,000 - ₦200,000/night  \n• Luxury: ₦200,000+/night\n\nRemember: Negotiate for 15% instant discounts! Plus 7.5% VAT applies to multi-night stays. 💸`
    
    } else if (userMessage.includes('hello') || userMessage.includes('hi') || userMessage.includes('help')) {
      response = `Hello! Welcome to HotelSaver.ng! 🇳🇬\n\nI can help you with:\n• Finding hotels in Lagos, Abuja, Port Harcourt & Owerri\n• Understanding our price negotiation process\n• Booking local services (hair, massage, cleaning, etc.)\n• Contact information and support\n\nWhat would you like to know about Nigerian hospitality? 🏨✨`
    
    } else {
      // Default response
      response = `I'm here to help with HotelSaver.ng! 🇳🇬\n\nTry asking about:\n• "Hotels in Lagos"\n• "How does negotiation work?"\n• "Book massage service"\n• "Contact WhatsApp"\n\nOr contact our 24/7 support: +234 707 777 55 45 📱`
    }

    return NextResponse.json({
      response,
      conversation: [
        { role: 'user', content: message },
        { role: 'assistant', content: response }
      ]
    })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({
      response: "Sorry, I'm having technical difficulties. For immediate help, please WhatsApp us: +234 707 777 55 45 📱",
      conversation: []
    })
  }
}