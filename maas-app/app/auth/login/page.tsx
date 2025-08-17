'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogoWithText } from '@/components/ui/logo';
import { Instagram, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    instagramId: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    if (!formData.instagramId || !formData.password) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      
      // 이메일 형식으로 변환
      const email = `${formData.instagramId}@maas.app`;

      // Supabase Auth 로그인
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
        throw authError;
      }

      if (data.user) {
        // 프로필 데이터 확인
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (profileError || !profile) {
          // 프로필이 없으면 평가 페이지로
          router.push('/test');
        } else {
          // 프로필이 있으면 매칭 페이지로
          router.push('/matching');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <LogoWithText className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
          <p className="text-gray-600 mt-2">계속하려면 로그인하세요</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">계정 정보 입력</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 인스타그램 아이디 */}
              <div className="space-y-2">
                <Label htmlFor="instagramId">인스타그램 아이디</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="instagramId"
                    type="text"
                    placeholder="instagram_id"
                    className="pl-10"
                    value={formData.instagramId}
                    onChange={(e) => setFormData({ ...formData, instagramId: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호 입력"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}

              {/* 제출 버튼 */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                disabled={loading}
              >
                {loading ? '로그인 중...' : '로그인'}
              </Button>

              {/* 회원가입 링크 */}
              <p className="text-center text-sm text-gray-600">
                아직 계정이 없으신가요?{' '}
                <Link href="/auth/signup" className="text-teal-600 hover:text-teal-700 font-medium">
                  회원가입
                </Link>
              </p>

              {/* 비밀번호 찾기 */}
              <p className="text-center text-sm">
                <Link href="/auth/reset-password" className="text-gray-500 hover:text-gray-700">
                  비밀번호를 잊으셨나요?
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}