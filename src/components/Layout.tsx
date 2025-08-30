'use client'

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '../../sample-components/button';
import { Navbar, NavbarSection, NavbarItem, NavbarSpacer } from '../../sample-components/navbar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'English Memorizer' }) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const navItems = [
    { href: '/', label: 'Study', icon: '📚' },
    { href: '/sentences', label: 'Sentences', icon: '📝' },
    { href: '/stats', label: 'Statistics', icon: '📊' },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  // Show login page navigation if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-950 dark:border-white"></div>
      </div>
    );
  }

  if (!session && router.pathname !== '/login') {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <Head>
          <title>{title}</title>
          <meta name="description" content="English sentence memorization app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Head>
        <title>{title}</title>
        <meta name="description" content="English sentence memorization app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Navbar>
            <NavbarSection>
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl">🧠</span>
                <span className="font-bold text-xl text-zinc-900 dark:text-white">English Memorizer</span>
              </Link>
            </NavbarSection>

            <NavbarSpacer />

            <NavbarSection>
              {navItems.map((item) => (
                <NavbarItem 
                  key={item.href} 
                  href={item.href}
                  current={router.pathname === item.href}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </NavbarItem>
              ))}
            </NavbarSection>

            {session && (
              <NavbarSpacer />
            )}

            {session && (
              <NavbarSection>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {session.user?.email}
                  </div>
                  <Button 
                    onClick={handleLogout}
                    color="red"
                    className="text-sm"
                  >
                    로그아웃
                  </Button>
                </div>
              </NavbarSection>
            )}
          </Navbar>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
