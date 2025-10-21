// API route for collecting feedback to improve AI chatbot
import { NextRequest, NextResponse } from 'next/server'
import { hotelSaverChatbot } from '@/lib/gpt-chatbot'
import { addTrainingConversation } from '@/lib/training-data'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      conversationId, 
      userMessage,
      aiResponse,
      userRating, 
      culturalAccuracy,
      responseRelevance,
      userCorrection,
      improvements 
    } = body

    // Validate required fields
    if (!conversationId || !userRating) {
      return NextResponse.json(
        { error: 'conversationId and userRating are required' },
        { status: 400 }
      )
    }

    // Create feedback object
    const feedback = {
      conversationId,
      userMessage: userMessage || '',
      aiResponse: aiResponse || '',
      userRating: Number(userRating),
      culturalAccuracy: Number(culturalAccuracy || userRating),
      responseRelevance: Number(responseRelevance || userRating),
      improvements: improvements || [],
      timestamp: new Date()
    }

    // Record feedback for learning
    await hotelSaverChatbot.recordFeedback(feedback)

    // If user provided correction, add to training data
    if (userCorrection && userMessage) {
      addTrainingConversation(
        userMessage,
        userCorrection,
        'user_correction',
        `User-corrected response (original rating: ${userRating})`,
        0.9 // High confidence for user corrections
      )
    }

    // Log for analytics
    console.log('Chatbot Feedback:', {
      session: conversationId,
      rating: feedback.userRating,
      cultural: feedback.culturalAccuracy,
      relevance: feedback.responseRelevance,
      hasCorrection: !!userCorrection,
      timestamp: feedback.timestamp
    })

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully',
      feedbackId: `fb_${Date.now()}`,
      learningStatus: userCorrection ? 'Training data updated' : 'Feedback recorded'
    })

  } catch (error) {
    console.error('Feedback API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process feedback'
    }, { status: 500 })
  }
}

// Get chatbot analytics and training status
export async function GET() {
  try {
    const analytics = hotelSaverChatbot.getAnalytics()
    
    return NextResponse.json({
      status: 'operational',
      analytics,
      trainingStatus: {
        lastUpdated: new Date().toISOString(),
        cultureTraining: 'Nigerian English + Pidgin support active',
        businessContext: 'Hotel + Services + Events integrated',
        improvementAreas: [
          'Continuous learning from user feedback',
          'Regional dialect expansion',
          'Seasonal event awareness',
          'Payment method guidance'
        ]
      }
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    
    return NextResponse.json({
      status: 'error',
      error: 'Failed to retrieve analytics'
    }, { status: 500 })
  }
}