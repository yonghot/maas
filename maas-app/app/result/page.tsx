'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTestStore } from '@/store/test-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Home, RefreshCw, TrendingUp, Target, BarChart3, Users, Heart, Lightbulb, UserCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import NormalDistributionChart from '@/components/result/NormalDistributionChart';
import { createClient } from '@/lib/supabase/client';

export default function ResultPage() {
  const router = useRouter();
  const { result: storeResult, userInfo: storeUserInfo } = useTestStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(storeResult);
  const [userInfo, setUserInfo] = useState(storeUserInfo);

  useEffect(() => {
    setMounted(true);
    
    const loadUserProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // 로그인된 사용자의 경우 DB에서 프로필 불러오기
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (profile && !error) {
            // DB에서 불러온 프로필 데이터로 결과 설정
            setResult({
              score: profile.total_score,
              totalScore: profile.total_score,
              tier: profile.tier,
              grade: profile.tier, // tier를 grade로도 사용
              percentile: profile.percentile || 50, // percentile 추가
              categoryScores: profile.category_scores || {},
              advice: [] // advice 필드 추가
            } as any);
            
            setUserInfo({
              gender: profile.gender,
              age: profile.age,
              ageGroup: profile.age ? (profile.age < 30 ? '20s' : profile.age < 40 ? '30s' : '40s+') : '20s',
              region: profile.region
            } as any);
            
            console.log('DB에서 프로필 로드 성공:', profile);
          } else if (!storeResult) {
            // 프로필도 없고 store에도 데이터가 없으면 테스트 페이지로
            console.log('프로필 없음, 테스트 페이지로 이동');
            router.push('/test');
            return;
          }
        } else if (!storeResult) {
          // 로그인하지 않았고 store에도 데이터가 없으면 테스트 페이지로
          router.push('/test');
          return;
        }
      } catch (error) {
        console.error('프로필 로드 오류:', error);
        if (!storeResult) {
          router.push('/test');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [storeResult, storeUserInfo, router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-teal-50/30 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-teal-700 font-medium">결과를 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (!result) {
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

  // 레이더 차트 데이터 생성 (성별에 따라 다른 카테고리)
  const radarData = userInfo?.gender === 'male' 
    ? [
        { category: '재력', score: result.categoryScores?.wealth || 0 },
        { category: '센스', score: result.categoryScores?.sense || 0 },
        { category: '피지컬', score: result.categoryScores?.physical || 0 },
      ]
    : [
        { category: '나이', score: result.categoryScores?.age || 0 },
        { category: '외모', score: result.categoryScores?.appearance || 0 },
        { category: '가치관', score: result.categoryScores?.values || 0 },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-teal-50/30 p-4 safe-area-padding">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 정규분포 차트 */}
        <NormalDistributionChart 
          score={result.totalScore} 
          gender={userInfo?.gender || 'male'}
          animate={true}
        />

        {/* 결과 요약 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-800 mb-4">
            상세 분석 결과
          </h1>
          
          <p className="text-lg text-gray-700 font-medium max-w-2xl mx-auto">
            {getGradeMessage(result.grade)}
          </p>
        </motion.div>

        {/* 비슷한 점수대 사람들의 특징 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="shadow-xl border-0 backdrop-blur-lg bg-white/95">
            <CardHeader>
              <CardTitle className="text-xl text-teal-800 flex items-center">
                <UserCheck className="mr-2 h-5 w-5" />
                비슷한 점수대 사람들의 특징
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.totalScore >= 8.5 ? (
                  <>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">🏆 최상위권 특징</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• 사회적 성공과 안정적인 생활</li>
                        <li>• 높은 자기관리 수준</li>
                        <li>• 균형 잡힌 가치관</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">👑 매칭 성공률</h4>
                      <p className="text-sm text-purple-700">
                        상위 3% 이내의 선택권을 가지며, 
                        원하는 조건의 파트너를 만날 확률이 높습니다.
                      </p>
                    </div>
                  </>
                ) : result.totalScore >= 7.0 ? (
                  <>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">💪 상위권 특징</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• 안정적인 직업과 수입</li>
                        <li>• 건강한 생활 습관</li>
                        <li>• 긍정적인 대인관계</li>
                      </ul>
                    </div>
                    <div className="bg-cyan-50 rounded-lg p-4">
                      <h4 className="font-semibold text-cyan-800 mb-2">🎯 매칭 기회</h4>
                      <p className="text-sm text-cyan-700">
                        상위 15% 이내로 좋은 선택권을 가지며,
                        적극적인 활동으로 좋은 만남을 기대할 수 있습니다.
                      </p>
                    </div>
                  </>
                ) : result.totalScore >= 5.5 ? (
                  <>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">🌱 평균권 특징</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• 안정적인 가치관</li>
                        <li>• 현실적인 기대치</li>
                        <li>• 꾸준한 자기개발 의지</li>
                      </ul>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-800 mb-2">🎉 개선 가능성</h4>
                      <p className="text-sm text-emerald-700">
                        평균 수준으로 노력하면 충분히 개선 가능하며,
                        다양한 만남의 기회가 있습니다.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">🔥 성장 필요 구간</h4>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• 적극적인 자기개발 필요</li>
                        <li>• 기본기 강화 필요</li>
                        <li>• 새로운 도전 필요</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">🚀 발전 기회</h4>
                      <p className="text-sm text-red-700">
                        현재는 하위권이지만 충분한 발전 가능성이 있으며,
                        체계적인 노력으로 극복 가능합니다.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
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
                      axisLine={false}
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
              {radarData.map((item, index) => {
                // 각 카테고리의 최대값으로 백분율 계산
                const maxScore = 100; // 카테고리별 최대 점수
                const percentage = (item.score / maxScore) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <span className="text-sm font-bold text-teal-600">{item.score.toFixed(0)}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-teal-400 to-teal-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {/* 개선 방안 표시 */}
              {result.advice && result.advice.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">💡 개선 방안</h4>
                  <ul className="space-y-2">
                    {result.advice.map((advice, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{advice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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