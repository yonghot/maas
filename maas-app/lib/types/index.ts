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
}

// 리드 정보 (연락처 정보)
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

// 테스트 결과
export interface TestResult {
  id: string;
  userInfo: UserInfo;
  score: number;
  grade: Grade;
  gradeInfo: {
    title: string;
    description: string;
    color: string;
  };
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