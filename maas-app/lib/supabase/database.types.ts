export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          instagram_id: string
          instagram_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          instagram_id: string
          instagram_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          instagram_id?: string
          instagram_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          gender: 'male' | 'female'
          age: number
          region: string
          tier: string
          grade: string
          total_score: number
          category_scores: Json
          evaluation_data: Json
          last_evaluated_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gender: 'male' | 'female'
          age: number
          region: string
          tier?: string
          grade?: string
          total_score?: number
          category_scores?: Json
          evaluation_data?: Json
          last_evaluated_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gender?: 'male' | 'female'
          age?: number
          region?: string
          tier?: string
          grade?: string
          total_score?: number
          category_scores?: Json
          evaluation_data?: Json
          last_evaluated_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: 'free' | 'basic' | 'premium'
          status: 'active' | 'cancelled' | 'expired'
          started_at: string
          expires_at: string | null
          payment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: 'free' | 'basic' | 'premium'
          status?: 'active' | 'cancelled' | 'expired'
          started_at?: string
          expires_at?: string | null
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: 'free' | 'basic' | 'premium'
          status?: 'active' | 'cancelled' | 'expired'
          started_at?: string
          expires_at?: string | null
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          order_id: string
          payment_key: string
          amount: number
          plan_id: string
          status: 'pending' | 'completed' | 'failed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id: string
          payment_key: string
          amount: number
          plan_id: string
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_id?: string
          payment_key?: string
          amount?: number
          plan_id?: string
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      daily_views: {
        Row: {
          id: string
          user_id: string
          view_date: string
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          view_date?: string
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          view_date?: string
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      profile_views: {
        Row: {
          id: string
          viewer_id: string
          viewed_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          viewer_id: string
          viewed_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          viewer_id?: string
          viewed_id?: string
          viewed_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}