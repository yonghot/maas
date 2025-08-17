'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTestStore } from '@/store/test-store';
import SignupForm from '@/components/auth/SignupForm';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Heart, Target } from 'lucide-react';
import { LogoWithText } from '@/components/ui/logo';

export default function InfoPage() {
  const router = useRouter();
  const { isTestCompleted, hasSubmittedLead, result } = useTestStore();

  useEffect(() => {
    // 테스트를 완료하지 않았으면 테스트 페이지로 리다이렉트
    if (!isTestCompleted) {
      router.push('/test');
      return;
    }

    // 이미 정보를 제출했다면 결과 페이지로 리다이렉트
    if (hasSubmittedLead) {
      router.push('/result/test');
      return;
    }
  }, [isTestCompleted, hasSubmittedLead, router]);

  if (!isTestCompleted) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* 모바일 최적화 컨테이너 */}
      <div className="container mx-auto px-4 py-safe max-w-lg">
        {/* 상단 로고 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center pt-6 pb-4"
        >
          <LogoWithText />
        </motion.div>

        {/* 진행률 표시 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-sm text-gray-600">평가 완료!</span>
            <span className="text-sm font-bold text-purple-600">마지막 단계</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: '90%' }}
              animate={{ width: '95%' }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </div>
        </motion.div>

        {/* 결과 요약 카드 (모바일 최적화) */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">당신의 등급</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-purple-700">{result.grade}급</span>
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{result.gradeInfo.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {result.score}점
                    </p>
                    <p className="text-xs text-gray-600">종합 점수</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 메인 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  회원가입하고 매칭 시작하기
                </h2>
                <p className="text-sm text-gray-600">
                  인스타그램 계정으로 간편하게 가입하세요
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="px-4 pb-6">
              <SignupForm />
            </CardContent>
          </Card>
        </motion.div>

        {/* 혜택 안내 (모바일 최적화) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 grid grid-cols-3 gap-3"
        >
          <div className="text-center p-3 bg-white/80 backdrop-blur rounded-lg">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-purple-100 rounded-full">
                <Heart className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-700">티어 매칭</p>
            <p className="text-xs text-gray-500 mt-1">비슷한 등급</p>
          </div>
          
          <div className="text-center p-3 bg-white/80 backdrop-blur rounded-lg">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-pink-100 rounded-full">
                <Target className="w-5 h-5 text-pink-600" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-700">정확한 매칭</p>
            <p className="text-xs text-gray-500 mt-1">AI 기반</p>
          </div>
          
          <div className="text-center p-3 bg-white/80 backdrop-blur rounded-lg">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-700">무제한 탐색</p>
            <p className="text-xs text-gray-500 mt-1">무한 스크롤</p>
          </div>
        </motion.div>

        {/* 하단 안내 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 pb-8 text-center"
        >
          <p className="text-xs text-gray-500">
            © 2025 공학적배우자탐색기. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}