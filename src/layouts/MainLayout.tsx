import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Package,
  BookOpen,
  FileText,
  Settings,
  ChefHat,
  AlertTriangle,
} from 'lucide-react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'POS', href: '/pos', icon: ShoppingCart },
  { name: 'Menu Items', href: '/menu', icon: UtensilsCrossed },
  { name: 'Ingredients', href: '/ingredients', icon: Package },
  { name: 'Recipes', href: '/recipes', icon: BookOpen },
  { name: 'Stock', href: '/stock', icon: ChefHat },
  { name: 'Orders', href: '/orders', icon: FileText },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function MainLayout() {
  const location = useLocation();
  const getLowStockAlerts = useRestaurantStore((state) => state.getLowStockAlerts);
  const lowStockAlerts = getLowStockAlerts();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 lg:flex lg:flex-col" style={{ background: 'var(--gradient-sidebar)' }}>
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <ChefHat className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-sidebar-accent-foreground">Pakistani Dhaba</h1>
            <p className="text-xs text-sidebar-foreground/60">Restaurant POS</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  'sidebar-nav-item',
                  isActive && 'active'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                {item.href === '/stock' && lowStockAlerts.length > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                    {lowStockAlerts.length}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Low Stock Alert Footer */}
        {lowStockAlerts.length > 0 && (
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <div className="flex-1">
                <p className="text-xs font-medium text-destructive">Low Stock Alert</p>
                <p className="text-xs text-sidebar-foreground/60">{lowStockAlerts.length} items below threshold</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-6 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ChefHat className="h-5 w-5" />
          </div>
          <h1 className="font-display font-bold">Pakistani Dhaba</h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
