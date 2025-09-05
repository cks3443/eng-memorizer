'use client'

import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import * as Headless from '@headlessui/react'
import Link from 'next/link'
import clsx from 'clsx'
import { useToast } from './ToastProvider'

interface SidebarLayoutProps {
  children: React.ReactNode
  title?: string
}

// Simple Badge component
function Badge({ children, color = 'zinc', className }: { children: React.ReactNode; color?: string; className?: string }) {
  const colorClasses = {
    green: 'bg-green-500/15 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    zinc: 'bg-zinc-600/10 text-zinc-700 dark:bg-white/5 dark:text-zinc-400'
  }
  
  return (
    <span className={clsx(
      'inline-flex items-center gap-x-1.5 rounded-md px-1.5 py-0.5 text-sm/5 font-medium sm:text-xs/5',
      colorClasses[color as keyof typeof colorClasses] || colorClasses.zinc,
      className
    )}>
      {children}
    </span>
  )
}

// Simple Avatar component
function Avatar({ src, initials, className }: { src?: string | null; initials?: string; className?: string }) {
  return (
    <div className={clsx('relative inline-flex items-center justify-center rounded-full bg-zinc-500 text-white font-medium', className)}>
      {src ? (
        <img src={src} alt="" className="w-full h-full rounded-full object-cover" />
      ) : (
        <span className="text-sm">{initials || 'U'}</span>
      )}
    </div>
  )
}

function OpenMenuIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M2 6.75C2 6.33579 2.33579 6 2.75 6H17.25C17.6642 6 18 6.33579 18 6.75C18 7.16421 17.6642 7.5 17.25 7.5H2.75C2.33579 7.5 2 7.16421 2 6.75ZM2 13.25C2 12.8358 2.33579 12.5 2.75 12.5H17.25C17.6642 12.5 18 12.8358 18 13.25C18 13.6642 17.6642 14 17.25 14H2.75C2.33579 14 2 13.6642 2 13.25Z" />
    </svg>
  )
}

function CloseMenuIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  )
}

