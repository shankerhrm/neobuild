export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: "employee" | "admin"
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: "employee" | "admin"
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: "employee" | "admin"
          created_at?: string
        }
      }
      attendance_logs: {
        Row: {
          id: string
          user_id: string
          site_name: string
          check_in_time: string
          check_out_time: string | null
          check_in_location: Json
          check_out_location: Json | null
          notes: string | null
          created_at: string
          customer_name: string | null
          contact_person: string | null
          contact_number: string | null
          visit_summary: string | null
        }
        Insert: {
          id?: string
          user_id: string
          site_name: string
          check_in_time?: string
          check_out_time?: string | null
          check_in_location: Json
          check_out_location?: Json | null
          notes?: string | null
          created_at?: string
          customer_name?: string | null
          contact_person?: string | null
          contact_number?: string | null
          visit_summary?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          site_name?: string
          check_in_time?: string
          check_out_time?: string | null
          check_in_location?: Json
          check_out_location?: Json | null
          notes?: string | null
          created_at?: string
          customer_name?: string | null
          contact_person?: string | null
          contact_number?: string | null
          visit_summary?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          sku: string | null
          article_no: string | null
          model_no: string | null
          make: string | null
          description: string | null
          price: number
          stock_quantity: number
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          sku?: string | null
          article_no?: string | null
          model_no?: string | null
          make?: string | null
          description?: string | null
          price?: number
          stock_quantity?: number
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          sku?: string | null
          article_no?: string | null
          model_no?: string | null
          make?: string | null
          description?: string | null
          price?: number
          stock_quantity?: number
          category?: string | null
          created_at?: string
        }
      }
      enquiry_items: {
        Row: {
          id: string
          visit_id: string
          product_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          visit_id: string
          product_id: string
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          visit_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          visit_id: string | null
          customer_name: string
          quote_number: number
          subtotal: number
          tax_percent: number
          discount_percent: number
          total_amount: number
          terms_conditions: string | null
          status: "draft" | "sent" | "approved" | "rejected"
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          visit_id?: string | null
          customer_name: string
          quote_number?: number
          subtotal?: number
          tax_percent?: number
          discount_percent?: number
          total_amount?: number
          terms_conditions?: string | null
          status?: "draft" | "sent" | "approved" | "rejected"
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          visit_id?: string | null
          customer_name?: string
          quote_number?: number
          subtotal?: number
          tax_percent?: number
          discount_percent?: number
          total_amount?: number
          terms_conditions?: string | null
          status?: "draft" | "sent" | "approved" | "rejected"
          created_by?: string | null
          created_at?: string
        }
      }
      quote_items: {
        Row: {
          id: string
          quote_id: string
          product_id: string
          quantity: number
          unit_price: number
          line_total: number
          created_at: string
        }
        Insert: {
          id?: string
          quote_id: string
          product_id: string
          quantity?: number
          unit_price?: number
          line_total?: number
          created_at?: string
        }
        Update: {
          id?: string
          quote_id: string
          product_id: string
          quantity?: number
          unit_price?: number
          line_total?: number
          created_at?: string
        }
      }
    }
  }
}

export type LocationData = {
  lat: number;
  lng: number;
  accuracy?: number;
}

export type AttendanceLog = Omit<Database['public']['Tables']['attendance_logs']['Row'], 'check_in_location' | 'check_out_location'> & {
  check_in_location: LocationData;
  check_out_location: LocationData | null;
  profiles?: Database['public']['Tables']['profiles']['Row'] | null;
  enquiry_items?: { count: number }[];
}

export type Product = Database['public']['Tables']['products']['Row'];
export type EnquiryItem = Database['public']['Tables']['enquiry_items']['Row'] & {
  products?: Product;
};
export type Quote = Database['public']['Tables']['quotes']['Row'];
export type QuoteItem = Database['public']['Tables']['quote_items']['Row'];