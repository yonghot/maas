'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Users, Trophy, ArrowRight, Sparkles, CheckCircle2, Target, BarChart3 } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50/30 safe-area-padding">
      {/* Hero Section - 모바일 최적화 */}
      <section className="relative overflow-hidden px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* 플로팅 요소 - 모바일에서 축소 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-purple-200/50"
                  initial={{ 
                    x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
                    y: typeof window !== 'undefined' ? window.innerHeight + 100 : 1000
                  }}
                  animate={{ 
                    y: -100,
                    x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0
                  }}
                  transition={{
                    duration: 20 + Math.random() * 10,
                    repeat: Infinity,
                    delay: i * 3
                  }}
                >
                  <Heart size={16 + Math.random() * 20} fill="currentColor" />
                </motion.div>
              ))}
            </div>

            {/* 메인 타이틀 - 모바일 크기 조정 */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative mb-6"
            >
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-3">
                나의 결혼 점수는?
              </h1>
            </motion.div>

            {/* 서브 텍스트 - 모바일 가독성 개선 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-8 px-4"
            >
              <p className="text-base sm:text-lg text-purple-700 font-semibold mb-4">
                우리 모두가 알고있지만 감히 대놓고 말하지는 못하는 불편한 진실.
              </p>
              <p className="text-sm sm:text-base text-purple-600/90 leading-relaxed mb-4">
                우리는 결국 서로 비슷한 점수의 사람들끼리 만나게 됩니다.<br />
                당신이 배우자로서 가지는 이성적 매력 수준을 진단하고,<br />
                나와 비슷한 점수의 사람들은 어떠한 조건을 가지고 있는지 알아보세요!
              </p>
              <p className="text-base sm:text-lg text-purple-600/80">
                AI가 분석하는 객관적인 매력 지수<br />
                <span className="font-semibold text-purple-700">5분</span>만에 당신의 매력을 평가받아보세요
              </p>
            </motion.div>

            {/* CTA 버튼 - 모바일 터치 최적화 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="px-4"
            >
              <Button
                onClick={handleStart}
                disabled={isLoading}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-base sm:text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 min-h-[56px] touch-manipulation"
              >
                {isLoading ? (
                  <span>시작하는 중...</span>
                ) : (
                  <>
                    지금 바로 시작하기
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>

          {/* 통계 카드 - 모바일 세로 배치 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 px-4"
          >
            <Card className="p-5 text-center hover:shadow-lg transition-shadow bg-white/80 backdrop-blur border-purple-100">
              <Users className="w-10 h-10 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-700">10,234</div>
              <div className="text-sm text-purple-600/70">참여자 수</div>
            </Card>

            <Card className="p-5 text-center hover:shadow-lg transition-shadow bg-white/80 backdrop-blur border-purple-100">
              <Trophy className="w-10 h-10 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold text-purple-700">72점</div>
              <div className="text-sm text-purple-600/70">평균 점수</div>
            </Card>

            <Card className="p-5 text-center hover:shadow-lg transition-shadow bg-white/80 backdrop-blur border-purple-100">
              <Heart className="w-10 h-10 mx-auto mb-2 text-purple-400" fill="currentColor" />
              <div className="text-2xl font-bold text-purple-700">89%</div>
              <div className="text-sm text-purple-600/70">만족도</div>
            </Card>
          </motion.div>

          {/* 특징 설명 - 모바일 최적화 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-12 sm:mt-16 text-center px-4"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-800 mb-6">
              왜 결혼매력평가인가요?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/60 backdrop-blur rounded-2xl p-6 border border-purple-100">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="font-semibold text-base mb-2 text-purple-800">객관적 평가</h3>
                <p className="text-sm text-purple-600/80 leading-relaxed">데이터 기반의<br />객관적인 매력도 분석</p>
              </div>
              <div className="bg-white/60 backdrop-blur rounded-2xl p-6 border border-purple-100">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="font-semibold text-base mb-2 text-purple-800">상세한 분석</h3>
                <p className="text-sm text-purple-600/80 leading-relaxed">카테고리별<br />강점과 약점 파악</p>
              </div>
              <div className="bg-white/60 backdrop-blur rounded-2xl p-6 border border-purple-100">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="font-semibold text-base mb-2 text-purple-800">맞춤형 조언</h3>
                <p className="text-sm text-purple-600/80 leading-relaxed">개선을 위한<br />구체적인 가이드 제공</p>
              </div>
            </div>
          </motion.div>

          {/* 푸터 - 모바일 여백 조정 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-12 sm:mt-20 text-center text-purple-600/60 text-xs sm:text-sm px-4 pb-safe"
          >
            <p>※ 본 테스트는 재미를 위한 것으로, 실제 결혼 가능성과는 무관합니다</p>
            <p className="mt-2">© 2025 MAAS - Marriage Attractiveness Assessment System</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}