// SEO utilities for generating structured data

export interface ProductStructuredData {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  sku?: string;
  category?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

export interface OrganizationStructuredData {
  name: string;
  url: string;
  logo: string;
  description: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint?: {
    telephone: string;
    contactType: string;
    email: string;
  };
}

export interface BreadcrumbStructuredData {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export const generateProductStructuredData = (product: ProductStructuredData) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": product.currency,
      "availability": `https://schema.org/${product.availability}`,
      "seller": {
        "@type": "Organization",
        "name": "Style Yard Emporium"
      }
    },
    ...(product.brand && { "brand": { "@type": "Brand", "name": product.brand } }),
    ...(product.sku && { "sku": product.sku }),
    ...(product.category && { "category": product.category }),
    ...(product.aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.aggregateRating.ratingValue,
        "reviewCount": product.aggregateRating.reviewCount
      }
    })
  };
};

export const generateOrganizationStructuredData = (org: OrganizationStructuredData) => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": org.name,
    "url": org.url,
    "logo": org.logo,
    "description": org.description,
    ...(org.address && {
      "address": {
        "@type": "PostalAddress",
        "streetAddress": org.address.streetAddress,
        "addressLocality": org.address.addressLocality,
        "addressRegion": org.address.addressRegion,
        "postalCode": org.address.postalCode,
        "addressCountry": org.address.addressCountry
      }
    }),
    ...(org.contactPoint && {
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": org.contactPoint.telephone,
        "contactType": org.contactPoint.contactType,
        "email": org.contactPoint.email
      }
    }),
    "sameAs": [
      "https://www.facebook.com/styleyardemporium",
      "https://www.instagram.com/styleyardemporium",
      "https://www.twitter.com/styleyardemporium"
    ]
  };
};

export const generateBreadcrumbStructuredData = (breadcrumbs: BreadcrumbStructuredData) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

export const generateWebsiteStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Style Yard Emporium",
    "url": "https://styleyardemporium.com",
    "description": "Premium fashion and lifestyle products",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://styleyardemporium.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
};

export const generateStoreStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Style Yard Emporium",
    "url": "https://styleyardemporium.com",
    "description": "Premium fashion and lifestyle products",
    "image": "https://styleyardemporium.com/og-image.jpg",
    "telephone": "+1-555-STYLE-YARD",
    "email": "info@styleyardemporium.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Fashion Avenue",
      "addressLocality": "New York",
      "addressRegion": "NY",
      "postalCode": "10001",
      "addressCountry": "US"
    },
    "openingHours": "Mo-Fr 09:00-18:00",
    "paymentAccepted": "Credit Card, PayPal, Apple Pay, Google Pay",
    "currenciesAccepted": "USD"
  };
};

export const generateFAQStructuredData = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};
