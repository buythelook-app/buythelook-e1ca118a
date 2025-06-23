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
      agent_runs: {
        Row: {
          agent_name: string
          id: string
          result: Json
          score: number
          status: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          agent_name: string
          id?: string
          result: Json
          score: number
          status?: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          agent_name?: string
          id?: string
          result?: Json
          score?: number
          status?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          item_id: string | null
          quantity: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_id?: string | null
          quantity?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string | null
          quantity?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          item_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favorites_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          price: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name: string
          price?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          price?: string | null
          type?: string | null
        }
        Relationships: []
      }
      outfit_logs: {
        Row: {
          bottom_id: string
          created_at: string
          id: string
          shoes_id: string
          top_id: string
          user_id: string | null
        }
        Insert: {
          bottom_id: string
          created_at?: string
          id?: string
          shoes_id: string
          top_id: string
          user_id?: string | null
        }
        Update: {
          bottom_id?: string
          created_at?: string
          id?: string
          shoes_id?: string
          top_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      recommendation_test_cases: {
        Row: {
          budget: number
          event: string
          id: number
          style: string
        }
        Insert: {
          budget: number
          event: string
          id?: number
          style: string
        }
        Update: {
          budget?: number
          event?: string
          id?: number
          style?: string
        }
        Relationships: []
      }
      shoes: {
        Row: {
          about_me: string | null
          availability: string | null
          brand: string | null
          breadcrumbs: Json | null
          buy_the_look: Json | null
          category: string | null
          color: Json | null
          currency: string | null
          description: string | null
          discount: string | null
          discovery_input: Json | null
          id: string
          image: Json | null
          input: Json | null
          look_after_me: string | null
          name: string
          possible_sizes: Json | null
          price: number | null
          product_details: string | null
          product_id: number | null
          size_fit: string | null
          url: string | null
          you_might_also_like: Json | null
        }
        Insert: {
          about_me?: string | null
          availability?: string | null
          brand?: string | null
          breadcrumbs?: Json | null
          buy_the_look?: Json | null
          category?: string | null
          color?: Json | null
          currency?: string | null
          description?: string | null
          discount?: string | null
          discovery_input?: Json | null
          id?: string
          image?: Json | null
          input?: Json | null
          look_after_me?: string | null
          name: string
          possible_sizes?: Json | null
          price?: number | null
          product_details?: string | null
          product_id?: number | null
          size_fit?: string | null
          url?: string | null
          you_might_also_like?: Json | null
        }
        Update: {
          about_me?: string | null
          availability?: string | null
          brand?: string | null
          breadcrumbs?: Json | null
          buy_the_look?: Json | null
          category?: string | null
          color?: Json | null
          currency?: string | null
          description?: string | null
          discount?: string | null
          discovery_input?: Json | null
          id?: string
          image?: Json | null
          input?: Json | null
          look_after_me?: string | null
          name?: string
          possible_sizes?: Json | null
          price?: number | null
          product_details?: string | null
          product_id?: number | null
          size_fit?: string | null
          url?: string | null
          you_might_also_like?: Json | null
        }
        Relationships: []
      }
      style_quiz_results: {
        Row: {
          body_shape: string | null
          chest: string | null
          color_preferences: string[] | null
          created_at: string
          gender: string | null
          height: string | null
          id: string
          photo_url: string | null
          style_preferences: string[] | null
          updated_at: string
          user_id: string | null
          waist: string | null
          weight: string | null
        }
        Insert: {
          body_shape?: string | null
          chest?: string | null
          color_preferences?: string[] | null
          created_at?: string
          gender?: string | null
          height?: string | null
          id?: string
          photo_url?: string | null
          style_preferences?: string[] | null
          updated_at?: string
          user_id?: string | null
          waist?: string | null
          weight?: string | null
        }
        Update: {
          body_shape?: string | null
          chest?: string | null
          color_preferences?: string[] | null
          created_at?: string
          gender?: string | null
          height?: string | null
          id?: string
          photo_url?: string | null
          style_preferences?: string[] | null
          updated_at?: string
          user_id?: string | null
          waist?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      zara_cloth: {
        Row: {
          availability: boolean | null
          care: Json | null
          category_id: number | null
          colour: string
          colour_code: number | null
          created_at: string
          currency: string | null
          description: string | null
          dimension: string | null
          id: string
          image: Json | null
          low_on_stock: boolean | null
          materials: Json[] | null
          materials_description: string | null
          price: number
          product_family: string | null
          product_family_en: string | null
          product_id: number | null
          product_name: string
          product_subfamily: string | null
          section: string | null
          size: string[]
          sku: string | null
          url: string | null
          you_may_also_like: Json | null
        }
        Insert: {
          availability?: boolean | null
          care?: Json | null
          category_id?: number | null
          colour: string
          colour_code?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          dimension?: string | null
          id?: string
          image?: Json | null
          low_on_stock?: boolean | null
          materials?: Json[] | null
          materials_description?: string | null
          price: number
          product_family?: string | null
          product_family_en?: string | null
          product_id?: number | null
          product_name: string
          product_subfamily?: string | null
          section?: string | null
          size: string[]
          sku?: string | null
          url?: string | null
          you_may_also_like?: Json | null
        }
        Update: {
          availability?: boolean | null
          care?: Json | null
          category_id?: number | null
          colour?: string
          colour_code?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          dimension?: string | null
          id?: string
          image?: Json | null
          low_on_stock?: boolean | null
          materials?: Json[] | null
          materials_description?: string | null
          price?: number
          product_family?: string | null
          product_family_en?: string | null
          product_id?: number | null
          product_name?: string
          product_subfamily?: string | null
          section?: string | null
          size?: string[]
          sku?: string | null
          url?: string | null
          you_may_also_like?: Json | null
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
