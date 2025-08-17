import { PlanDetails } from '@/lib/types';

export const subscriptionPlans: Record<string, PlanDetails> = {
  free: {
    id: 'free',
    name: '무료 플랜',
    price: 0,
    period: 'month',
    features: [
      '나와 같거나 낮은 티어 프로필 열람',
      '일일 30개 프로필 제한',
      '기본 프로필 정보만 열람',
      '좋아요 일일 10개 제한'
    ],
    limitations: {
      dailyViews: 30,
      tierAccessLevel: 0,  // 같거나 낮은 티어만
      unlimitedScroll: false
    }
  },
  basic: {
    id: 'basic',
    name: '베이직 플랜',
    price: 1900,  // 프로모션 가격
    originalPrice: 3800,
    period: 'month',
    features: [
      '모든 티어 프로필 열람 가능',
      '무제한 프로필 열람',
      '상세 프로필 정보 확인',
      '인스타그램 아이디 확인'
    ],
    limitations: {
      dailyViews: -1,  // 무제한
      tierAccessLevel: 10,  // 모든 티어
      unlimitedScroll: true
    }
  },
  premium: {
    id: 'premium',
    name: '프리미엄 플랜',
    price: 3900,  // 프로모션 가격
    originalPrice: 7800,
    period: 'month',
    status: 'coming_soon',  // 준비중
    features: [
      '베이직 플랜의 모든 기능',
      '프로필 우선 노출',
      '프리미엄 배지',
      '고급 필터링 기능',
      '전용 고객 지원'
    ],
    limitations: {
      dailyViews: -1,  // 무제한
      tierAccessLevel: 10,  // 모든 티어
      unlimitedScroll: true
    }
  }
};

// 티어 접근 권한 확인
export function canAccessTier(
  userTier: string,
  targetTier: string,
  subscription: PlanDetails
): boolean {
  const tierOrder = [
    'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 
    'Emerald', 'Diamond', 'Master', 'GrandMaster', 'Challenger'
  ];
  
  const userIndex = tierOrder.indexOf(userTier);
  const targetIndex = tierOrder.indexOf(targetTier);
  
  if (userIndex === -1 || targetIndex === -1) return false;
  
  // 무료 플랜: 같거나 낮은 티어만
  if (subscription.id === 'free') {
    return targetIndex <= userIndex;
  }
  
  // 유료 플랜: 모든 티어 접근 가능
  return true;
}

// 일일 조회 제한 확인
export function checkDailyLimit(
  viewCount: number,
  subscription: PlanDetails
): { canView: boolean; remaining: number } {
  const limit = subscription.limitations?.dailyViews || 0;
  
  // 무제한인 경우
  if (limit === -1) {
    return { canView: true, remaining: -1 };
  }
  
  const remaining = Math.max(0, limit - viewCount);
  return {
    canView: viewCount < limit,
    remaining
  };
}