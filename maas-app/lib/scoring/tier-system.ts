// LOL 티어 시스템 기반 등급 체계

export interface TierInfo {
  tier: string;
  percentile: number;
  minScore: number;
  title: string;
  description: string;
  color: string;
  actualPercentile?: number;
  zScore?: number;
}

// 정규분포 파라미터
const distribution = {
  mean: 50,           // 평균 점수
  stdDev: 15,         // 표준편차
  skewness: 0.2       // 약간의 양의 왜도
};

// Z-score 계산
export function calculateZScore(score: number): number {
  return (score - distribution.mean) / distribution.stdDev;
}

// 백분위수 계산 (누적분포함수)
export function calculatePercentile(score: number): number {
  const z = calculateZScore(score);
  
  // 표준정규분포 CDF 계산 (Abramowitz and Stegun 근사식)
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  if (z > 0) {
    return (1 - probability) * 100;
  } else {
    return probability * 100;
  }
}

// LOL 티어 시스템
export const tierSystem: Record<string, Omit<TierInfo, 'tier'>> = {
  "Challenger": { 
    percentile: 99.9,     // 상위 0.1%
    minScore: 80,         // μ + 2σ
    title: "결혼 최강자",
    description: "극소수의 완벽한 조건",
    color: "#ff4e50"      // 빨간색
  },
  "GrandMaster": {
    percentile: 99.5,     // 상위 0.5%
    minScore: 77,
    title: "결혼 그랜드마스터",
    description: "최상위권 매력도",
    color: "#ff6b6b"      // 연한 빨간색
  },
  "Master": {
    percentile: 99,       // 상위 1%
    minScore: 75,         // μ + 1.67σ
    title: "결혼 마스터",
    description: "탁월한 결혼 조건",
    color: "#c44569"      // 자주색
  },
  "Diamond": {
    percentile: 96,       // 상위 4%
    minScore: 70,         // μ + 1.33σ
    title: "다이아몬드",
    description: "매우 우수한 매력",
    color: "#00d4ff"      // 하늘색
  },
  "Emerald": {
    percentile: 90,       // 상위 10%
    minScore: 65,         // μ + 1σ
    title: "에메랄드",
    description: "우수한 결혼 조건",
    color: "#00b894"      // 에메랄드색
  },
  "Platinum": {
    percentile: 80,       // 상위 20%
    minScore: 60,         // μ + 0.67σ
    title: "플래티넘",
    description: "준수한 매력도",
    color: "#74b9ff"      // 플래티넘색
  },
  "Gold": {
    percentile: 60,       // 상위 40%
    minScore: 53,         // μ + 0.2σ
    title: "골드",
    description: "평균 이상",
    color: "#fdcb6e"      // 금색
  },
  "Silver": {
    percentile: 40,       // 상위 60%
    minScore: 47,         // μ - 0.2σ
    title: "실버",
    description: "평균 수준",
    color: "#b2bec3"      // 은색
  },
  "Bronze": {
    percentile: 20,       // 상위 80%
    minScore: 40,         // μ - 0.67σ
    title: "브론즈",
    description: "노력이 필요함",
    color: "#cd7f32"      // 동색
  },
  "Iron": {
    percentile: 0,        // 하위 20%
    minScore: 0,          // μ - 1.33σ 이하
    title: "아이언",
    description: "많은 개선 필요",
    color: "#636e72"      // 회색
  }
};

// 점수로 티어 결정
export function getTier(score: number): TierInfo {
  const percentile = calculatePercentile(score);
  
  // 티어 시스템을 역순으로 확인 (높은 티어부터)
  const tiers = Object.entries(tierSystem).reverse();
  
  for (const [tierName, tierData] of tiers) {
    if (score >= tierData.minScore || percentile >= tierData.percentile) {
      return {
        tier: tierName,
        ...tierData,
        actualPercentile: Math.round(percentile * 10) / 10,
        zScore: Math.round(calculateZScore(score) * 100) / 100
      };
    }
  }
  
  // 기본값: Iron
  return {
    tier: "Iron",
    ...tierSystem.Iron,
    actualPercentile: Math.round(percentile * 10) / 10,
    zScore: Math.round(calculateZScore(score) * 100) / 100
  };
}

// 티어 간 매칭 가능 여부 확인
export function canMatch(tier1: string, tier2: string): boolean {
  const tierOrder = Object.keys(tierSystem);
  const index1 = tierOrder.indexOf(tier1);
  const index2 = tierOrder.indexOf(tier2);
  
  // 없는 티어면 false
  if (index1 === -1 || index2 === -1) return false;
  
  // 3단계 차이까지 매칭 가능 (예: Gold는 Platinum, Gold, Silver, Bronze와 매칭)
  return Math.abs(index1 - index2) <= 2;
}

// 티어별 이모지
export const tierEmojis: Record<string, string> = {
  "Challenger": "🔥",
  "GrandMaster": "👑", 
  "Master": "💎",
  "Diamond": "💠",
  "Emerald": "💚",
  "Platinum": "🔷",
  "Gold": "🥇",
  "Silver": "🥈",
  "Bronze": "🥉",
  "Iron": "⚫"
};

// 점수 분포 시뮬레이션 (테스트용)
export function simulateScoreDistribution(sampleSize: number = 10000): Record<string, number> {
  const tierCounts: Record<string, number> = {};
  
  // Box-Muller 변환으로 정규분포 생성
  for (let i = 0; i < sampleSize; i++) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const score = Math.max(0, Math.min(100, distribution.mean + z * distribution.stdDev));
    
    const tier = getTier(score);
    tierCounts[tier.tier] = (tierCounts[tier.tier] || 0) + 1;
  }
  
  // 백분율로 변환
  const tierPercentages: Record<string, number> = {};
  for (const [tier, count] of Object.entries(tierCounts)) {
    tierPercentages[tier] = Math.round((count / sampleSize) * 1000) / 10;
  }
  
  return tierPercentages;
}