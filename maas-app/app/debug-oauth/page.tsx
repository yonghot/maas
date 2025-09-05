'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugOAuthPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    // 페이지 로드 시 즉시 환경 정보 수집
    const info = {
      timestamp: new Date().toISOString(),
      environment: {
        isProduction: process.env.NODE_ENV === 'production',
        isVercel: !!process.env.VERCEL,
        origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
        protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown'
      },
      envVars: {
        NEXT_PUBLIC_SUPABASE_URL: {
          exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          value: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
          source: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'ENV' : 'FALLBACK'
        },
        NEXT_PUBLIC_SUPABASE_ANON_KEY: {
          exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
          source: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'ENV' : 'FALLBACK'
        }
      },
      cookies: {
        allCookies: document.cookie,
        authCookies: document.cookie.split('; ').filter(c => 
          c.includes('auth') || c.includes('pkce') || c.includes('sb-')
        )
      },
      localStorage: {
        hasTestData: !!localStorage.getItem('maas-test-storage'),
        hasAuthToken: !!localStorage.getItem('sb-hvpyqchgimnzaotwztuy-auth-token')
      }
    };

    setDebugInfo(info);
    console.log('🔍 OAuth Debug Info:', info);
  }, []);

  const testSupabaseConnection = async () => {
    setIsLoading(true);
    setTestResult('테스트 시작...\n');

    try {
      const supabase = createClient();
      
      // 1. 연결 테스트
      setTestResult(prev => prev + '1. Supabase 연결 테스트...\n');
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (testError) {
        setTestResult(prev => prev + `❌ 연결 실패: ${testError.message}\n`);
        if (testError.message.includes('Invalid API key')) {
          setTestResult(prev => prev + '⚠️ API 키 문제 감지!\n');
        }
      } else {
        setTestResult(prev => prev + '✅ 연결 성공!\n');
      }

      // 2. 세션 확인
      setTestResult(prev => prev + '\n2. 현재 세션 확인...\n');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setTestResult(prev => prev + `❌ 세션 확인 실패: ${sessionError.message}\n`);
      } else if (session) {
        setTestResult(prev => prev + `✅ 세션 있음: ${session.user?.email}\n`);
      } else {
        setTestResult(prev => prev + '⚠️ 세션 없음\n');
      }

      // 3. OAuth URL 생성 테스트
      setTestResult(prev => prev + '\n3. OAuth URL 생성 테스트...\n');
      
      // Google
      const { data: googleData, error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true
        }
      });
      
      if (googleError) {
        setTestResult(prev => prev + `❌ Google OAuth 실패: ${googleError.message}\n`);
      } else if (googleData?.url) {
        setTestResult(prev => prev + `✅ Google OAuth URL 생성 성공\n`);
        setTestResult(prev => prev + `   URL: ${googleData.url.substring(0, 100)}...\n`);
      }

      // Kakao
      const { data: kakaoData, error: kakaoError } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true
        }
      });
      
      if (kakaoError) {
        setTestResult(prev => prev + `❌ Kakao OAuth 실패: ${kakaoError.message}\n`);
      } else if (kakaoData?.url) {
        setTestResult(prev => prev + `✅ Kakao OAuth URL 생성 성공\n`);
        setTestResult(prev => prev + `   URL: ${kakaoData.url.substring(0, 100)}...\n`);
      }

      setTestResult(prev => prev + '\n✅ 테스트 완료!');
    } catch (error: any) {
      setTestResult(prev => prev + `\n❌ 예외 발생: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testRealOAuth = async (provider: 'google' | 'kakao') => {
    setIsLoading(true);
    console.log('🚀 실제 OAuth 시작:', provider);
    console.log('📍 현재 Origin:', window.location.origin);
    console.log('🔗 Redirect URL:', `${window.location.origin}/auth/callback`);
    
    try {
      const supabase = createClient();
      
      // OAuth URL 생성을 먼저 시도 (브라우저 리다이렉트 없이)
      console.log('🔐 OAuth URL 생성 시도...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true // 일단 URL만 생성해서 확인
        }
      });
      
      if (error) {
        console.error('❌ OAuth URL 생성 실패:', error);
        alert(`OAuth URL 생성 실패:\n${error.message}\n\n가능한 원인:\n1. Supabase에서 ${provider} Provider가 비활성화됨\n2. Client ID/Secret이 설정되지 않음`);
        return;
      }
      
      if (data?.url) {
        console.log('✅ OAuth URL 생성 성공:', data.url);
        alert(`OAuth URL이 생성되었습니다!\n\n이제 실제로 이동하시겠습니까?\n\nURL: ${data.url.substring(0, 100)}...`);
        
        // 사용자 확인 후 실제 리다이렉트
        if (confirm('OAuth 페이지로 이동하시겠습니까?')) {
          window.location.href = data.url;
        }
      } else {
        console.error('❌ URL이 반환되지 않음');
        alert('OAuth URL이 생성되지 않았습니다.');
      }
    } catch (error: any) {
      console.error('❌ 예외 발생:', error);
      alert(`예외 발생: ${error.message}\n\n${error.stack}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">OAuth 디버그 페이지</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>1. 환경 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>2. Supabase 연결 테스트</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testSupabaseConnection}
            disabled={isLoading}
            className="mb-4"
          >
            {isLoading ? '테스트 중...' : '연결 테스트 실행'}
          </Button>
          
          {testResult && (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm whitespace-pre">
              {testResult}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>3. 실제 OAuth 테스트</CardTitle>
        </CardHeader>
        <CardContent className="space-x-4">
          <Button 
            onClick={() => testRealOAuth('google')}
            disabled={isLoading}
            variant="outline"
          >
            Google 로그인 테스트
          </Button>
          <Button 
            onClick={() => testRealOAuth('kakao')}
            disabled={isLoading}
            variant="outline"
          >
            Kakao 로그인 테스트
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>⚠️ Supabase 대시보드 확인 사항</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong>Authentication → Providers</strong>에서 Google/Kakao 활성화 확인
            </li>
            <li>
              <strong>Authentication → URL Configuration</strong>에서 Redirect URLs 확인:
              <ul className="ml-6 mt-2 space-y-1">
                <li>• http://localhost:3000/auth/callback</li>
                <li className="font-bold text-red-600">• https://maas-eight.vercel.app/auth/callback</li>
              </ul>
            </li>
            <li>
              <strong>Google Cloud Console</strong>에서 OAuth 2.0 클라이언트 ID 설정:
              <ul className="ml-6 mt-2 space-y-1">
                <li>• 승인된 리디렉션 URI에 Supabase URL 추가</li>
              </ul>
            </li>
            <li>
              <strong>Kakao Developers</strong>에서 OAuth 설정:
              <ul className="ml-6 mt-2 space-y-1">
                <li>• Redirect URI에 Supabase URL 추가</li>
              </ul>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}