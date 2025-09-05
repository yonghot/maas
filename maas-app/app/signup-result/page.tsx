'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTestStore } from '@/store/test-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Trophy, ChevronRight, Instagram, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export default function SignupResultPage() {
  const router = useRouter();
  const { result, userInfo, answers } = useTestStore();
  const [instagramId, setInstagramId] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // URL 파라미터에서 에러 및 메시지 확인
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    const messageParam = params.get('message');
    
    if (errorParam) {
      const errorDesc = params.get('desc');
      
      if (errorParam === 'auth_failed') {
        setError('소셜 로그인 인증에 실패했습니다. 다시 시도해주세요.');
      } else if (errorParam === 'session_failed') {
        // Invalid API key 에러 특별 처리
        if (errorDesc?.includes('Invalid API key')) {
          setError('인증 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
          console.error('❌ Supabase API 키 오류 감지:', errorDesc);
        } else {
          setError('세션 생성에 실패했습니다. 다시 시도해주세요.');
        }
      } else if (errorParam === 'pkce_cookie_missing') {
        setError('브라우저 쿠키가 차단되어 있습니다. 쿠키를 활성화하고 다시 시도해주세요.');
      } else if (errorParam === 'env_loading_failed') {
        setError('서버 환경 설정 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (errorParam === 'no_test_data') {
        setError('테스트 결과를 찾을 수 없습니다. 테스트를 다시 진행해주세요.');
      } else {
        // 기타 에러
        setError(errorDesc ? decodeURIComponent(errorDesc) : '알 수 없는 오류가 발생했습니다.');
      }
      
      // 에러 로그
      console.error(`❌ OAuth 에러: ${errorParam}`, errorDesc);
    }
    
    // URL에서 message 파라미터가 있으면 표시 (에러가 아닌 안내 메시지)
    if (messageParam && !errorParam) {
      // 이 경우는 소셜 로그인은 성공했지만 테스트를 다시 해야 하는 상황
      console.log('안내 메시지:', decodeURIComponent(messageParam));
    }
    
    // 결과가 없고 특별한 안내 메시지도 없으면 테스트 페이지로 리다이렉트
    if (!result && !messageParam) {
      console.log('⚠️ signup-result: 테스트 결과 없음, /test로 리다이렉트 시도');
      console.log('현재 URL:', window.location.href);
      console.log('result:', result);
      console.log('messageParam:', messageParam);
      
      // 잠시 비활성화하여 상황 파악
      // router.push('/test');
    }
  }, [result, router]);

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    // 인스타그램 아이디가 입력되었는지 확인
    if (!instagramId.trim()) {
      setError('인스타그램 아이디를 입력해주세요.');
      return;
    }

    // 인스타그램 아이디 유효성 검사
    if (!validateInstagramId(instagramId)) {
      setError('올바른 인스타그램 아이디 형식이 아닙니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // 테스트 결과와 Instagram 정보를 서버 쿠키에 저장
      if (typeof window !== 'undefined' && result) {
        // API를 통해 서버 사이드 쿠키 설정
        const prepareResponse = await fetch('/api/auth/prepare', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            result,
            userInfo,
            answers,
            instagram_id: instagramId,
            instagram_public: isPublic
          }),
        });
        
        if (!prepareResponse.ok) {
          throw new Error('쿠키 설정 실패');
        }
        
        // localStorage에도 백업 저장 (OAuth 리다이렉트 후에도 사용 가능)
        const testData = {
          result,
          userInfo,
          answers,
          instagram_id: instagramId,
          instagram_public: isPublic,
          timestamp: Date.now()
        };
        localStorage.setItem('test_result', JSON.stringify(testData));
        
        console.log('테스트 데이터 저장 완료:', testData);
      }
      
      // PKCE 코드 수동 생성 및 설정
      console.log('🔐 ===== OAuth 로그인 시작 =====');
      console.log('📅 시간:', new Date().toISOString());
      console.log('🌐 현재 Origin:', window.location.origin);
      console.log('🎯 Provider:', provider);
      console.log('🔑 환경 변수 체크:');
      console.log('  - NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌');
      console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌');
      
      // OAuth 시작 전에 세션 확인
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('🔍 현재 세션 상태:', sessionData?.session ? '세션 있음' : '세션 없음');
      
      // 현재 쿠키 상태 확인 (브라우저)
      console.log('🍪 현재 브라우저 쿠키:', document.cookie);
      
      console.log('📤 signInWithOAuth 호출 직전...');
      
      // signInWithOAuth 호출
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('OAuth 오류:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('✅ OAuth URL 생성 성공!');
        console.log('OAuth URL:', data.url);
        
        // URL에서 PKCE 파라미터 확인
        const oauthUrl = new URL(data.url);
        const hasCodeChallenge = oauthUrl.searchParams.has('code_challenge');
        const hasChallengeMethod = oauthUrl.searchParams.has('code_challenge_method');
        
        console.log('PKCE 파라미터 확인:');
        console.log('- code_challenge:', hasCodeChallenge ? '✅ 있음' : '❌ 없음');
        console.log('- code_challenge_method:', hasChallengeMethod ? '✅ 있음' : '❌ 없음');
        
        if (!hasCodeChallenge || !hasChallengeMethod) {
          console.warn('⚠️ PKCE 파라미터가 누락되었습니다!');
        }
      }
    } catch (err: any) {
      console.error('소셜 로그인 오류:', err);
      let errorMessage = '소셜 로그인 중 오류가 발생했습니다.';
      
      if (err.message?.includes('provider is not enabled')) {
        errorMessage = `${provider === 'google' ? 'Google' : 'Kakao'} 로그인이 설정되지 않았습니다. 관리자에게 문의해주세요.`;
      } else if (err.message?.includes('validation_failed')) {
        errorMessage = '소셜 로그인 설정을 확인해주세요.';
      } else if (err.message?.includes('code verifier')) {
        errorMessage = 'PKCE 인증 오류가 발생했습니다. 페이지를 새로고침한 후 다시 시도해주세요.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const validateInstagramId = (id: string) => {
    // 인스타그램 아이디 유효성 검사: 영문, 숫자, 언더스코어, 마침표만 허용
    const regex = /^[a-zA-Z0-9._]+$/;
    return regex.test(id);
  };

  const handleInstagramIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // @ 기호 제거
    value = value.replace('@', '');
    // 공백 제거
    value = value.replace(/\s/g, '');
    // 소문자로 변환
    value = value.toLowerCase();
    setInstagramId(value);
  };

  // URL 파라미터 확인
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const messageParam = params?.get('message');
  const errorParam = params?.get('error');
  
  // 테스트 결과 없이 메시지만 있는 경우 (소셜 로그인 후 테스트 필요)
  const isPostLogin = messageParam && !result;
  
  if (!result && !isPostLogin) {
    return null;
  }

  // 소셜 로그인 후 테스트 필요한 경우
  if (isPostLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50/30 flex items-center justify-center p-4 safe-area-padding">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-2xl border-0 backdrop-blur-lg bg-white/95">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <Trophy className="w-12 h-12 text-green-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-800">
                  로그인 완료!
                </CardTitle>
                <p className="text-base text-gray-600 mt-3">
                  {decodeURIComponent(messageParam || '')}
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <p className="text-center text-green-700 text-sm font-medium mb-2">
                    이제 결혼 매력도 테스트를 진행해보세요!
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-green-600">
                    <li className="flex items-center">
                      <span className="mr-2">✓</span> 5분 내외 간단한 테스트
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">✓</span> 성별맞춤 매력도 분석
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">✓</span> 백분위수 및 개선 방안 제공
                    </li>
                  </ul>
                </div>
                
                <Button
                  onClick={() => router.push('/test')}
                  className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center justify-center"
                >
                  테스트 시작하기
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                
                {errorParam === 'no_test_data' && (
                  <p className="text-sm text-orange-600 text-center bg-orange-50 p-2 rounded mt-4">
                    이전 테스트 결과를 찾을 수 없어 새로 진행합니다.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50/30 flex items-center justify-center p-4 safe-area-padding">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl border-0 backdrop-blur-lg bg-white/95 mb-4">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <Trophy className="w-12 h-12 text-purple-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-purple-800">
                테스트 완료!
              </CardTitle>
              <p className="text-base text-gray-600 mt-3">
                당신의 결혼 매력도 분석이 완료되었습니다.
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <p className="text-center text-purple-700 text-sm font-medium">
                  회원가입 후 확인할 수 있는 정보:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-purple-600">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> 종합 점수 및 백분위수
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> 카테고리별 상세 점수
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> 맞춤형 개선 방안
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> 비슷한 점수대 사람들의 특징
                  </li>
                </ul>
              </div>
              <p className="text-center text-gray-500 text-xs">
                무료 회원가입으로 모든 분석 결과를 확인하세요!
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-2xl border-0 backdrop-blur-lg bg-white/95">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold text-purple-800">
                결과 보기
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                무료 회원가입 후 모든 분석 결과를 확인하세요
              </p>
            </CardHeader>
            <CardContent>
              {/* 인스타그램 아이디 입력 */}
              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-sm font-medium text-gray-700">
                    인스타그램 아이디
                  </Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <span className="absolute left-9 top-3 text-gray-400">@</span>
                    <Input
                      id="instagram"
                      type="text"
                      placeholder="your_instagram_id"
                      value={instagramId}
                      onChange={handleInstagramIdChange}
                      required
                      className="pl-14 h-12 border-gray-300 focus:border-purple-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    다른 사용자들이 연락할 수 있는 방법입니다
                  </p>
                </div>

                <div className="flex items-center justify-between space-x-3 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    {isPublic ? (
                      <Eye className="h-5 w-5 text-purple-600" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <Label htmlFor="public-toggle" className="text-sm font-medium text-gray-700 cursor-pointer">
                        프로필 공개
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        {isPublic 
                          ? '다른 사용자가 나에게 연락할 수 있습니다' 
                          : '다른 사용자 정보만 볼 수 있습니다'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="public-toggle"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>
              </div>

              {/* 소셜 로그인 버튼 */}
              <div className="space-y-3 mb-4">
                <Button
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium flex items-center justify-center"
                  type="button"
                >
                  <svg className="mr-2" width="20" height="20" viewBox="0 0 20 20">
                    <g fill="none" fillRule="evenodd">
                      <path d="M19.6 10.23c0-.69-.06-1.35-.17-1.99H10v3.74h5.4c-.23 1.25-.95 2.31-2.02 3.02v2.51h3.27c1.91-1.76 3.01-4.36 3.01-7.28z" fill="#4285F4"/>
                      <path d="M10 20c2.73 0 5.02-.91 6.69-2.45l-3.27-2.51c-.91.61-2.07.97-3.42.97-2.63 0-4.86-1.78-5.66-4.17H.98v2.59C2.65 17.75 6.1 20 10 20z" fill="#34A853"/>
                      <path d="M4.34 11.84A5.94 5.94 0 0 1 4.03 10c0-.65.11-1.29.31-1.88V5.53H.98A9.97 9.97 0 0 0 0 10c0 1.61.39 3.14.98 4.47l3.36-2.63z" fill="#FBBC04"/>
                      <path d="M10 3.96c1.48 0 2.81.51 3.85 1.51l2.89-2.89C15.02 1.01 12.73 0 10 0 6.1 0 2.65 2.25.98 5.53l3.36 2.59C5.14 5.74 7.37 3.96 10 3.96z" fill="#EA4335"/>
                    </g>
                  </svg>
                  Google로 계속하기
                </Button>

                <Button
                  onClick={() => handleSocialLogin('kakao')}
                  disabled={isLoading}
                  className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] text-[#000000D9] font-medium flex items-center justify-center"
                  type="button"
                >
                  <svg className="mr-2" width="20" height="20" viewBox="0 0 20 20">
                    <path fill="#000000" d="M10 0C4.48 0 0 3.62 0 8.08c0 2.89 1.88 5.42 4.7 6.84-.2.72-.74 2.64-.85 3.05-.13.51.19.5.4.36.17-.11 2.67-1.83 3.75-2.57.65.09 1.31.14 2 .14 5.52 0 10-3.62 10-8.08S15.52 0 10 0"/>
                  </svg>
                  카카오로 계속하기
                </Button>
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded mb-4">
                  {error}
                </p>
              )}

              <p className="text-xs text-center text-gray-500 mt-4">
                이미 계정이 있으신가요?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-purple-600 hover:underline font-medium"
                >
                  로그인
                </button>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}