import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getFinancialOverview } from '@/app/actions/finance';
import { getQuickInsight } from '@/app/actions/ai-advisor';
import { DashboardClient } from '@/components/dashboard-client';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Fetch data on the server (Rule: server-side-performance)
  const [initialData, quickInsight] = await Promise.all([
    getFinancialOverview(user.id),
    getQuickInsight()
  ]);

  // Get profile data for the greeting
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  return (
    <DashboardClient 
      initialData={initialData as any} 
      quickInsight={quickInsight}
      user={{
        id: user.id,
        full_name: profile?.full_name || user.user_metadata?.full_name || 'User'
      }} 
    />
  );
}
