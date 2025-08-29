import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'English Memorizer' }) => {
  const router = useRouter();

  const navItems = [
    { href: '/', label: 'Study', icon: '📚' },
    { href: '/sentences', label: 'Sentences', icon: '📝' },
    { href: '/stats', label: 'Statistics', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{title}</title>
        <meta name="description" content="English sentence memorization app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl">🧠</span>
                <span className="font-bold text-xl text-gray-900">English Memorizer</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    router.pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
