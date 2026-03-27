const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres.kufsgwavbdtxshyvwhtl:MofmIG0yb9vIEmTM@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?prepare_timeout=10'
});

async function main() {
  console.log('Testing database connection...');
  
  try {
    // Try raw query first with timeout
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Connection test:', result);
    
    // Check if users table exists
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `;
    console.log('Users table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // List users
      const users = await prisma.$queryRaw`
        SELECT id, email, role, name FROM users LIMIT 10
      `;
      console.log('Users:', users);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
