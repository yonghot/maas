'use client';

import { motion } from 'framer-motion';
import { TestResult } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

interface ScoreDisplayProps {
  result: TestResult;
}

export default function ScoreDisplay({ result }: ScoreDisplayProps) {
  // 원형 진행바를 위한 계산
  const circumference = 2 * Math.PI * 120; // 반지름 120
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (result.score / 100) * circumference;

  // 등급별 색상과 이모지
  const gradeConfig = {
    S: { emoji: '👑', color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
    A: { emoji: '🏆', color: 'text-purple-500', bgColor: 'bg-purple-50' },
    B: { emoji: '🌟', color: 'text-blue-500', bgColor: 'bg-blue-50' },
    C: { emoji: '💪', color: 'text-green-500', bgColor: 'bg-green-50' },
    D: { emoji: '📚', color: 'text-orange-500', bgColor: 'bg-orange-50' },
    F: { emoji: '🎯', color: 'text-red-500', bgColor: 'bg-red-50' }
  };

  const config = gradeConfig[result.grade];

  return (
    <Card className={`${config.bgColor} border-2 border-opacity-20 overflow-hidden`}>
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* 점수 원형 차트 */}
          <div className="relative flex items-center justify-center">
            <svg
              className="w-64 h-64 transform -rotate-90"
              viewBox="0 0 256 256"
            >
              {/* 배경 원 */}
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              
              {/* 진행 원 */}
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                className={config.color}
                style={{
                  strokeDasharray,
                  strokeDashoffset
                }}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </svg>
            
            {/* 중앙 점수 표시 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="text-center"
              >
                <div className="text-6xl mb-2">{config.emoji}</div>
                <div className={`text-5xl font-bold ${config.color} mb-1`}>
                  {result.score}
                </div>
                <div className="text-lg text-gray-600">점</div>
              </motion.div>
            </div>
          </div>

          {/* 등급 정보 */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            {/* 등급 배지 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="inline-flex items-center gap-3"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${config.bgColor} border-2 border-current ${config.color}`}>
                <span className="text-2xl font-bold">{result.grade}</span>
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${config.color}`}>
                  {result.gradeInfo.title}
                </h2>
                <p className="text-gray-600 text-lg">
                  {result.gradeInfo.description}
                </p>
              </div>
            </motion.div>

            {/* 사용자 정보 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="space-y-2"
            >
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="bg-white bg-opacity-50 px-4 py-2 rounded-full">
                  <span className="text-sm text-gray-600">닉네임: </span>
                  <span className="font-medium">{result.userInfo.nickname}</span>
                </div>
                <div className="bg-white bg-opacity-50 px-4 py-2 rounded-full">
                  <span className="text-sm text-gray-600">나이: </span>
                  <span className="font-medium">{result.userInfo.age}세</span>
                </div>
                <div className="bg-white bg-opacity-50 px-4 py-2 rounded-full">
                  <span className="text-sm text-gray-600">성별: </span>
                  <span className="font-medium">
                    {result.userInfo.gender === 'male' ? '남성' : '여성'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 진행률 바 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="space-y-2"
            >
              <div className="flex justify-between text-sm text-gray-600">
                <span>전체 평균 대비</span>
                <span>{result.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${result.gradeInfo.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${result.score}%` }}
                  transition={{ duration: 1.5, delay: 1.3, ease: "easeOut" }}
                />
              </div>
            </motion.div>

            {/* 등급별 멘트 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 }}
              className="bg-white bg-opacity-60 p-4 rounded-lg"
            >
              <p className="text-gray-700 leading-relaxed">
                {getGradeMessage(result.grade, result.userInfo.gender)}
              </p>
            </motion.div>
          </div>
        </div>

        {/* 하단 통계 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="mt-8 pt-6 border-t border-gray-200 border-opacity-50"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-800">{getPercentile(result.score)}%</div>
              <div className="text-sm text-gray-600">상위 백분율</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-800">{result.strengths.length}</div>
              <div className="text-sm text-gray-600">주요 강점</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-800">{result.weaknesses.length}</div>
              <div className="text-sm text-gray-600">개선 영역</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-800">{result.advice.length}</div>
              <div className="text-sm text-gray-600">개선 조언</div>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}

// 등급별 메시지
function getGradeMessage(grade: string, gender: 'male' | 'female'): string {
  const messages = {
    male: {
      S: '완벽한 남성! 모든 면에서 최고 수준의 매력을 가지고 있습니다. 자신감을 가지고 적극적으로 어필하세요.',
      A: '매우 매력적인 남성입니다. 몇 가지 소소한 개선만으로도 완벽에 가까워질 수 있어요.',
      B: '충분히 매력적인 남성입니다. 현재의 장점을 더욱 발전시키면 더 좋은 결과를 얻을 수 있어요.',
      C: '평균적인 매력을 가진 남성입니다. 몇 가지 영역에서 개선한다면 훨씬 더 매력적이 될 수 있어요.',
      D: '개선이 필요한 영역들이 있습니다. 하지만 충분히 발전 가능하니 포기하지 마세요!',
      F: '많은 노력이 필요하지만, 체계적으로 개선해 나간다면 분명 좋은 결과를 얻을 수 있어요.'
    },
    female: {
      S: '완벽한 여성! 모든 면에서 최고 수준의 매력을 가지고 있습니다. 자신감을 가지고 적극적으로 어필하세요.',
      A: '매우 매력적인 여성입니다. 몇 가지 소소한 개선만으로도 완벽에 가까워질 수 있어요.',
      B: '충분히 매력적인 여성입니다. 현재의 장점을 더욱 발전시키면 더 좋은 결과를 얻을 수 있어요.',
      C: '평균적인 매력을 가진 여성입니다. 몇 가지 영역에서 개선한다면 훨씬 더 매력적이 될 수 있어요.',
      D: '개선이 필요한 영역들이 있습니다. 하지만 충분히 발전 가능하니 포기하지 마세요!',
      F: '많은 노력이 필요하지만, 체계적으로 개선해 나간다면 분명 좋은 결과를 얻을 수 있어요.'
    }
  };

  return messages[gender][grade as keyof typeof messages.male] || '';
}

// 백분율 계산
function getPercentile(score: number): number {
  if (score >= 95) return 1;
  if (score >= 85) return 10;
  if (score >= 70) return 30;
  if (score >= 55) return 50;
  if (score >= 40) return 70;
  return 90;
}