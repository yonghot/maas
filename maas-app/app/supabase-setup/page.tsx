'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function SupabaseSetupPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testOAuth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/debug-oauth');
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error('테스트 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">🚨 OAuth 설정 가이드</h1>
      
      <div className="mb-8 p-6 bg-red-50 border-2 border-red-500 rounded-lg">
        <h2 className="text-2xl font-bold text-red-700 mb-3">핵심 문제 발견!</h2>
        <p className="text-lg text-red-600">
          OAuth URL이 Google/Kakao로 리다이렉트되지 않고 있습니다.
          <br />
          Supabase Dashboard에서 Provider 설정을 완료해야 합니다.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Step 1: Supabase Dashboard */}
        <Card>
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-2xl">1️⃣ Supabase Dashboard 접속</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <a 
              href="https://supabase.com/dashboard/project/hvpyqchgimnzaotwztuy/auth/providers"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mb-4"
            >
              Supabase Providers 설정 페이지 열기 →
            </a>
            <p className="text-gray-600">
              위 버튼을 클릭하면 Authentication → Providers 페이지가 바로 열립니다.
            </p>
          </CardContent>
        </Card>

        {/* Step 2: Google 설정 */}
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-2xl">2️⃣ Google Provider 설정</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-500 mt-1" />
                <div>
                  <p className="font-semibold">Google Provider를 "Enabled" 상태로 변경</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-500 mt-1" />
                <div>
                  <p className="font-semibold">Client ID 입력</p>
                  <code className="block mt-2 p-3 bg-gray-100 rounded text-sm">
                    264154438039-0gjglspsg0btsrfp49dlug60evvh01im.apps.googleusercontent.com
                  </code>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-500 mt-1" />
                <div>
                  <p className="font-semibold">Client Secret 입력 (Google Console에서 확인)</p>
                  <ol className="mt-2 ml-4 list-decimal text-sm text-gray-600">
                    <li>
                      <a href="https://console.cloud.google.com" target="_blank" className="text-blue-600 underline">
                        Google Cloud Console
                      </a> 접속
                    </li>
                    <li>프로젝트 선택 (inmyleague)</li>
                    <li>APIs & Services → Credentials</li>
                    <li>OAuth 2.0 Client IDs에서 "inmyleague" 클릭</li>
                    <li>Client secret 복사</li>
                    <li>Supabase에 붙여넣기</li>
                  </ol>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm">
                  <strong>⚠️ 중요:</strong> Client Secret이 없으면 OAuth가 작동하지 않습니다!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Kakao 설정 */}
        <Card>
          <CardHeader className="bg-yellow-50">
            <CardTitle className="text-2xl">3️⃣ Kakao Provider 설정</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-500 mt-1" />
                <div>
                  <p className="font-semibold">Kakao Provider를 "Enabled" 상태로 변경</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-500 mt-1" />
                <div>
                  <p className="font-semibold">Client ID (REST API Key) 입력</p>
                  <ol className="mt-2 ml-4 list-decimal text-sm text-gray-600">
                    <li>
                      <a href="https://developers.kakao.com" target="_blank" className="text-blue-600 underline">
                        Kakao Developers
                      </a> 접속
                    </li>
                    <li>내 애플리케이션 → MAAS 앱 선택</li>
                    <li>앱 설정 → 앱 키</li>
                    <li>REST API 키 복사</li>
                    <li>Supabase의 Kakao Client ID에 붙여넣기</li>
                  </ol>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-500 mt-1" />
                <div>
                  <p className="font-semibold">Client Secret 입력</p>
                  <ol className="mt-2 ml-4 list-decimal text-sm text-gray-600">
                    <li>Kakao Developers의 앱 설정 → 보안</li>
                    <li>Client Secret 생성 (없으면 "코드 생성" 클릭)</li>
                    <li>생성된 Secret을 Supabase에 붙여넣기</li>
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Redirect URLs 확인 */}
        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="text-2xl">4️⃣ Redirect URLs 확인</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4">Supabase Dashboard의 Authentication → URL Configuration에서 다음 URL들이 모두 추가되어 있는지 확인:</p>
            <div className="space-y-2">
              <code className="block p-3 bg-gray-100 rounded">http://localhost:3000/auth/callback</code>
              <code className="block p-3 bg-gray-100 rounded">http://localhost:3001/auth/callback</code>
              <code className="block p-3 bg-gray-100 rounded text-red-600 font-bold">https://maas-eight.vercel.app/auth/callback</code>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              특히 빨간색 프로덕션 URL이 반드시 추가되어 있어야 합니다!
            </p>
          </CardContent>
        </Card>

        {/* Step 5: 테스트 */}
        <Card>
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-2xl">5️⃣ 설정 테스트</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Button
              onClick={testOAuth}
              disabled={isLoading}
              className="w-full py-6 text-lg"
            >
              {isLoading ? '테스트 중...' : '🔍 OAuth 설정 테스트 실행'}
            </Button>
            
            {testResults && (
              <div className="mt-6 p-4 bg-gray-100 rounded">
                <h3 className="font-bold mb-2">테스트 결과:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
                
                {testResults.providers?.google?.status === 'success' && 
                 testResults.providers?.google?.host?.includes('google') ? (
                  <div className="mt-4 p-3 bg-green-100 rounded flex items-center gap-2">
                    <CheckCircle className="text-green-600" />
                    <span className="text-green-700">Google OAuth 정상 설정됨!</span>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-red-100 rounded flex items-center gap-2">
                    <XCircle className="text-red-600" />
                    <span className="text-red-700">Google OAuth 설정 필요</span>
                  </div>
                )}
                
                {testResults.providers?.kakao?.status === 'success' && 
                 testResults.providers?.kakao?.host?.includes('kakao') ? (
                  <div className="mt-4 p-3 bg-green-100 rounded flex items-center gap-2">
                    <CheckCircle className="text-green-600" />
                    <span className="text-green-700">Kakao OAuth 정상 설정됨!</span>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-red-100 rounded flex items-center gap-2">
                    <XCircle className="text-red-600" />
                    <span className="text-red-700">Kakao OAuth 설정 필요</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 문제 해결 팁 */}
        <Card className="border-2 border-purple-500">
          <CardHeader className="bg-purple-100">
            <CardTitle className="text-2xl">💡 문제 해결 팁</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Supabase에서 Provider를 처음 설정하는 경우 Save를 <strong>두 번</strong> 클릭해야 할 수 있습니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>설정 변경 후 약 30초 대기 (설정 반영 시간)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>브라우저 캐시 삭제 권장 (Ctrl+Shift+Delete)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Client Secret은 보안상 한 번만 표시되므로 안전한 곳에 보관</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}