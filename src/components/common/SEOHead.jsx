// ============================================
// BIT SOFTWARE — SEOHead Component
// ============================================

import { Helmet } from 'react-helmet-async';

export function SEOHead({ title, description, image, url, type = 'website' }) {
  const siteName = 'BIT Software & IT Solution';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDesc = 'World-class IT services, web development, mobile apps, ERP solutions, and digital marketing in Saudi Arabia.';
  const metaDesc = description || defaultDesc;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      {image && <meta name="twitter:image" content={image} />}
      {url && <link rel="canonical" href={url} />}
      <meta name="language" content="ar-SA,en" />
    </Helmet>
  );
}
