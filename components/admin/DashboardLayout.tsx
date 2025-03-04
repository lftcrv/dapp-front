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
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 mt-24">
        <div className="py-6 flex flex-col md:flex-row md:gap-8 lg:gap-10">
          <aside className="w-full md:w-[220px] lg:w-[240px] flex-shrink-0">
            <div className="sticky top-24">
              <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
                <h3 className="mb-3 text-sm font-medium text-gray-500">
                  Navigation
                </h3>
                <nav className="flex flex-col space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        item.active
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
