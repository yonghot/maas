'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Home, RefreshCw, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import NormalDistributionChart from '@/components/result/NormalDistributionChart';

function SimpleResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [score, setScore] = useState<number>(0);
  const [gender, setGender] = useState<'male' | 'female'>('male');

  useEffect(() => {
    const scoreParam = searchParams.get('score');
    const genderParam = searchParams.get('gender');

    if (scoreParam) {
      setScore(parseFloat(scoreParam));
      if (genderParam === 'male' || genderParam === 'female') {
        setGender(genderParam);
      }
    } else {
      router.push('/');
    }
  }, [searchParams, router]);


  if (!score) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-teal-50/30 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* 정규분포 차트 */}
        <NormalDistributionChart 
          score={score} 
          gender={gender}
          animate={true}
        />
        
        {/* 기존 결과 카드 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-2xl border-0 backdrop-blur-lg bg-white/95 max-w-md mx-auto">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl font-bold text-teal-800 mb-4">
                추가 정보
              </CardTitle>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <p className="text-gray-700 font-medium">
                  상세한 분석 결과를 획인하실 수 있습니다.
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-teal-50 rounded-xl p-4 text-center">
                <p className="text-sm text-teal-700">
                  <span className="font-bold">회원가입</span>하면 카테고리별 상세 점수와<br />
                  맞춤형 개선 방안을 확인할 수 있습니다.
                </p>
              </div>

              <Button
                onClick={() => router.push('/signup')}
                className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                결과 보기
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/test')}
                  className="h-12 border-teal-300 text-teal-600 hover:bg-teal-50"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  다시 하기
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="h-12 border-teal-300 text-teal-600 hover:bg-teal-50"
                >
                  <Home className="mr-2 h-4 w-4" />
                  홈으로
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function SimpleResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-teal-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-600">결과를 불러오는 중...</p>
        </div>
      </div>
    }>
      <SimpleResultContent />
    </Suspense>
  );
}