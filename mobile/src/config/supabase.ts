import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Database } from '../types/database';

const supabaseUrl = 'https://zopvzedfnshapdnhsrsk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvcHZ6ZWRmbnNoYXBkbmhzcnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDUxMDUsImV4cCI6MjA2NzEyMTEwNX0.4JFyDrfladTrPCGKmOdU1DgywqlkP5jjab-Ggz7T_fM';

// Custom storage implementation using SecureStore with size optimization
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn('SecureStore getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      // Check if value is too large (SecureStore has ~2048 byte limit)
      if (value.length > 1800) {
        console.warn('Value too large for SecureStore, truncating:', key);
        // Store only essential parts for large values
        const parsed = JSON.parse(value);
        if (parsed.access_token && parsed.refresh_token) {
          const minimalValue = JSON.stringify({
            access_token: parsed.access_token,
            refresh_token: parsed.refresh_token,
            expires_at: parsed.expires_at,
            // Remove other large fields
          });
          await SecureStore.setItemAsync(key, minimalValue);
          return;
        }
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn('SecureStore setItem error:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn('SecureStore removeItem error:', error);
    }
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 