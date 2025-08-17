'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Instagram, 
  MapPin, 
  Calendar,
  Trophy,
  Lock,
  Sparkles,
  ChevronRight,
  Eye,
  Info
} from 'lucide-react';
import { MatchCard as MatchCardType, PlanDetails } from '@/lib/types';
import { tierSystem, tierEmojis } from '@/lib/scoring/tier-system';

interface MatchCardProps {
  card: MatchCardType;
  onView: () => void;
  onShowDetail?: () => void;
  subscription?: PlanDetails;
}

export default function MatchCard({ 
  card, 
  onView,
  onShowDetail,
  subscription 
}: MatchCardProps) {
  const [showInstagram, setShowInstagram] = useState(false);
  
  // 티어 정보 가져오기
  const tierInfo = tierSystem[card.tier];
  const tierEmoji = tierEmojis[card.tier];

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="w-full max-w-sm mx-auto"
    >
      <Card className="overflow-hidden shadow-2xl border-0">
        {/* 티어 배지 */}
        <div 
          className="h-2 w-full"
          style={{ backgroundColor: tierInfo.color }}
        />
        
        <CardContent className="p-0">
          {/* 프로필 이미지 영역 (임시) */}
          <motion.div 
            className="h-64 bg-gradient-to-br from-teal-100 to-cyan-100 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* 티어 표시 */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg">
              <span className="text-xl">{tierEmoji}</span>
              <span className="font-bold text-sm" style={{ color: tierInfo.color }}>
                {card.tier}
              </span>
            </div>
            
            {/* 인스타그램 아이디 (공개인 경우만) */}
            {card.instagramId && subscription?.id !== 'free' ? (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInstagram(!showInstagram)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 shadow-lg transition-all"
              >
                <Instagram className="w-5 h-5 text-teal-500" />
              </motion.button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 shadow-lg"
              >
                <Lock className="w-5 h-5 text-gray-400" />
              </motion.div>
            )}
            
            {/* 인스타그램 아이디 표시 */}
            <AnimatePresence>
              {showInstagram && card.instagramId && subscription?.id !== 'free' && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  className="absolute top-16 right-4 bg-white rounded-lg px-3 py-2 shadow-lg"
                >
                  <p className="text-sm font-medium text-teal-600">
                    @{card.instagramId}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* 프로필 정보 */}
          <div className="p-6 space-y-4">
            {/* 기본 정보 */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {card.nickname || '익명'}
              </h3>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {card.age}세
                </span>
                {card.region && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {card.region}
                  </span>
                )}
              </div>
            </div>
            
            {/* 티어 설명 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-3 border border-teal-200"
            >
              <p className="text-sm font-medium text-gray-700">
                {tierInfo.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {tierInfo.description}
              </p>
            </motion.div>
            
            {/* 주요 매력 포인트 */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">주요 매력 포인트</p>
              <div className="flex flex-wrap gap-2">
                {card.mainAttractPoints.map((point, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-xs font-medium transition-all hover:bg-teal-200"
                  >
                    <Sparkles className="w-3 h-3" />
                    {point}
                  </span>
                ))}
              </div>
            </div>
            
            {/* 액션 버튼 */}
            <div className="flex gap-3 pt-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={onView}
                  size="lg"
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg transition-all"
                >
                  <ChevronRight className="w-5 h-5 mr-2" />
                  다음 프로필 보기
                </Button>
              </motion.div>
            </div>
            
            {/* 상세 보기 버튼 */}
            {onShowDetail && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={onShowDetail}
                  variant="ghost"
                  className="w-full text-sm text-gray-500 hover:text-teal-600 transition-colors"
                >
                  <Info className="w-4 h-4 mr-2" />
                  프로필 상세 보기
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}