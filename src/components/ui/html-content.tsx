"use client";

import { useEffect, useState } from 'react';

interface HtmlContentProps {
  content: string;
  className?: string;
}

// Simple HTML sanitizer - removes dangerous tags and attributes
function sanitizeHtml(html: string): string {
  // Basic sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<iframe\b[^>]*>/gi, '')
    .replace(/<object\b[^>]*>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '');
}

export function HtmlContent({ content, className = "" }: HtmlContentProps) {
  const [sanitizedContent, setSanitizedContent] = useState('');

  useEffect(() => {
    // Simple sanitization for now
    const sanitized = sanitizeHtml(content);
    setSanitizedContent(sanitized);
  }, [content]);

  if (!sanitizedContent) {
    // Fallback to plain text
    return <div className={className}>{content}</div>;
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
