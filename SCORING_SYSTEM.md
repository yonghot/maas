# MAAS 결혼매력평가 점수 계산 시스템
## Marriage Attractiveness Assessment System v3.0

---

## 1. 시스템 개요

### 1.1 평가 모델
MAAS는 성별별 차별화된 평가 모델을 사용하여 결혼 시장에서의 매력도를 객관적으로 평가합니다.

- **CAI-M (Male)**: 재력(Wealth) × 센스(Sense) × 피지컬(Physical) 기반 평가
- **CAI-F (Female)**: 나이(Age) × 외모(Appearance) × 가치관(Values) 기반 평가
- **정규분포 기반**: 평균 50점, 표준편차 15점의 정규분포 모델
- **LOL 티어 시스템**: 10단계 세분화된 등급 체계

### 1.2 핵심 원칙
- 성별별 차별화된 가중치 적용
- 정규분포 기반 상대 평가
- 데이터 기반 객관적 측정
- 실시간 백분위수 계산

---

## 2. 점수 계산 시스템

### 2.1 남성 평가 (CAI-M)

#### 계산식
```typescript
// 35세 이상 여성 평가 기준
const maleScore = (wealth * 0.6) + (sense * 0.3) + (physical * 0.1);
```

#### 세부 평가 항목

**재력 (Wealth) - 최대 100점**
```typescript
interface WealthScoring {
  income: number;      // 소득 (0-50점)
  assets: number;      // 자산 (0-30점)  
  jobStability: number; // 직업 안정성 (0-20점)
}

// 소득 점수표
~3,000만원: 10점
3,001~5,000만원: 20점
5,001~7,000만원: 30점
7,001~1억원: 40점
1억원 초과: 50점

// 자산 점수표
~5,000만원: 5점
5,001만~2억원: 15점
2억원 초과: 30점

// 직업 안정성
전문직/공무원: 20점
대기업 정규직: 15점
중소기업 정규직: 10점
계약직/프리랜서: 5점
```

**센스 (Sense) - 최대 100점**
```typescript
interface SenseScoring {
  socialIntelligence: number; // 사회적 지능 (0-40점)
  humor: number;             // 유머 감각 (0-30점)
  positivity: number;        // 긍정성 (0-30점)
}
```

**피지컬 (Physical) - 최대 100점**
```typescript
interface PhysicalScoring {
  bmi: number;       // BMI 지수 (0-40점)
  exercise: number;  // 운동 습관 (0-40점)
  style: number;     // 스타일 (0-20점)
}

// BMI 점수표
정상 (18.5-24.9): 40점
과체중/저체중: 20점
비만: 10점
```

### 2.2 여성 평가 (CAI-F)

#### 계산식
```typescript
// 평가자 연령에 따른 가중치 변화
const femaleScore = (evaluatorAge < 35) 
  ? (age * 0.2) + (appearance * 0.4) + (values * 0.4)  // 젊은 남성 관점
  : (age * 0.4) + (appearance * 0.2) + (values * 0.4); // 35세+ 남성 관점
```

#### 세부 평가 항목

**나이 (Age) - 최대 100점**
```typescript
// 생물학적 출산 리스크 기반 고정 점수표
20-29세: 95점
30-32세: 85점
33-34세: 75점
35세: 60점
36-37세: 50점
38-40세: 35점
40세+: 20점
```

**외모 (Appearance) - 최대 100점**
```typescript
interface AppearanceScoring {
  attractiveness: number;  // 객관적 매력 (0-50점)
  bodyManagement: number;  // 몸매 관리 (0-30점)
  style: number;          // 스타일 (0-20점)
}
```

**가치관 (Values) - 최대 100점**
```typescript
interface ValuesScoring {
  emotionalStability: number;  // 정서적 안정성 (0-50점)
  rationalThinking: number;    // 합리적 사고 (0-30점)
  familyValues: number;        // 가족 가치관 (0-20점)
}
```

---

## 3. 티어 시스템

### 3.1 정규분포 기반 백분위수 계산

```typescript
// 정규분포 파라미터
const distribution = {
  mean: 50,           // 평균 점수
  stdDev: 15,         // 표준편차
  skewness: 0.2       // 약간의 양의 왜도
};

// Z-score 계산
function calculateZScore(score: number): number {
  return (score - distribution.mean) / distribution.stdDev;
}

// 백분위수 계산 (누적분포함수)
function calculatePercentile(score: number): number {
  const z = calculateZScore(score);
  // 표준정규분포 CDF 계산 (Abramowitz and Stegun 근사식)
  // ... 계산 로직
  return percentile;
}
```

