'use client';

import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface RadarData {
  category: string;
  score: number;
}

interface RadarChartProps {
  data: RadarData[];
}

export default function RadarChart({ data }: RadarChartProps) {
  // 애니메이션을 위한 상태
  const maxScore = 100;

  // 데이터를 0-100 범위로 정규화
  const normalizedData = data.map(item => ({
    ...item,
    score: Math.min(item.score, maxScore)
  }));

  // 커스텀 도트 컴포넌트
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    return (
      <motion.circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#8b5cf6"
        stroke="#ffffff"
        strokeWidth={2}
        initial={{ r: 0 }}
        animate={{ r: 4 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      />
    );
  };

  // 커스텀 각도 축 라벨
  const CustomAngleAxisTick = (props: any) => {
    const { payload, x, y, textAnchor } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={4}
          textAnchor={textAnchor}
          fill="#374151"
          className="text-sm font-medium"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full h-80 relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full h-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={normalizedData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            {/* 격자 */}
            <PolarGrid 
              stroke="#e5e7eb" 
              strokeWidth={1}
              gridType="polygon"
            />
            
            {/* 각도 축 (카테고리) */}
            <PolarAngleAxis 
              dataKey="category" 
              tick={<CustomAngleAxisTick />}
              className="text-sm"
            />
            
            {/* 반지름 축 (점수) */}
            <PolarRadiusAxis
              angle={90}
              domain={[0, maxScore]}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickCount={6}
              axisLine={false}
            />
            
            {/* 레이더 영역 */}
            <Radar
              name="점수"
              dataKey="score"
              stroke="#8b5cf6"
              fill="rgba(139, 92, 246, 0.1)"
              fillOpacity={0.3}
              strokeWidth={3}
              dot={<CustomDot />}
              animationBegin={200}
              animationDuration={1000}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 점수 표시 오버레이 */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {normalizedData.map((item, index) => {
          // 각 포인트의 위치 계산 (간단한 원형 배치)
          const angle = (index * 2 * Math.PI) / normalizedData.length - Math.PI / 2;
          const radius = 100; // 기본 반지름
          const scoreRadius = (item.score / maxScore) * radius;
          
          // 중심점에서의 오프셋
          const centerX = 50; // 퍼센트
          const centerY = 50; // 퍼센트
          
          const x = centerX + (scoreRadius * Math.cos(angle)) * 0.6; // 0.6은 스케일 조정
          const y = centerY + (scoreRadius * Math.sin(angle)) * 0.6;

          return (
            <motion.div
              key={item.category}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ 
                left: `${x}%`, 
                top: `${y}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
            >
              <div className="bg-white bg-opacity-90 px-2 py-1 rounded-full shadow-sm border text-xs font-medium text-gray-700">
                {item.score}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 범례 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-4 flex flex-wrap justify-center gap-4"
      >
        {normalizedData.map((item, index) => (
          <div key={item.category} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-600">
              {item.category}: <span className="font-medium">{item.score}점</span>
            </span>
          </div>
        ))}
      </motion.div>

      {/* 성능 지표 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-4 bg-gray-50 rounded-lg p-4"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-purple-600">
              {Math.max(...normalizedData.map(d => d.score))}
            </div>
            <div className="text-xs text-gray-500">최고 점수</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">
              {Math.min(...normalizedData.map(d => d.score))}
            </div>
            <div className="text-xs text-gray-500">최저 점수</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {Math.round(normalizedData.reduce((sum, d) => sum + d.score, 0) / normalizedData.length)}
            </div>
            <div className="text-xs text-gray-500">평균 점수</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">
              {Math.round(Math.max(...normalizedData.map(d => d.score)) - Math.min(...normalizedData.map(d => d.score)))}
            </div>
            <div className="text-xs text-gray-500">점수 편차</div>
          </div>
        </div>
      </motion.div>

      {/* 개선 제안 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="mt-4"
      >
        {(() => {
          const minScoreItem = normalizedData.reduce((min, item) => 
            item.score < min.score ? item : min
          );
          const maxScoreItem = normalizedData.reduce((max, item) => 
            item.score > max.score ? item : max
          );

          return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">분석 결과</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">💪</span>
                  <span className="text-gray-700">
                    <strong>{maxScoreItem.category}</strong>이(가) 가장 뛰어납니다 ({maxScoreItem.score}점)
                  </span>
                </div>
                {minScoreItem.score < 70 && (
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600">📈</span>
                    <span className="text-gray-700">
                      <strong>{minScoreItem.category}</strong> 영역을 개선하면 더 좋은 결과를 얻을 수 있어요 ({minScoreItem.score}점)
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </motion.div>
    </div>
  );
}