'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import CookieConsent from 'react-cookie-consent'

interface GoogleAnalyticsComponentProps {
  gaId: string
}

export function GoogleAnalyticsComponent({ gaId }: GoogleAnalyticsComponentProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [cookieAccepted, setCookieAccepted] = useState(false)

  useEffect(() => {
    // Check if cookies were already accepted
    const consent = localStorage.getItem('cookieConsent')
    if (consent === 'true') {
      setCookieAccepted(true)
    }
  }, [])

  useEffect(() => {
    if (cookieAccepted && typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', gaId, {
        page_path: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''),
      })
    }
  }, [pathname, searchParams, gaId, cookieAccepted])

  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true')
    setCookieAccepted(true)
  }

  const handleDeclineCookies = () => {
    localStorage.setItem('cookieConsent', 'false')
    setCookieAccepted(false)
    // Disable Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      })
    }
  }

  return (
    <>
      {cookieAccepted && <GoogleAnalytics gaId={gaId} />}
      <CookieConsent
        location="bottom"
        buttonText="Accept All Cookies"
        declineButtonText="Decline"
        enableDeclineButton
        onAccept={handleAcceptCookies}
        onDecline={handleDeclineCookies}
        style={{
          background: "rgba(0, 0, 0, 0.95)",
          color: "#fff",
          fontSize: "14px",
          textAlign: "left",
          padding: "20px",
        }}
        buttonStyle={{
          backgroundColor: "#22c55e",
          color: "#fff",
          fontSize: "14px",
          borderRadius: "6px",
          padding: "10px 20px",
          border: "none",
          cursor: "pointer",
        }}
        declineButtonStyle={{
          backgroundColor: "transparent",
          color: "#94a3b8",
          fontSize: "14px",
          borderRadius: "6px",
          padding: "10px 20px",
          border: "1px solid #94a3b8",
          cursor: "pointer",
          marginRight: "10px",
        }}
        expires={365}
        cookieName="ganzafrica-cookie-consent"
      >
        We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
        By clicking "Accept All Cookies", you consent to our use of cookies. You can manage your preferences or
        learn more about our cookie policy in our{" "}
        <a href="/privacy-policy" style={{ color: "#22c55e", textDecoration: "underline" }}>
          Privacy Policy
        </a>.
      </CookieConsent>
    </>
  )
}

// Event tracking utilities
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters)
  }
}

export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
      page_path: url,
      page_title: title,
    })
  }
}

export const trackVideoEvent = (action: 'play' | 'pause' | 'complete', videoTitle: string, progress?: number) => {
  trackEvent('video_' + action, {
    video_title: videoTitle,
    video_progress: progress,
    content_type: 'video',
  })
}

export const trackDownload = (fileName: string, fileType: string) => {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType,
  })
}

export const trackFormSubmission = (formName: string, success: boolean = true) => {
  trackEvent('form_submit', {
    form_name: formName,
    success: success,
  })
}

export const trackOutboundLink = (url: string, linkText?: string) => {
  trackEvent('click', {
    link_url: url,
    link_text: linkText,
    outbound: true,
  })
}

export const trackSearch = (searchTerm: string, resultsCount?: number) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  })
}

export const trackNewsArticleView = (articleTitle: string, category?: string) => {
  trackEvent('view_item', {
    item_name: articleTitle,
    item_category: category || 'news',
    content_type: 'article',
  })
}

export const trackProgramView = (programName: string, programType?: string) => {
  trackEvent('view_item', {
    item_name: programName,
    item_category: programType || 'program',
    content_type: 'program',
  })
}

export const trackJobApplicationStart = (jobTitle: string, jobId: string) => {
  trackEvent('begin_checkout', {
    item_name: jobTitle,
    item_id: jobId,
    content_type: 'job_application',
  })
}

export const trackJobApplicationComplete = (jobTitle: string, jobId: string) => {
  trackEvent('purchase', {
    item_name: jobTitle,
    item_id: jobId,
    content_type: 'job_application',
    value: 1,
  })
}

// Type declaration for gtag
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, any>) => void
  }
}