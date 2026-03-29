import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Single Supabase client for browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

export interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
  is_verified: boolean
}

// ============ POSTS ============

export async function getPosts(section?: string) {
  let query = supabase
    .from('guest_posts')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(20)

  if (section && section !== 'all') {
    query = query.eq('section', section)
  }

  const { data, error } = await query
  if (error) return []
  return data
}

export async function createPost(post: { name: string; content: string; title?: string; section?: string }) {
  const { data, error } = await supabase
    .from('guest_posts')
    .insert({
      name: post.name,
      content: post.content,
      title: post.title,
      section: post.section || 'discussion',
      approved: true,
      like_count: 0,
      comment_count: 0,
      view_count: 0,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

// ============ COMMENTS ============

export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from('guest_comments')
    .select('*')
    .eq('post_id', postId)
    .eq('approved', true)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function createComment(comment: { post_id: string; name: string; content: string }) {
  const { data, error } = await supabase
    .from('guest_comments')
    .insert({
      post_id: comment.post_id,
      name: comment.name,
      content: comment.content,
      approved: true,
      like_count: 0,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  
  // Increment comment count
  await supabase.rpc('increment_comment_count', { post_id: comment.post_id })
  
  return { data }
}

// ============ QUESTIONS ============

export async function getQuestions() {
  const { data, error } = await supabase
    .from('guest_posts')
    .select('*')
    .eq('approved', true)
    .eq('section', 'EngineeringQuestions')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return []
  return data
}

export async function createQuestion(q: { name: string; title: string; content?: string }) {
  const { data, error } = await supabase
    .from('guest_posts')
    .insert({
      name: q.name,
      title: q.title,
      content: q.content,
      section: 'EngineeringQuestions',
      approved: true,
      like_count: 0,
      comment_count: 0,
      view_count: 0,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

// ============ AUTH ============

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) return { error: error.message }
  return { data }
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ============ ADMIN ============

export async function getStats() {
  const [users, posts, questions] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('guest_posts').select('id', { count: 'exact', head: true }).neq('section', 'EngineeringQuestions'),
    supabase.from('guest_posts').select('id', { count: 'exact', head: true }).eq('section', 'EngineeringQuestions'),
  ])

  return {
    users: users.count || 0,
    posts: posts.count || 0,
    questions: questions.count || 0,
  }
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return []
  return data
}

export async function getAllPosts() {
  const { data, error } = await supabase
    .from('guest_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return []
  return data
}
