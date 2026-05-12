-- Create note_folders table
CREATE TABLE IF NOT EXISTS public.note_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT 'blue',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on note_folders
ALTER TABLE public.note_folders ENABLE ROW LEVEL SECURITY;

-- Policies for note_folders
CREATE POLICY "Users can view own note folders" ON public.note_folders FOR SELECT TO authenticated USING (auth.uid()::uuid = user_id::uuid);
CREATE POLICY "Users can insert own note folders" ON public.note_folders FOR INSERT TO authenticated WITH CHECK (auth.uid()::uuid = user_id::uuid);
CREATE POLICY "Users can update own note folders" ON public.note_folders FOR UPDATE TO authenticated USING (auth.uid()::uuid = user_id::uuid) WITH CHECK (auth.uid()::uuid = user_id::uuid);
CREATE POLICY "Users can delete own note folders" ON public.note_folders FOR DELETE TO authenticated USING (auth.uid()::uuid = user_id::uuid);

-- Modify notes table to support Interactive UI
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.note_folders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS pos_x INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pos_y INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS linked_task_id TEXT REFERENCES public.tasks(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS linked_project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL;
