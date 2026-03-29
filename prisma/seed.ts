import { db } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user only
  const hashedPassword = await bcrypt.hash('Amina022000l', 10);
  
  const admin = await db.user.upsert({
    where: { email: 'yac13inem@gmail.com' },
    update: {
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
      isVerified: true,
      isActive: true,
      isEmailVerified: true,
      verificationStatus: 'VERIFIED',
    },
    create: {
      id: 'admin-dzbuild-001',
      email: 'yac13inem@gmail.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
      isVerified: true,
      isActive: true,
      isEmailVerified: true,
      verificationStatus: 'VERIFIED',
    },
  });

  console.log('✅ Admin user created:', admin.email);
  console.log('📧 Email: yac13inem@gmail.com');
  console.log('🔑 Password: Amina022000l');
  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
