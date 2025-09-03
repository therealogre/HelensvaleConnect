import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'Helensvale Connect - Zimbabwe\'s Premier Service Marketplace',
  description = 'Find, book & pay for trusted local services in Zimbabwe. Support ZiG currency, PayNow & EcoCash. 2000+ verified vendors across Harare, Bulawayo & more.',
  keywords = 'Zimbabwe services, local services Zimbabwe, ZiG currency, PayNow, EcoCash, Harare services, Bulawayo services, service marketplace Zimbabwe, home services Zimbabwe, professional services Zimbabwe',
  canonical,
  image = '/images/helensvale-connect-og.jpg',
  type = 'website',
  structuredData,
  noIndex = false,
}) => {
  const siteUrl = 'https://helensvaleconnect.art';
  const fullUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;
  const fullImageUrl = `${siteUrl}${image}`;

  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Helensvale Connect',
    description: 'Zimbabwe\'s Premier Service Marketplace',
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+263-77-123-4567',
      contactType: 'customer service',
      availableLanguage: ['English', 'Shona'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ZW',
      addressRegion: 'Harare',
    },
    sameAs: [
      'https://facebook.com/helensvaleconnect',
      'https://twitter.com/helensvaleconnect',
      'https://linkedin.com/company/helensvaleconnect',
    ],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {canonical && <link rel="canonical" href={fullUrl} />}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Helensvale Connect" />
      <meta property="og:locale" content="en_ZW" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@helensvaleconnect" />

      {/* Additional SEO Meta Tags */}
      <meta name="author" content="Helensvale Connect" />
      <meta name="publisher" content="Helensvale Connect" />
      <meta name="copyright" content="© 2024 Helensvale Connect" />
      <meta name="language" content="English" />
      <meta name="geo.region" content="ZW" />
      <meta name="geo.country" content="Zimbabwe" />
      <meta name="geo.placename" content="Zimbabwe" />

      {/* Mobile & Responsive */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      
      {/* DNS Prefetch for performance */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
    </Helmet>
  );
};

// SEO Hook for dynamic content
export const useSEO = (seoData) => {
  return <SEO {...seoData} />;
};

// Predefined SEO configurations for common pages
export const SEOConfigs = {
  home: {
    title: 'Helensvale Connect - Zimbabwe\'s #1 Service Marketplace | ZiG, PayNow & EcoCash',
    description: 'Find & book trusted local services in Zimbabwe. 2000+ verified vendors, ZiG currency support, PayNow & EcoCash payments. Home services, automotive, beauty & more.',
    keywords: 'Zimbabwe services, ZiG currency, PayNow Zimbabwe, EcoCash payments, local services Harare, Bulawayo services, home services Zimbabwe, service marketplace',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Helensvale Connect',
      url: 'https://helensvaleconnect.art',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://helensvaleconnect.art/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  },
  
  vendors: {
    title: 'Find Trusted Service Providers in Zimbabwe | Helensvale Connect',
    description: 'Browse 2000+ verified service providers across Zimbabwe. Home services, automotive, beauty, professional services. All accept ZiG, PayNow & EcoCash.',
    keywords: 'Zimbabwe service providers, verified vendors Zimbabwe, home services Harare, plumbers Zimbabwe, electricians Bulawayo, beauty salons Zimbabwe',
  },
  
  pricing: {
    title: 'Pricing Plans for Zimbabwe Businesses | Start from ZiG 79/month',
    description: 'Affordable pricing for Zimbabwe businesses. Founder pricing available - save up to 60%. ZiG currency supported. Start your free trial today.',
    keywords: 'Zimbabwe business pricing, ZiG pricing plans, service marketplace pricing, business software Zimbabwe, affordable business tools',
  },
  
  categories: {
    title: 'Service Categories in Zimbabwe | Home, Auto, Beauty & More',
    description: 'Explore all service categories available in Zimbabwe. From home repairs to professional services. All providers verified and accept local payments.',
    keywords: 'service categories Zimbabwe, home services, automotive services, beauty services, professional services Zimbabwe',
  },
};

export default SEO;
