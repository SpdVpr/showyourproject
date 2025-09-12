import { NextResponse } from 'next/server';
import { socialMediaManager } from '@/lib/socialMediaService';

export async function GET() {
  console.log('🧪 Test sharing endpoint called');
  try {
    // Create a test project with all required fields
    const testProject = {
      id: 'test-123',
      shortId: 'TEST123',
      name: 'Test Project',
      tagline: 'Testing social media sharing',
      description: 'This is a test project to verify our social media integration works correctly.',
      websiteUrl: 'https://example.com',
      category: 'Web Apps',
      tags: ['test', 'automation', 'social-media'],
      thumbnailUrl: 'https://via.placeholder.com/400x300',
      logoUrl: 'https://via.placeholder.com/100x100',
      userId: 'test-user',
      submitterId: 'test-user',
      submitterEmail: 'test@example.com',
      submitterName: 'Test User',
      status: 'approved' as const,
      voteCount: 0,
      viewCount: 0,
      featured: false,
      socialMediaShared: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any; // Type assertion to bypass strict typing for test

    console.log('🧪 Testing social media sharing with test project...');

    // Debug: Check which platforms are enabled
    const enabledPlatforms = socialMediaManager.getEnabledPlatforms();
    console.log('🔍 Enabled platforms:', enabledPlatforms);

    const validations = socialMediaManager.validateAllConfigurations();
    console.log('🔍 Platform validations:', validations);

    // Test the sharing
    const results = await socialMediaManager.shareProject(testProject);
    
    return NextResponse.json({
      success: true,
      message: 'Social media sharing test completed',
      results: results.map(r => ({
        platform: r.platform,
        status: r.status,
        postUrl: r.postUrl,
        error: r.error
      }))
    });
    
  } catch (error) {
    console.error('❌ Social media sharing test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
