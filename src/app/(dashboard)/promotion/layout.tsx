'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PromotionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    { name: '📊 Dashboard', href: '/promotion' },
    { name: '📜 History', href: '/promotion/promtion/history' },
    { name: 'Promotion', href: '/promotion/promtion' },
    { name: 'Student', href: '/promotion/student' },
    { name: 'Student Promotion', href: '/promotion/studentpromtion' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Promotion Panel</h2>
        <nav className="space-y-2 flex flex-col">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`p-2 rounded font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-blue-50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}