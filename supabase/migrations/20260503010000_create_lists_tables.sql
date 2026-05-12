-- Create checklists table
CREATE TABLE IF NOT EXISTS public.checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'indigo',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create checklist_items table
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_checklists_user_id ON public.checklists(user_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON public.checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_position ON public.checklist_items(checklist_id, position);

-- Enable Row Level Security
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: checklists (user can only access their own)
CREATE POLICY "checklists_select_own"
  ON public.checklists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "checklists_insert_own"
  ON public.checklists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "checklists_update_own"
  ON public.checklists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "checklists_delete_own"
  ON public.checklists FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies: checklist_items (inherit via checklist ownership)
CREATE POLICY "checklist_items_select_own"
  ON public.checklist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.checklists
      WHERE checklists.id = checklist_items.checklist_id
        AND checklists.user_id = auth.uid()
    )
  );

CREATE POLICY "checklist_items_insert_own"
  ON public.checklist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.checklists
      WHERE checklists.id = checklist_items.checklist_id
        AND checklists.user_id = auth.uid()
    )
  );

CREATE POLICY "checklist_items_update_own"
  ON public.checklist_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.checklists
      WHERE checklists.id = checklist_items.checklist_id
        AND checklists.user_id = auth.uid()
    )
  );

CREATE POLICY "checklist_items_delete_own"
  ON public.checklist_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.checklists
      WHERE checklists.id = checklist_items.checklist_id
        AND checklists.user_id = auth.uid()
    )
  );
