import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'ar' | 'fr' | 'en';
export type UserRole = 
  | 'CIVIL_ENGINEER'
  | 'CONTRACTOR'
  | 'ENGINEERING_OFFICE'
  | 'CRAFTSMAN'
  | 'CONSTRUCTION_COMPANY'
  | 'STORE_FACTORY'
  | 'NORMAL_USER'
  | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isVerified?: boolean;
  rating?: number;
  reviewCount?: number;
  city?: string;
  wilaya?: string;
  specialization?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
}

export interface Post {
  id: string;
  content: string;
  title?: string;
  post_type: string;
  images: string[];
  videos: string[];
  category?: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  shares_count?: number;
  views_count?: number;
  is_featured?: boolean;
  is_sponsored?: boolean;
  created_at: string;
  is_liked?: boolean;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: UserRole;
    specialization?: string;
    city?: string;
    wilaya?: string;
  };
}

interface AppState {
  // User
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  
  // Posts
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  removePost: (id: string) => void;
  
  // Locale
  locale: Locale;
  setLocale: (locale: Locale) => void;
  
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  
  // Admin mode
  isAdminMode: boolean;
  setAdminMode: (mode: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User
      user: null,
      isLoggedIn: false,
      setUser: (user) => set({ user, isLoggedIn: !!user }),
      logout: async () => {
        try {
          // Call logout API to clear Supabase session
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
          // Continue with local logout anyway
        }
        set({ user: null, isLoggedIn: false, isAdminMode: false, posts: [] });
      },
      
      // Posts
      posts: [],
      setPosts: (posts) => set({ posts }),
      addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
      updatePost: (id, updates) => set((state) => ({
        posts: state.posts.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      removePost: (id) => set((state) => ({
        posts: state.posts.filter(p => p.id !== id)
      })),
      
      // Locale
      locale: 'ar',
      setLocale: (locale) => set({ locale }),
      
      // UI State
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      activeSection: 'home',
      setActiveSection: (section) => set({ activeSection: section }),
      
      // Admin mode
      isAdminMode: false,
      setAdminMode: (mode) => set({ isAdminMode: mode }),
    }),
    {
      name: 'dzbuild-storage',
      partialize: (state) => ({
        locale: state.locale,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
