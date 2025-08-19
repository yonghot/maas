'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTestStore } from '@/store/test-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Home, RefreshCw, TrendingUp, Target, BarChart3, Users, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export default function ResultPage() {
  const router = useRouter();
  const { result, userInfo } = useTestStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 결과가 없으면 테스트 페이지로 리다이렉트
    if (!result) {
      router.push('/test');
    }
  }, [result, router]);

  if (!mounted || !result) {
    return null;
  }

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
    if (gradeValue.includes('S')) return '최상위 매력 보유자입니다! 🎉';
    if (gradeValue.includes('A')) return '상위권 매력을 가지고 있습니다! 👑';
    if (gradeValue.includes('B')) return '평균 이상의 매력을 가지고 있습니다. 👍';
    if (gradeValue.includes('C')) return '평균적인 매력을 가지고 있습니다. 📊';
    if (gradeValue.includes('D')) return '개선의 여지가 있습니다. 💪';
    if (gradeValue.includes('E')) return '노력이 필요합니다. 🔥';
    return '많은 개선이 필요합니다. ⚡';
  };

  // 레이더 차트 데이터 생성
  const radarData = [
    { category: '외모/건강', score: result.categoryScores['외모/건강'] || 0 },
    { category: '경제력', score: result.categoryScores['경제력'] || 0 },
    { category: '성격/인성', score: result.categoryScores['성격/인성'] || 0 },
    { category: '생활능력', score: result.categoryScores['생활능력'] || 0 },
    { category: '관계능력', score: result.categoryScores['관계능력'] || 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-teal-50/30 p-4 safe-area-padding">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.7, type: "spring" }}
            >
              <Trophy className="w-16 h-16 text-yellow-500" />
            </motion.div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-teal-800 mb-4">
            결혼매력도 분석 결과
          </h1>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="text-6xl font-bold bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
              {result.totalScore.toFixed(1)}점
            </div>

            <div className="flex justify-center gap-4">
              <span className={`px-6 py-3 rounded-full text-lg font-bold bg-gradient-to-r ${getTierColor(result.tier)} text-white shadow-lg`}>
                {result.tier}급
              </span>
              <span className="px-6 py-3 bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 rounded-full text-lg font-bold shadow-lg">
                {result.grade}
              </span>
            </div>

            <p className="text-lg text-gray-700 font-medium max-w-2xl mx-auto">
              {getGradeMessage(result.grade)}
            </p>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 레이더 차트 */}
          <Card className="shadow-xl border-0 backdrop-blur-lg bg-white/95">
            <CardHeader>
              <CardTitle className="text-xl text-teal-800 flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                카테고리별 점수
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis 
                      dataKey="category" 
                      tick={{ fontSize: 12, fill: '#374151' }}
                      className="text-xs"
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                    />
                    <Radar
                      name="점수"
                      dataKey="score"
                      stroke="#0D9488"
                      fill="#0D9488"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 카테고리별 상세 점수 */}
          <Card className="shadow-xl border-0 backdrop-blur-lg bg-white/95">
            <CardHeader>
              <CardTitle className="text-xl text-teal-800 flex items-center">
                <Target className="mr-2 h-5 w-5" />
                상세 분석
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {radarData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <span className="text-sm font-bold text-teal-600">{item.score.toFixed(1)}점</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-teal-400 to-teal-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 하단 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/test')}
            className="h-12 px-8 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            다시 테스트하기
          </Button>
          
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="h-12 px-8 border-teal-300 text-teal-600 hover:bg-teal-50"
          >
            <Home className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}