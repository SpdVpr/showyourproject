import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !url.startsWith('http')) {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract metadata
    const metadata = {
      title: 
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('title').text() ||
        '',
      
      description:
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        '',
      
      image:
        $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        $('link[rel="icon"]').attr('href') ||
        '',
      
      siteName:
        $('meta[property="og:site_name"]').attr('content') ||
        '',
      
      type:
        $('meta[property="og:type"]').attr('content') ||
        'website',
      
      favicon:
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href') ||
        '/favicon.ico',
    };

    // Clean up the data
    metadata.title = metadata.title.trim().substring(0, 100);
    metadata.description = metadata.description.trim().substring(0, 500);
    
    // Make relative URLs absolute
    if (metadata.image && metadata.image.startsWith('/')) {
      const urlObj = new URL(url);
      metadata.image = `${urlObj.protocol}//${urlObj.host}${metadata.image}`;
    }
    
    if (metadata.favicon && metadata.favicon.startsWith('/')) {
      const urlObj = new URL(url);
      metadata.favicon = `${urlObj.protocol}//${urlObj.host}${metadata.favicon}`;
    }

    return NextResponse.json({ metadata });

  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata from URL' },
      { status: 500 }
    );
  }
}
