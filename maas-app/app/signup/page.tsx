'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { Loader2, UserPlus } from 'lucide-react';
import { useTestStore } from '@/store/test-store';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { result } = useTestStore();

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // 이미 로그인된 경우 결과 페이지로 이동
        if (result) {
          router.push(`/result/${result.id}`);
        } else {
          router.push('/test');
        }
      }
    };
    checkAuth();
  }, [supabase, router, result]);

  // 소셜 로그인 핸들러
  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    setLoading(true);
    setError(null);

    try {
      // Kakao는 현재 Supabase에서 기본 제공하지 않으므로 Google만 구현
      if (provider === 'kakao') {
        setError('카카오톡 로그인은 준비 중입니다.');
        setLoading(false);
        return;
      }

      // 테스트 결과가 있으면 쿠키에 저장 (바로 회원가입하는 경우에는 없을 수 있음)
      if (result) {
        const testData = {
          result,
          userInfo: useTestStore.getState().userInfo,
          answers: useTestStore.getState().answers,
          instagram_id: null, // 바로 회원가입 시 인스타그램 ID 없음
          instagram_public: true,
          timestamp: Date.now()
        };
        
        // 쿠키에 저장
        document.cookie = `test_result=${encodeURIComponent(JSON.stringify(testData))}; path=/; max-age=3600; SameSite=Lax`;
        console.log('테스트 데이터 쿠키에 저장:', testData);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('로그인 에러:', error);
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('로그인 중 오류:', err);
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 backdrop-blur-lg bg-white/95">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center mb-4"
            >
              <UserPlus className="w-12 h-12 text-purple-600" />
            </motion.div>
            
            <CardTitle className="text-2xl font-bold text-purple-800">
              회원가입
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              소셜 계정으로 간편하게 가입하세요
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* 회원가입 혜택 안내 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-purple-50 rounded-lg p-4 space-y-2"
            >
              <h3 className="font-semibold text-purple-800 mb-2">
                회원가입 후 확인할 수 있는 정보
              </h3>
              <ul className="space-y-1 text-sm text-purple-700">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  종합 점수 및 등급
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  카테고리별 상세 점수
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  맞춤형 개선 방안
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  비슷한 점수대 사람들의 특징
                </li>
              </ul>
            </motion.div>

            {/* 에러 메시지 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 text-red-600 text-sm p-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {/* 소셜 로그인 버튼들 */}
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={() => handleSocialLogin('google')}
                  disabled={loading}
                  className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <FcGoogle className="mr-2 h-5 w-5" />
                  )}
                  구글로 시작하기
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={() => handleSocialLogin('kakao')}
                  disabled={loading}
                  className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E] border-0 font-medium"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <RiKakaoTalkFill className="mr-2 h-5 w-5" />
                  )}
                  카카오톡으로 시작하기
                </Button>
              </motion.div>
            </div>

            {/* 구분선 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">또는</span>
              </div>
            </div>

            {/* 테스트로 돌아가기 */}
            <Button
              variant="outline"
              onClick={() => router.push('/test')}
              className="w-full h-12 border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              테스트로 돌아가기
            </Button>

            {/* 약관 안내 */}
            <p className="text-xs text-center text-gray-500 mt-4">
              가입 시{' '}
              <a href="/terms" className="text-purple-600 hover:underline">
                이용약관
              </a>
              {' '}및{' '}
              <a href="/privacy" className="text-purple-600 hover:underline">
                개인정보처리방침
              </a>
              에 동의하게 됩니다.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}