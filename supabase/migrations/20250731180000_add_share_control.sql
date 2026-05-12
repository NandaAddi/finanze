-- Add is_public column to projects if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'is_public') THEN
        ALTER TABLE public.projects ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update projects RLS to allow public access when is_public is true
-- We use a separate policy for public access (no TO authenticated)
DROP POLICY IF EXISTS "public_projects_select" ON public.projects;
CREATE POLICY "public_projects_select"
    ON public.projects
    FOR SELECT
    USING (is_public = true);

-- Update columns RLS to allow public access when project is public
DROP POLICY IF EXISTS "public_columns_select" ON public.columns;
CREATE POLICY "public_columns_select"
    ON public.columns
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id::text = columns.project_id::text 
            AND projects.is_public = true
        )
    );

-- Update tasks RLS to allow public access when project is public
DROP POLICY IF EXISTS "public_tasks_select" ON public.tasks;
CREATE POLICY "public_tasks_select"
    ON public.tasks
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.columns 
            JOIN public.projects ON projects.id::text = columns.project_id::text
            WHERE columns.id::text = tasks.column_id::text 
            AND projects.is_public = true
        )
    );
