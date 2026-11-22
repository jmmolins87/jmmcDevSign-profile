
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {

  "public": {
          Tables: {
            "cover_assets": {
                  Row: {
                    "alt": string,"id": string,"label": string,"src": string
                  }
                  ComputedFields: never
                  Insert: {
                    "alt": string,"id": string,"label": string,"src": string
                  }
                  Update: {
                    "alt"?: string,"id"?: string,"label"?: string,"src"?: string
                  }
                  Relationships: [

                  ]
                },"memberships": {
                  Row: {
                    "activated_at": string | null,"activated_by": string | null,"created_at": string,"role": Database["public"]['Enums']["membership_role"],"status": Database["public"]['Enums']["membership_status"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "activated_at"?: string | null,"activated_by"?: string | null,"created_at"?: string,"role": Database["public"]['Enums']["membership_role"],"status": Database["public"]['Enums']["membership_status"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "activated_at"?: string | null,"activated_by"?: string | null,"created_at"?: string,"role"?: Database["public"]['Enums']["membership_role"],"status"?: Database["public"]['Enums']["membership_status"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [

                  ]
                },"post_revisions": {
                  Row: {
                    "author_id": string | null,"cover_asset_id": string | null,"created_at": string,"id": string,"post_id": string,"snapshot": NonNullable<Json>,"stage": Database["public"]['Enums']["revision_stage"],"version": number
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id"?: string | null,"cover_asset_id"?: string | null,"created_at"?: string,"id"?: string,"post_id": string,"snapshot": NonNullable<Json>,"stage"?: Database["public"]['Enums']["revision_stage"],"version": number
                  }
                  Update: {
                    "author_id"?: string | null,"cover_asset_id"?: string | null,"created_at"?: string,"id"?: string,"post_id"?: string,"snapshot"?: NonNullable<Json>,"stage"?: Database["public"]['Enums']["revision_stage"],"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "post_revisions_cover_asset_id_fkey"
      columns: ["cover_asset_id"]
isOneToOne: false
      referencedRelation: "cover_assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "post_revisions_post_id_fkey"
      columns: ["post_id"]
isOneToOne: false
      referencedRelation: "posts"
      referencedColumns: ["id"]
    }
                  ]
                },"posts": {
                  Row: {
                    "created_at": string,"created_by": string | null,"deleted_at": string | null,"id": string,"published_at": string | null,"published_revision_id": string | null,"published_via_schedule": boolean,"scheduled_at": string | null,"scheduled_revision_id": string | null,"slug": string | null,"updated_at": string,"version": number,"working_revision_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"deleted_at"?: string | null,"id"?: string,"published_at"?: string | null,"published_revision_id"?: string | null,"published_via_schedule"?: boolean,"scheduled_at"?: string | null,"scheduled_revision_id"?: string | null,"slug"?: string | null,"updated_at"?: string,"version"?: number,"working_revision_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"deleted_at"?: string | null,"id"?: string,"published_at"?: string | null,"published_revision_id"?: string | null,"published_via_schedule"?: boolean,"scheduled_at"?: string | null,"scheduled_revision_id"?: string | null,"slug"?: string | null,"updated_at"?: string,"version"?: number,"working_revision_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "posts_id_published_revision_id_fkey"
      columns: ["id","published_revision_id"]
isOneToOne: false
      referencedRelation: "post_revisions"
      referencedColumns: ["post_id","id"]
    },{
      foreignKeyName: "posts_id_scheduled_revision_id_fkey"
      columns: ["id","scheduled_revision_id"]
isOneToOne: false
      referencedRelation: "post_revisions"
      referencedColumns: ["post_id","id"]
    },{
      foreignKeyName: "posts_id_working_revision_id_fkey"
      columns: ["id","working_revision_id"]
isOneToOne: false
      referencedRelation: "post_revisions"
      referencedColumns: ["post_id","id"]
    }
                  ]
                },"registration_requests": {
                  Row: {
                    "assigned_role": Database["public"]['Enums']["membership_role"] | null,"created_at": string,"decided_at": string | null,"decided_by": string | null,"email": string,"full_name": string,"id": string,"locale": string,"requested_role": Database["public"]['Enums']["membership_role"],"status": Database["public"]['Enums']["registration_status"],"updated_at": string,"user_id": string,"version": number
                  }
                  ComputedFields: never
                  Insert: {
                    "assigned_role"?: Database["public"]['Enums']["membership_role"] | null,"created_at"?: string,"decided_at"?: string | null,"decided_by"?: string | null,"email": string,"full_name": string,"id"?: string,"locale": string,"requested_role": Database["public"]['Enums']["membership_role"],"status"?: Database["public"]['Enums']["registration_status"],"updated_at"?: string,"user_id": string,"version"?: number
                  }
                  Update: {
                    "assigned_role"?: Database["public"]['Enums']["membership_role"] | null,"created_at"?: string,"decided_at"?: string | null,"decided_by"?: string | null,"email"?: string,"full_name"?: string,"id"?: string,"locale"?: string,"requested_role"?: Database["public"]['Enums']["membership_role"],"status"?: Database["public"]['Enums']["registration_status"],"updated_at"?: string,"user_id"?: string,"version"?: number
                  }
                  Relationships: [

                  ]
                }
          }
          Views: {
            "published_posts": {
                  Row: {
                    "post": Json | null,"slug": string | null
                  }
                  ComputedFields: never
                  Relationships: [

                  ]
                }
          }
          Functions: {
            "admin_verification_delivery_statuses":
{ Args: Record<PropertyKey, never>; Returns: {
              "request_id": string,"status": string
            }[]
                           },
"cancel_post_schedule":
{ Args: { "p_expected_version": number,"p_post_id": string }; Returns: Json
                           },
"claim_email_deliveries":
{ Args: { "p_limit": number }; Returns: {
              "applicant_email": string,"attempts": number,"encrypted_payload": string,"full_name": string,"id": string,"idempotency_key": string,"lease_id": string,"locale": string,"recipient": string,"request_id": string,"requested_role": string,"template": string,"user_id": string
            }[]
                           },
"complete_email_delivery":
{ Args: { "p_error": string,"p_id": string,"p_lease_id": string,"p_result": string }; Returns: undefined
                           },
"create_registration_request":
{ Args: { "p_full_name": string,"p_locale": string,"p_requested_role": string }; Returns: string
                           },
"decide_registration_request":
{ Args: { "p_actor_id": string,"p_assigned_role": string,"p_decision": string,"p_digest": string,"p_encrypted_code": string,"p_request_id": string }; Returns: string
                           },
"editorial_posts":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"publish_post":
{ Args: { "p_expected_version": number,"p_post_id": string,"p_scheduled_at"?: string,"p_snapshot"?: Json }; Returns: Json
                           },
"record_denied_registration_decision":
{ Args: { "p_actor_id"?: string,"p_result": string }; Returns: undefined
                           },
"registration_email_status":
{ Args: { "p_request_id": string }; Returns: string
                           },
"remove_post":
{ Args: { "p_expected_version": number,"p_post_id": string }; Returns: undefined
                           },
"resend_verification_code":
{ Args: { "p_actor_id": string,"p_digest": string,"p_encrypted_code": string }; Returns: string
                           },
"save_post":
{ Args: { "p_expected_version"?: number,"p_post_id"?: string,"p_snapshot"?: Json }; Returns: Json
                           },
"verify_registration_code":
{ Args: { "p_digest": string }; Returns: string
                           }
          }
          Enums: {
            "membership_role": "admin"|"editor"|"revisor","membership_status": "pending"|"active"|"rejected","registration_status": "pending"|"approved"|"rejected","revision_stage": "draft"|"review"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "membership_role": ["admin", "editor", "revisor"],"membership_status": ["pending", "active", "rejected"],"registration_status": ["pending", "approved", "rejected"],"revision_stage": ["draft", "review"]
          }
        }
} as const