### 3.2 LOL 기반 티어 등급

| 티어 | 명칭 | 상위 % | 점수 구간 | 설명 |
|------|------|--------|-----------|------|
| **Challenger** | 챌린저 | 0.01% | 95+ | 시장의 법칙, 최상위 계층 |
| **Grandmaster** | 그랜드마스터 | 0.05% | 92-94 | 독보적 존재감 |
| **Master** | 마스터 | 0.5% | 88-91 | 선망의 대상, 엘리트 |
| **Diamond** | 다이아몬드 | 3% | 82-87 | 확실한 상류층 |
| **Emerald** | 에메랄드 | 15% | 71-81 | 상위권의 증명 |
| **Platinum** | 플래티넘 | 35% | 58-70 | 평균 이상의 매력 |
| **Gold** | 골드 | 65% | 43-57 | 대한민국 표준 |
| **Silver** | 실버 | 85% | 31-42 | 성장의 기회 |
| **Bronze** | 브론즈 | 95% | 21-30 | 기본기 구축 |
| **Iron** | 아이언 | 99% | 0-20 | 자기 객관화의 시작 |

### 3.3 티어별 특성 및 매칭 전략

```typescript
interface TierInfo {
  tier: string;
  percentile: number;
  minScore: number;
  title: string;
  description: string;
  color: string;
  matchingStrategy: string;
}

// 티어별 매칭 범위
const matchingRange = {
  'Challenger': ['Challenger', 'Grandmaster', 'Master'],
  'Diamond': ['Master', 'Diamond', 'Emerald'],
  'Gold': ['Platinum', 'Gold', 'Silver'],
  // ...
};
```

---

## 4. 구현 가이드

### 4.1 프로젝트 구조
```
lib/
├── scoring/
│   ├── calculator.ts       # 점수 계산 로직
│   ├── tier-system.ts      # 티어 및 백분위수
│   └── analysis.ts         # 결과 분석 생성
├── questions/
│   ├── male.ts            # 남성용 질문
│   └── female.ts          # 여성용 질문
└── types/
    └── index.ts            # 타입 정의
```

### 4.2 핵심 타입 정의

```typescript
// 테스트 결과
interface TestResult {
  id: string;
  userInfo: UserInfo;
  score: number;              // 100점 만점 점수
  percentile: number;         // 백분위수
  tier: string;              // LOL 티어
  categories: MaleScoring | FemaleScoring;
  categoryScores: {
    [key: string]: number;
  };
  strengths: string[];
  weaknesses: string[];
  advice: string[];
  createdAt: Date;
}

// 사용자 정보
interface UserInfo {
  gender: 'male' | 'female';
  age: number;
  region: string;
  nickname?: string;
}
```

### 4.3 점수 계산 클래스

```typescript
export class ScoringCalculator {
  
  // 통합 점수 계산
  calculateScore(
    answers: UserAnswer[],
    userInfo: UserInfo
  ): TestResult {
    if (userInfo.gender === 'male') {
      return this.calculateMaleScore(answers, userInfo);
    } else {
      return this.calculateFemaleScore(answers, userInfo);
    }
  }
  
  // 남성 점수 계산
  private calculateMaleScore(
    answers: UserAnswer[],
    userInfo: UserInfo
  ): TestResult {
    const scoring = this.extractMaleScoring(answers);
    const finalScore = Math.round(
      (scoring.wealth.total * 0.6) + 
      (scoring.sense.total * 0.3) + 
      (scoring.physical.total * 0.1)
    );
    
    return this.generateResult(finalScore, scoring, userInfo);
  }
  
  // 여성 점수 계산
  private calculateFemaleScore(
    answers: UserAnswer[],
    userInfo: UserInfo,
    evaluatorAge: number = 35
  ): TestResult {
    const scoring = this.extractFemaleScoring(answers, userInfo.age);
    
    let finalScore: number;
    if (evaluatorAge < 35) {
      finalScore = Math.round(
        (scoring.age.total * 0.2) + 
        (scoring.appearance.total * 0.4) + 
        (scoring.values.total * 0.4)
      );
    } else {
      finalScore = Math.round(
        (scoring.age.total * 0.4) + 
        (scoring.appearance.total * 0.2) + 
        (scoring.values.total * 0.4)
      );
    }
    
    return this.generateResult(finalScore, scoring, userInfo);
  }
  
  // 결과 생성
  private generateResult(
    score: number,
    categories: any,
    userInfo: UserInfo
  ): TestResult {
    const percentile = calculatePercentile(score);
    const tier = getTierByScore(score);
    const analysis = generateAnalysis(categories, userInfo.gender);
    
    return {
      id: generateId(),
      userInfo,
      score,
      percentile,
      tier,
      categories,
      categoryScores: this.extractCategoryScores(categories),
      ...analysis,
      createdAt: new Date()
    };
  }
}
```

