# AI Bot Training Guide for HotelSaver.ng

## 🎓 **Complete Training Methods for Your Nigerian AI Chatbot**

### **Method 1: Enhanced System Prompt Training**

The system prompt is like the AI's "personality manual." Here's how to improve it:

#### **Add More Nigerian Context:**

```typescript
// In lib/gpt-chatbot.ts - buildNigerianSystemPrompt()

const enhancedPrompt = `
You are Ada, HotelSaver.ng's AI assistant specializing in Nigerian hospitality.

ADVANCED NIGERIAN CONTEXT:
- Lagos: Recognize VI (Victoria Island), Ikoyi, Lekki, Mainland divisions
- Traffic patterns: "Go-slow" on Third Mainland Bridge, alternative routes
- Business hours: Lagos (24/7), Abuja (government hours), Port Harcourt (oil industry)
- Payment culture: Bank transfers preferred, USSD payments common
- Negotiation is normal - always offer to "negotiate price" or "find better deal"

NIGERIAN ENGLISH PATTERNS:
Input: "How far na?" → Understand as: "How are you?"
Input: "Abeg help me" → Understand as: "Please help me"
Input: "I wan book" → Understand as: "I want to book"
Input: "Wetin be the cost?" → Understand as: "What is the cost?"
Input: "No wahala" → Understand as: "No problem"

CULTURAL RESPONSES:
- Always greet with time-appropriate "Good morning/afternoon sir/ma"
- Use "No wahala" instead of "No problem"
- Reference family events: "extended family gathering", "traditional ceremony"
- Mention seasonal events: Harmattan season, rainy season impacts

BUSINESS INTELLIGENCE:
- Payday periods: End of month (25th-5th) = higher booking activity
- Nigerian holidays: Independence Day (Oct 1), Democracy Day (June 12), Eid festivals
- Wedding seasons: December-January, avoid during Ramadan
- Corporate events: Avoid during NYSC batch changes, government transitions

ADVANCED SERVICE KNOWLEDGE:
- Traditional weddings: Require "aso-ebi" coordination, multiple venues
- Hair services: Understand "attachment", "weaving", "braiding", "relaxer"
- Security: Common for parties, know "bouncer" vs "escort" services  
- Catering: Jollof rice quality is serious business, never compromise on this
- Livestock: Traditional ceremonies may require goat/cow, handle respectfully

CONVERSATION FLOWS:
1. Greet → Understand need → Suggest options → Handle negotiations → Close or escalate
2. Always offer alternatives if first choice unavailable
3. Bundle services for cost savings (Nigerians love good deals)
4. Mention free cancellation policies upfront (builds trust)

ERROR HANDLING:
- If confused by Pidgin, ask politely: "I want to help you perfectly, could you rephrase that?"
- Never claim to not understand Nigerian English - adapt and learn
- For complex issues: "Let me connect you with our Nigerian specialist"
`
```

### **Method 2: Conversation Training Dataset**

Create training examples for common Nigerian scenarios:

```typescript
// Add to lib/gpt-chatbot.ts

const nigerianTrainingExamples = [
  {
    user: "Abeg, I dey find hotel for Lagos around 50k per night",
    assistant: "Good day sir! No wahala at all. I go help you find good hotels in Lagos within ₦50,000 budget. That price range get plenty options both on Island and Mainland. Make I search for you now...",
    context: "Budget hotel search in Nigerian English"
  },
  {
    user: "My oga wan do birthday party for 100 people, wetin una fit do?",
    assistant: "Congratulations on your oga's birthday! For 100 people birthday celebration, our Birthday Package (₦850,000) go cover everything: catering with proper Jollof rice, DJ with latest Afrobeats, decoration, security, photography. You go save 15% compared to booking separately. Which area you dey plan the party?",
    context: "Event planning for boss's birthday"
  },
  {
    user: "I need hair stylist wey sabi do traditional Nigerian braids for wedding",
    assistant: "Perfect! Traditional Nigerian braids for wedding na very important thing. We get expert hair stylists wey specialize in bridal braiding - Ghana weaving, Shuku styles, threading with attachments. Our Wedding Hair Package include trial session, wedding day styling, and touch-up. For which city you dey plan the wedding?",
    context: "Traditional wedding hair services"
  }
]

// Use these in system prompt as examples
```

### **Method 3: Fine-tuning with OpenAI (Advanced)**

For production-level customization:

```typescript
// Create fine-tuning dataset
const finetuningData = [
  {
    "messages": [
      {"role": "system", "content": "You are Ada, Nigerian hotel booking assistant"},
      {"role": "user", "content": "Abeg help me book hotel for Lagos"},
      {"role": "assistant", "content": "Good day! No wahala, I go help you find perfect hotel in Lagos. What be your budget and preferred area?"}
    ]
  },
  // ... more examples
]

// Upload to OpenAI for fine-tuning
async function createFineTunedModel() {
  const file = await openai.files.create({
    file: fs.createReadStream("nigerian-hotel-training.jsonl"),
    purpose: "fine-tune"
  })
  
  const fineTune = await openai.fineTuning.jobs.create({
    training_file: file.id,
    model: "gpt-4"
  })
  
  return fineTune.id
}
```

