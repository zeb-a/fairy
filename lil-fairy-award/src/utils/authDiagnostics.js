/**
 * Authentication Diagnostics Helper
 * This utility helps diagnose common authentication issues with Supabase
 */

import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in supabaseService.js
const supabaseUrl = 'https://jbmpfczuyspgxgqvejuf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibXBmY3p1eXNwZ3hncXZlanVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NzI0NjUsImV4cCI6MjA4MjQ0ODQ2NX0.B-pyr_bsUYpU8eHAvBR-HWqj33ocEJw7EfCtFs8Meko';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const runAuthDiagnostics = async () => {
  console.log('Running Supabase authentication diagnostics...');
  
  try {
    // Test 1: Check if Supabase client is properly initialized
    console.log('✅ Testing Supabase client initialization...');
    if (!supabase) {
      console.error('❌ Supabase client is not properly initialized');
      return false;
    }
    console.log('✅ Supabase client is properly initialized');
    
    // Test 2: Check if we can access auth status
    console.log('✅ Testing auth status access...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError && userError.message !== 'Auth session not found') {
      console.error('❌ Error accessing auth status:', userError);
    } else {
      console.log('✅ Auth status accessible');
    }
    
    // Test 3: Check if we can ping the Supabase instance
    console.log('✅ Testing connection to Supabase...');
    const { error: pingError } = await supabase.from('teachers').select('id').limit(1);
    if (pingError) {
      console.log('⚠️  Connection to Supabase established but teachers table may not exist:', pingError.message);
    } else {
      console.log('✅ Connection to Supabase successful');
    }
    
    // Test 4: Check if auth settings are enabled
    console.log('✅ Testing if auth is enabled...');
    // This is a simple test to see if auth endpoints are accessible
    try {
      const testResponse = await fetch(`${supabaseUrl}/auth/v1/authorize`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
        },
      });
      
      if (testResponse.status === 400 || testResponse.status === 404) {
        // This is expected - it means auth is enabled but missing required parameters
        console.log('✅ Auth appears to be enabled (received expected error for missing params)');
      } else {
        console.log('⚠️  Unexpected response when testing auth:', testResponse.status);
      }
    } catch (err) {
      console.error('❌ Error testing auth endpoint:', err);
    }
    
    console.log('✅ Authentication diagnostics completed');
    return true;
  } catch (error) {
    console.error('❌ Error during authentication diagnostics:', error);
    return false;
  }
};

// Function to check if Supabase project is properly configured
export const checkSupabaseConfig = async () => {
  console.log('Checking Supabase configuration...');
  
  try {
    // Check if we can access the auth providers
    const { data: { providers }, error } = await supabase.auth.listUserFactors();
    
    if (error) {
      console.log('⚠️  Could not access auth providers (this might be expected):', error.message);
    } else {
      console.log('✅ Auth providers accessible:', providers);
    }
    
    return true;
  } catch (err) {
    console.error('❌ Error checking Supabase config:', err);
    return false;
  }
};