---

## 5. 질문 데이터 구조

### 5.1 질문 타입

```typescript
type QuestionType = 'select' | 'slider' | 'number' | 'bmi-calculator';

interface Question {
  id: string;
  category: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: Option[];
  min?: number;
  max?: number;
  step?: number;
}

interface Option {
  value: string | number;
  label: string;
  score: number;
}
```

### 5.2 질문 예시

```typescript
// 남성용 질문 예시
export const maleQuestions: Question[] = [
  {
    id: 'income',
    category: 'wealth',
    text: '현재 연 소득은 얼마입니까?',
    type: 'select',
    required: true,
    options: [
      { value: 2000, label: '3천만원 미만', score: 10 },
      { value: 4000, label: '3천-5천만원', score: 20 },
      { value: 6000, label: '5천-7천만원', score: 30 },
      { value: 8500, label: '7천만-1억원', score: 40 },
      { value: 12000, label: '1억원 초과', score: 50 }
    ]
  },
  // ... 추가 질문들
];

// 여성용 질문 예시
export const femaleQuestions: Question[] = [
  {
    id: 'attractiveness',
    category: 'appearance',
    text: '스스로 생각하기에 이성에게 어필할 만한 외모인가요?',
    type: 'slider',
    required: true,
    min: 10,
    max: 50,
    step: 10
  },
  // ... 추가 질문들
];
```

---

## 6. 분석 및 조언 생성

### 6.1 강점/약점 분석

```typescript
function analyzeStrengthsAndWeaknesses(
  categories: any,
  gender: 'male' | 'female'
): { strengths: string[], weaknesses: string[] } {
  const strengths = [];
  const weaknesses = [];
  
  // 카테고리별 점수 분석
  Object.entries(categories).forEach(([key, category]: [string, any]) => {
    if (category.total >= 80) {
      strengths.push(getCategoryLabel(key, gender));
    } else if (category.total <= 40) {
      weaknesses.push(getCategoryLabel(key, gender));
    }
  });
  
  return { strengths, weaknesses };
}
```

### 6.2 맞춤형 조언 생성

```typescript
function generateAdvice(
  categories: any,
  gender: 'male' | 'female',
  tier: string
): string[] {
  const advice = [];
  
  // 티어별 일반 조언
  advice.push(getTierAdvice(tier));
  
  // 약점 개선 조언
  if (gender === 'male') {
    if (categories.wealth.total < 50) {
      advice.push('커리어 개발과 재테크 능력 향상에 집중하세요');
    }
    if (categories.sense.total < 50) {
      advice.push('대인관계 스킬과 유머 감각을 키워보세요');
    }
    if (categories.physical.total < 50) {
      advice.push('규칙적인 운동과 스타일 개선을 고려해보세요');
    }
  } else {
    if (categories.appearance.total < 50) {
      advice.push('꾸준한 자기관리로 최상의 컨디션을 유지하세요');
    }
    if (categories.values.total < 50) {
      advice.push('정서적 안정성과 소통 능력을 개발하세요');
    }
  }
  
  return advice;
}
```

---

## 7. 데이터베이스 스키마

### 7.1 테스트 결과 저장

