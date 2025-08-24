'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, XCircle, Settings, Copy, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OAuthAdminPage() {
  const [providers, setProviders] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');

  useEffect(() => {
    checkOAuthProviders();
  }, []);

  const checkOAuthProviders = async () => {
    try {
      setIsLoading(true);
      
      // 실제로는 Supabase 설정을 직접 확인할 수 없으므로
      // 사용자에게 수동 설정 상태를 알려주는 방식으로 변경
      const testProviders = {
        google: false, // 기본값: 설정되지 않음
        kakao: false   // 기본값: 설정되지 않음
      };

      // 로컬 스토리지에서 설정 상태를 확인 (관리자가 수동으로 업데이트)
      const savedGoogleStatus = localStorage.getItem('oauth_google_enabled');
      const savedKakaoStatus = localStorage.getItem('oauth_kakao_enabled');
      
      testProviders.google = savedGoogleStatus === 'true';
      testProviders.kakao = savedKakaoStatus === 'true';

      setProviders(testProviders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const toggleProviderStatus = (provider: 'google' | 'kakao') => {
    const currentStatus = providers?.[provider] || false;
    const newStatus = !currentStatus;
    
    localStorage.setItem(`oauth_${provider}_enabled`, newStatus.toString());
    
    setProviders((prev: any) => ({
      ...prev,
      [provider]: newStatus
    }));
  };

  const testSocialLogin = async (provider: 'google' | 'kakao') => {
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?test=true`
        }
      });
    } catch (err: any) {
      alert(`${provider} 로그인 테스트 실패: ${err.message}`);
    }
  };

  // Supabase OAuth 콜백 URL (실제 OAuth Provider에 설정할 URL)
  const supabaseCallbackURI = 'https://hvpyqchgimnzaotwztuy.supabase.co/auth/v1/callback';
  
  // 앱 리다이렉트 URL (Supabase 대시보드에 설정할 URL)
  const appRedirectURIs = [
    'https://maas-eight.vercel.app/auth/callback',  // 프로덕션 환경
    'http://localhost:3000/auth/callback'            // 로컬 개발 환경
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">OAuth 설정 상태를 확인 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">OAuth 설정 관리</h1>
          <p className="text-gray-600">소셜 로그인 제공업체 설정 상태를 확인하고 관리합니다.</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <p className="text-red-700">{error}</p>
          </motion.div>
        )}

        {/* OAuth 제공업체 상태 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPHA..." className="w-6 h-6 mr-2" />
                    Google OAuth
                  </span>
                  {providers?.google ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      활성화됨
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="w-4 h-4 mr-1" />
                      비활성화됨
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Google Cloud Console에서 OAuth 클라이언트를 설정하고 Supabase에서 활성화해야 합니다.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Google Console
                    </Button>
                    {providers?.google ? (
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => testSocialLogin('google')}
                        className="flex-1"
                      >
                        테스트하기
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => toggleProviderStatus('google')}
                        className="flex-1"
                      >
                        설정 완료로 표시
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-6 h-6 bg-yellow-400 rounded mr-2"></div>
                    Kakao OAuth
                  </span>
                  {providers?.kakao ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      활성화됨
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="w-4 h-4 mr-1" />
                      비활성화됨
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Kakao Developers에서 애플리케이션을 등록하고 Client Secret을 생성한 후 Supabase에서 활성화해야 합니다.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open('https://developers.kakao.com/', '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Kakao Developers
                    </Button>
                    {providers?.kakao ? (
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => testSocialLogin('kakao')}
                        className="flex-1"
                      >
                        테스트하기
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => toggleProviderStatus('kakao')}
                        className="flex-1"
                      >
                        설정 완료로 표시
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* OAuth Provider Redirect URIs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>OAuth Provider 설정 URL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Google & Kakao OAuth Provider에 등록할 콜백 URL:
                  </p>
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded border border-blue-200">
                    <code className="text-sm font-mono text-blue-800">{supabaseCallbackURI}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(supabaseCallbackURI, 'supabase-callback')}
                      className="ml-2"
                    >
                      <Copy className="w-4 h-4" />
                      {copySuccess === 'supabase-callback' ? '복사됨!' : '복사'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    이 URL은 Google Cloud Console과 Kakao Developers의 Redirect URI 설정에 추가하세요.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Supabase Redirect URLs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Supabase 대시보드 설정 URL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Supabase 대시보드 → Authentication → URL Configuration에 추가할 리다이렉트 URL:
                </p>
                <div className="space-y-2">
                  {appRedirectURIs.map((uri, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                      <code className="text-sm font-mono">{uri}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(uri, `app-${index}`)}
                        className="ml-2"
                      >
                        <Copy className="w-4 h-4" />
                        {copySuccess === `app-${index}` ? '복사됨!' : '복사'}
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>중요:</strong> Site URL도 프로덕션 URL(https://maas-eight.vercel.app)로 설정해야 합니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Supabase 설정 링크 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Supabase 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                OAuth 제공업체를 설정한 후 Supabase Dashboard에서 활성화해야 합니다.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => window.open('https://app.supabase.com/project/hvpyqchgimnzaotwztuy/auth/url-configuration', '_blank')}
                  className="w-full"
                  variant="outline"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  1. Supabase URL Configuration (리다이렉트 URL 설정)
                </Button>
                <Button 
                  onClick={() => window.open('https://app.supabase.com/project/hvpyqchgimnzaotwztuy/auth/providers', '_blank')}
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  2. Supabase Auth Providers (OAuth 활성화)
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 단계별 설정 가이드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>단계별 설정 가이드</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">1️⃣ Google OAuth 설정</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li><a href="https://console.cloud.google.com/" target="_blank" className="text-blue-600 underline">Google Cloud Console</a> 접속</li>
                    <li>프로젝트 선택 또는 새 프로젝트 생성</li>
                    <li>APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID</li>
                    <li>Application type: Web application</li>
                    <li>위의 Redirect URIs 모두 추가</li>
                    <li>Client ID와 Client Secret 복사</li>
                  </ol>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">2️⃣ Kakao OAuth 설정</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li><a href="https://developers.kakao.com/" target="_blank" className="text-blue-600 underline">Kakao Developers</a> 접속</li>
                    <li>내 애플리케이션 → 애플리케이션 추가하기</li>
                    <li>앱 이름: "MAAS", 사업자명: 개인개발자</li>
                    <li>플랫폼 설정 → Web 플랫폼 등록</li>
                    <li>카카오 로그인 → 활성화 설정 → ON</li>
                    <li>위의 Redirect URIs 모두 추가</li>
                    <li>제품 설정 → 카카오 로그인 → 보안</li>
                    <li>Client Secret → 코드 생성 → 활성화: "사용함"</li>
                    <li>앱 키 → REST API 키 복사 (Client ID용)</li>
                    <li>보안 → Client Secret 코드 복사</li>
                  </ol>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">3️⃣ Supabase에서 활성화</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li><a href="https://app.supabase.com/project/hvpyqchgimnzaotwztuy/auth/providers" target="_blank" className="text-blue-600 underline">Supabase Auth Providers</a> 접속</li>
                    <li>Google Provider: Enable 토글 → Client ID & Secret 입력</li>
                    <li>Kakao Provider: Enable 토글 → Client ID(REST API 키) & Secret 입력</li>
                    <li>각각 Save 클릭</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 새로고침 버튼 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Button onClick={checkOAuthProviders} disabled={isLoading}>
            설정 상태 다시 확인
          </Button>
        </motion.div>
      </div>
    </div>
  );
}