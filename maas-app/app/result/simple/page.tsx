'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Home, RefreshCw, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

function SimpleResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [score, setScore] = useState<number>(0);
  const [tier, setTier] = useState<string>('');
  const [grade, setGrade] = useState<string>('');

  useEffect(() => {
    const scoreParam = searchParams.get('score');
    const tierParam = searchParams.get('tier');
    const gradeParam = searchParams.get('grade');

    if (scoreParam && tierParam && gradeParam) {
      setScore(parseFloat(scoreParam));
      setTier(tierParam);
      setGrade(gradeParam);
    } else {
      router.push('/');
    }
  }, [searchParams, router]);

  const getTierColor = (tierValue: string) => {
    switch(tierValue) {
      case 'S': return 'from-yellow-400 to-yellow-600';
      case 'A': return 'from-purple-400 to-purple-600';
      case 'B': return 'from-blue-400 to-blue-600';
      case 'C': return 'from-green-400 to-green-600';
      case 'D': return 'from-gray-400 to-gray-600';
      case 'E': return 'from-orange-400 to-orange-600';
      case 'F': return 'from-red-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getGradeMessage = (gradeValue: string) => {
    if (gradeValue.includes('S')) return '최상위 매력 보유자입니다!';
    if (gradeValue.includes('A')) return '상위권 매력을 가지고 있습니다!';
    if (gradeValue.includes('B')) return '평균 이상의 매력을 가지고 있습니다.';
    if (gradeValue.includes('C')) return '평균적인 매력을 가지고 있습니다.';
    if (gradeValue.includes('D')) return '개선의 여지가 있습니다.';
    if (gradeValue.includes('E')) return '노력이 필요합니다.';
    return '많은 개선이 필요합니다.';
  };

  if (!score || !tier || !grade) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-teal-50/30 flex items-center justify-center p-4 safe-area-padding">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl border-0 backdrop-blur-lg bg-white/95">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.7, type: "spring" }}
                >
                  <Trophy className="w-16 h-16 text-yellow-500" />
                </motion.div>
              </div>
              
              <CardTitle className="text-2xl font-bold text-teal-800 mb-4">
                테스트 결과
              </CardTitle>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
                  {score.toFixed(1)}점
                </div>

                <div className="flex justify-center gap-3">
                  <span className={`px-6 py-3 rounded-full text-lg font-bold bg-gradient-to-r ${getTierColor(tier)} text-white shadow-lg`}>
                    {tier}급
                  </span>
                  <span className="px-6 py-3 bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 rounded-full text-lg font-bold shadow-lg">
                    {grade}
                  </span>
                </div>

                <p className="text-gray-700 font-medium mt-4">
                  {getGradeMessage(grade)}
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
                회원가입하고 상세 결과 보기
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