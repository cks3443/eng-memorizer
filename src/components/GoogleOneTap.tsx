'use client'

import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: () => void
          renderButton: (element: HTMLElement, config: any) => void
        }
      }
    }
  }
}

interface GoogleOneTapProps {
  className?: string
}

export function GoogleOneTap({ className }: GoogleOneTapProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Prevent multiple initializations
    if (isLoaded || window.google) return

    // Load Google One Tap script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    
    script.onload = () => {
      if (window.google && !isLoaded) {
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false,
          })

          // Only show prompt if not already shown
          setTimeout(() => {
            if (window.google) {
              window.google.accounts.id.prompt()
            }
          }, 1000)
          
          setIsLoaded(true)
        } catch (error) {
          console.error('Error initializing Google One Tap:', error)
        }
      }
    }

    document.head.appendChild(script)

    return () => {
      try {
        if (script.parentNode) {
          document.head.removeChild(script)
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }, [isLoaded])

  const handleCredentialResponse = async (response: any) => {
    try {
      // Use the credential response from Google One Tap
      await signIn('google', { 
        callbackUrl: '/',
        credential: response.credential 
      })
    } catch (error) {
      console.error('Error signing in:', error)
    }
  }

  return (
    <div className={className}>
      <div id="g_id_onload"
        data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        data-context="signin"
        data-ux_mode="popup"
        data-auto_prompt="false"
        data-use_fedcm_for_prompt="false">
      </div>
    </div>
  )
}
