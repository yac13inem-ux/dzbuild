import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Check if tables exist
export async function GET() {
  try {
    const tables = [
      { name: 'users', label: 'المستخدمين / Utilisateurs' },
      { name: 'posts', label: 'المنشورات / Publications' },
      { name: 'library_resources', label: 'المكتبة / Bibliothèque' },
      { name: 'advertisements', label: 'الإعلانات / Publicités' },
      { name: 'products', label: 'المنتجات / Produits' },
      { name: 'jobs', label: 'الوظائف / Emplois' },
      { name: 'companies', label: 'الشركات / Entreprises' },
      { name: 'craftsmen', label: 'الحرفيين / Artisans' },
      { name: 'projects', label: 'المشاريع / Projets' },
      { name: 'comments', label: 'التعليقات / Commentaires' }
    ];
    
    const results: { table: string; label: string; exists: boolean; count: number }[] = [];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table.name)
          .select('id')
          .limit(1);
        
        results.push({
          table: table.name,
          label: table.label,
          exists: !error,
          count: data?.length || 0
        });
      } catch {
        results.push({
          table: table.name,
          label: table.label,
          exists: false,
          count: 0
        });
      }
    }
    
    const allExist = results.every(r => r.exists);
    
    return NextResponse.json({ 
      success: true,
      allTablesExist: allExist,
      tables: results,
      message: allExist 
        ? 'جميع الجداول موجودة' 
        : 'بعض الجداول غير موجودة - يرجى إنشاؤها في Supabase'
    });
  } catch (error) {
    console.error('Check tables error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to check tables: ' + (error as Error).message 
    }, { status: 500 });
  }
}
