// Test script to verify authentication functionality
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with the provided credentials
const supabaseUrl = 'https://jbmpfczuyspgxgqvejuf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibXBmY3p1eXNwZ3hncXZlanVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NzI0NjUsImV4cCI6MjA4MjQ0ODQ2NX0.B-pyr_bsUYpU8eHAvBR-HWqj33ocEJw7EfCtFs8Meko';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Testing Supabase connection...');
console.log('Attempting to get current user...');

// Test getting current user (should return no user if not logged in)
supabase.auth.getUser()
  .then(({ data, error }) => {
    if (error) {
      console.log('Error getting user:', error.message);
    } else {
      console.log('Current user data:', data.user ? 'User exists' : 'No user logged in');
    }
  })
  .catch(err => {
    console.log('Exception getting user:', err.message);
  });

// Test sign in with invalid credentials to see if it responds properly
console.log('\nTesting sign in with invalid credentials...');
supabase.auth.signInWithPassword({
  email: 'invalid@example.com',
  password: 'invalidpassword'
})
  .then(({ data, error }) => {
    if (error) {
      console.log('Expected error for invalid credentials:', error.message);
    } else {
      console.log('Unexpected success:', data);
    }
  })
  .catch(err => {
    console.log('Exception during sign in:', err.message);
  });

console.log('\nTest completed.');