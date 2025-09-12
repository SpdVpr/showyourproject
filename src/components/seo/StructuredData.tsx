import Script from 'next/script';

interface StructuredDataProps {
  type?: 'website' | 'organization' | 'product' | 'article';
  data?: any;
}

export function StructuredData({ type = 'website', data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
    };

    switch (type) {
      case 'website':
        return {
          ...baseData,
          "@type": "WebSite",
          "name": "ShowYourProject.com",
          "description": "Submit your website for free promotion on ShowYourProject.com. Get discovered by thousands of visitors and earn valuable backlinks to boost your SEO.",
          "url": "https://showyourproject.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://showyourproject.com/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@type": "Organization",
            "name": "ShowYourProject",
            "url": "https://showyourproject.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://showyourproject.com/logo.png"
            }
          }
        };

      case 'organization':
        return {
          ...baseData,
          "@type": "Organization",
          "name": "ShowYourProject",
          "description": "Global startup directory and promotion platform",
          "url": "https://showyourproject.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://showyourproject.com/logo.png"
          },
          "sameAs": [
            "https://twitter.com/showyourproject",
            "https://linkedin.com/company/showyourproject",
            "https://github.com/showyourproject"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "support@showyourproject.com"
          }
        };

      case 'product':
        return {
          ...baseData,
          "@type": "Product",
          "name": data?.name || "Startup Project",
          "description": data?.description || "Innovative startup project",
          "url": data?.url || "https://showyourproject.com",
          "image": data?.image || "https://showyourproject.com/default-project.jpg",
          "brand": {
            "@type": "Brand",
            "name": data?.brand || "Independent Startup"
          },
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        };

      case 'article':
        return {
          ...baseData,
          "@type": "Article",
          "headline": data?.title || "Startup Article",
          "description": data?.description || "Article about startup",
          "author": {
            "@type": "Person",
            "name": data?.author || "ShowYourProject Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "ShowYourProject",
            "logo": {
              "@type": "ImageObject",
              "url": "https://showyourproject.com/logo.png"
            }
          },
          "datePublished": data?.datePublished || new Date().toISOString(),
          "dateModified": data?.dateModified || new Date().toISOString(),
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": data?.url || "https://showyourproject.com"
          }
        };

      default:
        return baseData;
    }
  };

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData()),
      }}
    />
  );
}
