import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '@/components/Layout'
import { Providers } from '@/components/Providers'
import { useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('[ENV] NEXT_PUBLIC_GOOGLE_CLIENT_ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '(undefined)')
    }
  }, [])
  return (
    <Providers>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Providers>
  )
}
