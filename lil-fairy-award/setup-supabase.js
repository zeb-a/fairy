#!/usr/bin/env node

/**
 * Supabase Setup Script
 * This script provides instructions for setting up the required Supabase database tables
 * and configuring Row Level Security policies for the lil-fairy-award application.
 */

console.log("=== Lil' Fairy Award - Supabase Setup Instructions ===\n");

console.log("1. DATABASE TABLES:");
console.log("You need to create the following tables in your Supabase database:");
console.log("   - teachers");
console.log("   - classes"); 
console.log("   - students");
console.log("   - tasks");
console.log("   - points_log");
console.log("   - avatars (storage bucket)\n");

console.log("2. SQL SCHEMA TO RUN IN SUPABASE SQL EDITOR:");
console.log(`
-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  avatar_selection TEXT DEFAULT '🧙',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  strength_points INTEGER DEFAULT 0,
  need_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  point_type TEXT DEFAULT 'strength', -- 'strength' or 'need'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Points log table
CREATE TABLE IF NOT EXISTS points_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  point_type TEXT NOT NULL, -- 'strength' or 'need'
  reward_type TEXT DEFAULT 'Award',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Teachers can only access their own profile
CREATE POLICY "Teachers can view own profile" ON teachers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Teachers can insert own profile" ON teachers
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Teachers can update own profile" ON teachers
  FOR UPDATE USING (auth.uid() = id);

-- Teachers can access their own classes
CREATE POLICY "Teachers can view own classes" ON classes
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert own classes" ON classes
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own classes" ON classes
  FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own classes" ON classes
  FOR DELETE USING (auth.uid() = teacher_id);

-- Teachers can access students in their classes
CREATE POLICY "Teachers can view students in own classes" ON students
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM classes WHERE classes.id = students.class_id AND classes.teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can insert students in own classes" ON students
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM classes WHERE classes.id = students.class_id AND classes.teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can update students in own classes" ON students
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM classes WHERE classes.id = students.class_id AND classes.teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can delete students in own classes" ON students
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM classes WHERE classes.id = students.class_id AND classes.teacher_id = auth.uid()
  ));

-- Teachers can access tasks in their classes
CREATE POLICY "Teachers can view tasks in own classes" ON tasks
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM classes WHERE classes.id = tasks.class_id AND classes.teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can insert tasks in own classes" ON tasks
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM classes WHERE classes.id = tasks.class_id AND classes.teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can update tasks in own classes" ON tasks
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM classes WHERE classes.id = tasks.class_id AND classes.teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can delete tasks in own classes" ON tasks
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM classes WHERE classes.id = tasks.class_id AND classes.teacher_id = auth.uid()
  ));

-- Teachers can access points log in their classes
CREATE POLICY "Teachers can view points log in own classes" ON points_log
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM classes WHERE classes.id = points_log.class_id AND classes.teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can insert points log in own classes" ON points_log
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM classes WHERE classes.id = points_log.class_id AND classes.teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can update points log in own classes" ON points_log
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM classes WHERE classes.id = points_log.class_id AND classes.teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can delete points log in own classes" ON points_log
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM classes WHERE classes.id = points_log.class_id AND classes.teacher_id = auth.uid()
  ));

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own avatar images" ON storage.objects
  FOR UPDATE USING (auth.uid() IS NOT NULL) 
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own avatar images" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
`);

console.log("\n3. TO RUN THESE QUERIES:");
console.log("   - Go to your Supabase dashboard");
console.log("   - Navigate to SQL Editor");
console.log("   - Paste and run the above SQL commands");

console.log("\n4. ADDITIONAL SETUP:");
console.log("   - Make sure your Supabase project has Auth enabled");
console.log("   - Ensure email authentication is configured");
console.log("   - Check that your API keys are correct in supabaseService.js");

console.log("\n5. TROUBLESHOOTING:");
console.log("   - If you still get 404 errors, verify the table names match exactly");
console.log("   - For RLS errors, make sure the policies are correctly set");
console.log("   - Check that your Supabase URL and API key in supabaseService.js are correct");

console.log("\nAfter running these SQL commands, your application should work correctly.");