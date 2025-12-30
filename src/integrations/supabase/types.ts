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
          remaining_credits: number | null
          result: Json
          score: number
          status: string
          timestamp: string
          user_id: string | null
          variant: string | null
        }
        Insert: {
          agent_name: string
          body_type?: string | null
          id?: string
          remaining_credits?: number | null
          result: Json
          score: number
          status?: string
          timestamp?: string
          user_id?: string | null
          variant?: string | null
        }
        Update: {
          agent_name?: string
          body_type?: string | null
          id?: string
          remaining_credits?: number | null
          result?: Json
          score?: number
          status?: string
          timestamp?: string
          user_id?: string | null
          variant?: string | null
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
      blog_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_keywords: string | null
          published: boolean | null
          published_at: string | null
          reading_time: number | null
          slug: string
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          published?: boolean | null
          published_at?: string | null
          reading_time?: number | null
          slug: string
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          published?: boolean | null
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts_categories: {
        Row: {
          blog_post_id: string
          category_id: string
          created_at: string | null
        }
        Insert: {
          blog_post_id: string
          category_id: string
          created_at?: string | null
        }
        Update: {
          blog_post_id?: string
          category_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_categories_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts_tags: {
        Row: {
          blog_post_id: string
          created_at: string | null
          tag_id: string
        }
        Insert: {
          blog_post_id: string
          created_at?: string | null
          tag_id: string
        }
        Update: {
          blog_post_id?: string
          created_at?: string | null
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_tags_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      brightdata_sync_history: {
        Row: {
          error_details: Json | null
          id: number
          job_id: string | null
          logs: Json | null
          processed_count: number | null
          progress_percentage: number | null
          status: string | null
          sync_method: string
          sync_timestamp: string | null
          total_added: number | null
          total_failed: number | null
          total_processed: number | null
          total_updated: number | null
        }
        Insert: {
          error_details?: Json | null
          id?: number
          job_id?: string | null
          logs?: Json | null
          processed_count?: number | null
          progress_percentage?: number | null
          status?: string | null
          sync_method: string
          sync_timestamp?: string | null
          total_added?: number | null
          total_failed?: number | null
          total_processed?: number | null
          total_updated?: number | null
        }
        Update: {
          error_details?: Json | null
          id?: number
          job_id?: string | null
          logs?: Json | null
          processed_count?: number | null
          progress_percentage?: number | null
          status?: string | null
          sync_method?: string
          sync_timestamp?: string | null
          total_added?: number | null
          total_failed?: number | null
          total_processed?: number | null
          total_updated?: number | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string
          description: string | null
          end_time: string | null
          event_type: string | null
          google_event_id: string
          id: string
          is_synced: boolean | null
          location: string | null
          start_time: string
          suggested_look_ids: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          google_event_id: string
          id?: string
          is_synced?: boolean | null
          location?: string | null
          start_time: string
          suggested_look_ids?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          google_event_id?: string
          id?: string
          is_synced?: boolean | null
          location?: string | null
          start_time?: string
          suggested_look_ids?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
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
      generated_outfits: {
        Row: {
          created_at: string
          description: string | null
          feedback_reason: string | null
          feedback_text: string | null
          id: string
          is_liked: boolean | null
          is_unlocked: boolean | null
          items: Json
          links_unlocked: boolean | null
          name: string
          purchased_at: string | null
          quiz_id: string | null
          stylist_notes: Json | null
          total_price: number | null
          user_id: string
          why_it_works: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          feedback_reason?: string | null
          feedback_text?: string | null
          id?: string
          is_liked?: boolean | null
          is_unlocked?: boolean | null
          items: Json
          links_unlocked?: boolean | null
          name: string
          purchased_at?: string | null
          quiz_id?: string | null
          stylist_notes?: Json | null
          total_price?: number | null
          user_id: string
          why_it_works?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          feedback_reason?: string | null
          feedback_text?: string | null
          id?: string
          is_liked?: boolean | null
          is_unlocked?: boolean | null
          items?: Json
          links_unlocked?: boolean | null
          name?: string
          purchased_at?: string | null
          quiz_id?: string | null
          stylist_notes?: Json | null
          total_price?: number | null
          user_id?: string
          why_it_works?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_outfits_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "style_quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_outfits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      payment_transactions: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string | null
          id: string
          lemonsqueezy_order_id: string | null
          metadata: Json | null
          outfit_id: string | null
          payment_type: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string | null
          id?: string
          lemonsqueezy_order_id?: string | null
          metadata?: Json | null
          outfit_id?: string | null
          payment_type?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string | null
          id?: string
          lemonsqueezy_order_id?: string | null
          metadata?: Json | null
          outfit_id?: string | null
          payment_type?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "generated_outfits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          changed_at: string | null
          id: number
          new_price: number | null
          old_price: number | null
          product_id: number
          product_name: string | null
          store_name: string | null
        }
        Insert: {
          changed_at?: string | null
          id?: number
          new_price?: number | null
          old_price?: number | null
          product_id: number
          product_name?: string | null
          store_name?: string | null
        }
        Update: {
          changed_at?: string | null
          id?: number
          new_price?: number | null
          old_price?: number | null
          product_id?: number
          product_name?: string | null
          store_name?: string | null
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
      product_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string | null
          product_id: string
          product_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type?: string | null
          product_id: string
          product_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string | null
          product_id?: string
          product_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          credits: number | null
          credits_tour_completed: boolean | null
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          name: string | null
          onboarding_completed: boolean | null
          outfits_tour_completed: boolean | null
          pricing_variant: string | null
          updated_at: string | null
          user_credits: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          credits?: number | null
          credits_tour_completed?: boolean | null
          email?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          name?: string | null
          onboarding_completed?: boolean | null
          outfits_tour_completed?: boolean | null
          pricing_variant?: string | null
          updated_at?: string | null
          user_credits?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          credits?: number | null
          credits_tour_completed?: boolean | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          name?: string | null
          onboarding_completed?: boolean | null
          outfits_tour_completed?: boolean | null
          pricing_variant?: string | null
          updated_at?: string | null
          user_credits?: number | null
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
      stock_history: {
        Row: {
          changed_at: string | null
          id: number
          new_status: string | null
          old_status: string | null
          product_id: number
          product_name: string | null
          store_name: string | null
        }
        Insert: {
          changed_at?: string | null
          id?: number
          new_status?: string | null
          old_status?: string | null
          product_id: number
          product_name?: string | null
          store_name?: string | null
        }
        Update: {
          changed_at?: string | null
          id?: number
          new_status?: string | null
          old_status?: string | null
          product_id?: number
          product_name?: string | null
          store_name?: string | null
        }
        Relationships: []
      }
      store_cache: {
        Row: {
          brand: string
          created_at: string | null
          expires_at: string | null
          id: string
          latitude: number
          location_hash: string
          longitude: number
          stores: Json
          user_id: string | null
        }
        Insert: {
          brand: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          latitude: number
          location_hash: string
          longitude: number
          stores?: Json
          user_id?: string | null
        }
        Update: {
          brand?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          latitude?: number
          location_hash?: string
          longitude?: number
          stores?: Json
          user_id?: string | null
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
      style_quizzes: {
        Row: {
          budget: string | null
          created_at: string
          id: string
          mood: string | null
          occasion: string | null
          uploaded_image_url: string | null
          user_id: string
          vision: string | null
        }
        Insert: {
          budget?: string | null
          created_at?: string
          id?: string
          mood?: string | null
          occasion?: string | null
          uploaded_image_url?: string | null
          user_id: string
          vision?: string | null
        }
        Update: {
          budget?: string | null
          created_at?: string
          id?: string
          mood?: string | null
          occasion?: string | null
          uploaded_image_url?: string | null
          user_id?: string
          vision?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "style_quizzes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      styled_profiles: {
        Row: {
          age: number | null
          avoided_colors: Json | null
          body_type: string | null
          created_at: string
          default_budget: string | null
          default_occasion: string | null
          face_shape: string | null
          gender: string | null
          height_cm: number | null
          preferred_colors: Json | null
          skin_tone: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          avoided_colors?: Json | null
          body_type?: string | null
          created_at?: string
          default_budget?: string | null
          default_occasion?: string | null
          face_shape?: string | null
          gender?: string | null
          height_cm?: number | null
          preferred_colors?: Json | null
          skin_tone?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          avoided_colors?: Json | null
          body_type?: string | null
          created_at?: string
          default_budget?: string | null
          default_occasion?: string | null
          face_shape?: string | null
          gender?: string | null
          height_cm?: number | null
          preferred_colors?: Json | null
          skin_tone?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "styled_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: number
          products_added: number | null
          products_removed: number | null
          products_updated: number | null
          status: string | null
          store_name: string
          store_url: string
          sync_timestamp: string | null
          total_products_synced: number | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: number
          products_added?: number | null
          products_removed?: number | null
          products_updated?: number | null
          status?: string | null
          store_name: string
          store_url: string
          sync_timestamp?: string | null
          total_products_synced?: number | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: number
          products_added?: number | null
          products_removed?: number | null
          products_updated?: number | null
          status?: string | null
          store_name?: string
          store_url?: string
          sync_timestamp?: string | null
          total_products_synced?: number | null
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          comment: string | null
          created_at: string
          feedback_type: string | null
          id: string
          is_disliked: boolean | null
          is_liked: boolean | null
          look_data: Json | null
          look_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          feedback_type?: string | null
          id?: string
          is_disliked?: boolean | null
          is_liked?: boolean | null
          look_data?: Json | null
          look_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          feedback_type?: string | null
          id?: string
          is_disliked?: boolean | null
          is_liked?: boolean | null
          look_data?: Json | null
          look_id?: string
          updated_at?: string
          user_id?: string
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
      user_payments: {
        Row: {
          amount: number
          created_at: string | null
          credits_purchased: number
          currency: string | null
          id: string
          payment_status: string | null
          user_id: string
          variant: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          credits_purchased: number
          currency?: string | null
          id?: string
          payment_status?: string | null
          user_id: string
          variant: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          credits_purchased?: number
          currency?: string | null
          id?: string
          payment_status?: string | null
          user_id?: string
          variant?: string
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      waitlist: {
        Row: {
          category: string
          created_at: string | null
          email: string
          id: string
          notified: boolean | null
          notified_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          email: string
          id?: string
          notified?: boolean | null
          notified_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          email?: string
          id?: string
          notified?: boolean | null
          notified_at?: string | null
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
      zara_cloth_test: {
        Row: {
          availability: boolean | null
          care: Json | null
          category_id: string | null
          category_name: string | null
          colour: string | null
          colour_code: string
          created_at: string | null
          currency: string | null
          description: string | null
          dimension: string | null
          flags: string[] | null
          id: number
          image: Json | null
          images: Json | null
          is_active: boolean | null
          last_synced: string | null
          last_synced_by: string | null
          low_on_stock: boolean | null
          match_products: Json | null
          materials: Json | null
          materials_description: string | null
          price: number | null
          product_family: string | null
          product_family_en: string | null
          product_id: number
          product_name: string | null
          product_subfamily: string | null
          section: string | null
          seo_category_id: string | null
          similar_products: Json | null
          size: string
          sku: string | null
          source: string | null
          source_priority: number | null
          sync_method: string | null
          updated_at: string | null
          url: string | null
          you_may_also_like: string | null
        }
        Insert: {
          availability?: boolean | null
          care?: Json | null
          category_id?: string | null
          category_name?: string | null
          colour?: string | null
          colour_code?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          dimension?: string | null
          flags?: string[] | null
          id?: number
          image?: Json | null
          images?: Json | null
          is_active?: boolean | null
          last_synced?: string | null
          last_synced_by?: string | null
          low_on_stock?: boolean | null
          match_products?: Json | null
          materials?: Json | null
          materials_description?: string | null
          price?: number | null
          product_family?: string | null
          product_family_en?: string | null
          product_id: number
          product_name?: string | null
          product_subfamily?: string | null
          section?: string | null
          seo_category_id?: string | null
          similar_products?: Json | null
          size?: string
          sku?: string | null
          source?: string | null
          source_priority?: number | null
          sync_method?: string | null
          updated_at?: string | null
          url?: string | null
          you_may_also_like?: string | null
        }
        Update: {
          availability?: boolean | null
          care?: Json | null
          category_id?: string | null
          category_name?: string | null
          colour?: string | null
          colour_code?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          dimension?: string | null
          flags?: string[] | null
          id?: number
          image?: Json | null
          images?: Json | null
          is_active?: boolean | null
          last_synced?: string | null
          last_synced_by?: string | null
          low_on_stock?: boolean | null
          match_products?: Json | null
          materials?: Json | null
          materials_description?: string | null
          price?: number | null
          product_family?: string | null
          product_family_en?: string | null
          product_id?: number
          product_name?: string | null
          product_subfamily?: string | null
          section?: string | null
          seo_category_id?: string | null
          similar_products?: Json | null
          size?: string
          sku?: string | null
          source?: string | null
          source_priority?: number | null
          sync_method?: string | null
          updated_at?: string | null
          url?: string | null
          you_may_also_like?: string | null
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
      cleanup_expired_store_cache: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      upsert_zara_cloth_test:
        | {
            Args: {
              p_availability: boolean
              p_brand: string
              p_care: Json
              p_care_info: string
              p_category: string
              p_category_id: number
              p_category_path: string
              p_color: string
              p_colour: string
              p_colour_code: string
              p_currency: string
              p_description: string
              p_dimension: string
              p_id: string
              p_image: Json
              p_images: Json
              p_low_on_stock: boolean
              p_materials: Json[]
              p_materials_description: string
              p_price: number
              p_product_family: string
              p_product_family_en: string
              p_product_id: string
              p_product_name: string
              p_product_subfamily: string
              p_product_url: string
              p_scrape_type: string
              p_scraped_category: string
              p_section: string
              p_size: string[]
              p_sku: string
              p_stock_status: string
              p_url: string
              p_you_may_also_like: string[]
            }
            Returns: undefined
          }
        | {
            Args: {
              p_availability: boolean
              p_brand: string
              p_care: Json
              p_care_info: string
              p_category: string
              p_category_id: string
              p_category_path: string
              p_color: string
              p_colour: string
              p_colour_code: string
              p_currency: string
              p_description: string
              p_dimension: string
              p_id: string
              p_image: Json
              p_images: Json
              p_low_on_stock: boolean
              p_materials: Json[]
              p_materials_description: string
              p_price: number
              p_product_family: string
              p_product_family_en: string
              p_product_id: string
              p_product_name: string
              p_product_subfamily: string
              p_product_url: string
              p_scrape_type: string
              p_scraped_category: string
              p_section: string
              p_size: string[]
              p_sku: string
              p_stock_status: string
              p_url: string
              p_you_may_also_like: string[]
            }
            Returns: undefined
          }
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
      upsert_zara_product_test:
        | {
            Args: {
              p_availability: boolean
              p_brand: string
              p_care: Json
              p_care_info: string
              p_category: string
              p_category_id: number
              p_category_path: string
              p_color: string
              p_colour: string
              p_colour_code: number
              p_currency: string
              p_description: string
              p_dimension: string
              p_id: string
              p_image: Json
              p_images: Json
              p_low_on_stock: boolean
              p_materials: Json[]
              p_materials_description: string
              p_price: number
              p_product_family: string
              p_product_family_en: string
              p_product_id: number
              p_product_name: string
              p_product_subfamily: string
              p_product_url: string
              p_scrape_type: string
              p_scraped_category: string
              p_section: string
              p_size: string[]
              p_sku: string
              p_stock_status: string
              p_url: string
              p_you_may_also_like: Json
            }
            Returns: string
          }
        | {
            Args: {
              p_availability: string
              p_brand: string
              p_care: Json
              p_care_info: string
              p_category: string
              p_category_id: string
              p_category_path: string
              p_color: string
              p_colour: string
              p_colour_code: string
              p_currency: string
              p_description: string
              p_dimension: string
              p_id: string
              p_image: Json
              p_images: Json
              p_low_on_stock: boolean
              p_materials: Json[]
              p_materials_description: string
              p_price: number
              p_product_family: string
              p_product_family_en: string
              p_product_id: string
              p_product_name: string
              p_product_subfamily: string
              p_product_url: string
              p_scrape_type: string
              p_scraped_category: string
              p_section: string
              p_size: string[]
              p_sku: string
              p_stock_status: string
              p_url: string
              p_you_may_also_like: Json
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
