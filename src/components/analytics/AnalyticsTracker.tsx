'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function TrackerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string>('');

  useEffect(() => {
    // Avoid double tracking on mount/rerender
    const currentPath = pathname + (searchParams?.toString() || '');
    if (lastTrackedPath.current === currentPath) return;
    lastTrackedPath.current = currentPath;

    // Skip tracking admin pages and API routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
      return;
    }

    // Retrieve or create persistent visitorId
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      localStorage.setItem('visitor_id', visitorId);
    }

    // Retrieve or create session-specific sessionId
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = 's_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      sessionStorage.setItem('session_id', sessionId);
    }

    // Detect device type
    const ua = navigator.userAgent;
    let device: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
      if (/iPad|tablet/i.test(ua)) {
        device = 'tablet';
      } else {
        device = 'mobile';
      }
    }

    // Detect browser
    let browser = 'Other';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    else if (ua.includes('Trident') || ua.includes('MSIE')) browser = 'Internet Explorer';
    else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    const payload = {
      visitorId,
      sessionId,
      pageUrl: window.location.href,
      pageTitle: document.title || 'Portfolio Page',
      referrer: document.referrer || '',
      device,
      browser,
      userAgent: ua,
    };

    const trackUrl = '/api/analytics/track';

    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(trackUrl, blob);
    } else {
      fetch(trackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch((err) => {
        console.warn('Analytics tracking fetch error:', err);
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerContent />
    </Suspense>
  );
}
