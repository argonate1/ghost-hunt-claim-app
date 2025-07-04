import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Database } from '../types/database';

const supabaseUrl = 'https://zopvzedfnshapdnhsrsk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvcHZ6ZWRmbnNoYXBkbmhzcnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDUxMDUsImV4cCI6MjA2NzEyMTEwNX0.4JFyDrfladTrPCGKmOdU1DgywqlkP5jjab-Ggz7T_fM';

// Custom storage implementation using SecureStore
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 