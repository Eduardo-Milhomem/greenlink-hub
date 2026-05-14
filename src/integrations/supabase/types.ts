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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          address_id: string | null
          asset_tag: string
          catalog_item_id: string | null
          contract_id: string | null
          created_at: string
          customer_id: string | null
          id: string
          installed_at: string | null
          last_reading_at: string | null
          notes: string | null
          owner_type: Database["public"]["Enums"]["asset_owner_type"]
          serial_number: string | null
          site_name: string | null
          status: Database["public"]["Enums"]["asset_status"]
          updated_at: string
        }
        Insert: {
          address_id?: string | null
          asset_tag: string
          catalog_item_id?: string | null
          contract_id?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          installed_at?: string | null
          last_reading_at?: string | null
          notes?: string | null
          owner_type?: Database["public"]["Enums"]["asset_owner_type"]
          serial_number?: string | null
          site_name?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          updated_at?: string
        }
        Update: {
          address_id?: string | null
          asset_tag?: string
          catalog_item_id?: string | null
          contract_id?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          installed_at?: string | null
          last_reading_at?: string | null
          notes?: string | null
          owner_type?: Database["public"]["Enums"]["asset_owner_type"]
          serial_number?: string | null
          site_name?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "customer_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_items: {
        Row: {
          cost_price: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_recurring: boolean
          item_code: string
          item_type: Database["public"]["Enums"]["catalog_item_type"]
          name: string
          sale_price: number
          track_serial: boolean
          track_stock: boolean
          unit_code: string
          updated_at: string
        }
        Insert: {
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          item_code: string
          item_type?: Database["public"]["Enums"]["catalog_item_type"]
          name: string
          sale_price?: number
          track_serial?: boolean
          track_stock?: boolean
          unit_code?: string
          updated_at?: string
        }
        Update: {
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          item_code?: string
          item_type?: Database["public"]["Enums"]["catalog_item_type"]
          name?: string
          sale_price?: number
          track_serial?: boolean
          track_stock?: boolean
          unit_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      contract_items: {
        Row: {
          billing_frequency:
            | Database["public"]["Enums"]["billing_frequency"]
            | null
          catalog_item_id: string | null
          contract_id: string
          description: string
          end_date: string | null
          id: string
          is_recurring: boolean
          quantity: number
          start_date: string | null
          unit_price: number
        }
        Insert: {
          billing_frequency?:
            | Database["public"]["Enums"]["billing_frequency"]
            | null
          catalog_item_id?: string | null
          contract_id: string
          description: string
          end_date?: string | null
          id?: string
          is_recurring?: boolean
          quantity?: number
          start_date?: string | null
          unit_price?: number
        }
        Update: {
          billing_frequency?:
            | Database["public"]["Enums"]["billing_frequency"]
            | null
          catalog_item_id?: string | null
          contract_id?: string
          description?: string
          end_date?: string | null
          id?: string
          is_recurring?: boolean
          quantity?: number
          start_date?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_items_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_items_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          auto_renew: boolean
          billing_frequency: Database["public"]["Enums"]["billing_frequency"]
          contract_number: string
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at: string
          created_by: string | null
          customer_id: string
          end_date: string | null
          id: string
          monthly_amount: number
          notes: string | null
          order_id: string | null
          price_indexer: string | null
          start_date: string
          status: Database["public"]["Enums"]["contract_status"]
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean
          billing_frequency?: Database["public"]["Enums"]["billing_frequency"]
          contract_number: string
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          created_by?: string | null
          customer_id: string
          end_date?: string | null
          id?: string
          monthly_amount?: number
          notes?: string | null
          order_id?: string | null
          price_indexer?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"]
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean
          billing_frequency?: Database["public"]["Enums"]["billing_frequency"]
          contract_number?: string
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          created_by?: string | null
          customer_id?: string
          end_date?: string | null
          id?: string
          monthly_amount?: number
          notes?: string | null
          order_id?: string | null
          price_indexer?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_addresses: {
        Row: {
          city: string | null
          complement: string | null
          created_at: string
          customer_id: string
          district: string | null
          id: string
          label: string | null
          latitude: number | null
          longitude: number | null
          number: string | null
          state: string | null
          street: string | null
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          complement?: string | null
          created_at?: string
          customer_id: string
          district?: string | null
          id?: string
          label?: string | null
          latitude?: number | null
          longitude?: number | null
          number?: string | null
          state?: string | null
          street?: string | null
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          complement?: string | null
          created_at?: string
          customer_id?: string
          district?: string | null
          id?: string
          label?: string | null
          latitude?: number | null
          longitude?: number | null
          number?: string | null
          state?: string | null
          street?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contacts: {
        Row: {
          created_at: string
          customer_id: string
          email: string | null
          full_name: string
          id: string
          is_primary: boolean
          phone: string | null
          role_title: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          email?: string | null
          full_name: string
          id?: string
          is_primary?: boolean
          phone?: string | null
          role_title?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          email?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean
          phone?: string | null
          role_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_orders: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string
          discount_amount: number
          id: string
          notes: string | null
          order_date: string
          order_number: string
          quote_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id: string
          discount_amount?: number
          id?: string
          notes?: string | null
          order_date?: string
          order_number: string
          quote_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string
          discount_amount?: number
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string
          quote_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_orders_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          city: string | null
          created_at: string
          created_by: string | null
          customer_type: Database["public"]["Enums"]["customer_type"]
          document_number: string | null
          email: string | null
          id: string
          legal_name: string
          notes: string | null
          phone: string | null
          state: string | null
          status: Database["public"]["Enums"]["generic_status"]
          trade_name: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          created_by?: string | null
          customer_type?: Database["public"]["Enums"]["customer_type"]
          document_number?: string | null
          email?: string | null
          id?: string
          legal_name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["generic_status"]
          trade_name?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          created_by?: string | null
          customer_type?: Database["public"]["Enums"]["customer_type"]
          document_number?: string | null
          email?: string | null
          id?: string
          legal_name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["generic_status"]
          trade_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          company_name: string | null
          converted_at: string | null
          converted_customer_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_name?: string | null
          converted_at?: string | null
          converted_customer_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_name?: string | null
          converted_at?: string | null
          converted_customer_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_converted_customer_id_fkey"
            columns: ["converted_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          amount: number
          assigned_to: string | null
          created_at: string
          customer_id: string | null
          expected_close_date: string | null
          id: string
          lead_id: string | null
          notes: string | null
          stage: Database["public"]["Enums"]["opportunity_stage"]
          title: string
          updated_at: string
          win_probability: number | null
        }
        Insert: {
          amount?: number
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          title: string
          updated_at?: string
          win_probability?: number | null
        }
        Update: {
          amount?: number
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          title?: string
          updated_at?: string
          win_probability?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          catalog_item_id: string | null
          description: string
          id: string
          item_type: string
          order_id: string
          quantity: number
          service_end_date: string | null
          service_start_date: string | null
          total_amount: number
          unit_price: number
        }
        Insert: {
          catalog_item_id?: string | null
          description: string
          id?: string
          item_type?: string
          order_id: string
          quantity?: number
          service_end_date?: string | null
          service_start_date?: string | null
          total_amount?: number
          unit_price?: number
        }
        Update: {
          catalog_item_id?: string | null
          description?: string
          id?: string
          item_type?: string
          order_id?: string
          quantity?: number
          service_end_date?: string | null
          service_start_date?: string | null
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payables: {
        Row: {
          amount: number
          category_id: string | null
          cost_center_id: string | null
          created_at: string
          description: string
          due_date: string
          id: string
          issue_date: string
          open_amount: number
          status: Database["public"]["Enums"]["billing_status"]
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          cost_center_id?: string | null
          created_at?: string
          description: string
          due_date: string
          id?: string
          issue_date?: string
          open_amount: number
          status?: Database["public"]["Enums"]["billing_status"]
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          cost_center_id?: string | null
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          issue_date?: string
          open_amount?: number
          status?: Database["public"]["Enums"]["billing_status"]
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      quote_items: {
        Row: {
          catalog_item_id: string | null
          discount_amount: number
          id: string
          item_description: string
          item_type: string
          quantity: number
          quote_id: string
          sort_order: number
          total_amount: number
          unit_price: number
        }
        Insert: {
          catalog_item_id?: string | null
          discount_amount?: number
          id?: string
          item_description: string
          item_type?: string
          quantity?: number
          quote_id: string
          sort_order?: number
          total_amount?: number
          unit_price?: number
        }
        Update: {
          catalog_item_id?: string | null
          discount_amount?: number
          id?: string
          item_description?: string
          item_type?: string
          quantity?: number
          quote_id?: string
          sort_order?: number
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          discount_amount: number
          id: string
          issue_date: string
          notes: string | null
          opportunity_id: string | null
          quote_number: string
          status: Database["public"]["Enums"]["quote_status"]
          subtotal: number
          total_amount: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          discount_amount?: number
          id?: string
          issue_date?: string
          notes?: string | null
          opportunity_id?: string | null
          quote_number: string
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          discount_amount?: number
          id?: string
          issue_date?: string
          notes?: string | null
          opportunity_id?: string | null
          quote_number?: string
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      receivables: {
        Row: {
          amount: number
          category_id: string | null
          contract_id: string | null
          cost_center_id: string | null
          created_at: string
          customer_id: string
          description: string
          due_date: string
          id: string
          issue_date: string
          open_amount: number
          order_id: string | null
          origin_id: string | null
          origin_type: string | null
          status: Database["public"]["Enums"]["billing_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          contract_id?: string | null
          cost_center_id?: string | null
          created_at?: string
          customer_id: string
          description: string
          due_date: string
          id?: string
          issue_date?: string
          open_amount: number
          order_id?: string | null
          origin_id?: string | null
          origin_type?: string | null
          status?: Database["public"]["Enums"]["billing_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          contract_id?: string | null
          cost_center_id?: string | null
          created_at?: string
          customer_id?: string
          description?: string
          due_date?: string
          id?: string
          issue_date?: string
          open_amount?: number
          order_id?: string | null
          origin_id?: string | null
          origin_type?: string | null
          status?: Database["public"]["Enums"]["billing_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receivables_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_order_tasks: {
        Row: {
          completed_at: string | null
          id: string
          service_order_id: string
          sort_order: number
          status: string
          title: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          service_order_id: string
          sort_order?: number
          status?: string
          title: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          service_order_id?: string
          sort_order?: number
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_order_tasks_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          asset_id: string | null
          assigned_to: string | null
          completed_at: string | null
          contract_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          description: string | null
          id: string
          order_id: string | null
          os_number: string
          priority: Database["public"]["Enums"]["service_priority"]
          scheduled_end: string | null
          scheduled_start: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status: Database["public"]["Enums"]["service_order_status"]
          ticket_id: string | null
          updated_at: string
        }
        Insert: {
          asset_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          description?: string | null
          id?: string
          order_id?: string | null
          os_number: string
          priority?: Database["public"]["Enums"]["service_priority"]
          scheduled_end?: string | null
          scheduled_start?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["service_order_status"]
          ticket_id?: string | null
          updated_at?: string
        }
        Update: {
          asset_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          description?: string | null
          id?: string
          order_id?: string | null
          os_number?: string
          priority?: Database["public"]["Enums"]["service_priority"]
          scheduled_end?: string | null
          scheduled_start?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["service_order_status"]
          ticket_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_balances: {
        Row: {
          catalog_item_id: string
          minimum_stock: number
          on_hand: number
          reserved: number
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          catalog_item_id: string
          minimum_stock?: number
          on_hand?: number
          reserved?: number
          updated_at?: string
          warehouse_id?: string
        }
        Update: {
          catalog_item_id?: string
          minimum_stock?: number
          on_hand?: number
          reserved?: number
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_balances_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          catalog_item_id: string
          created_at: string
          created_by: string | null
          id: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes: string | null
          occurred_at: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          source_warehouse_id: string | null
          target_warehouse_id: string | null
        }
        Insert: {
          catalog_item_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes?: string | null
          occurred_at?: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          source_warehouse_id?: string | null
          target_warehouse_id?: string | null
        }
        Update: {
          catalog_item_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: Database["public"]["Enums"]["stock_movement_type"]
          notes?: string | null
          occurred_at?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          source_warehouse_id?: string | null
          target_warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          asset_id: string | null
          assigned_to: string | null
          category: string | null
          channel: string | null
          contract_id: string | null
          created_at: string
          customer_id: string
          description: string | null
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolved_at: string | null
          sla_due_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          ticket_number: string
          updated_at: string
        }
        Insert: {
          asset_id?: string | null
          assigned_to?: string | null
          category?: string | null
          channel?: string | null
          contract_id?: string | null
          created_at?: string
          customer_id: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          sla_due_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          ticket_number: string
          updated_at?: string
        }
        Update: {
          asset_id?: string | null
          assigned_to?: string | null
          category?: string | null
          channel?: string | null
          contract_id?: string | null
          created_at?: string
          customer_id?: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          sla_due_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          ticket_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          author_user_id: string | null
          body: string
          created_at: string
          id: string
          is_internal: boolean
          ticket_id: string
        }
        Insert: {
          author_user_id?: string | null
          body: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id: string
        }
        Update: {
          author_user_id?: string | null
          body?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "manager" | "operator" | "viewer"
      asset_owner_type: "greenlink" | "customer" | "third_party"
      asset_status:
        | "available"
        | "reserved"
        | "installed"
        | "rented"
        | "maintenance"
        | "returned"
        | "inactive"
      billing_frequency:
        | "one_time"
        | "monthly"
        | "quarterly"
        | "semiannual"
        | "annual"
      billing_status: "open" | "partial" | "paid" | "overdue" | "cancelled"
      catalog_item_type:
        | "product"
        | "service"
        | "kit"
        | "rental"
        | "manufactured"
      contract_status:
        | "draft"
        | "active"
        | "suspended"
        | "expired"
        | "cancelled"
      contract_type:
        | "sale_installation"
        | "rental"
        | "subscription"
        | "support"
        | "mixed"
      customer_type: "pf" | "pj"
      generic_status: "active" | "inactive"
      lead_status:
        | "novo"
        | "contatado"
        | "qualificado"
        | "perdido"
        | "convertido"
      opportunity_stage:
        | "novo"
        | "qualificado"
        | "proposta"
        | "negociacao"
        | "ganho"
        | "perdido"
      order_status:
        | "open"
        | "approved"
        | "invoiced"
        | "partially_fulfilled"
        | "fulfilled"
        | "cancelled"
      quote_status:
        | "draft"
        | "sent"
        | "approved"
        | "rejected"
        | "expired"
        | "cancelled"
      service_order_status:
        | "open"
        | "scheduled"
        | "in_route"
        | "in_progress"
        | "waiting_parts"
        | "done"
        | "cancelled"
        | "return_required"
      service_priority: "low" | "medium" | "high" | "urgent"
      service_type:
        | "installation"
        | "maintenance"
        | "removal"
        | "support"
        | "inspection"
        | "training"
      stock_movement_type:
        | "in"
        | "out"
        | "transfer"
        | "adjustment"
        | "reservation"
        | "release"
        | "consumption"
        | "production_in"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status:
        | "new"
        | "in_progress"
        | "waiting_customer"
        | "resolved"
        | "cancelled"
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
      app_role: ["admin", "manager", "operator", "viewer"],
      asset_owner_type: ["greenlink", "customer", "third_party"],
      asset_status: [
        "available",
        "reserved",
        "installed",
        "rented",
        "maintenance",
        "returned",
        "inactive",
      ],
      billing_frequency: [
        "one_time",
        "monthly",
        "quarterly",
        "semiannual",
        "annual",
      ],
      billing_status: ["open", "partial", "paid", "overdue", "cancelled"],
      catalog_item_type: [
        "product",
        "service",
        "kit",
        "rental",
        "manufactured",
      ],
      contract_status: ["draft", "active", "suspended", "expired", "cancelled"],
      contract_type: [
        "sale_installation",
        "rental",
        "subscription",
        "support",
        "mixed",
      ],
      customer_type: ["pf", "pj"],
      generic_status: ["active", "inactive"],
      lead_status: [
        "novo",
        "contatado",
        "qualificado",
        "perdido",
        "convertido",
      ],
      opportunity_stage: [
        "novo",
        "qualificado",
        "proposta",
        "negociacao",
        "ganho",
        "perdido",
      ],
      order_status: [
        "open",
        "approved",
        "invoiced",
        "partially_fulfilled",
        "fulfilled",
        "cancelled",
      ],
      quote_status: [
        "draft",
        "sent",
        "approved",
        "rejected",
        "expired",
        "cancelled",
      ],
      service_order_status: [
        "open",
        "scheduled",
        "in_route",
        "in_progress",
        "waiting_parts",
        "done",
        "cancelled",
        "return_required",
      ],
      service_priority: ["low", "medium", "high", "urgent"],
      service_type: [
        "installation",
        "maintenance",
        "removal",
        "support",
        "inspection",
        "training",
      ],
      stock_movement_type: [
        "in",
        "out",
        "transfer",
        "adjustment",
        "reservation",
        "release",
        "consumption",
        "production_in",
      ],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: [
        "new",
        "in_progress",
        "waiting_customer",
        "resolved",
        "cancelled",
      ],
    },
  },
} as const
