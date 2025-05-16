
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
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
