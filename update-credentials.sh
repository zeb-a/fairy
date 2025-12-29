#!/bin/bash

echo "Please enter your Supabase Project URL (e.g., https://xxxx.supabase.co):"
read SUPABASE_URL

echo "Please enter your Supabase Anon Key:"
read SUPABASE_ANON_KEY

# Update the test file with the credentials
sed -i "s|https://YOUR_PROJECT_ID.supabase.co|$SUPABASE_URL|" /workspace/test-connection.html
sed -i "s/YOUR_ANON_KEY/$SUPABASE_ANON_KEY/" /workspace/test-connection.html

echo "Credentials updated in test-connection.html"
echo "Now go to your Supabase dashboard and run the SQL commands from setup.sql in the SQL Editor"
echo "Then visit http://localhost:8000/test-connection.html to test the connection"