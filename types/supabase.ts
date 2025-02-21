export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      shopping_items: {
        Row: {
          id: number;
          name: string;
          price: number;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: number;
          name: string;
          price: number;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: number;
          name?: string;
          price?: number;
          created_at?: string;
          user_id?: string;
        };
      };
    };
  };
}
