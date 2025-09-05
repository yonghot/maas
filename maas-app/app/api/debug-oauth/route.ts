import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase/server';

// 서버 사이드 실행 강제
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 환경 변수 체크
    const env = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    };

    // Supabase 서버 클라이언트로 연결 테스트
    const supabase = await createServerComponentClient();
    
    // Provider 설정 테스트 - Google
    const googleTest = await testProvider('google');
    
    // Provider 설정 테스트 - Kakao  
    const kakaoTest = await testProvider('kakao');

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: {
        isProduction: process.env.NODE_ENV === 'production',
        isVercel: !!process.env.VERCEL,
        hasEnvVars: env.hasUrl && env.hasKey
      },
      providers: {
        google: googleTest,
        kakao: kakaoTest
      },
      debug: {
        supabaseUrl: env.url?.substring(0, 40) + '...',
        redirectUrl: `${process.env.VERCEL ? 'https://maas-eight.vercel.app' : 'http://localhost:3000'}/auth/callback`
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

async function testProvider(provider: 'google' | 'kakao') {
  try {
    const supabase = await createServerComponentClient();
    
    // signInWithOAuth를 skipBrowserRedirect: true로 호출하여 URL만 생성
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.VERCEL ? 'https://maas-eight.vercel.app' : 'http://localhost:3000'}/auth/callback`,
        skipBrowserRedirect: true
      }
    });
    
    if (error) {
      return {
        status: 'error',
        message: error.message,
        details: error
      };
    }
    
    if (data?.url) {
      // URL 파싱하여 정보 추출
      const url = new URL(data.url);
      return {
        status: 'success',
        urlGenerated: true,
        provider: provider,
        host: url.host,
        searchParams: Object.fromEntries(url.searchParams),
        fullUrl: data.url.substring(0, 150) + '...'
      };
    }
    
    return {
      status: 'no_url',
      message: 'URL이 생성되지 않았습니다'
    };
  } catch (error: any) {
    return {
      status: 'exception',
      message: error.message,
      stack: error.stack?.substring(0, 200)
    };
  }
}