'use client';

import Script from 'next/script';

/**
 * Google Tag Manager + GA4 injection component.
 * Reads GTM Container ID from NEXT_PUBLIC_GTM_ID env variable.
 * Renders nothing if the env var is not set (dev/test environments).
 */
export function GoogleAnalytics() {
    const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

    if (!gtmId) return null;

    return (
        <>
            {/* GTM Head Script */}
            <Script
                id="gtm-script"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                        })(window,document,'script','dataLayer','${gtmId}');
                    `,
                }}
            />
            {/* GTM NoScript Fallback (for users with JS disabled) */}
            <noscript>
                <iframe
                    src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                    height="0"
                    width="0"
                    style={{ display: 'none', visibility: 'hidden' }}
                />
            </noscript>
        </>
    );
}
