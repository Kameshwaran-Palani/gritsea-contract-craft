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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ai_logs: {
        Row: {
          created_at: string
          id: string
          prompt: string
          response: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt: string
          response: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string
          response?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_snapshots: {
        Row: {
          contract_id: string
          created_at: string
          created_by: string | null
          id: string
          snapshot_data: Json
          version_number: number
        }
        Insert: {
          contract_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          snapshot_data: Json
          version_number?: number
        }
        Update: {
          contract_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          snapshot_data?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_snapshots_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_snapshots_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          clauses_json: Json | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          client_signature_url: string | null
          contract_amount: number | null
          created_at: string
          id: string
          ip_address: string | null
          is_locked: boolean | null
          locked_at: string | null
          payment_terms: string | null
          pdf_url: string | null
          project_timeline: string | null
          public_link_id: string | null
          scope_of_work: string | null
          signature_url: string | null
          signed_at: string | null
          signed_by_name: string | null
          status: Database["public"]["Enums"]["contract_status"] | null
          title: string
          updated_at: string
          user_id: string
          verification_email_required: boolean | null
          verification_phone_required: boolean | null
        }
        Insert: {
          clauses_json?: Json | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          client_signature_url?: string | null
          contract_amount?: number | null
          created_at?: string
          id?: string
          ip_address?: string | null
          is_locked?: boolean | null
          locked_at?: string | null
          payment_terms?: string | null
          pdf_url?: string | null
          project_timeline?: string | null
          public_link_id?: string | null
          scope_of_work?: string | null
          signature_url?: string | null
          signed_at?: string | null
          signed_by_name?: string | null
          status?: Database["public"]["Enums"]["contract_status"] | null
          title: string
          updated_at?: string
          user_id: string
          verification_email_required?: boolean | null
          verification_phone_required?: boolean | null
        }
        Update: {
          clauses_json?: Json | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          client_signature_url?: string | null
          contract_amount?: number | null
          created_at?: string
          id?: string
          ip_address?: string | null
          is_locked?: boolean | null
          locked_at?: string | null
          payment_terms?: string | null
          pdf_url?: string | null
          project_timeline?: string | null
          public_link_id?: string | null
          scope_of_work?: string | null
          signature_url?: string | null
          signed_at?: string | null
          signed_by_name?: string | null
          status?: Database["public"]["Enums"]["contract_status"] | null
          title?: string
          updated_at?: string
          user_id?: string
          verification_email_required?: boolean | null
          verification_phone_required?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          plan: Database["public"]["Enums"]["user_plan"] | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          plan?: Database["public"]["Enums"]["user_plan"] | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          plan?: Database["public"]["Enums"]["user_plan"] | null
          updated_at?: string
        }
        Relationships: []
      }
      revision_requests: {
        Row: {
          client_email: string | null
          client_name: string
          contract_id: string
          created_at: string
          id: string
          message: string
          resolved: boolean | null
        }
        Insert: {
          client_email?: string | null
          client_name: string
          contract_id: string
          created_at?: string
          id?: string
          message: string
          resolved?: boolean | null
        }
        Update: {
          client_email?: string | null
          client_name?: string
          contract_id?: string
          created_at?: string
          id?: string
          message?: string
          resolved?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "revision_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      signatures: {
        Row: {
          client_verified_email: string | null
          client_verified_name: string | null
          client_verified_phone: string | null
          contract_id: string
          id: string
          ip_address: string | null
          signature_image_url: string
          signed_at: string
          signer_email: string | null
          signer_name: string
          signer_type: Database["public"]["Enums"]["signer_type"]
        }
        Insert: {
          client_verified_email?: string | null
          client_verified_name?: string | null
          client_verified_phone?: string | null
          contract_id: string
          id?: string
          ip_address?: string | null
          signature_image_url: string
          signed_at?: string
          signer_email?: string | null
          signer_name: string
          signer_type: Database["public"]["Enums"]["signer_type"]
        }
        Update: {
          client_verified_email?: string | null
          client_verified_name?: string | null
          client_verified_phone?: string | null
          contract_id?: string
          id?: string
          ip_address?: string | null
          signature_image_url?: string
          signed_at?: string
          signer_email?: string | null
          signer_name?: string
          signer_type?: Database["public"]["Enums"]["signer_type"]
        }
        Relationships: [
          {
            foreignKeyName: "signatures_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
          id: string
          plan_name: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_name: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_name?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_document_signatures: {
        Row: {
          client_verified_email: string | null
          client_verified_name: string | null
          client_verified_phone: string | null
          document_id: string
          id: string
          ip_address: string | null
          signature_image_url: string
          signed_at: string
          signer_email: string | null
          signer_name: string
          signer_type: string
        }
        Insert: {
          client_verified_email?: string | null
          client_verified_name?: string | null
          client_verified_phone?: string | null
          document_id: string
          id?: string
          ip_address?: string | null
          signature_image_url: string
          signed_at?: string
          signer_email?: string | null
          signer_name: string
          signer_type: string
        }
        Update: {
          client_verified_email?: string | null
          client_verified_name?: string | null
          client_verified_phone?: string | null
          document_id?: string
          id?: string
          ip_address?: string | null
          signature_image_url?: string
          signed_at?: string
          signer_email?: string | null
          signer_name?: string
          signer_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_document_signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "uploaded_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_documents: {
        Row: {
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          original_filename: string
          public_link_id: string | null
          signature_positions: Json | null
          signed_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          verification_email_required: boolean | null
          verification_phone_required: boolean | null
        }
        Insert: {
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          original_filename: string
          public_link_id?: string | null
          signature_positions?: Json | null
          signed_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          verification_email_required?: boolean | null
          verification_phone_required?: boolean | null
        }
        Update: {
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          original_filename?: string
          public_link_id?: string | null
          signature_positions?: Json | null
          signed_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          verification_email_required?: boolean | null
          verification_phone_required?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      contract_status:
        | "draft"
        | "sent"
        | "signed"
        | "cancelled"
        | "sent_for_signature"
        | "revision_requested"
      signer_type: "freelancer" | "client"
      subscription_status: "active" | "cancelled" | "expired" | "pending"
      user_plan: "free" | "pro" | "agency"
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
    Enums: {
      contract_status: [
        "draft",
        "sent",
        "signed",
        "cancelled",
        "sent_for_signature",
        "revision_requested",
      ],
      signer_type: ["freelancer", "client"],
      subscription_status: ["active", "cancelled", "expired", "pending"],
      user_plan: ["free", "pro", "agency"],
    },
  },
} as const