### **Method 4: Dynamic Learning System**

Implement feedback loops to improve responses:

```typescript
// Add to lib/gpt-chatbot.ts

interface ConversationFeedback {
  sessionId: string
  userMessage: string
  aiResponse: string
  userRating: number // 1-5 stars
  userCorrection?: string
  timestamp: Date
}

class LearningSystem {
  async recordFeedback(feedback: ConversationFeedback) {
    // Store in database or file
    await this.saveFeedback(feedback)
    
    // If rating < 3, analyze for improvements
    if (feedback.userRating < 3) {
      await this.analyzeFailure(feedback)
    }
  }
  
  async improveResponse(originalMessage: string, betterResponse: string) {
    // Add to training examples
    this.trainingExamples.push({
      user: originalMessage,
      assistant: betterResponse,
      source: 'user_correction',
      confidence: 0.9
    })
  }
}
```

### **Method 5: Nigerian Knowledge Base Integration**

```typescript
// Create Nigerian-specific knowledge base

const nigerianKnowledgeBase = {
  cities: {
    lagos: {
      areas: ['Victoria Island', 'Ikoyi', 'Lekki', 'Surulere', 'Mainland'],
      traffic: 'Heavy during rush hours 7-10am, 4-8pm',
      business: '24/7 commercial activity',
      airports: 'Murtala Muhammed International',
      popular_events: 'Lagos Fashion Week, Felabration'
    },
    abuja: {
      areas: ['Central Business District', 'Wuse', 'Garki', 'Asokoro'],
      traffic: 'Moderate, government working hours impact',
      business: 'Monday-Friday focused, government meetings',
      airports: 'Nnamdi Azikiwe International',
      popular_events: 'Abuja International Film Festival'
    }
  },
  
  cultural_events: {
    wedding_seasons: ['December', 'January', 'February'],
    avoid_periods: ['Ramadan', 'Election periods'],
    peak_business: ['End of month', 'Government allocation periods']
  },
  
  language_patterns: {
    pidgin_translations: {
      'how far': 'how are you',
      'wetin dey happen': 'what is happening',
      'I dey kampe': 'I am fine',
      'no wahala': 'no problem',
      'abeg': 'please'
    }
  }
}

// Integrate into responses
function enhanceWithLocalKnowledge(message: string, city: string) {
  const cityInfo = nigerianKnowledgeBase.cities[city.toLowerCase()]
  if (cityInfo) {
    return `Based on ${city} local knowledge: ${cityInfo.traffic}, popular areas include ${cityInfo.areas.join(', ')}`
  }
  return ''
}
```

## 🛠️ **Implementation Steps**

### **Step 1: Update System Prompt (Easy)**

```bash
# Edit the system prompt in lib/gpt-chatbot.ts
# Add more Nigerian context and examples
# Test with Nigerian English phrases
```

### **Step 2: Add Training Examples (Medium)**

```typescript
// Create training-data.ts file with conversation examples
// Import into gpt-chatbot.ts
// Use as few-shot examples in system prompt
```

### **Step 3: Implement Feedback System (Advanced)**

```typescript
// Add rating buttons to chatbot UI
// Store user corrections and ratings
// Analyze patterns to improve responses
```

### **Step 4: Create Knowledge Base (Expert)**

```typescript
// Build comprehensive Nigerian hospitality database
// Include seasonal trends, cultural events, local preferences
// Integrate with real-time data (traffic, events, weather)
```

## 🧪 **Testing Your Training**

### **Test Scenarios:**

1. **Pidgin English**: "Abeg, I wan book hotel for Lagos"
2. **Cultural Events**: "I dey plan traditional Igbo wedding"  
3. **Business Context**: "My oga need accommodation for Abuja meeting"
4. **Price Negotiations**: "This price too high, you fit reduce am?"
5. **Complex Complaints**: "The caterer no show up for my party"

### **Success Metrics:**

- **Cultural Understanding**: 95%+ recognition of Nigerian English
- **Response Relevance**: Accurate hotel/service suggestions
- **Escalation Rate**: <5% to human agents
- **Customer Satisfaction**: 4.5+ star average rating

## 🚀 **Advanced Training Features**

### **Real-time Learning**
```typescript
// Monitor conversations and auto-improve
async function continuousLearning() {
  const conversations = await getRecentConversations()
  const patterns = analyzePatterns(conversations)
  const improvements = generateImprovements(patterns)
  await updateSystemPrompt(improvements)
}
```

### **A/B Testing**
```typescript
// Test different response styles
const responseStyles = ['formal', 'casual', 'pidgin-friendly']
const bestStyle = await testResponseStyles(responseStyles)
```

### **Integration with Business Data**
```typescript
// Connect to real booking trends
const bookingTrends = await getBookingAnalytics()
const seasonalAdjustments = calculateSeasonalPrompts(bookingTrends)
```

Your AI bot will become **smarter and more Nigerian** with each conversation! 🇳🇬🤖

Would you like me to implement any of these training methods right now?