```sql
-- 회원 테스트 결과
CREATE TABLE test_results (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  gender VARCHAR(10),
  age INTEGER,
  region VARCHAR(50),
  nickname VARCHAR(50),
  total_score INTEGER,
  percentile FLOAT,
  tier VARCHAR(20),
  grade VARCHAR(2),
  -- 카테고리별 점수 (JSONB)
  evaluation_data JSONB,
  answers JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 익명 테스트 결과
CREATE TABLE anonymous_test_results (
  id UUID PRIMARY KEY,
  session_id VARCHAR(100),
  gender VARCHAR(10),
  age INTEGER,
  region VARCHAR(50),
  nickname VARCHAR(50),
  total_score INTEGER,
  percentile FLOAT,
  tier VARCHAR(20),
  grade VARCHAR(2),
  -- 카테고리별 점수 (JSONB)
  evaluation_data JSONB,
  answers JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 통합 뷰 (관리자용)
CREATE VIEW all_test_results AS
SELECT 
  id,
  'registered' as user_type,
  user_id as user_identifier,
  gender,
  age,
  total_score,
  percentile,
  tier,
  evaluation_data,
  created_at
FROM test_results
UNION ALL
SELECT 
  id,
  'anonymous' as user_type,
  session_id as user_identifier,
  gender,
  age,
  total_score,
  percentile,
  tier,
  evaluation_data,
  created_at
FROM anonymous_test_results;
```

---

## 8. API 엔드포인트

### 8.1 점수 계산 API

```typescript
// POST /api/calculate-score
interface CalculateScoreRequest {
  userInfo: UserInfo;
  answers: UserAnswer[];
}

interface CalculateScoreResponse {
  result: TestResult;
  shareUrl: string;
}
```

### 8.2 결과 저장 API

```typescript
// POST /api/test-results
interface SaveResultRequest {
  result: TestResult;
  isAuthenticated: boolean;
}

interface SaveResultResponse {
  id: string;
  type: 'registered' | 'anonymous';
  sessionId?: string;
}
```

---

## 9. 테스트 시나리오

```typescript
describe('MAAS 점수 계산 시스템', () => {
  const calculator = new ScoringCalculator();
  
  describe('남성 평가', () => {
    it('고소득 전문직 남성', () => {
      const answers = createMaleAnswers({
        income: 12000,  // 1억 초과
        assets: 30000,  // 2억 초과
        job: 'professional'
      });
      const result = calculator.calculateScore(answers, maleUserInfo);
      
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.tier).toBe('Diamond');
    });
  });
  
  describe('여성 평가', () => {
    it('20대 여성 평가', () => {
      const userInfo = { gender: 'female', age: 25 };
      const result = calculator.calculateScore(answers, userInfo);
      
      expect(result.categories.age.total).toBe(95);
      expect(result.percentile).toBeGreaterThan(50);
    });
  });
  
  describe('백분위수 계산', () => {
    it('평균 점수는 50 백분위수', () => {
      const percentile = calculatePercentile(50);
      expect(percentile).toBeCloseTo(50, 1);
    });
    
    it('1 표준편차 위는 약 84 백분위수', () => {
      const percentile = calculatePercentile(65); // 50 + 15
      expect(percentile).toBeCloseTo(84.1, 1);
    });
  });
});
```

---

## 10. 향후 개선 사항

### 10.1 고도화 방향
- [ ] 머신러닝 기반 동적 가중치 조정
- [ ] 변수 간 상관관계 분석 및 반영
- [ ] 지역별/연령별 세분화된 평가 모델
- [ ] 매칭 성공률 예측 모델 추가
- [ ] A/B 테스트를 통한 지속적 개선

### 10.2 기술적 개선
- [ ] 실시간 백분위수 업데이트
- [ ] 캐싱 전략 최적화
- [ ] 분산 처리 시스템 구축
- [ ] 데이터 익명화 및 보안 강화

---

## 변경 이력

### v3.0 (2025-08-20)
- SCORING_SYSTEM.md와 SCORING_IMPLEMENTATION.md 통합
- MECE 원칙에 따른 구조 재정리
- LOL 티어 시스템 공식 채택
- 정규분포 기반 백분위수 계산 추가

### v2.0 (2025-08-19)
- CAI-M, CAI-F 모델 정립
- 성별별 가중치 차별화
- 구현 가이드 추가

### v1.0 (2025-08-16)
- 초기 점수 계산 시스템 설계
- 5개 카테고리 평가 체계

---

*이 문서는 MAAS 점수 계산 시스템의 공식 사양서입니다.*
*실제 구현 시 이 문서를 기준으로 개발하시기 바랍니다.*
*최종 업데이트: 2025-08-21*