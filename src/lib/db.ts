import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ecbmanzwvjoyenufmuib.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYm1hbnp3dmpveWVudWZtdWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMjAyMjMsImV4cCI6MjA4OTU5NjIyM30.Vn18s0dxBtufKM7ttzryhMuvReEtxP3bvkMLAI1qoS8'

// Single Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Export as db for backwards compatibility
export const db = supabase

// Types
export interface GuestPost {
  id: string
  name: string
  title?: string
  content: string
  section: string
  approved: boolean
  like_count: number
  comment_count: number
  view_count: number
  created_at: string
  edit_token?: string
  updated_at?: string
  category?: string
  images?: string
}

export interface GuestComment {
  id: string
  post_id: string
  name: string
  content: string
  approved: boolean
  like_count: number
  created_at: string
}

export default supabase
// Force redeploy Fri Mar 20 22:44:08 UTC 2026
// Build trigger Sat Mar 21 09:36:38 UTC 2026
// Build trigger Fri Mar 27 14:57:46 UTC 2026