function MobileSidebar({ open, close, children }: React.PropsWithChildren<{ open: boolean; close: () => void }>) {
  return (
    <Headless.Dialog open={open} onClose={close} className="lg:hidden">
      <Headless.DialogBackdrop
        transition
        className="fixed inset-0 bg-black/30 transition data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />
      <Headless.DialogPanel
        transition
        className="fixed inset-y-0 w-full max-w-80 p-2 transition duration-300 ease-in-out data-closed:-translate-x-full"
      >
        <div className="flex h-full flex-col rounded-lg bg-white shadow-xs ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <div className="-mb-3 px-4 pt-3">
            <Headless.CloseButton className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium text-zinc-950 dark:text-white hover:bg-zinc-950/5 dark:hover:bg-white/5" aria-label="Close navigation">
              <CloseMenuIcon />
            </Headless.CloseButton>
          </div>
          {children}
        </div>
      </Headless.DialogPanel>
    </Headless.Dialog>
  )
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children, title = 'English Memorizer' }) => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { showToast } = useToast()
  const hasShownWelcome = useRef(false)
  const [showSidebar, setShowSidebar] = useState(false)

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

  const sidebarContent = (
    <nav 
      id="sidebar-navigation"
      data-component="sidebar"
      className="flex h-full min-h-0 flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700"
    >
      {/* Header */}
      <div 
        id="sidebar-header"
        data-component="sidebar-header"
        className="flex flex-col border-b border-zinc-950/5 p-4 dark:border-white/5"
      >
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl">🧠</span>
          <span className="font-bold text-lg text-zinc-900 dark:text-white">English Memorizer</span>
        </Link>
      </div>

      {/* Body */}
      <div 
        id="sidebar-body"
        data-component="sidebar-body"
        className="flex flex-1 flex-col overflow-y-auto p-4"
      >
        <div 
          id="navigation-menu"
          data-component="navigation-menu"
          className="flex flex-col gap-0.5"
        >
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-item-${index}`}
              data-component="nav-item"
              data-href={item.href}
              data-label={item.label}
              data-current={router.pathname === item.href}
              className={clsx(
                'flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium sm:py-2 sm:text-sm/5',
                'hover:bg-zinc-950/5 dark:hover:bg-white/5',
                router.pathname === item.href
                  ? 'bg-zinc-950/5 text-zinc-950 dark:bg-white/5 dark:text-white'
                  : 'text-zinc-700 dark:text-zinc-300'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
        
        <div 
          id="sidebar-spacer"
          data-component="sidebar-spacer"
          className="mt-8 flex-1" 
        />
      </div>

      {/* Footer */}
      <div 
        id="sidebar-footer"
        data-component="sidebar-footer"
        className="flex flex-col border-t border-zinc-950/5 p-4 dark:border-white/5"
      >
        {status === 'loading' ? (
          <div 
            id="user-loading"
            data-component="user-loading"
            className="flex items-center gap-3 px-2 py-2.5"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse mb-1" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-2/3" />
            </div>
          </div>
        ) : session?.user ? (
          <div 
            id="user-authenticated"
            data-component="user-authenticated"
            data-user-email={session.user.email}
            data-user-name={session.user.name}
          >
            <div 
              id="user-status-badges"
              data-component="user-status-badges"
              className="flex items-center justify-between mb-2"
            >
              <Badge color="green" className="text-xs">
                온라인
              </Badge>
              <Badge color="green" className="text-xs">
                활성
              </Badge>
            </div>
            <Headless.Menu as="div" className="relative">
              <Headless.MenuButton 
                id="user-menu-button"
                data-component="user-menu-button"
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium text-zinc-950 dark:text-white hover:bg-zinc-950/5 dark:hover:bg-white/5"
              >
                <Avatar 
                  src={session.user.image} 
                  initials={getUserInitials(session.user.name)}
                  className="w-8 h-8"
                />
                <div className="flex flex-col text-left min-w-0 flex-1">
                  <span className="font-medium text-zinc-900 dark:text-white text-sm truncate">
                    {session.user.name}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {session.user.email}
                  </span>
                </div>
              </Headless.MenuButton>
              <Headless.MenuItems 
                id="user-dropdown-menu"
                data-component="user-dropdown-menu"
                className="absolute bottom-full left-0 mb-2 w-56 origin-bottom-left rounded-md bg-white dark:bg-zinc-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <Headless.MenuItem>
                  <div 
                    id="user-profile-info"
                    data-component="user-profile-info"
                    className="flex items-center gap-3 px-4 py-2"
                  >
                    <Avatar 
                      src={session.user.image} 
                      initials={getUserInitials(session.user.name)}
                      className="w-10 h-10"
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
                </Headless.MenuItem>
                <hr className="my-1 border-zinc-200 dark:border-zinc-600" />
                <Headless.MenuItem>
                  {({ focus }) => (
                    <button
                      id="logout-button"
                      data-component="logout-button"
                      onClick={handleSignOut}
                      className={clsx(
                        'flex w-full items-center gap-2 px-4 py-2 text-sm',
                        focus ? 'bg-zinc-100 dark:bg-zinc-700' : '',
                        'text-red-600 dark:text-red-400'
                      )}
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      로그아웃
                    </button>
                  )}
                </Headless.MenuItem>
              </Headless.MenuItems>
            </Headless.Menu>
          </div>
        ) : (
          <div 
            id="user-unauthenticated"
            data-component="user-unauthenticated"
          >
            <div className="flex items-center justify-center mb-2">
              <Badge color="zinc" className="text-xs">
                오프라인
              </Badge>
            </div>
            <Link
              id="login-link"
              data-component="login-link"
              href="/login"
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium text-zinc-950 dark:text-white hover:bg-zinc-950/5 dark:hover:bg-white/5"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              로그인
            </Link>
          </div>
        )}
      </div>
    </nav>
  )

  const navbarContent = (
    <div className="flex items-center space-x-2">
      <span className="text-xl">🧠</span>
      <span className="font-bold text-lg text-zinc-900 dark:text-white">English Memorizer</span>
      {session?.user && (
        <div className="ml-auto flex items-center gap-2">
          <Badge color="green" className="text-xs">
            온라인
          </Badge>
        </div>
      )}
    </div>
  )

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="English sentence memorization app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative isolate flex min-h-svh w-full bg-white max-lg:flex-col lg:bg-zinc-100 dark:bg-zinc-900 dark:lg:bg-zinc-950">
        {/* Sidebar on desktop */}
        <div className="fixed inset-y-0 left-0 w-64 max-lg:hidden">{sidebarContent}</div>

        {/* Sidebar on mobile */}
        <MobileSidebar open={showSidebar} close={() => setShowSidebar(false)}>
          {sidebarContent}
        </MobileSidebar>

        {/* Navbar on mobile */}
        <header className="flex items-center px-4 lg:hidden">
          <div className="py-2.5">
            <button 
              onClick={() => setShowSidebar(true)} 
              aria-label="Open navigation"
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium text-zinc-950 dark:text-white hover:bg-zinc-950/5 dark:hover:bg-white/5"
            >
              <OpenMenuIcon />
            </button>
          </div>
          <div className="min-w-0 flex-1">{navbarContent}</div>
        </header>

        {/* Content */}
        <main 
          id="main-content"
          data-component="main-section"
          className="flex flex-1 flex-col lg:min-w-0 lg:pl-64"
        >
          <div 
            id="content-wrapper"
            data-component="content-wrapper"
            className="grow lg:bg-white lg:shadow-xs lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:ring-white/10"
          >
            <div 
              id="content-container"
              data-component="content-container"
              data-max-width="6xl"
              className="mx-auto max-w-6xl"
            >
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default SidebarLayout
