export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          id: string
          key_name: string
          key_value: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_name: string
          key_value: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          key_name?: string
          key_value?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      automation_subscriptions: {
        Row: {
          automation_active: boolean | null
          content_type: string | null
          created_at: string
          credits_remaining: number | null
          credits_total: number | null
          credits_used: number | null
          cronjob_id: string | null
          custom_page_token: string
          execution_times: Json | null
          facebook_user_id: string | null
          followers_count: number | null
          id: string
          page_access_token: string
          page_id: string
          page_name: string
          posts_per_day: number | null
          posts_per_week: number | null
          subscription_end: string | null
          subscription_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          automation_active?: boolean | null
          content_type?: string | null
          created_at?: string
          credits_remaining?: number | null
          credits_total?: number | null
          credits_used?: number | null
          cronjob_id?: string | null
          custom_page_token?: string
          execution_times?: Json | null
          facebook_user_id?: string | null
          followers_count?: number | null
          id?: string
          page_access_token: string
          page_id: string
          page_name: string
          posts_per_day?: number | null
          posts_per_week?: number | null
          subscription_end?: string | null
          subscription_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          automation_active?: boolean | null
          content_type?: string | null
          created_at?: string
          credits_remaining?: number | null
          credits_total?: number | null
          credits_used?: number | null
          cronjob_id?: string | null
          custom_page_token?: string
          execution_times?: Json | null
          facebook_user_id?: string | null
          followers_count?: number | null
          id?: string
          page_access_token?: string
          page_id?: string
          page_name?: string
          posts_per_day?: number | null
          posts_per_week?: number | null
          subscription_end?: string | null
          subscription_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      facebook_pages: {
        Row: {
          access_token: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          page_id: string
          page_name: string
          picture_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          page_id: string
          page_name: string
          picture_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          access_token?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          page_id?: string
          page_name?: string
          picture_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      facebook_users: {
        Row: {
          access_token: string | null
          created_at: string
          facebook_email: string | null
          facebook_id: string
          facebook_name: string
          facebook_picture_url: string | null
          id: string
          last_login: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          facebook_email?: string | null
          facebook_id: string
          facebook_name: string
          facebook_picture_url?: string | null
          id?: string
          last_login?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          facebook_email?: string | null
          facebook_id?: string
          facebook_name?: string
          facebook_picture_url?: string | null
          id?: string
          last_login?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      page_events: {
        Row: {
          auto_replied: boolean
          comment_id: string | null
          content: string | null
          created_at: string
          event_type: string
          id: string
          message_id: string | null
          metadata: Json | null
          page_id: string
          post_id: string | null
          response_content: string | null
          status: string
          updated_at: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          auto_replied?: boolean
          comment_id?: string | null
          content?: string | null
          created_at?: string
          event_type: string
          id?: string
          message_id?: string | null
          metadata?: Json | null
          page_id: string
          post_id?: string | null
          response_content?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          auto_replied?: boolean
          comment_id?: string | null
          content?: string | null
          created_at?: string
          event_type?: string
          id?: string
          message_id?: string | null
          metadata?: Json | null
          page_id?: string
          post_id?: string | null
          response_content?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_data: Json
          id: string
          page_id: string | null
          processed: boolean
          webhook_type: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_data: Json
          id?: string
          page_id?: string | null
          processed?: boolean
          webhook_type: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_data?: Json
          id?: string
          page_id?: string | null
          processed?: boolean
          webhook_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_execute_automation: {
        Args: { p_custom_page_token: string }
        Returns: boolean
      }
      deduct_credits: {
        Args: { p_credits_to_deduct?: number; p_custom_page_token: string }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
