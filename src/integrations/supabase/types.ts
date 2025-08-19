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
        Relationships: [
          {
            foreignKeyName: "automation_subscriptions_facebook_user_id_fkey"
            columns: ["facebook_user_id"]
            isOneToOne: false
            referencedRelation: "facebook_users"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_pages: {
        Row: {
          access_token: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          last_activity: string | null
          page_id: string
          page_name: string
          picture_url: string | null
          updated_at: string
          user_id: string
          webhook_status: string | null
        }
        Insert: {
          access_token: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_activity?: string | null
          page_id: string
          page_name: string
          picture_url?: string | null
          updated_at?: string
          user_id?: string
          webhook_status?: string | null
        }
        Update: {
          access_token?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_activity?: string | null
          page_id?: string
          page_name?: string
          picture_url?: string | null
          updated_at?: string
          user_id?: string
          webhook_status?: string | null
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
      cleanup_old_webhook_logs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_automation_subscription: {
        Args: {
          p_content_type?: string
          p_execution_times?: Json
          p_page_access_token: string
          p_page_id: string
          p_page_name: string
          p_posts_per_day?: number
          p_user_id: string
        }
        Returns: string
      }
      deactivate_expired_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      deduct_credits: {
        Args: { p_credits_to_deduct?: number; p_custom_page_token: string }
        Returns: boolean
      }
      extend_subscription: {
        Args: { p_days?: number; p_user_id: string }
        Returns: boolean
      }
      get_automation_schedule: {
        Args: Record<PropertyKey, never>
        Returns: {
          content_type: string
          credits_remaining: number
          custom_page_token: string
          execution_times: Json
          id: string
          page_id: string
          page_name: string
          posts_per_day: number
          user_id: string
        }[]
      }
      get_automation_status: {
        Args: { p_custom_page_token: string }
        Returns: {
          active: boolean
          credits_remaining: number
          credits_total: number
          posts_per_day: number
          subscription_end: string
        }[]
      }
      get_page_analytics: {
        Args: { p_days?: number; p_page_id: string }
        Returns: {
          auto_replies_count: number
          comments_count: number
          error_count: number
          messages_count: number
          pending_count: number
          success_count: number
          total_events: number
        }[]
      }
      get_page_events: {
        Args: { p_limit?: number; p_offset?: number; p_page_id: string }
        Returns: {
          auto_replied: boolean
          content: string
          created_at: string
          event_type: string
          id: string
          response_content: string
          status: string
          user_name: string
        }[]
      }
      get_recent_webhook_activity: {
        Args: { p_hours?: number; p_page_id: string }
        Returns: {
          auto_replied: boolean
          content: string
          created_at: string
          event_id: string
          event_type: string
          status: string
          user_name: string
        }[]
      }
      get_user_dashboard_stats: {
        Args: { p_user_id: string }
        Returns: {
          active_subscriptions: number
          total_credits: number
          total_events: number
          total_pages: number
          used_credits: number
          webhook_success_rate: number
        }[]
      }
      get_user_facebook_pages: {
        Args: { p_user_id: string }
        Returns: {
          category: string
          id: string
          is_active: boolean
          last_activity: string
          page_id: string
          page_name: string
          picture_url: string
          webhook_status: string
        }[]
      }
      get_user_subscription_status: {
        Args: { p_user_id: string }
        Returns: {
          has_active_subscription: boolean
          pages_count: number
          remaining_credits: number
          subscription_end: string
          total_credits: number
        }[]
      }
      manage_user_credits: {
        Args: { p_action: string; p_amount?: number; p_user_id: string }
        Returns: {
          message: string
          new_remaining: number
          new_total: number
          success: boolean
        }[]
      }
      reset_daily_credits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_webhook_status: {
        Args: { p_page_id: string; p_status: string }
        Returns: boolean
      }
      upsert_facebook_page: {
        Args: {
          p_access_token: string
          p_category?: string
          p_page_id: string
          p_page_name: string
          p_picture_url?: string
          p_user_id: string
        }
        Returns: string
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
