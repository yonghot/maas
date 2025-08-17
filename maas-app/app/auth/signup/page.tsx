'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LogoWithText } from '@/components/ui/logo';
import { Instagram, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    instagramId: '',
    password: '',
    confirmPassword: '',
    instagramPublic: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    if (!formData.instagramId || !formData.password || !formData.confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      
      // 이메일 형식으로 변환 (인스타그램 ID를 이메일처럼 사용)
      const email = `${formData.instagramId}@maas.app`;

      // Supabase Auth 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          data: {
            instagram_id: formData.instagramId,
            instagram_public: formData.instagramPublic,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // 프로필 테이블에 기본 정보 저장
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            instagram_id: formData.instagramId,
            instagram_public: formData.instagramPublic,
          });

        if (profileError) throw profileError;

        // 무료 구독 플랜 자동 생성
        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: authData.user.id,
            plan_id: 'free',
            status: 'active',
          });

        if (subError) throw subError;

        // 평가 페이지로 이동
        router.push('/test');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.');
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
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
          <p className="text-gray-600 mt-2">인스타그램 계정으로 시작하세요</p>
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
                <p className="text-xs text-gray-500">@ 없이 아이디만 입력하세요</p>
              </div>

              {/* 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="최소 6자 이상"
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

              {/* 비밀번호 확인 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호 재입력"
                    className="pl-10"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* 인스타그램 공개 설정 */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="instagramPublic"
                  checked={formData.instagramPublic}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, instagramPublic: checked as boolean })
                  }
                  disabled={loading}
                />
                <div className="space-y-1">
                  <Label htmlFor="instagramPublic" className="cursor-pointer">
                    인스타그램 아이디 공개
                  </Label>
                  <p className="text-xs text-gray-500">
                    다른 사용자가 내 인스타그램 아이디를 볼 수 있습니다
                  </p>
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
                {loading ? '처리 중...' : '회원가입'}
              </Button>

              {/* 로그인 링크 */}
              <p className="text-center text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link href="/auth/login" className="text-teal-600 hover:text-teal-700 font-medium">
                  로그인
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}