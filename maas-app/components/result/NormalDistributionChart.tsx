'use client';

import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
import { generateNormalDistributionData, calculatePercentile, getGradeFromPercentile } from '@/lib/utils/percentile';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Trophy, Users } from 'lucide-react';

interface NormalDistributionChartProps {
  score: number;
  gender: 'male' | 'female';
  animate?: boolean;
}

export default function NormalDistributionChart({ score, gender, animate = true }: NormalDistributionChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedPercentile, setAnimatedPercentile] = useState(100);

  // 정규분포 데이터 생성
  const distributionData = useMemo(() => generateNormalDistributionData(), []);
  
  // 백분위수 계산
  const percentile = useMemo(() => calculatePercentile(score), [score]);
  
  // 등급 정보
  const gradeInfo = useMemo(() => getGradeFromPercentile(percentile), [percentile]);

  // 점수와 백분위수 애니메이션
  useEffect(() => {
    if (!animate) {
      setAnimatedScore(score);
      setAnimatedPercentile(percentile);
      setIsVisible(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
      
      // 점수 애니메이션
      const scoreStep = score / 50;
      let currentScore = 0;
      const scoreInterval = setInterval(() => {
        currentScore += scoreStep;
        if (currentScore >= score) {
          currentScore = score;
          clearInterval(scoreInterval);
        }
        setAnimatedScore(Math.round(currentScore * 10) / 10);
      }, 30);

      // 백분위수 애니메이션
      const percentileStep = (100 - percentile) / 50;
      let currentPercentile = 100;
      const percentileInterval = setInterval(() => {
        currentPercentile -= percentileStep;
        if (currentPercentile <= percentile) {
          currentPercentile = percentile;
          clearInterval(percentileInterval);
        }
        setAnimatedPercentile(Math.round(currentPercentile * 10) / 10);
      }, 30);

      return () => {
        clearInterval(scoreInterval);
        clearInterval(percentileInterval);
      };
    }, 500);

    return () => clearTimeout(timer);
  }, [score, percentile, animate]);

  // 사용자 위치의 데이터 포인트
  const userDataPoint = {
    x: score,
    y: distributionData.find(d => Math.abs(d.x - score) < 0.05)?.y || 0
  };

  // 차트 색상 (점수에 따라 동적)
  const getChartColor = () => {
    if (score >= 8.5) return '#fbbf24'; // 금색
    if (score >= 7.0) return '#a78bfa'; // 보라색
    if (score >= 5.5) return '#60a5fa'; // 파란색
    if (score >= 4.0) return '#34d399'; // 초록색
    return '#f87171'; // 빨간색
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-6 space-y-6">
              {/* 점수 및 백분위수 표시 */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <h3 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                    {animatedScore.toFixed(1)}점
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">10점 만점</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold text-gray-800">
                      상위 {animatedPercentile.toFixed(1)}%
                    </span>
                  </div>
                  
                  <Badge 
                    className={`px-4 py-2 text-white bg-gradient-to-r ${gradeInfo.color} text-lg font-bold`}
                  >
                    {gradeInfo.grade} ({gradeInfo.tier})
                  </Badge>
                  
                  <p className="text-sm text-gray-600 max-w-xs">
                    {gradeInfo.description}
                  </p>
                </motion.div>
              </div>

              {/* 정규분포 차트 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="relative"
              >
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span className="text-xs">{gender === 'male' ? '남성' : '여성'} 분포</span>
                  </Badge>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart 
                    data={distributionData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                  >
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={getChartColor()} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={getChartColor()} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    
                    <XAxis 
                      dataKey="x" 
                      domain={[0, 10]}
                      ticks={[0, 2, 4, 6, 8, 10]}
                      tick={{ fontSize: 12 }}
                      label={{ value: '점수', position: 'insideBottom', offset: -20 }}
                    />
                    
                    <YAxis 
                      hide 
                    />
                    
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload?.[0]) {
                          const value = payload[0].payload.x;
                          const percentileValue = calculatePercentile(value);
                          return (
                            <div className="bg-white p-2 rounded shadow-lg border">
                              <p className="text-sm font-medium">{value}점</p>
                              <p className="text-xs text-gray-600">상위 {percentileValue.toFixed(1)}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    
                    <Area 
                      type="monotone" 
                      dataKey="y" 
                      stroke={getChartColor()}
                      strokeWidth={2}
                      fill="url(#colorGradient)"
                      animationDuration={1500}
                    />
                    
                    {/* 사용자 위치 표시 */}
                    <ReferenceLine 
                      x={score} 
                      stroke={getChartColor()}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      label={{
                        value: "나의 위치",
                        position: "top",
                        fill: getChartColor(),
                        fontSize: 12,
                        fontWeight: "bold"
                      }}
                    />
                    
                    <ReferenceDot
                      x={userDataPoint.x}
                      y={userDataPoint.y}
                      r={6}
                      fill={getChartColor()}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                {/* 범례 */}
                <div className="mt-4 flex justify-center">
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full" />
                      <span>S급 (9.5+)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full" />
                      <span>A급 (8.5+)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" />
                      <span>B급 (7.0+)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full" />
                      <span>C급 (5.5+)</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 추가 정보 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-gray-700">통계적 의미</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      이 점수는 정규분포를 기반으로 계산되었으며, 평균 5점, 표준편차 1.5점을 기준으로 합니다.
                      당신은 전체 {gender === 'male' ? '남성' : '여성'} 중 상위 {percentile.toFixed(1)}%에 해당합니다.
                    </p>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}