import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import SidebarLayout from '@/components/SidebarLayout'
import { Providers } from '@/components/Providers'
import { useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('[ENV] NEXT_PUBLIC_GOOGLE_CLIENT_ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '(undefined)')
    }
  }, [])
  
  return (
    <Providers session={pageProps.session}>
      <SidebarLayout>
        <Component {...pageProps} />
      </SidebarLayout>
    </Providers>
  )
}
