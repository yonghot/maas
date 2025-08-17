'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Users, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStart = () => {
    setIsLoading(true);
    router.push('/test');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* 플로팅 하트 애니메이션 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-pink-200"
                  initial={{ 
                    x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
                    y: typeof window !== 'undefined' ? window.innerHeight + 100 : 1000
                  }}
                  animate={{ 
                    y: -100,
                    x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0
                  }}
                  transition={{
                    duration: 15 + Math.random() * 10,
                    repeat: Infinity,
                    delay: i * 2
                  }}
                >
                  <Heart size={20 + Math.random() * 30} fill="currentColor" />
                </motion.div>
              ))}
            </div>

            {/* 메인 타이틀 */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                결혼매력평가
              </h1>
              <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl text-gray-700 mb-6">
                <Sparkles className="text-yellow-500" />
                <span>나의 결혼 매력도는 몇 점?</span>
                <Sparkles className="text-yellow-500" />
              </div>
            </motion.div>

            {/* 서브 텍스트 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            >
              AI가 분석하는 객관적인 결혼 매력 지수!<br />
              <span className="font-semibold">5분</span>만에 당신의 매력을 평가받아보세요
            </motion.p>

            {/* CTA 버튼 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button
                onClick={handleStart}
                disabled={isLoading}
                size="lg"
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                {isLoading ? (
                  <span>시작하는 중...</span>
                ) : (
                  <>
                    지금 바로 시작하기
                    <ArrowRight className="ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>

          {/* 통계 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Users className="w-12 h-12 mx-auto mb-3 text-purple-600" />
              <div className="text-3xl font-bold text-gray-800">10,234</div>
              <div className="text-gray-600">참여자 수</div>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
              <div className="text-3xl font-bold text-gray-800">72점</div>
              <div className="text-gray-600">평균 점수</div>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Heart className="w-12 h-12 mx-auto mb-3 text-pink-500" fill="currentColor" />
              <div className="text-3xl font-bold text-gray-800">89%</div>
              <div className="text-gray-600">만족도</div>
            </Card>
          </motion.div>

          {/* 특징 설명 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-16 text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8">
              왜 결혼매력평가인가요?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div>
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">객관적 평가</h3>
                <p className="text-gray-600">데이터 기반의 객관적인 매력도 분석</p>
              </div>
              <div>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">상세한 분석</h3>
                <p className="text-gray-600">카테고리별 강점과 약점 파악</p>
              </div>
              <div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">맞춤형 조언</h3>
                <p className="text-gray-600">개선을 위한 구체적인 가이드 제공</p>
              </div>
            </div>
          </motion.div>

          {/* 푸터 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-20 text-center text-gray-500 text-sm"
          >
            <p>※ 본 테스트는 재미를 위한 것으로, 실제 결혼 가능성과는 무관합니다</p>
            <p className="mt-2">© 2025 MAAS - Marriage Attractiveness Assessment System</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}