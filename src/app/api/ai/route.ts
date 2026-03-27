import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const RequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  context: z.string().optional(),
});

// Knowledge base for construction-related questions
const knowledgeBase: Record<string, string> = {
  cement: `
    Cement types in Algeria:
    - CPA: Portland Cement (most common)
    - CPJ: Composite Portland Cement
    - CLK: Blast Furnace Cement
    Average price: 1,000-1,500 DZD per bag (50kg)
    Recommended for: Foundations, walls, slabs
  `,
  steel: `
    Steel reinforcement (rebar) in Algeria:
    - Diameters: 8mm, 10mm, 12mm, 14mm, 16mm, 20mm, 25mm
    - Average price: 85,000-95,000 DZD per ton
    - Types: FeE400, FeE500
    Calculation: Approximately 80-120 kg/m³ of concrete
  `,
  concrete: `
    Concrete mixing ratios:
    - Foundation: 1:2:4 (cement:sand:gravel)
    - Slab: 1:1.5:3
    - Columns: 1:1.5:3
    Water-cement ratio: 0.5-0.6
    Minimum curing time: 7 days
  `,
  cost: `
    Construction costs in Algeria (2024 estimates):
    - Economy quality: 35,000-45,000 DZD/m²
    - Medium quality: 45,000-55,000 DZD/m²
    - High quality: 55,000-70,000 DZD/m²
    - Luxury: 70,000-100,000+ DZD/m²
    These include materials and labor
  `,
  foundation: `
    Foundation types:
    - Isolated footings: For individual columns
    - Strip footings: For walls
    - Raft foundation: For weak soil
    - Pile foundation: For tall buildings
    Depth: Usually 1-1.5m below ground level
    Concrete grade: C25/30 minimum
  `,
  plumbing: `
    Plumbing materials:
    - PPR pipes: Hot and cold water
    - PVC pipes: Drainage
    - Copper pipes: Rarely used (expensive)
    Average costs:
    - Bathroom: 80,000-150,000 DZD
    - Kitchen: 50,000-100,000 DZD
  `,
};

function findRelevantInfo(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('cement') || lowerQuery.includes('إسمنت') || lowerQuery.includes('ciment')) {
    return knowledgeBase.cement;
  }
  if (lowerQuery.includes('steel') || lowerQuery.includes('iron') || lowerQuery.includes('حديد') || lowerQuery.includes('fer')) {
    return knowledgeBase.steel;
  }
  if (lowerQuery.includes('concrete') || lowerQuery.includes('خرسانة') || lowerQuery.includes('béton')) {
    return knowledgeBase.concrete;
  }
  if (lowerQuery.includes('cost') || lowerQuery.includes('تكلفة') || lowerQuery.includes('coût') || lowerQuery.includes('price')) {
    return knowledgeBase.cost;
  }
  if (lowerQuery.includes('foundation') || lowerQuery.includes('أساس') || lowerQuery.includes('fondation')) {
    return knowledgeBase.foundation;
  }
  if (lowerQuery.includes('plumbing') || lowerQuery.includes('سباكة') || lowerQuery.includes('plomberie')) {
    return knowledgeBase.plumbing;
  }
  
  return '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = RequestSchema.parse(body);
    
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    const query = lastMessage.content;
    const relevantInfo = findRelevantInfo(query);
    
    // Simulated AI response
    // In production, you would call the actual AI API here
    const response = {
      message: generateResponse(query, relevantInfo),
      context: relevantInfo,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

function generateResponse(query: string, context: string): string {
  const lowerQuery = query.toLowerCase();
  
  // Cost calculation question
  if (lowerQuery.includes('cost') || lowerQuery.includes('تكلفة') || lowerQuery.includes('coût')) {
    if (lowerQuery.includes('120') || lowerQuery.includes('150') || lowerQuery.includes('200')) {
      const area = parseInt(query.match(/\d+/)?.[0] || '120');
      const cost = area * 50000; // 50,000 DZD per m² average
      return `بناءً على المعطيات الحالية في السوق الجزائري، التكلفة التقديرية لبناء منزل بمساحة ${area}م² تتراوح بين ${(cost * 0.8 / 1000000).toFixed(1)} إلى ${(cost * 1.2 / 1000000).toFixed(1)} مليون دينار جزائري.

هذا التقدير يشمل:
- الأساسات والهيكل الإنشائي
- البناء والتشطيبات الأساسية
- التمديدات الكهربائية والصحية

للحصول على عرض سعر دقيق، يُنصح بالتواصل مع مقاولين محليين في منطقتك.`;
    }
  }
  
  // Material question
  if (context) {
    return `إليك المعلومات المتوفرة حول استفسارك:\n\n${context}\n\nهل تريد معلومات إضافية عن أي جانب آخر؟`;
  }
  
  // Default response
  return `شكراً على سؤالك! أنا مساعدك الذكي في مجال البناء والهندسة المدنية.

يمكنني مساعدتك في:
- حساب تكاليف البناء
- معرفة أسعار مواد البناء
- الاستشارات الفنية الهندسية
- دليل مراحل البناء

ما هو سؤالك بالتحديد؟`;
}
