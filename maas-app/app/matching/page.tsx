'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoWithText } from '@/components/ui/logo';
import MatchCard from '@/components/matching/MatchCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Crown, 
  Filter, 
  Settings, 
  User,
  Lock,
  Sparkles,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { MatchCard as MatchCardType, SubscriptionPlan } from '@/lib/types';
import { subscriptionPlans, canAccessTier, checkDailyLimit } from '@/lib/config/subscription-plans';
import { getTier } from '@/lib/scoring/tier-system';

// 임시 데이터 생성 함수
function generateMockCards(count: number, userTier: string): MatchCardType[] {
  const tiers = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'GrandMaster', 'Challenger'];
  const regions = ['서울', '경기', '부산', '대구', '인천', '광주', '대전'];
  const attractPoints = [
    '안정적인 직업', '긍정적 성격', '운동 매니아', '요리 전문가', 
    '여행 애호가', '독서광', '음악 감상', '영화 애호가', '패션 센스'
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    userId: `user_${i}`,
    nickname: `User${i}`,
    age: Math.floor(Math.random() * 15) + 25,
    region: regions[Math.floor(Math.random() * regions.length)],
    tier: tiers[Math.floor(Math.random() * tiers.length)] as any,
    mainAttractPoints: Array.from({ length: 3 }, () => 
      attractPoints[Math.floor(Math.random() * attractPoints.length)]
    ),
    instagramId: Math.random() > 0.5 ? `user${i}_insta` : undefined
  }));
}

export default function MatchingPage() {
  const router = useRouter();
  const [cards, setCards] = useState<MatchCardType[]>([]);
  const [filteredCards, setFilteredCards] = useState<MatchCardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dailyViewCount, setDailyViewCount] = useState(0);
  
  // 사용자 정보 (임시)
  const [userInfo] = useState({
    tier: 'Gold',
    subscription: subscriptionPlans.free // 무료 플랜으로 시작
  });
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // 카드 로드
  useEffect(() => {
    const loadCards = async () => {
      setLoading(true);
      // 임시 데이터 생성
      const mockCards = generateMockCards(100, userInfo.tier);
      setCards(mockCards);
      
      // 구독 플랜에 따라 필터링
      const filtered = mockCards.filter(card => 
        canAccessTier(userInfo.tier, card.tier, userInfo.subscription)
      );
      
      setFilteredCards(filtered);
      setLoading(false);
    };
    
    loadCards();
  }, [userInfo.tier, userInfo.subscription]);

  // 일일 제한 확인
  const checkLimit = useCallback(() => {
    const { canView, remaining } = checkDailyLimit(dailyViewCount, userInfo.subscription);
    
    if (!canView && userInfo.subscription.id === 'free') {
      setShowUpgradeModal(true);
      return false;
    }
    
    return true;
  }, [dailyViewCount, userInfo.subscription]);

  // 다음 카드로 이동
  const handleNextCard = useCallback(() => {
    if (!checkLimit()) return;
    
    setDailyViewCount(prev => prev + 1);
    setCurrentIndex(prev => prev + 1);
    
    // 무한 스크롤: 끝에 도달하면 새 카드 로드
    if (currentIndex >= filteredCards.length - 5) {
      const newCards = generateMockCards(20, userInfo.tier);
      const filtered = newCards.filter(card => 
        canAccessTier(userInfo.tier, card.tier, userInfo.subscription)
      );
      setFilteredCards(prev => [...prev, ...filtered]);
    }
  }, [currentIndex, filteredCards.length, userInfo, checkLimit]);

  // 액션 핸들러
  const handleView = () => {
    console.log('Viewed:', filteredCards[currentIndex]);
    handleNextCard();
  };

  const handleShowDetail = () => {
    // 상세 페이지로 이동
    router.push(`/profile/${filteredCards[currentIndex].userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  const currentCard = filteredCards[currentIndex];
  const { remaining } = checkDailyLimit(dailyViewCount, userInfo.subscription);

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-teal-50 to-cyan-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <LogoWithText className="scale-75 origin-left" />
            
            <div className="flex items-center gap-2">
              {/* 구독 상태 */}
              {userInfo.subscription.id !== 'free' && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-sm font-medium shadow-lg"
                >
                  <Crown className="w-4 h-4 animate-pulse" />
                  {userInfo.subscription.name}
                </motion.div>
              )}
              
              {/* 일일 제한 표시 (무료 플랜) */}
              {userInfo.subscription.id === 'free' && remaining > 0 && (
                <div className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600">
                  오늘 {remaining}개 남음
                </div>
              )}
              
              <Button variant="ghost" size="icon">
                <Filter className="w-5 h-5" />
              </Button>
              
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
              
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-8 max-w-lg">
        {currentCard ? (
          <AnimatePresence mode="wait">
            <MatchCard
              key={currentCard.userId}
              card={currentCard}
              onView={handleView}
              onShowDetail={handleShowDetail}
              subscription={userInfo.subscription}
            />
          </AnimatePresence>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">더 이상 표시할 프로필이 없습니다.</p>
              <Button 
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                새로고침
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* 업그레이드 모달 */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-teal-500 animate-pulse" />
                </div>
                
                <h3 className="text-2xl font-bold">일일 제한 도달</h3>
                <p className="text-gray-600">
                  오늘의 무료 프로필 조회를 모두 사용하셨습니다.
                  프리미엄으로 업그레이드하고 무제한으로 이용하세요!
                </p>
                
                {/* 프리미엄 혜택 */}
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 text-left space-y-2">
                  <p className="font-semibold text-teal-700 mb-2">프리미엄 혜택</p>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-teal-600 mt-0.5" />
                      <span>모든 티어 프로필 무제한 열람</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-teal-600 mt-0.5" />
                      <span>인스타그램 아이디 확인</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-teal-600 mt-0.5" />
                      <span>상세 프로필 정보</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowUpgradeModal(false)}
                  >
                    나중에
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg"
                    onClick={() => router.push('/pricing')}
                  >
                    업그레이드
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}