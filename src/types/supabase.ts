
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
