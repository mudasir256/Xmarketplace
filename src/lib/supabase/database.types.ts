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
          published_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          description?: string;
          price?: number | null;
          condition?: string;
          contact_number?: string | null;
          status?: string;
          city?: string | null;
          is_featured?: boolean;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
