'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTestStore } from '@/store/test-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Trophy, ChevronRight, User, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export default function SignupResultPage() {
  const router = useRouter();
  const { result, userInfo, answers } = useTestStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // 결과가 없으면 테스트 페이지로 리다이렉트
    if (!result) {
      router.push('/test');
    }
  }, [result, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // 테스트 결과 저장
      if (authData.user && result && userInfo) {
        const response = await fetch('/api/test-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gender: userInfo.gender,
            age: userInfo.age,
            region: userInfo.region,
            tier: result.tier,
            grade: result.grade,
            totalScore: result.totalScore,
            categoryScores: result.categoryScores,
            answers,
            evaluationData: {
              answers,
              userInfo
            }
          }),
        });

        if (!response.ok) {
          console.error('결과 저장 실패');
        }
      }

      // 결과 페이지로 이동
      router.push('/result');
    } catch (err: any) {
      setError(err.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    // 익명으로 결과 저장하고 간단한 결과만 보여주기
    setIsLoading(true);
    try {
      if (result && userInfo) {
        const response = await fetch('/api/test-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gender: userInfo.gender,
            age: userInfo.age,
            region: userInfo.region,
            tier: result.tier,
            grade: result.grade,
            totalScore: result.totalScore,
            categoryScores: result.categoryScores,
            answers,
            evaluationData: {
              answers,
              userInfo
            }
          }),
        });

        const data = await response.json();
        
        // 간단한 결과 페이지로 이동
        router.push(`/result/simple?score=${result.totalScore}&tier=${result.tier}&grade=${result.grade}`);
      }
    } catch (err) {
      console.error('결과 저장 실패:', err);
      // 에러가 있어도 간단한 결과는 보여주기
      if (result) {
        router.push(`/result/simple?score=${result.totalScore}&tier=${result.tier}&grade=${result.grade}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-teal-50/30 flex items-center justify-center p-4 safe-area-padding">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl border-0 backdrop-blur-lg bg-white/95 mb-4">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <Trophy className="w-12 h-12 text-teal-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-teal-800">
                테스트 완료!
              </CardTitle>
              <p className="text-base text-gray-600 mt-3">
                당신의 결혼 매력도 분석이 완료되었습니다.
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-teal-50 rounded-lg p-4 mb-4">
                <p className="text-center text-teal-700 text-sm font-medium">
                  회원가입 후 확인할 수 있는 정보:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-teal-600">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> 종합 점수 및 등급
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
              <CardTitle className="text-xl font-bold text-teal-800">
                회원가입하고 상세 결과 보기
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                무료 회원가입 후 모든 분석 결과를 확인하세요
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    이메일
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-12 border-gray-300 focus:border-teal-500 text-center"
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
                      placeholder="최소 6자 이상"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 h-12 border-gray-300 focus:border-teal-500 text-center"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    비밀번호 확인
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="비밀번호 재입력"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10 h-12 border-gray-300 focus:border-teal-500 text-center"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    <>
                      회원가입하고 상세 결과 보기
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="w-full text-gray-600 hover:text-gray-800"
                >
                  나중에 하기 (간단한 결과만 보기)
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500 mt-4">
                이미 계정이 있으신가요?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-teal-600 hover:underline font-medium"
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