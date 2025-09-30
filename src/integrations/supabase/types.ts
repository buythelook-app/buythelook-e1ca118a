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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      affiliate_clicks: {
        Row: {
          click_type: string | null
          created_at: string | null
          id: string
          item_id: string
          retailer: string
          user_id: string
        }
        Insert: {
          click_type?: string | null
          created_at?: string | null
          id?: string
          item_id: string
          retailer: string
          user_id: string
        }
        Update: {
          click_type?: string | null
          created_at?: string | null
          id?: string
          item_id?: string
          retailer?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_runs: {
        Row: {
          agent_name: string
          body_type: string | null
          id: string
          result: Json
          score: number
          status: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          agent_name: string
          body_type?: string | null
          id?: string
          result: Json
          score: number
          status?: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          agent_name?: string
          body_type?: string | null
          id?: string
          result?: Json
          score?: number
          status?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event: string
          id: string
          properties: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event: string
          id?: string
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event?: string
          id?: string
          properties?: Json | null
          session_id?: string | null
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
      catalog_items: {
        Row: {
          available: boolean | null
          brand: string | null
          category: string | null
          color: string | null
          created_at: string
          currency: string | null
          gender: string | null
          id: string
          images: Json | null
          materials: string | null
          price: number | null
          sizes: Json | null
          source: string
          source_product_id: string
          title: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          available?: boolean | null
          brand?: string | null
          category?: string | null
          color?: string | null
          created_at?: string
          currency?: string | null
          gender?: string | null
          id?: string
          images?: Json | null
          materials?: string | null
          price?: number | null
          sizes?: Json | null
          source: string
          source_product_id: string
          title?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          available?: boolean | null
          brand?: string | null
          category?: string | null
          color?: string | null
          created_at?: string
          currency?: string | null
          gender?: string | null
          id?: string
          images?: Json | null
          materials?: string | null
          price?: number | null
          sizes?: Json | null
          source?: string
          source_product_id?: string
          title?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      click_events: {
        Row: {
          category: string
          created_at: string
          id: string
          item_id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          item_id: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          item_id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
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
      manual_outfit_ratings: {
        Row: {
          body_shape_fit: number | null
          color_coordination: number | null
          created_at: string | null
          creativity: number | null
          feedback_notes: string | null
          id: string
          improvements: string | null
          like_dislike: boolean | null
          must_include_met: string[] | null
          occasion_match: number | null
          outfit_index: number
          overall_rating: number | null
          run_timestamp: string
          should_avoid_violated: string[] | null
          style_alignment: number | null
          test_case_name: string
          updated_at: string | null
          user_id: string | null
          value_for_money: number | null
          what_missing: string | null
          what_works: string | null
        }
        Insert: {
          body_shape_fit?: number | null
          color_coordination?: number | null
          created_at?: string | null
          creativity?: number | null
          feedback_notes?: string | null
          id?: string
          improvements?: string | null
          like_dislike?: boolean | null
          must_include_met?: string[] | null
          occasion_match?: number | null
          outfit_index: number
          overall_rating?: number | null
          run_timestamp: string
          should_avoid_violated?: string[] | null
          style_alignment?: number | null
          test_case_name: string
          updated_at?: string | null
          user_id?: string | null
          value_for_money?: number | null
          what_missing?: string | null
          what_works?: string | null
        }
        Update: {
          body_shape_fit?: number | null
          color_coordination?: number | null
          created_at?: string | null
          creativity?: number | null
          feedback_notes?: string | null
          id?: string
          improvements?: string | null
          like_dislike?: boolean | null
          must_include_met?: string[] | null
          occasion_match?: number | null
          outfit_index?: number
          overall_rating?: number | null
          run_timestamp?: string
          should_avoid_violated?: string[] | null
          style_alignment?: number | null
          test_case_name?: string
          updated_at?: string | null
          user_id?: string | null
          value_for_money?: number | null
          what_missing?: string | null
          what_works?: string | null
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
      product_cache: {
        Row: {
          cache_key: string
          created_at: string | null
          expires_at: string | null
          id: string
          product_data: Json
          product_id: string
          retailer: string
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          product_data: Json
          product_id: string
          retailer: string
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          product_data?: Json
          product_id?: string
          retailer?: string
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
      user_feedback: {
        Row: {
          agent_notes: string | null
          created_at: string
          feedback_text: string | null
          feedback_type: string | null
          id: number
          outfit_id: string | null
          used_for_training: boolean | null
          user_id: string | null
        }
        Insert: {
          agent_notes?: string | null
          created_at?: string
          feedback_text?: string | null
          feedback_type?: string | null
          id?: number
          outfit_id?: string | null
          used_for_training?: boolean | null
          user_id?: string | null
        }
        Update: {
          agent_notes?: string | null
          created_at?: string
          feedback_text?: string | null
          feedback_type?: string | null
          id?: number
          outfit_id?: string | null
          used_for_training?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_interactions: {
        Row: {
          created_at: string | null
          feedback: Json | null
          id: string
          interaction_type: string
          item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feedback?: Json | null
          id?: string
          interaction_type: string
          item_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          feedback?: Json | null
          id?: string
          interaction_type?: string
          item_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          body_type: string | null
          brand_preferences: string[] | null
          color_preferences: string[] | null
          consent_settings: Json | null
          created_at: string | null
          email: string | null
          id: string
          interaction_history: Json | null
          price_sensitivity: number | null
          push_token: string | null
          size_preferences: Json | null
          style_vector: number[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body_type?: string | null
          brand_preferences?: string[] | null
          color_preferences?: string[] | null
          consent_settings?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          interaction_history?: Json | null
          price_sensitivity?: number | null
          push_token?: string | null
          size_preferences?: Json | null
          style_vector?: number[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body_type?: string | null
          brand_preferences?: string[] | null
          color_preferences?: string[] | null
          consent_settings?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          interaction_history?: Json | null
          price_sensitivity?: number | null
          push_token?: string | null
          size_preferences?: Json | null
          style_vector?: number[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      validation_dataset: {
        Row: {
          actual_output: Json | null
          agent_version: string | null
          created_at: string | null
          expected_criteria: Json
          id: string
          input_data: Json
          metrics: Json | null
          run_timestamp: string | null
          test_case_name: string
          updated_at: string | null
        }
        Insert: {
          actual_output?: Json | null
          agent_version?: string | null
          created_at?: string | null
          expected_criteria: Json
          id?: string
          input_data: Json
          metrics?: Json | null
          run_timestamp?: string | null
          test_case_name: string
          updated_at?: string | null
        }
        Update: {
          actual_output?: Json | null
          agent_version?: string | null
          created_at?: string | null
          expected_criteria?: Json
          id?: string
          input_data?: Json
          metrics?: Json | null
          run_timestamp?: string | null
          test_case_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      zara_cloth: {
        Row: {
          availability: boolean | null
          brand: string | null
          care: Json | null
          care_info: string | null
          category: string | null
          category_id: number | null
          category_path: string | null
          color: string | null
          colour: string
          colour_code: number | null
          created_at: string
          currency: string | null
          description: string | null
          dimension: string | null
          id: string
          image: Json | null
          images: Json | null
          low_on_stock: boolean | null
          materials: Json[] | null
          materials_description: string | null
          price: number
          product_family: string | null
          product_family_en: string | null
          product_id: number | null
          product_name: string
          product_subfamily: string | null
          product_url: string | null
          scrape_type: string | null
          scraped_category: string | null
          section: string | null
          size: string[]
          sku: string | null
          stock_status: string | null
          updated_at: string | null
          url: string | null
          you_may_also_like: Json | null
        }
        Insert: {
          availability?: boolean | null
          brand?: string | null
          care?: Json | null
          care_info?: string | null
          category?: string | null
          category_id?: number | null
          category_path?: string | null
          color?: string | null
          colour: string
          colour_code?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          dimension?: string | null
          id?: string
          image?: Json | null
          images?: Json | null
          low_on_stock?: boolean | null
          materials?: Json[] | null
          materials_description?: string | null
          price: number
          product_family?: string | null
          product_family_en?: string | null
          product_id?: number | null
          product_name: string
          product_subfamily?: string | null
          product_url?: string | null
          scrape_type?: string | null
          scraped_category?: string | null
          section?: string | null
          size: string[]
          sku?: string | null
          stock_status?: string | null
          updated_at?: string | null
          url?: string | null
          you_may_also_like?: Json | null
        }
        Update: {
          availability?: boolean | null
          brand?: string | null
          care?: Json | null
          care_info?: string | null
          category?: string | null
          category_id?: number | null
          category_path?: string | null
          color?: string | null
          colour?: string
          colour_code?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          dimension?: string | null
          id?: string
          image?: Json | null
          images?: Json | null
          low_on_stock?: boolean | null
          materials?: Json[] | null
          materials_description?: string | null
          price?: number
          product_family?: string | null
          product_family_en?: string | null
          product_id?: number | null
          product_name?: string
          product_subfamily?: string | null
          product_url?: string | null
          scrape_type?: string | null
          scraped_category?: string | null
          section?: string | null
          size?: string[]
          sku?: string | null
          stock_status?: string | null
          updated_at?: string | null
          url?: string | null
          you_may_also_like?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      products: {
        Row: {
          brand: string | null
          care_info: string | null
          category: string | null
          category_path: string | null
          color: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string | null
          images: Json | null
          materials: Json[] | null
          name: string | null
          price: number | null
          product_url: string | null
          scrape_type: string | null
          scraped_category: string | null
          size: string[] | null
          stock_status: string | null
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          care_info?: never
          category?: string | null
          category_path?: string | null
          color?: never
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string | null
          images?: never
          materials?: Json[] | null
          name?: string | null
          price?: number | null
          product_url?: never
          scrape_type?: string | null
          scraped_category?: string | null
          size?: string[] | null
          stock_status?: string | null
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          care_info?: never
          category?: string | null
          category_path?: string | null
          color?: never
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string | null
          images?: never
          materials?: Json[] | null
          name?: string | null
          price?: number | null
          product_url?: never
          scrape_type?: string | null
          scraped_category?: string | null
          size?: string[] | null
          stock_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      zara_cloth_view: {
        Row: {
          availability: boolean | null
          care: Json | null
          category_id: number | null
          colour: string | null
          colour_code: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          dimension: string | null
          id: string | null
          image: string | null
          low_on_stock: boolean | null
          materials: string[] | null
          materials_description: string | null
          price: number | null
          product_family: string | null
          product_family_en: string | null
          product_id: number | null
          product_name: string | null
          product_subfamily: string | null
          section: string | null
          size: string[] | null
          sku: string | null
          url: string | null
          you_may_also_like: Json | null
        }
        Insert: {
          availability?: never
          care?: never
          category_id?: never
          colour?: never
          colour_code?: never
          created_at?: string | null
          currency?: string | null
          description?: never
          dimension?: never
          id?: string | null
          image?: never
          low_on_stock?: never
          materials?: never
          materials_description?: never
          price?: never
          product_family?: never
          product_family_en?: never
          product_id?: never
          product_name?: never
          product_subfamily?: never
          section?: never
          size?: never
          sku?: never
          url?: string | null
          you_may_also_like?: never
        }
        Update: {
          availability?: never
          care?: never
          category_id?: never
          colour?: never
          colour_code?: never
          created_at?: string | null
          currency?: string | null
          description?: never
          dimension?: never
          id?: string | null
          image?: never
          low_on_stock?: never
          materials?: never
          materials_description?: never
          price?: never
          product_family?: never
          product_family_en?: never
          product_id?: never
          product_name?: never
          product_subfamily?: never
          section?: never
          size?: never
          sku?: never
          url?: string | null
          you_may_also_like?: never
        }
        Relationships: []
      }
    }
    Functions: {
      upsert_zara_product: {
        Args: {
          _brand: string
          _category: string
          _category_path: string
          _color: string
          _currency: string
          _description: string
          _id: string
          _images: Json
          _materials: string
          _price: number
          _product_name: string
          _product_url: string
          _scrape_type: string
          _scraped_category: string
          _size: string[]
          _stock_status: string
        }
        Returns: undefined
      }
      upsert_zara_product_correct: {
        Args: {
          p_availability?: boolean
          p_brand?: string
          p_care?: Json
          p_care_info?: string
          p_category?: string
          p_category_id?: number
          p_category_path?: string
          p_color?: string
          p_colour?: string
          p_colour_code?: number
          p_currency?: string
          p_description?: string
          p_dimension?: string
          p_id?: string
          p_image?: Json
          p_images?: Json
          p_low_on_stock?: boolean
          p_materials?: Json[]
          p_materials_description?: string
          p_price?: number
          p_product_family?: string
          p_product_family_en?: string
          p_product_id?: number
          p_product_name?: string
          p_product_subfamily?: string
          p_product_url?: string
          p_scrape_type?: string
          p_scraped_category?: string
          p_section?: string
          p_size?: string[]
          p_sku?: string
          p_stock_status?: string
          p_url?: string
          p_you_may_also_like?: Json
        }
        Returns: string
      }
      upsert_zara_product_final: {
        Args: {
          p_availability?: boolean
          p_brand?: string
          p_care?: Json
          p_care_info?: string
          p_category?: string
          p_category_id?: number
          p_category_path?: string
          p_color?: string
          p_colour?: string
          p_colour_code?: number
          p_currency?: string
          p_description?: string
          p_dimension?: string
          p_id?: string
          p_image?: Json
          p_images?: Json
          p_low_on_stock?: boolean
          p_materials?: Json[]
          p_materials_description?: string
          p_price?: number
          p_product_family?: string
          p_product_family_en?: string
          p_product_id?: number
          p_product_name?: string
          p_product_subfamily?: string
          p_product_url?: string
          p_scrape_type?: string
          p_scraped_category?: string
          p_section?: string
          p_size?: string[]
          p_sku?: string
          p_stock_status?: string
          p_url?: string
          p_you_may_also_like?: Json
        }
        Returns: string
      }
      upsert_zara_product_text: {
        Args: {
          _brand: string
          _category: string
          _category_path: string
          _color: string
          _currency: string
          _description: string
          _id: string
          _images: Json
          _materials: string
          _price: number
          _product_name: string
          _product_url: string
          _scrape_type: string
          _scraped_category: string
          _size: string[]
          _stock_status: string
        }
        Returns: undefined
      }
      upsert_zara_product_v2: {
        Args: {
          _brand: string
          _category: string
          _category_path: string
          _color: string
          _currency: string
          _description: string
          _id: string
          _images: Json
          _materials_arr: string[]
          _materials_str: string
          _price: number
          _product_name: string
          _product_url: string
          _scrape_type: string
          _scraped_category: string
          _size: string[]
          _stock_status: string
        }
        Returns: undefined
      }
      upsert_zara_product_v3: {
        Args: {
          _brand: string
          _category: string
          _category_path: string
          _color: string
          _currency: string
          _description: string
          _id: string
          _images: Json
          _materials: string[]
          _price: number
          _product_name: string
          _product_url: string
          _scrape_type: string
          _scraped_category: string
          _size: string[]
          _stock_status: string
        }
        Returns: undefined
      }
      upsert_zara_product_v4: {
        Args: {
          p_availability?: boolean
          p_brand?: string
          p_care?: Json
          p_care_info?: string
          p_category?: string
          p_category_id?: number
          p_category_path?: string
          p_color?: string
          p_colour?: string
          p_colour_code?: number
          p_currency?: string
          p_description?: string
          p_dimension?: string
          p_id?: string
          p_image?: string
          p_images?: Json
          p_low_on_stock?: boolean
          p_materials?: Json
          p_materials_description?: string
          p_price?: number
          p_product_family?: string
          p_product_family_en?: string
          p_product_id?: number
          p_product_name?: string
          p_product_subfamily?: string
          p_product_url?: string
          p_scrape_type?: string
          p_scraped_category?: string
          p_section?: string
          p_size?: string
          p_sku?: string
          p_stock_status?: string
          p_url?: string
          p_you_may_also_like?: Json
        }
        Returns: undefined
      }
      upsert_zara_product_v6: {
        Args: {
          p_availability?: boolean
          p_brand?: string
          p_care?: Json
          p_care_info?: string
          p_category?: string
          p_category_id?: number
          p_category_path?: string
          p_color?: string
          p_colour?: string
          p_colour_code?: number
          p_currency?: string
          p_description?: string
          p_dimension?: string
          p_id?: string
          p_image?: Json
          p_images?: Json
          p_low_on_stock?: boolean
          p_materials?: Json[]
          p_materials_description?: string
          p_price?: number
          p_product_family?: string
          p_product_family_en?: string
          p_product_id?: number
          p_product_name?: string
          p_product_subfamily?: string
          p_product_url?: string
          p_scrape_type?: string
          p_scraped_category?: string
          p_section?: string
          p_size?: string[]
          p_sku?: string
          p_stock_status?: string
          p_url?: string
          p_you_may_also_like?: Json
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
