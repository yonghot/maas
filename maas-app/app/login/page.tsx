'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, User, Lock, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/result`
        }
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('소셜 로그인 오류:', err);
      let errorMessage = '소셜 로그인 중 오류가 발생했습니다.';
      
      if (err.message?.includes('provider is not enabled')) {
        errorMessage = `${provider === 'google' ? 'Google' : 'Kakao'} 로그인이 설정되지 않았습니다. 관리자에게 문의해주세요.`;
      } else if (err.message?.includes('validation_failed')) {
        errorMessage = '소셜 로그인 설정을 확인해주세요.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 관리자 로그인인 경우 하드코딩된 계정 확인
      if (isAdminLogin) {
        // 관리자 계정 정보 (하드코딩)
        const ADMIN_ID = 'admin';
        const ADMIN_PASSWORD = 'maas2025';
        
        if (email === ADMIN_ID && password === ADMIN_PASSWORD) {
          // 관리자 로그인 성공
          console.log('관리자 로그인 성공');
          
          // localStorage와 sessionStorage 모두 사용
          if (typeof window !== 'undefined') {
            localStorage.setItem('adminAuth', 'true');
            sessionStorage.setItem('adminAuth', 'true');
          }
          
          // 직접 이동
          window.location.href = '/admin';
        } else {
          throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
      } else {
        // 일반 사용자 로그인 (Supabase)
        const supabase = createClient();
        
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        // 자동 로그인 설정 (세션 지속 시간 설정)
        if (rememberMe && data.session) {
          // 30일간 세션 유지
          localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
        }

        if (authError) throw authError;

        // 로그인 성공 시 프로필 확인
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', data.user?.id)
          .single();
        
        // 프로필이 있으면 결과 페이지로, 없으면 테스트 페이지로
        if (profile) {
          router.push('/result');
        } else {
          router.push('/test');
        }
      }
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const isAdminLogin = redirect === '/admin';

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 backdrop-blur-lg bg-white/95">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              {isAdminLogin ? (
                <Shield className="w-12 h-12 text-purple-600" />
              ) : (
                <User className="w-12 h-12 text-purple-600" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-purple-800">
              {isAdminLogin ? '관리자 로그인' : '로그인'}
            </CardTitle>
            {isAdminLogin && (
              <p className="text-sm text-gray-600 mt-2">
                관리자 계정으로 로그인해주세요
              </p>
            )}
          </CardHeader>
          <CardContent>
            {!isAdminLogin && (
              <div className="space-y-4 mb-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    소셜 계정으로 로그인해주세요
                  </p>
                </div>
                
                {/* 소셜 로그인 버튼 */}
                <div className="space-y-3">
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
                    Google로 로그인
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
                    카카오로 로그인
                  </Button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded">
                    {error}
                  </div>
                )}
              </div>
            )}

            {isAdminLogin && (
              <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {isAdminLogin ? '아이디' : '이메일'}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type={isAdminLogin ? "text" : "email"}
                    placeholder={isAdminLogin ? "관리자 아이디" : "your@email.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 border-gray-300 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  비밀번호
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="비밀번호 입력"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-12 border-gray-300 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  자동 로그인
                </Label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </Button>
              </form>
            )}

            {!isAdminLogin && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  아직 계정이 없으신가요?{' '}
                  <button
                    onClick={() => router.push('/')}
                    className="text-purple-600 hover:underline font-medium"
                  >
                    테스트 시작하기
                  </button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600">로딩 중...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}