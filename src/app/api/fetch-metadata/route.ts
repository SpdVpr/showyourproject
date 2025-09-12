import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    let validUrl: URL;
    try {
      validUrl = new URL(url);
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Fetch the webpage
    const response = await fetch(validUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok) {
      return NextResponse.json({ 
        error: `Failed to fetch webpage: ${response.status} ${response.statusText}` 
      }, { status: 400 });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract metadata
    const metadata = {
      title: '',
      description: '',
      image: '',
      siteName: '',
      favicon: '',
    };

    // Title extraction (priority order)
    metadata.title = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      '';

    // Description extraction
    metadata.description = 
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    // Image extraction (Open Graph, Twitter, etc.)
    let imageUrl = 
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[name="twitter:image:src"]').attr('content') ||
      $('link[rel="image_src"]').attr('href') ||
      '';

    // Convert relative URLs to absolute
    if (imageUrl && !imageUrl.startsWith('http')) {
      if (imageUrl.startsWith('//')) {
        imageUrl = validUrl.protocol + imageUrl;
      } else if (imageUrl.startsWith('/')) {
        imageUrl = validUrl.origin + imageUrl;
      } else {
        imageUrl = validUrl.origin + '/' + imageUrl;
      }
    }

    metadata.image = imageUrl;

    // Site name
    metadata.siteName = 
      $('meta[property="og:site_name"]').attr('content') ||
      validUrl.hostname ||
      '';

    // Favicon
    let faviconUrl = 
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      $('link[rel="apple-touch-icon"]').attr('href') ||
      '/favicon.ico';

    // Convert relative favicon URLs to absolute
    if (faviconUrl && !faviconUrl.startsWith('http')) {
      if (faviconUrl.startsWith('//')) {
        faviconUrl = validUrl.protocol + faviconUrl;
      } else if (faviconUrl.startsWith('/')) {
        faviconUrl = validUrl.origin + faviconUrl;
      } else {
        faviconUrl = validUrl.origin + '/' + faviconUrl;
      }
    }

    metadata.favicon = faviconUrl;

    // Clean up text content
    metadata.title = metadata.title.trim().substring(0, 100);
    metadata.description = metadata.description.trim().substring(0, 500);

    return NextResponse.json({
      success: true,
      metadata,
      url: validUrl.toString()
    });

  } catch (error) {
    console.error('Metadata fetch error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return NextResponse.json({ 
          error: 'Request timeout - website took too long to respond' 
        }, { status: 408 });
      }
    }

    return NextResponse.json({ 
      error: 'Failed to fetch website metadata. Please check the URL and try again.' 
    }, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
