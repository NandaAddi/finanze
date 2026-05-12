import { createClient } from '@/utils/supabase/server';
import { AppSidebar } from './app-sidebar';
import { redirect } from 'next/navigation';

export async function AppSidebarServer() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get profile for the sidebar
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, email')
    .eq('id', user.id)
    .single();

  const userData = {
    name: profile?.full_name || user.user_metadata?.full_name || user.email || 'User',
    email: profile?.email || user.email || '',
    avatar: profile?.avatar_url || user.user_metadata?.avatar_url || '',
  };

  return <AppSidebar initialUser={userData} />;
}
