-- ==========================================
-- 1. DROP EXISTING TABLES TO START FRESH
-- ==========================================
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.interviews CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.applicant_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ==========================================
-- 2. CREATE TABLES
-- ==========================================

-- Users table
CREATE TABLE public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    phone TEXT,
    role TEXT DEFAULT 'applicant',
    status TEXT DEFAULT 'active',
    permission_level TEXT,
    department TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Applicant Profiles table
CREATE TABLE public.applicant_profiles (
    user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT,
    bio TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    resume_url TEXT,
    resume_file_name TEXT,
    resume_uploaded_at TIMESTAMP WITH TIME ZONE,
    cover_letter_url TEXT,
    cover_letter_file_name TEXT,
    cover_letter_uploaded_at TIMESTAMP WITH TIME ZONE,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT
);

-- Jobs table
CREATE TABLE public.jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB DEFAULT '[]'::jsonb,
    department TEXT NOT NULL,
    location TEXT,
    location_type TEXT DEFAULT 'Remote',
    salary_min INTEGER DEFAULT 0,
    salary_max INTEGER DEFAULT 0,
    salary_currency TEXT DEFAULT 'USD',
    employment_type TEXT DEFAULT 'Full-time',
    deadline DATE,
    status TEXT DEFAULT 'published',
    posted_by_admin_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    posted_by_name TEXT,
    view_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Applications table
CREATE TABLE public.applications (
    id TEXT PRIMARY KEY,
    job_id TEXT REFERENCES public.jobs(id) ON DELETE CASCADE,
    applicant_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    cover_letter_url TEXT,
    cover_letter_file_name TEXT,
    resume_url TEXT,
    resume_file_name TEXT,
    status TEXT DEFAULT 'Applied',
    feedback TEXT,
    job_title TEXT,
    job_department TEXT,
    job_location TEXT,
    job_employment_type TEXT,
    applicant_name TEXT,
    applicant_email TEXT,
    applicant_phone TEXT,
    applicant_skills JSONB DEFAULT '[]'::jsonb,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Interviews table
CREATE TABLE public.interviews (
    id TEXT PRIMARY KEY,
    application_id TEXT REFERENCES public.applications(id) ON DELETE CASCADE,
    job_id TEXT REFERENCES public.jobs(id) ON DELETE CASCADE,
    applicant_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    scheduled_date DATE,
    scheduled_time TEXT,
    mode TEXT DEFAULT 'virtual',
    location_or_link TEXT,
    interviewer_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    interviewer_name TEXT,
    outcome TEXT DEFAULT 'Pending',
    notes TEXT,
    applicant_name TEXT,
    applicant_email TEXT,
    job_title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notifications table
CREATE TABLE public.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT,
    read_status BOOLEAN DEFAULT FALSE,
    related_job_id TEXT REFERENCES public.jobs(id) ON DELETE CASCADE,
    related_application_id TEXT REFERENCES public.applications(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. ENABLE ROW-LEVEL SECURITY & CREATE OPEN POLICIES
-- (This is the official Supabase way to allow public access)
-- ==========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.applicant_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on applicant_profiles" ON public.applicant_profiles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on jobs" ON public.jobs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on applications" ON public.applications FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on interviews" ON public.interviews FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 4. INSERT SUPER HR ADMIN ACCOUNT
-- ==========================================
-- Password is '123456'
INSERT INTO public.users (id, name, email, password, role, status, permission_level, department, avatar_url) 
VALUES (
    'usr_admin_123', 
    'Samuel Mensah', 
    'mensahsamuel3803@gmail.com', 
    '$2b$10$..nwxd6gS.0U9ahn7U2wVeFNKcBouWcyF28b1tXoqxOctUJ2BMezu', 
    'admin', 
    'active', 
    'super_admin', 
    'Human Resources', 
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
);
