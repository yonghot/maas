'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { TestResult } from '@/lib/types';
import ScoreDisplay from '@/components/result/ScoreDisplay';
import RadarChart from '@/components/result/RadarChart';
import ShareButtons from '@/components/result/ShareButtons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTestStore } from '@/store/test-store';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const { result: storeResult, hasSubmittedLead, isTestCompleted } = useTestStore();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 테스트를 완료하지 않았으면 테스트 페이지로 리다이렉트
    if (!isTestCompleted) {
      router.push('/test');
      return;
    }

    // 정보를 입력하지 않았으면 정보 입력 페이지로 리다이렉트
    if (!hasSubmittedLead) {
      router.push('/info');
      return;
    }

    const loadResult = async () => {
      try {
        if (storeResult) {
          const finalResult = {
            ...storeResult,
            id: params.id as string,
            createdAt: new Date()
          };
          setResult(finalResult);
        } else {
          console.error('결과가 없습니다. 테스트를 먼저 완료해주세요.');
          router.push('/test');
        }
      } catch (error) {
        console.error('결과 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [params.id, storeResult, hasSubmittedLead, isTestCompleted, router]);

  const handleGoBack = () => {
    router.push('/test');
  };

  const handleDownload = () => {
    // 결과를 이미지나 PDF로 다운로드하는 기능
    console.log('결과 다운로드');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">결과를 찾을 수 없습니다.</p>
            <Button onClick={handleGoBack}>
              테스트로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRadarData = () => {
    if (result.userInfo.gender === 'male') {
      const categories = result.categories as any;
      return [
        { category: '재력', score: categories.wealth.total },
        { category: '센스', score: categories.sense.total },
        { category: '피지컬', score: categories.physical.total },
        { category: '종합', score: result.score },
        { category: '매력도', score: result.score }
      ];
    } else {
      const categories = result.categories as any;
      return [
        { category: '나이', score: categories.age.total },
        { category: '외모', score: categories.appearance.total },
        { category: '가치관', score: categories.values.total },
        { category: '종합', score: result.score },
        { category: '매력도', score: result.score }
      ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            뒤로가기
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              다운로드
            </Button>
            <ShareButtons result={result} />
          </div>
        </motion.div>

        {/* 메인 결과 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <ScoreDisplay result={result} />
        </motion.div>

        {/* 상세 분석 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* 레이더 차트 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">능력치 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <RadarChart data={getRadarData()} />
              </CardContent>
            </Card>
          </motion.div>

          {/* 카테고리별 상세 점수 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">세부 점수</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.userInfo.gender === 'male' ? (
                  <>
                    {/* 남성 카테고리 */}
                    {Object.entries(result.categories as any).map(([key, category]: [string, any]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">
                            {key === 'wealth' ? '재력' : key === 'sense' ? '센스' : '피지컬'}
                          </span>
                          <span className="text-lg font-bold text-purple-600">
                            {category.total}점
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${category.total}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {/* 여성 카테고리 */}
                    {Object.entries(result.categories as any).map(([key, category]: [string, any]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">
                            {key === 'age' ? '나이' : key === 'appearance' ? '외모' : '가치관'}
                          </span>
                          <span className="text-lg font-bold text-purple-600">
                            {category.total}점
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${category.total}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 분석 및 조언 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 강점 및 약점 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">강점 & 약점</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.strengths.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">강점</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {result.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {result.weaknesses.length > 0 && (
                  <div>
                    <h4 className="font-medium text-orange-600 mb-2">약점</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {result.weaknesses.map((weakness, index) => (
                        <li key={index}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* 개선 조언 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">개선 조언</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  {result.advice.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 요약 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">종합 평가</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{result.summary}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 재테스트 버튼 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <Button
            onClick={() => router.push('/test')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-2"
          >
            다시 테스트하기
          </Button>
        </motion.div>
      </div>
    </div>
  );
}