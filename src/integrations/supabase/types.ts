export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          audio_url: string | null
          id: string
          is_deleted: boolean | null
          message_text: string | null
          message_type: string | null
          reactions: Json | null
          room_id: string | null
          sender_id: string | null
          sent_at: string
        }
        Insert: {
          audio_url?: string | null
          id?: string
          is_deleted?: boolean | null
          message_text?: string | null
          message_type?: string | null
          reactions?: Json | null
          room_id?: string | null
          sender_id?: string | null
          sent_at?: string
        }
        Update: {
          audio_url?: string | null
          id?: string
          is_deleted?: boolean | null
          message_text?: string | null
          message_type?: string | null
          reactions?: Json | null
          room_id?: string | null
          sender_id?: string | null
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          is_active: boolean | null
          room_type: string
          target_gender: string | null
          user1_id: string | null
          user2_id: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          room_type?: string
          target_gender?: string | null
          user1_id?: string | null
          user2_id?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          room_type?: string
          target_gender?: string | null
          user1_id?: string | null
          user2_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          confession_id: string
          content: string
          created_at: string
          id: string
          is_deleted: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confession_id: string
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confession_id?: string
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      confessions: {
        Row: {
          audio_quality: string | null
          audio_url: string | null
          category: string
          confession_type: string
          content: string | null
          created_at: string
          id: string
          is_boosted: boolean | null
          is_deleted: boolean | null
          reactions: Json | null
          recording_duration: number | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          audio_quality?: string | null
          audio_url?: string | null
          category: string
          confession_type: string
          content?: string | null
          created_at?: string
          id?: string
          is_boosted?: boolean | null
          is_deleted?: boolean | null
          reactions?: Json | null
          recording_duration?: number | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          audio_quality?: string | null
          audio_url?: string | null
          category?: string
          confession_type?: string
          content?: string | null
          created_at?: string
          id?: string
          is_boosted?: boolean | null
          is_deleted?: boolean | null
          reactions?: Json | null
          recording_duration?: number | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      content_moderation: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          moderated_at: string | null
          moderator_id: string | null
          reason: string
          reported_by: string | null
          status: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          moderated_at?: string | null
          moderator_id?: string | null
          reason: string
          reported_by?: string | null
          status?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          moderated_at?: string | null
          moderator_id?: string | null
          reason?: string
          reported_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      login_logs: {
        Row: {
          id: string
          ip_address: string | null
          login_success: boolean
          timestamp: string
          user_id: string | null
          username_attempted: string | null
        }
        Insert: {
          id?: string
          ip_address?: string | null
          login_success: boolean
          timestamp?: string
          user_id?: string | null
          username_attempted?: string | null
        }
        Update: {
          id?: string
          ip_address?: string | null
          login_success?: boolean
          timestamp?: string
          user_id?: string | null
          username_attempted?: string | null
        }
        Relationships: []
      }
      privacy_policies: {
        Row: {
          content: string
          created_at: string
          effective_date: string
          id: string
          version: string
        }
        Insert: {
          content: string
          created_at?: string
          effective_date?: string
          id?: string
          version: string
        }
        Update: {
          content?: string
          created_at?: string
          effective_date?: string
          id?: string
          version?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          expires_at: string
          id: string
          payment_id: string | null
          payment_method: string
          plan_type: string
          starts_at: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          expires_at: string
          id?: string
          payment_id?: string | null
          payment_method: string
          plan_type: string
          starts_at?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          expires_at?: string
          id?: string
          payment_id?: string | null
          payment_method?: string
          plan_type?: string
          starts_at?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_comment_reactions: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_privacy_acceptance: {
        Row: {
          accepted_at: string
          id: string
          ip_address: string | null
          policy_version: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          ip_address?: string | null
          policy_version: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          id?: string
          ip_address?: string | null
          policy_version?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reactions: {
        Row: {
          confession_id: string
          created_at: string
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          confession_id: string
          created_at?: string
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          confession_id?: string
          created_at?: string
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          audio_quality: string | null
          avatar_url: string | null
          country: string | null
          created_at: string
          email: string | null
          gender: string | null
          id: string
          is_admin: boolean | null
          is_online: boolean | null
          is_verified: boolean | null
          language_preference: string | null
          last_seen: string | null
          playback_speed: number | null
          privacy_mode: boolean | null
          push_notifications_enabled: boolean | null
          recording_duration: number | null
          subscription_expires_at: string | null
          subscription_type: string | null
          theme_preference: string | null
          updated_at: string
          username: string | null
          username_color: string | null
        }
        Insert: {
          audio_quality?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id?: string
          is_admin?: boolean | null
          is_online?: boolean | null
          is_verified?: boolean | null
          language_preference?: string | null
          last_seen?: string | null
          playback_speed?: number | null
          privacy_mode?: boolean | null
          push_notifications_enabled?: boolean | null
          recording_duration?: number | null
          subscription_expires_at?: string | null
          subscription_type?: string | null
          theme_preference?: string | null
          updated_at?: string
          username?: string | null
          username_color?: string | null
        }
        Update: {
          audio_quality?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id?: string
          is_admin?: boolean | null
          is_online?: boolean | null
          is_verified?: boolean | null
          language_preference?: string | null
          last_seen?: string | null
          playback_speed?: number | null
          privacy_mode?: boolean | null
          push_notifications_enabled?: boolean | null
          recording_duration?: number | null
          subscription_expires_at?: string | null
          subscription_type?: string | null
          theme_preference?: string | null
          updated_at?: string
          username?: string | null
          username_color?: string | null
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          id: string
          status: string | null
          submitted_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          status?: string | null
          submitted_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          status?: string | null
          submitted_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      Ysusu: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_inactive_chat_rooms: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_chat_messages: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      has_active_subscription: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      log_login_attempt: {
        Args: {
          p_user_id: string
          p_username: string
          p_success: boolean
          p_ip_address?: string
        }
        Returns: undefined
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
