import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';


interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Overview',
      href: '/admin/access-codes',
      active: pathname === '/admin/access-codes',
    },
    {
      name: 'Analytics',
      href: '/admin/access-codes/analytics',
      active: pathname === '/admin/access-codes/analytics',
    },
    {
      name: 'Debug',
      href: '/admin/access-codes/debug',
      active: pathname === '/admin/access-codes/debug',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">Admin Dashboard</span>
            </Link>
          </div>
          <div>
      
          </div>
        </div>
      </header>
      <div className="container pt-6 pb-16 flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="sticky top-24 z-30 h-[calc(100vh-6rem)] w-full shrink-0 md:block">
          <div className="h-full py-4 pr-6">
            <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
              <h3 className="mb-3 text-sm font-medium text-gray-500">Navigation</h3>
              <nav className="flex flex-col space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      item.active
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden py-4">
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 