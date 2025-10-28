import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({ 
  title = 'TechMart Haiti - Ecommerce Platform',
  description = 'Shop the latest products from TechMart Haiti. Best deals on electronics, fashion, home goods, and more!',
  keywords = 'ecommerce, shopping, haiti, techmart, products, deals',
  ogTitle,
  ogDescription,
  ogImage,
  canonicalUrl,
  schemaMarkup
}) => {
  const location = useLocation();
  const siteUrl = 'https://techmart-haiti.com';
  const fullUrl = canonicalUrl || `${siteUrl}${location.pathname}`;
  const defaultOgImage = `${siteUrl}/og-default.png`;

  // Default schema for ecommerce
  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TechMart Haiti',
    url: siteUrl,
    description: 'Ecommerce platform for Haiti',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Haitian Creole" />
      <meta name="author" content="TechMart Haiti" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage || defaultOgImage} />
      <meta property="og:site_name" content="TechMart Haiti" />
      <meta property="og:locale" content="ht_HT" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImage || defaultOgImage} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup || defaultSchema)}
      </script>
    </Helmet>
  );
};

export default SEO;

