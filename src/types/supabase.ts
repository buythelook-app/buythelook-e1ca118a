
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      zara_cloth: {
        Row: {
          id: string;
          product_name: string;
          price: number;
          colour: string;
          description: string | null;
          image: string | null;
          availability: boolean;
          size: string[];
          materials: string[] | null;
          created_at: string;
          category_id: number | null;
          product_id: number | null;
          colour_code: number | null;
          care: Json | null;
          low_on_stock: boolean | null;
          you_may_also_like: Json | null;
          section: string | null;
          product_family: string | null;
          product_family_en: string | null;
          product_subfamily: string | null;
          materials_description: string | null;
          dimension: string | null;
          sku: string | null;
          url: string | null;
          currency: string | null;
        };
        Insert: {
          id?: string;
          product_name: string;
          price: number;
          colour: string;
          description?: string | null;
          image?: string | null;
          availability?: boolean;
          size: string[];
          materials?: string[] | null;
          created_at?: string;
          category_id?: number | null;
          product_id?: number | null;
          colour_code?: number | null;
          care?: Json | null;
          low_on_stock?: boolean | null;
          you_may_also_like?: Json | null;
          section?: string | null;
          product_family?: string | null;
          product_family_en?: string | null;
          product_subfamily?: string | null;
          materials_description?: string | null;
          dimension?: string | null;
          sku?: string | null;
          url?: string | null;
          currency?: string | null;
        };
        Update: {
          id?: string;
          product_name?: string;
          price?: number;
          colour?: string;
          description?: string | null;
          image?: string | null;
          availability?: boolean;
          size?: string[];
          materials?: string[] | null;
          created_at?: string;
          category_id?: number | null;
          product_id?: number | null;
          colour_code?: number | null;
          care?: Json | null;
          low_on_stock?: boolean | null;
          you_may_also_like?: Json | null;
          section?: string | null;
          product_family?: string | null;
          product_family_en?: string | null;
          product_subfamily?: string | null;
          materials_description?: string | null;
          dimension?: string | null;
          sku?: string | null;
          url?: string | null;
          currency?: string | null;
        };
        Relationships: [];
      };
      shoes: {
        Row: {
          name: string;
          brand: string | null;
          description: string | null;
          price: number | null;
          colour: string | null;
          image: Json | null;
          discount: string | null;
          category: string | null;
          availability: string | null;
          url: string | null;
          breadcrumbs: Json | null;
          buy_the_look: Json | null;
          possible_sizes: Json | null;
          you_might_also_like: Json | null;
          product_id: number | null;
          color: Json | null;
          about_me: string | null;
          look_after_me: string | null;
          product_details: string | null;
          size_fit: string | null;
          currency: string | null;
        };
        Insert: {
          name: string;
          brand?: string | null;
          description?: string | null;
          price?: number | null;
          colour?: string | null;
          image?: Json | null;
          discount?: string | null;
          category?: string | null;
          availability?: string | null;
          url?: string | null;
          breadcrumbs?: Json | null;
          buy_the_look?: Json | null;
          possible_sizes?: Json | null;
          you_might_also_like?: Json | null;
          product_id?: number | null;
          color?: Json | null;
          about_me?: string | null;
          look_after_me?: string | null;
          product_details?: string | null;
          size_fit?: string | null;
          currency?: string | null;
        };
        Update: {
          name?: string;
          brand?: string | null;
          description?: string | null;
          price?: number | null;
          colour?: string | null;
          image?: Json | null;
          discount?: string | null;
          category?: string | null;
          availability?: string | null;
          url?: string | null;
          breadcrumbs?: Json | null;
          buy_the_look?: Json | null;
          possible_sizes?: Json | null;
          you_might_also_like?: Json | null;
          product_id?: number | null;
          color?: Json | null;
          about_me?: string | null;
          look_after_me?: string | null;
          product_details?: string | null;
          size_fit?: string | null;
          currency?: string | null;
        };
        Relationships: [];
      };
      agent_runs: {
        Row: {
          id: string;
          agent_name: string;
          timestamp: string;
          user_id: string | null;
          result: Json;
          score: number;
          status: string;
        };
        Insert: {
          id?: string;
          agent_name: string;
          timestamp?: string;
          user_id?: string | null;
          result: Json;
          score: number;
          status?: string;
        };
        Update: {
          id?: string;
          agent_name?: string;
          timestamp?: string;
          user_id?: string | null;
          result?: Json;
          score?: number;
          status?: string;
        };
        Relationships: [];
      };
      agent_feedback: {
        Row: {
          id: string;
          agent_name: string;
          outfit_id: string;
          approved: boolean | null;
          feedback: string | null;
          user_liked: boolean | null;
          user_feedback: string | null;
          timestamp: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          agent_name: string;
          outfit_id: string;
          approved?: boolean | null;
          feedback?: string | null;
          user_liked?: boolean | null;
          user_feedback?: string | null;
          timestamp?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          agent_name?: string;
          outfit_id?: string;
          approved?: boolean | null;
          feedback?: string | null;
          user_liked?: boolean | null;
          user_feedback?: string | null;
          timestamp?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      outfit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          top_id: string;
          bottom_id: string;
          shoes_id: string;
          user_liked: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          top_id: string;
          bottom_id: string;
          shoes_id: string;
          user_liked?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          top_id?: string;
          bottom_id?: string;
          shoes_id?: string;
          user_liked?: boolean | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
