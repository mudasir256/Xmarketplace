export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_path: string | null;
          role: string;
          account_status: string;
          preferred_location: unknown | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_path?: string | null;
          role?: string;
          account_status?: string;
          preferred_location?: unknown | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_path?: string | null;
          role?: string;
          account_status?: string;
          preferred_location?: unknown | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      marketplace_categories: {
        Row: {
          id: string;
          parent_id: string | null;
          name: string;
          slug: string;
          is_active: boolean;
          display_order: number;
        };
        Insert: {
          id?: string;
          parent_id?: string | null;
          name: string;
          slug: string;
          is_active?: boolean;
          display_order?: number;
        };
        Update: {
          parent_id?: string | null;
          name?: string;
          slug?: string;
          is_active?: boolean;
          display_order?: number;
        };
        Relationships: [];
      };
      marketplace_listings: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          title: string;
          slug: string;
          description: string;
          price: number | null;
          condition: string;
          contact_number: string | null;
          status: string;
          city: string | null;
          is_featured: boolean;
          latitude: number | null;
          longitude: number | null;
          area: string | null;
          published_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          title: string;
          slug: string;
          description: string;
          price?: number | null;
          condition?: string;
          contact_number?: string | null;
          status?: string;
          city?: string | null;
          is_featured?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          area?: string | null;
          published_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          title?: string;
          slug?: string;
          description?: string;
          price?: number | null;
          condition?: string;
          contact_number?: string | null;
          status?: string;
          city?: string | null;
          is_featured?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          area?: string | null;
          published_at?: string | null;
          expires_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      marketplace_listing_images: {
        Row: {
          id: string;
          listing_id: string;
          storage_path: string;
          alt_text: string | null;
          display_order: number;
          is_primary: boolean;
        };
        Insert: {
          id?: string;
          listing_id: string;
          storage_path: string;
          alt_text?: string | null;
          display_order?: number;
          is_primary?: boolean;
        };
        Update: {
          storage_path?: string;
          alt_text?: string | null;
          display_order?: number;
          is_primary?: boolean;
        };
        Relationships: [];
      };
      marketplace_favorites: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          listing_id?: string;
        };
        Relationships: [];
      };
      store_products: {
        Row: {
          id: string;
          category_id: string;
          brand_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          base_price: number;
          compare_at_price: number | null;
          product_status: string;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          brand_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          base_price: number;
          compare_at_price?: number | null;
          product_status?: string;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          brand_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          base_price?: number;
          compare_at_price?: number | null;
          product_status?: string;
          is_featured?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          province: string;
          city: string;
          area: string | null;
          street_address: string;
          postal_code: string | null;
          landmark: string | null;
          is_default_shipping: boolean;
          is_default_billing: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          phone: string;
          province: string;
          city: string;
          area?: string | null;
          street_address: string;
          postal_code?: string | null;
          landmark?: string | null;
          is_default_shipping?: boolean;
          is_default_billing?: boolean;
          created_at?: string;
        };
        Update: {
          full_name?: string;
          phone?: string;
          province?: string;
          city?: string;
          area?: string | null;
          street_address?: string;
          postal_code?: string | null;
          landmark?: string | null;
          is_default_shipping?: boolean;
          is_default_billing?: boolean;
        };
        Relationships: [];
      };
      store_orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          status: string;
          payment_status: string;
          grand_total: number;
          currency: string;
          placed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id: string;
          status?: string;
          payment_status?: string;
          grand_total: number;
          currency?: string;
          placed_at?: string;
          created_at?: string;
        };
        Update: {
          status?: string;
          payment_status?: string;
          grand_total?: number;
        };
        Relationships: [];
      };
      buyer_requests: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category_slug: string | null;
          city: string | null;
          budget_min: number | null;
          budget_max: number | null;
          contact_number: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          category_slug?: string | null;
          city?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          contact_number?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          category_slug?: string | null;
          city?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          contact_number?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          link_path: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          link_path?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
          title?: string;
          body?: string;
          link_path?: string | null;
        };
        Relationships: [];
      };
      store_wishlist: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          product_id?: string;
        };
        Relationships: [];
      };
      account_settings: {
        Row: {
          user_id: string;
          email_notifications: boolean;
          sms_notifications: boolean;
          profile_visibility: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          email_notifications?: boolean;
          sms_notifications?: boolean;
          profile_visibility?: string;
          updated_at?: string;
        };
        Update: {
          email_notifications?: boolean;
          sms_notifications?: boolean;
          profile_visibility?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      nearby_marketplace_listings: {
        Args: {
          p_lat: number;
          p_lng: number;
          p_radius_km?: number;
          p_category_slug?: string | null;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: {
          id: string;
          user_id: string;
          title: string;
          slug: string;
          description: string;
          price: number | null;
          condition: string | null;
          city: string | null;
          area: string | null;
          contact_number: string | null;
          is_featured: boolean;
          created_at: string;
          category_name: string;
          category_slug: string;
          primary_image_path: string | null;
          distance_km: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
