'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Lock, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        if (authError) throw authError;

        // 로그인 성공 시 리다이렉트
        router.push(redirect);
      }
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const isAdminLogin = redirect === '/admin';

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-teal-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 backdrop-blur-lg bg-white/95">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              {isAdminLogin ? (
                <Shield className="w-12 h-12 text-teal-600" />
              ) : (
                <User className="w-12 h-12 text-teal-600" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-teal-800">
              {isAdminLogin ? '관리자 로그인' : '로그인'}
            </CardTitle>
            {isAdminLogin && (
              <p className="text-sm text-gray-600 mt-2">
                관리자 계정으로 로그인해주세요
              </p>
            )}
          </CardHeader>
          <CardContent>
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
                    className="pl-10 h-12 border-gray-300 focus:border-teal-500"
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
                    className="pl-10 h-12 border-gray-300 focus:border-teal-500"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium"
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

            {!isAdminLogin && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  아직 계정이 없으신가요?{' '}
                  <button
                    onClick={() => router.push('/signup')}
                    className="text-teal-600 hover:underline font-medium"
                  >
                    회원가입
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