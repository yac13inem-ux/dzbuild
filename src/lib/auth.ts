import { supabase } from './db';

// Simple password verification (no bcrypt needed)
export async function hashPassword(password: string): Promise<string> {
  return password; // No hashing needed for simple admin login
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return password === hashedPassword;
}

// Get current user
export async function getCurrentUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, avatar, is_verified, is_active')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data;
}
