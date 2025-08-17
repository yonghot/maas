// 기본 타입 정의
export type Gender = 'male' | 'female';
export type AgeGroup = '20-25' | '26-30' | '31-35' | '36-40' | '40+';
export type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

// 남성 평가 카테고리
export interface MaleScoring {
  wealth: {
    income: number;      // 0-50점
    assets: number;      // 0-30점
    jobStability: number; // 0-20점
    total: number;       // 0-100점
  };
  sense: {
    socialIntelligence: number;  // 0-40점
    humor: number;               // 0-30점
    positivity: number;          // 0-30점
    total: number;              // 0-100점
  };
  physical: {
    bmi: number;          // 0-40점
    exercise: number;     // 0-40점
    style: number;        // 0-20점
    total: number;        // 0-100점
  };
}

// 여성 평가 카테고리
export interface FemaleScoring {
  age: {
    biologicalAge: number;  // 고정 점수표 기반
    total: number;         // 0-100점
  };
  appearance: {
    attractiveness: number;  // 0-50점
    bodyManagement: number;  // 0-30점
    style: number;          // 0-20점
    total: number;          // 0-100점
  };
  values: {
    emotionalStability: number;  // 0-50점
    rationalThinking: number;    // 0-30점
    familyValues: number;        // 0-20점
    total: number;              // 0-100점
  };
}

// 사용자 응답
export interface UserAnswer {
  questionId: string;
  value: string | number;
  score?: number;
}

export interface UserInfo {
  nickname?: string;
  gender: Gender;
  age: number;
  ageGroup: AgeGroup;
  region?: string;
}

// 리드 정보 (연락처 정보) - 레거시, 인스타그램 회원가입으로 대체됨
export interface UserLead {
  name: string;
  phone: string;
  email?: string;
  age: number;
  gender: Gender;
  region?: string;
  // 동의 항목
  privacyConsent: boolean;         // 개인정보 수집 동의 (필수)
  marketingConsent?: boolean;       // 마케팅 수신 동의 (선택)
  // 메타 정보
  submittedAt?: Date;
  testId?: string;                 // 연결된 테스트 ID
}

// 인스타그램 기반 회원가입
export interface UserAuth {
  instagramId: string;              // 인스타그램 아이디
  password: string;                 // 비밀번호
  instagramPublic: boolean;         // 인스타그램 공개 여부 (기본값: false)
}

// 사용자 프로필 (DB 저장용)
export interface UserProfile {
  id: string;                      // UUID
  instagramId: string;              // 인스타그램 아이디 (unique)
  instagramPublic: boolean;         // 인스타그램 공개 여부
  gender: Gender;
  age: number;
  region?: string;
  tier: Grade;                      // 등급 (S, A, B, C, D, F)
  totalScore: number;               // 전체 점수
  categoryScores: MaleScoring | FemaleScoring;  // 카테고리별 점수
  evaluationData: UserAnswer[];    // 평가 입력 데이터
  lastEvaluatedAt: Date;            // 마지막 평가 일시
  createdAt: Date;                  // 가입 일시
}

// 매칭 상호작용
export type MatchAction = 'like' | 'superlike' | 'pass';

export interface Match {
  id: string;
  userId: string;
  targetUserId: string;
  action: MatchAction;
  createdAt: Date;
}

// 성공적인 매칭 (상호 좋아요)
export interface SuccessfulMatch {
  id: string;
  user1Id: string;
  user2Id: string;
  matchedAt: Date;
}

// 매칭 대상 카드 정보
export interface MatchCard {
  userId: string;
  nickname?: string;                // 닉네임 또는 이니셜
  age: number;
  region?: string;
  tier: Grade;
  mainAttractPoints: string[];      // 주요 매력 포인트 3개
  instagramId?: string;              // 공개 설정인 경우만
}

// 구독 플랜
export type SubscriptionPlan = 'free' | 'basic' | 'premium';

export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  autoRenew?: boolean;
}

// 구독 플랜 상세
export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  price: number;
  originalPrice?: number;       // 원래 가격 (프로모션용)
  period: 'month' | 'year';
  status?: 'active' | 'coming_soon';  // 플랜 상태
  features: string[];
  limitations?: {
    dailyViews?: number;        // 일일 조회 제한
    tierAccessLevel?: number;    // 접근 가능한 티어 레벨 차이
    unlimitedScroll?: boolean;   // 무한 스크롤 가능 여부
  };
}

// 토스페이먼츠 결제 정보
export interface PaymentInfo {
  orderId: string;
  amount: number;
  method?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}

// 테스트 결과
export interface TestResult {
  id: string;
  userInfo: UserInfo;
  score: number;
  totalScore: number;
  grade: Grade;
  tier: string;
  gradeInfo: {
    title: string;
    description: string;
    color: string;
  };
  categoryScores: Record<string, number>;
  categories: MaleScoring | FemaleScoring;
  strengths: string[];
  weaknesses: string[];
  advice: string[];
  summary: string;
  createdAt: Date;
}

// 질문 타입
export type QuestionType = 'select' | 'slider' | 'number' | 'bmi-calculator';

export interface QuestionOption {
  value: string | number;
  label: string;
  score: number;
}

export interface Question {
  id: string;
  category: string;
  text: string;
  subText?: string;
  type: QuestionType;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  step?: number;
  labels?: Record<number, string>;
  genderSpecific?: Gender | 'all';
  required: boolean;
}