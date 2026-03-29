import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch guest questions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {
      isPublished: true,
    };
    if (category && category !== 'all') {
      where.category = category;
    }

    const questions = await db.question.findMany({
      where,
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    // Transform to frontend format
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      title: q.title,
      content: q.content,
      category: q.category,
      author_name: q.authorName || 'زائر',
      answers_count: q.answersCount || 0,
      votes_count: q.votesCount || 0,
      views_count: q.viewsCount || 0,
      is_solved: q.isSolved || false,
      is_pinned: q.isPinned || false,
      created_at: q.createdAt,
    }));

    return NextResponse.json({ 
      questions: formattedQuestions,
      total: questions.length 
    });
  } catch (error) {
    console.error('Error fetching guest questions:', error);
    return NextResponse.json({ questions: [], total: 0 });
  }
}

// POST - Create a guest question (no login required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, title, content, category, captchaAnswer } = body;

    // Validate CAPTCHA
    if (!captchaAnswer) {
      return NextResponse.json(
        { error: 'يرجى إكمال التحقق / Please complete CAPTCHA' },
        { status: 400 }
      );
    }

    // Validate input
    if (!name || !title || !category) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة / All fields are required' },
        { status: 400 }
      );
    }

    if (title.length < 10) {
      return NextResponse.json(
        { error: 'العنوان قصير جداً / Title too short (min 10 chars)' },
        { status: 400 }
      );
    }

    if (title.length > 300) {
      return NextResponse.json(
        { error: 'العنوان طويل جداً / Title too long (max 300 chars)' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'الاسم طويل جداً / Name too long (max 100 chars)' },
        { status: 400 }
      );
    }

    if (content && content.length > 5000) {
      return NextResponse.json(
        { error: 'المحتوى طويل جداً / Content too long (max 5000 chars)' },
        { status: 400 }
      );
    }

    // Create question
    const question = await db.question.create({
      data: {
        title: title.trim(),
        content: content?.trim() || null,
        category,
        authorName: name.trim(),
        answersCount: 0,
        votesCount: 0,
        viewsCount: 0,
        isSolved: false,
        isPinned: false,
        isPublished: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم نشر السؤال بنجاح / Question published successfully',
      question: {
        id: question.id,
        title: question.title,
        content: question.content,
        category: question.category,
        author_name: question.authorName,
        answers_count: question.answersCount,
        votes_count: question.votesCount,
        views_count: question.viewsCount,
        is_solved: question.isSolved,
        is_pinned: question.isPinned,
        created_at: question.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating guest question:', error);
    return NextResponse.json(
      { error: 'فشل نشر السؤال / Failed to create question' },
      { status: 500 }
    );
  }
}
