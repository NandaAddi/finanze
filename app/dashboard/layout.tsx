import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebarServer } from '@/components/app-sidebar-server';
import { GlobalSearch } from '@/components/global-search';
import { GlobalUI } from '@/components/global-ui';
import { ModeToggle } from '@/components/mode-toggle';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-muted/20 dark:bg-black/20">
        <AppSidebarServer />
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <div className="flex-1 overflow-auto bg-background transition-all duration-300">
            {/* Header / Top Bar */}
            <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-border/10 shrink-0 sticky top-0 bg-background/80 backdrop-blur-md z-20">
              <div className="flex items-center flex-1 max-w-xl">
                <GlobalSearch />
              </div>
              <div className="flex items-center gap-2">
                <ModeToggle />
                <div className="lg:hidden">
                  <SidebarTrigger />
                </div>
              </div>
            </header>

            <div className="p-6 lg:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Global Mobile Components (Client-side) */}
      <GlobalUI />
    </SidebarProvider>
  );
}
