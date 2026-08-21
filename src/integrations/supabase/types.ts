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
      phone_models: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id?: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      phones_597p9_models: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          price: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          price?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          price?: number | null
        }
        Relationships: []
      }
      phones_597p9_services: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          price: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          price?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          price?: number | null
        }
        Relationships: []
      }
      phones_597p9_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: number
          paid: boolean | null
          phone_id: number | null
          service_id: number | null
          updated_at: string
          user_email: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: number
          paid?: boolean | null
          phone_id?: number | null
          service_id?: number | null
          updated_at?: string
          user_email: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: number
          paid?: boolean | null
          phone_id?: number | null
          service_id?: number | null
          updated_at?: string
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "phones_597p9_transactions_phone_id_fkey"
            columns: ["phone_id"]
            isOneToOne: false
            referencedRelation: "phones_597p9_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phones_597p9_transactions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "phones_597p9_services"
            referencedColumns: ["id"]
          },
        ]
      }
      phones_597p9_user_roles: {
        Row: {
          created_at: string
          is_admin: boolean | null
          user_email: string
        }
        Insert: {
          created_at?: string
          is_admin?: boolean | null
          user_email: string
        }
        Update: {
          created_at?: string
          is_admin?: boolean | null
          user_email?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: number
          role: string | null
          username: string
        }
        Insert: {
          id?: number
          role?: string | null
          username: string
        }
        Update: {
          id?: number
          role?: string | null
          username?: string
        }
        Relationships: []
      }
      service_types: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id?: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number | null
          clientName: string | null
          date: string
          description: string | null
          id: number
          isPaid: boolean | null
          phoneName: string | null
          serviceType: string | null
        }
        Insert: {
          amount?: number | null
          clientName?: string | null
          date?: string
          description?: string | null
          id?: number
          isPaid?: boolean | null
          phoneName?: string | null
          serviceType?: string | null
        }
        Update: {
          amount?: number | null
          clientName?: string | null
          date?: string
          description?: string | null
          id?: number
          isPaid?: boolean | null
          phoneName?: string | null
          serviceType?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
        }
        Insert: {
          created_at?: string
          id: string
          is_admin?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { email: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
