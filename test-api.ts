// Test script for all APIs
const BASE_URL = 'http://localhost:3000';

async function testAPI(name: string, endpoint: string, method: string, body?: object) {
  try {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json();
    
    return { success: res.ok, status: res.status, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function runTests() {
  console.log('🧪 اختبار شامل لجميع العمليات\n');
  console.log('='.repeat(50));
  
  // Test Products
  console.log('\n📦 1. المنتجات (Products)');
  console.log('-'.repeat(30));
  
  const productPost = await testAPI('Product POST', '/api/guest/products', 'POST', {
    title: 'منتج تجريبي',
    description: 'وصف المنتج',
    category: 'materials',
    price: 5000,
    unit: 'وحدة'
  });
  
  if (productPost.success && productPost.data) {
    console.log('📤 النشر:', '✅ نجح');
    console.log('   ID:', productPost.data.product?.id);
    console.log('   editToken:', productPost.data.editToken?.substring(0, 20) + '...');
    
    const productId = productPost.data.product?.id;
    const editToken = productPost.data.editToken;
    
    // Test Update
    const productPut = await testAPI('Product PUT', '/api/guest/products', 'PUT', {
      id: productId,
      editToken: editToken,
      title: 'منتج معدل',
      price: 6000
    });
    console.log('✏️ التعديل:', productPut.success ? '✅ نجح' : '❌ فشل - ' + (productPut.data as any)?.error);
    
    // Test Delete
    const productDelete = await testAPI('Product DELETE', `/api/guest/products?id=${productId}&editToken=${editToken}`, 'DELETE');
    console.log('🗑️ الحذف:', productDelete.success ? '✅ نجح' : '❌ فشل - ' + (productDelete.data as any)?.error);
  } else {
    console.log('📤 النشر: ❌ فشل -', (productPost.data as any)?.error || productPost.error);
  }

  // Test Craftsmen
  console.log('\n👷 2. الحرفيين (Craftsmen)');
  console.log('-'.repeat(30));
  
  const craftsmanPost = await testAPI('Craftsman POST', '/api/guest/craftsmen', 'POST', {
    name: 'أحمد الحرفي',
    category: 'builder',
    phone: '0555123456',
    city: 'الجزائر',
    wilaya: 'الجزائر',
    experience_years: 5
  });
  
  if (craftsmanPost.success && craftsmanPost.data) {
    console.log('📤 النشر:', '✅ نجح');
    console.log('   ID:', craftsmanPost.data.craftsman?.id);
    
    const craftsmanId = craftsmanPost.data.craftsman?.id;
    const editToken = craftsmanPost.data.editToken;
    
    const craftsmanPut = await testAPI('Craftsman PUT', '/api/guest/craftsmen', 'PUT', {
      id: craftsmanId,
      editToken: editToken,
      name: 'أحمد المعدل'
    });
    console.log('✏️ التعديل:', craftsmanPut.success ? '✅ نجح' : '❌ فشل');
    
    const craftsmanDelete = await testAPI('Craftsman DELETE', `/api/guest/craftsmen?id=${craftsmanId}&editToken=${editToken}`, 'DELETE');
    console.log('🗑️ الحذف:', craftsmanDelete.success ? '✅ نجح' : '❌ فشل');
  } else {
    console.log('📤 النشر: ❌ فشل -', (craftsmanPost.data as any)?.error || craftsmanPost.error);
  }

  // Test Companies
  console.log('\n🏢 3. الشركات (Companies)');
  console.log('-'.repeat(30));
  
  const companyPost = await testAPI('Company POST', '/api/guest/companies', 'POST', {
    name: 'شركة البناء',
    company_type: 'BET',
    phone: '0555987654',
    email: 'company@test.com',
    city: 'وهران',
    wilaya: 'وهران'
  });
  
  if (companyPost.success && companyPost.data) {
    console.log('📤 النشر:', '✅ نجح');
    console.log('   ID:', companyPost.data.company?.id);
    
    const companyId = companyPost.data.company?.id;
    const editToken = companyPost.data.editToken;
    
    const companyPut = await testAPI('Company PUT', '/api/guest/companies', 'PUT', {
      id: companyId,
      editToken: editToken,
      name: 'شركة معدلة'
    });
    console.log('✏️ التعديل:', companyPut.success ? '✅ نجح' : '❌ فشل');
    
    const companyDelete = await testAPI('Company DELETE', `/api/guest/companies?id=${companyId}&editToken=${editToken}`, 'DELETE');
    console.log('🗑️ الحذف:', companyDelete.success ? '✅ نجح' : '❌ فشل');
  } else {
    console.log('📤 النشر: ❌ فشل -', (companyPost.data as any)?.error || companyPost.error);
  }

  // Test Jobs
  console.log('\n💼 4. الوظائف (Jobs)');
  console.log('-'.repeat(30));
  
  const jobPost = await testAPI('Job POST', '/api/guest/jobs', 'POST', {
    title: 'مهندس مدني',
    category: 'engineering',
    company_name: 'شركة البناء',
    city: 'قسنطينة',
    wilaya: 'قسنطينة',
    salary_range: '50000-70000 دج',
    experience_level: 'mid'
  });
  
  if (jobPost.success && jobPost.data) {
    console.log('📤 النشر:', '✅ نجح');
    console.log('   ID:', jobPost.data.job?.id);
    
    const jobId = jobPost.data.job?.id;
    const editToken = jobPost.data.editToken;
    
    const jobPut = await testAPI('Job PUT', '/api/guest/jobs', 'PUT', {
      id: jobId,
      editToken: editToken,
      title: 'مهندس أول'
    });
    console.log('✏️ التعديل:', jobPut.success ? '✅ نجح' : '❌ فشل');
    
    const jobDelete = await testAPI('Job DELETE', `/api/guest/jobs?id=${jobId}&editToken=${editToken}`, 'DELETE');
    console.log('🗑️ الحذف:', jobDelete.success ? '✅ نجح' : '❌ فشل');
  } else {
    console.log('📤 النشر: ❌ فشل -', (jobPost.data as any)?.error || jobPost.error);
  }

  // Test Projects
  console.log('\n🏗️ 5. المشاريع (Projects)');
  console.log('-'.repeat(30));
  
  const projectPost = await testAPI('Project POST', '/api/guest/projects', 'POST', {
    title: 'مشروع سكني',
    category: 'residential',
    status: 'planning',
    progress: 0,
    budget: 5000000,
    city: 'عنابة',
    wilaya: 'عنابة'
  });
  
  if (projectPost.success && projectPost.data) {
    console.log('📤 النشر:', '✅ نجح');
    console.log('   ID:', projectPost.data.project?.id);
    
    const projectId = projectPost.data.project?.id;
    const editToken = projectPost.data.editToken;
    
    const projectPut = await testAPI('Project PUT', '/api/guest/projects', 'PUT', {
      id: projectId,
      editToken: editToken,
      title: 'مشروع معدل',
      progress: 25
    });
    console.log('✏️ التعديل:', projectPut.success ? '✅ نجح' : '❌ فشل');
    
    const projectDelete = await testAPI('Project DELETE', `/api/guest/projects?id=${projectId}&editToken=${editToken}`, 'DELETE');
    console.log('🗑️ الحذف:', projectDelete.success ? '✅ نجح' : '❌ فشل');
  } else {
    console.log('📤 النشر: ❌ فشل -', (projectPost.data as any)?.error || projectPost.error);
  }

  // Test Comments
  console.log('\n💬 6. التعليقات (Comments)');
  console.log('-'.repeat(30));
  
  // First create a product to comment on
  const productForComment = await testAPI('Product for comment', '/api/guest/products', 'POST', {
    title: 'منتج للتعليق',
    price: 100
  });
  
  if (productForComment.success && productForComment.data?.product?.id) {
    const productId = productForComment.data.product.id;
    
    const commentPost = await testAPI('Comment POST', '/api/item-comments', 'POST', {
      item_type: 'product',
      item_id: productId,
      name: 'محمد',
      content: 'هذا تعليق تجريبي على المنتج'
    });
    
    if (commentPost.success && commentPost.data) {
      console.log('📤 النشر:', '✅ نجح');
      console.log('   ID:', commentPost.data.comment?.id);
      
      const commentId = commentPost.data.comment?.id;
      const editToken = commentPost.data.comment?.edit_token;
      
      const commentPut = await testAPI('Comment PUT', '/api/item-comments', 'PUT', {
        id: commentId,
        content: 'تعليق معدل',
        edit_token: editToken
      });
      console.log('✏️ التعديل:', commentPut.success ? '✅ نجح' : '❌ فشل');
      
      const commentDelete = await testAPI('Comment DELETE', `/api/item-comments?id=${commentId}&edit_token=${editToken}`, 'DELETE');
      console.log('🗑️ الحذف:', commentDelete.success ? '✅ نجح' : '❌ فشل');
      
      // Cleanup the product
      await testAPI('Cleanup', `/api/guest/products?id=${productId}&editToken=${productForComment.data.editToken}`, 'DELETE');
    } else {
      console.log('📤 النشر: ❌ فشل -', (commentPost.data as any)?.error || commentPost.error);
    }
  } else {
    console.log('📤 النشر: ❌ فشل - لا يمكن إنشاء منتج للتعليق');
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ انتهى الاختبار');
}

runTests();
