# Lil' Fairy Award - Setup Instructions

This application uses Supabase as its backend. To fix the 404 and 400 errors you're seeing, you need to properly configure your Supabase database.

## Required Database Setup

You need to run the following SQL commands in your Supabase SQL Editor to create the necessary tables and policies:

### 1. Database Tables and RLS Policies

```sql
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
```

### 2. How to Run the Setup

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to the "SQL Editor" tab
4. Paste the SQL commands above
5. Click "Run"

### 3. Verify Your Supabase Configuration

Make sure your Supabase URL and API key in `src/services/supabaseService.js` are correct:

```javascript
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';
```

## Common Issues and Solutions

### 404 Errors (teachers, classes endpoints)
- These are not actual API endpoints but direct Supabase table calls
- Ensure the tables exist in your database with the correct names
- Verify that Row Level Security policies are properly configured

### 400 Errors (classes)
- Usually indicates malformed requests or missing required fields
- Make sure your Supabase configuration matches the expected schema

### RLS Policy Errors (avatar upload)
- The error "new row violates row-level security policy" means your RLS policies are too restrictive
- Run the SQL commands above to set up proper policies
- Make sure the storage bucket and policies are correctly configured

## Additional Configuration

1. Ensure Auth is enabled in your Supabase project
2. Configure email authentication if using email/password login
3. Make sure your Supabase project allows the domain you're hosting on (for CORS)

After setting up the database properly, your application should work without the 404 and 400 errors.