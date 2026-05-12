-- Create note_connections table for mind map edges
CREATE TABLE IF NOT EXISTS public.note_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_note_id TEXT NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    target_note_id TEXT NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(source_note_id, target_note_id)
);

-- Enable RLS
ALTER TABLE public.note_connections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own note connections" ON public.note_connections FOR SELECT TO authenticated USING (auth.uid()::uuid = user_id::uuid);
CREATE POLICY "Users can insert own note connections" ON public.note_connections FOR INSERT TO authenticated WITH CHECK (auth.uid()::uuid = user_id::uuid);
CREATE POLICY "Users can delete own note connections" ON public.note_connections FOR DELETE TO authenticated USING (auth.uid()::uuid = user_id::uuid);
