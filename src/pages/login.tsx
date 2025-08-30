'use client'

import { signIn, useSession } from 'next-auth/react'
import { Button } from '../../sample-components/button'
import { AuthLayout } from '../../sample-components/auth-layout'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { GoogleOneTap } from '../components/GoogleOneTap'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-950 dark:border-white"></div>
        </div>
      </AuthLayout>
    )
  }

  if (session) {
    return null
  }

  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/' })
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-zinc-950 dark:text-white">
            English Memorizer
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            로그인하여 영어 학습을 시작하세요
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleGoogleSignIn}
            className="w-full" 
            color="indigo"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 로그인
          </Button>
          
          <GoogleOneTap className="mt-4" />
          
          <div className="text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              로그인하면 서비스 약관 및 개인정보 처리방침에 동의하게 됩니다.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
