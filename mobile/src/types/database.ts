export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      claims: {
        Row: {
          admin_notes: string | null
          claimed_at: string
          drop_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          admin_notes?: string | null
          claimed_at?: string
          drop_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          admin_notes?: string | null
          claimed_at?: string
          drop_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_drop_id_fkey"
            columns: ["drop_id"]
            isOneToOne: false
            referencedRelation: "drops"
            referencedColumns: ["id"]
          },
        ]
      }
      drops: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          drop_id: string
          expires_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          min_ghox_required: number | null
          prize: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          drop_id: string
          expires_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          min_ghox_required?: number | null
          prize?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          drop_id?: string
          expires_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          min_ghox_required?: number | null
          prize?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Drop type for easy access
export type Drop = Database['public']['Tables']['drops']['Row'];
export type Claim = Database['public']['Tables']['claims']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const; 