-- Create tables
CREATE TABLE teachers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_selection VARCHAR(10) DEFAULT '🧙',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES teachers(id),
    class_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID REFERENCES classes(id),
    student_name VARCHAR(255) NOT NULL,
    student_number VARCHAR(50) UNIQUE NOT NULL,
    strength_points INTEGER DEFAULT 0,
    need_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID REFERENCES classes(id),
    title VARCHAR(255) NOT NULL,
    point_type VARCHAR(50) DEFAULT 'strength',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE points_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    task_id UUID REFERENCES tasks(id),
    class_id UUID REFERENCES classes(id),
    point_type VARCHAR(50) NOT NULL,
    reward_type VARCHAR(100) DEFAULT 'Award',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    awarded_by UUID REFERENCES teachers(id)
);

-- Enable Row Level Security
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Teachers can view their own data" ON teachers
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Teachers can insert their own data" ON teachers
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Teachers can view their own classes" ON classes
    FOR SELECT TO authenticated
    USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert their own classes" ON classes
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can view classes they own" ON students
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM classes
        WHERE classes.id = students.class_id
        AND classes.teacher_id = auth.uid()
    ));

CREATE POLICY "Teachers can insert students in their classes" ON students
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM classes
        WHERE classes.id = students.class_id
        AND classes.teacher_id = auth.uid()
    ));

CREATE POLICY "Teachers can view tasks in their classes" ON tasks
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM classes
        WHERE classes.id = tasks.class_id
        AND classes.teacher_id = auth.uid()
    ));

CREATE POLICY "Teachers can insert tasks in their classes" ON tasks
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM classes
        WHERE classes.id = tasks.class_id
        AND classes.teacher_id = auth.uid()
    ));

CREATE POLICY "Teachers can view points for students in their classes" ON points_log
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM students
        WHERE students.id = points_log.student_id
        AND EXISTS (
            SELECT 1 FROM classes
            WHERE classes.id = students.class_id
            AND classes.teacher_id = auth.uid()
        )
    ));

CREATE POLICY "Teachers can insert points for students in their classes" ON points_log
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM students
        WHERE students.id = points_log.student_id
        AND EXISTS (
            SELECT 1 FROM classes
            WHERE classes.id = students.class_id
            AND classes.teacher_id = auth.uid()
        )
    ));

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for avatars bucket
CREATE POLICY "Public access for avatars bucket" ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can update their avatars" ON storage.objects FOR UPDATE TO authenticated
    WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can delete their avatars" ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'avatars');