'use client'

import React, { useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '../../sample/navbar'
import { Avatar, AvatarButton } from '../../sample/avatar'
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem, DropdownDivider } from '../../sample/dropdown'
import { NavbarDivider } from '../../sample/navbar'
import { Badge } from '../../sample/badge'
import { Link } from '../../sample/link'
import { useToast } from './ToastProvider'

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'English Memorizer' }) => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { showToast } = useToast()
  const hasShownWelcome = useRef(false)

  const navItems = [
    { href: '/', label: 'Study', icon: '📚' },
    { href: '/sentences', label: 'Sentences', icon: '📝' },
    { href: '/stats', label: 'Statistics', icon: '📊' },
  ]

  // Show welcome toast when user first logs in
  useEffect(() => {
    if (session?.user && !hasShownWelcome.current && router.pathname === '/') {
      hasShownWelcome.current = true
      showToast({
        type: 'success',
        title: `환영합니다, ${session.user.name}님!`,
        description: 'English Memorizer에 성공적으로 로그인하셨습니다.',
        duration: 4000
      })
    }
  }, [session, router.pathname, showToast])

  const handleSignOut = async () => {
    showToast({
      type: 'info',
      title: '로그아웃 완료',
      description: '안전하게 로그아웃되었습니다.',
      duration: 2000
    })
    await signOut({ callbackUrl: '/login' })
  }

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
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
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </NavbarItem>
              ))}
            </NavbarSection>

            <NavbarSpacer />

            {status === 'loading' ? (
              <NavbarSection>
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
              </NavbarSection>
            ) : session?.user ? (
              <NavbarSection>
                <Badge color="green" className="hidden sm:inline-flex">
                  온라인
                </Badge>
                <NavbarDivider className="hidden sm:block" />
                <Dropdown>
                  <DropdownButton as={AvatarButton} 
                    src={session.user.image} 
                    initials={getUserInitials(session.user.name)}
                    className="size-8"
                  />
                  <DropdownMenu>
                    <DropdownItem>
                      <div className="flex items-center gap-3">
                        <Avatar 
                          src={session.user.image} 
                          initials={getUserInitials(session.user.name)}
                          className="size-10"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {session.user.name}
                          </span>
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            {session.user.email}
                          </span>
                        </div>
                      </div>
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">상태</span>
                        <Badge color="green" className="text-xs">
                          활성
                        </Badge>
                      </div>
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem onClick={handleSignOut}>
                      <div className="flex items-center gap-2">
                        <svg className="size-4 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        <span className="text-red-600 dark:text-red-400">로그아웃</span>
                      </div>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </NavbarSection>
            ) : (
              <NavbarSection>
                <Badge color="zinc" className="hidden sm:inline-flex">
                  오프라인
                </Badge>
                <NavbarDivider className="hidden sm:block" />
                <Link href="/login" className="text-sm font-medium text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  로그인
                </Link>
              </NavbarSection>
            )}
          </Navbar>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

export default Layout
