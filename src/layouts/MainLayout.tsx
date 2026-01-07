import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRestaurantStore } from '@/store/restaurantStore';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';

export default function MainLayout() {
  const location = useLocation();
  const { user, isLoading, hasPermission } = useAuth();
  const settings = useRestaurantStore((state) => state.settings);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check route permission
  const currentPath = location.pathname.replace('/', '') || 'dashboard';
  const pathPermission = currentPath === '' ? 'dashboard' : currentPath;
  
  // Allow pos-users to access root (redirect to POS)
  if (!hasPermission(pathPermission) && pathPermission !== 'dashboard') {
    // Redirect to POS for pos_user role or dashboard for others
    return <Navigate to={hasPermission('pos') ? '/pos' : '/'} replace />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Header with Toggle */}
          <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
            <SidebarTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SidebarTrigger>
            <div className="flex-1">
              <h1 className="font-display font-bold lg:hidden">{settings.name}</h1>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
