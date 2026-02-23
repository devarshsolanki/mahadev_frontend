import { Suspense } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Settings, Loader2, Calendar } from 'lucide-react';
import { AdminErrorBoundary } from './AdminErrorBoundary';

const AdminLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const links = [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/products', icon: Package, label: 'Products' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { href: '/admin/subscriptions/active', icon: Calendar, label: 'Active Subscriptions' },
    // { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Mobile header */}
      <div className="md:hidden border-b sticky top-0 bg-background z-20">
        <div className="flex items-center gap-4 p-4">
          <h2 className="font-semibold">Admin Panel</h2>
          <nav className="flex items-center gap-4">
            {links.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                to={href}
                className={`p-2 rounded-md transition-colors ${isActive(href)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span className="sr-only">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Layout wrapper: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Relative positioning on desktop */}
        <aside className="hidden md:flex md:flex-col w-64 bg-muted/30 border-r flex-shrink-0">
          <div className="p-6">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">Manage your store</p>
          </div>
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {links.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${isActive(href)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content area - Takes remaining space */}
        <main className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <AdminErrorBoundary>
                <Suspense
                  fallback={
                    <div className="flex min-h-[400px] items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  }
                >
                  <Outlet />
                </Suspense>
              </AdminErrorBoundary>
            </div>
          </div>

          {/* Footer - Fixed at bottom of main content */}
          <footer className="border-t bg-muted/30 flex-shrink-0">
            <div className="p-4 text-center text-sm text-muted-foreground">
              <p>&copy; 2026 Admin Dashboard. All rights reserved.</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;