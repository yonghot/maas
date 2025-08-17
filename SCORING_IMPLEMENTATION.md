# MAAS 점수 계산 시스템 구현 가이드
## 통합된 평가 시스템 v2.0

---

## 📊 핵심 계산 모델

### 남성 평가 (CAI-M)
```typescript
// 최종 점수 계산식
const maleScore = (wealth * 0.6) + (sense * 0.3) + (physical * 0.1);

// 35세 이상 여성 관점 기준
const weights = {
  wealth: 0.6,    // 재력 60%
  sense: 0.3,     // 센스 30%
  physical: 0.1   // 피지컬 10%
};
```

### 여성 평가 (CAI-F)
```typescript
// 평가자 연령에 따른 가중치 변화
const femaleScore = (targetAge < 35) 
  ? (age * 0.2) + (appearance * 0.4) + (values * 0.4)  // 젊은 남성 관점
  : (age * 0.4) + (appearance * 0.2) + (values * 0.4); // 35세+ 남성 관점
```

---

## 🔧 구현 코드

### 1. 데이터 타입 정의
```typescript
// lib/types/scoring.ts
export interface MaleScoring {
  wealth: {
    income: number;      // 0-50점
    assets: number;      // 0-30점
    jobStability: number; // 0-20점
  };
  sense: {
    socialIntelligence: number;  // 0-40점
    humor: number;               // 0-30점
    positivity: number;          // 0-30점
  };
  physical: {
    bmi: number;          // 0-40점
    exercise: number;     // 0-40점
    style: number;        // 0-20점
  };
}

export interface FemaleScoring {
  age: {
    biologicalAge: number;  // 고정 점수표 기반
  };
  appearance: {
    attractiveness: number;  // 0-50점
    bodyManagement: number;  // 0-30점
    style: number;          // 0-20점
  };
  values: {
    emotionalStability: number;  // 0-50점
    rationalThinking: number;    // 0-30점
    familyValues: number;        // 0-20점
  };
}
```

### 2. 점수 계산 함수
```typescript
// lib/scoring/calculator.ts
export class ScoringCalculator {
  
  // 남성 점수 계산
  calculateMaleScore(answers: MaleAnswers): number {
    const wealth = this.calculateWealth(answers);
    const sense = this.calculateSense(answers);
    const physical = this.calculatePhysical(answers);
    
    return Math.round(
      (wealth * 0.6) + 
      (sense * 0.3) + 
      (physical * 0.1)
    );
  }
  
  // 여성 점수 계산
  calculateFemaleScore(
    answers: FemaleAnswers, 
    evaluatorAge: number
  ): number {
    const age = this.calculateAgeScore(answers.age);
    const appearance = this.calculateAppearance(answers);
    const values = this.calculateValues(answers);
    
    if (evaluatorAge < 35) {
      return Math.round(
        (age * 0.2) + 
        (appearance * 0.4) + 
        (values * 0.4)
      );
    } else {
      return Math.round(
        (age * 0.4) + 
        (appearance * 0.2) + 
        (values * 0.4)
      );
    }
  }
  
  // 재력 점수 계산 (남성)
  private calculateWealth(answers: MaleAnswers): number {
    let score = 0;
    
    // 소득 (50점)
    if (answers.income <= 3000) score += 10;
    else if (answers.income <= 5000) score += 20;
    else if (answers.income <= 7000) score += 30;
    else if (answers.income <= 10000) score += 40;
    else score += 50;
    
    // 자산 (30점)
    if (answers.assets <= 5000) score += 5;
    else if (answers.assets <= 20000) score += 15;
    else score += 30;
    
    // 직업 안정성 (20점)
    score += this.getJobStabilityScore(answers.job);
    
    return score;
  }
  
  // 나이 점수 (여성 - 고정 점수표)
  private calculateAgeScore(age: number): number {
    if (age <= 29) return 95;
    if (age <= 32) return 85;
    if (age <= 34) return 75;
    if (age === 35) return 60;
    if (age <= 37) return 50;
    if (age <= 40) return 35;
    return 20;
  }
}
```

### 3. 질문 데이터 구조
```typescript
// lib/questions/male.ts
export const maleQuestions = [
  // 재력 관련 질문
  {
    id: 'income',
    category: 'wealth',
    text: '현재 연 소득은 얼마입니까?',
    type: 'select',
    options: [
      { value: 2000, label: '3천만원 미만', score: 10 },
      { value: 4000, label: '3천-5천만원', score: 20 },
      { value: 6000, label: '5천-7천만원', score: 30 },
      { value: 8500, label: '7천만-1억원', score: 40 },
      { value: 12000, label: '1억원 초과', score: 50 }
    ]
  },
  {
    id: 'assets',
    category: 'wealth',
    text: '순자산(부동산, 금융자산 등)은 얼마입니까?',
    type: 'select',
    options: [
      { value: 3000, label: '5천만원 미만', score: 5 },
      { value: 12500, label: '5천만-2억원', score: 15 },
      { value: 30000, label: '2억원 초과', score: 30 }
    ]
  },
  
  // 센스 관련 질문
  {
    id: 'social_intelligence',
    category: 'sense',
    text: '대화 시 분위기를 주도하고 상대방의 감정을 잘 파악하시나요?',
    type: 'slider',
    min: 10,
    max: 40,
    step: 5,
    labels: {
      10: '전혀 아님',
      25: '보통',
      40: '매우 그렇다'
    }
  },
  
  // 피지컬 관련 질문
  {
    id: 'bmi',
    category: 'physical',
    text: '키와 몸무게를 입력해주세요',
    type: 'bmi-calculator',
    scoring: {
      normal: 40,      // BMI 18.5-24.9
      overweight: 20,  // BMI 25-29.9
      obese: 10        // BMI 30+
    }
  }
];

// lib/questions/female.ts
export const femaleQuestions = [
  // 나이 (자동 계산)
  {
    id: 'age',
    category: 'age',
    text: '나이를 입력해주세요',
    type: 'number',
    min: 20,
    max: 50
  },
  
  // 외모 관련 질문
  {
    id: 'attractiveness',
    category: 'appearance',
    text: '스스로 생각하기에 이성에게 어필할 만한 외모인가요?',
    type: 'slider',
    min: 10,
    max: 50,
    step: 10,
    labels: {
      10: '전혀 아니다',
      30: '보통',
      50: '매우 그렇다'
    }
  },
  
  // 가치관 관련 질문
  {
    id: 'emotional_stability',
    category: 'values',
    text: '스트레스 상황에서 감정적으로 행동하기보다 이성적으로 대처하시나요?',
    type: 'slider',
    min: 10,
    max: 50,
    step: 10,
    labels: {
      10: '전혀 아니다',
      30: '보통',
      50: '매우 그렇다'
    }
  }
];
```

### 4. 등급 시스템
```typescript
// lib/scoring/grading.ts
export function getGrade(score: number): Grade {
  if (score >= 95) return { 
    grade: 'S', 
    title: '결혼 끝판왕',
    description: '상위 1% - 모든 면에서 완벽한 매력',
    color: 'gradient-to-r from-yellow-400 to-yellow-600'
  };
  if (score >= 85) return { 
    grade: 'A', 
    title: '결혼 준비 완료',
    description: '상위 10% - 매우 매력적인 결혼 상대',
    color: 'gradient-to-r from-purple-400 to-purple-600'
  };
  if (score >= 70) return { 
    grade: 'B', 
    title: '매력 충분',
    description: '상위 30% - 충분히 매력적',
    color: 'gradient-to-r from-blue-400 to-blue-600'
  };
  if (score >= 55) return { 
    grade: 'C', 
    title: '노력하면 가능',
    description: '평균 수준 - 몇 가지 개선 필요',
    color: 'gradient-to-r from-green-400 to-green-600'
  };
  if (score >= 40) return { 
    grade: 'D', 
    title: '자기계발 필요',
    description: '하위 30% - 많은 노력 필요',
    color: 'gradient-to-r from-orange-400 to-orange-600'
  };
  return { 
    grade: 'F', 
    title: '솔로가 편해요',
    description: '하위 10% - 전면적인 개선 필요',
    color: 'gradient-to-r from-red-400 to-red-600'
  };
}
```

### 5. 결과 분석 생성
```typescript
// lib/analysis/generator.ts
export class AnalysisGenerator {
  
  generateMaleAnalysis(scores: MaleScoring): Analysis {
    const strengths = [];
    const weaknesses = [];
    const advice = [];
    
    // 재력 분석
    if (scores.wealth.income >= 40) {
      strengths.push('높은 소득 수준');
    } else if (scores.wealth.income <= 20) {
      weaknesses.push('소득 개선 필요');
      advice.push('커리어 개발과 스킬 향상에 투자하세요');
    }
    
    // 센스 분석
    if (scores.sense.humor >= 25) {
      strengths.push('뛰어난 유머 감각');
    } else {
      advice.push('다양한 사람들과 교류하며 소통 능력을 키우세요');
    }
    
    // 피지컬 분석
    if (scores.physical.exercise >= 30) {
      strengths.push('건강한 생활 습관');
    } else {
      advice.push('규칙적인 운동으로 건강과 외모를 관리하세요');
    }
    
    return {
      strengths,
      weaknesses,
      advice,
      summary: this.generateSummary(scores)
    };
  }
  
  generateFemaleAnalysis(scores: FemaleScoring): Analysis {
    const strengths = [];
    const weaknesses = [];
    const advice = [];
    
    // 나이 분석
    if (scores.age.biologicalAge >= 85) {
      strengths.push('최적의 결혼 적령기');
    } else if (scores.age.biologicalAge <= 50) {
      advice.push('나이는 숫자일 뿐, 다른 매력을 강화하세요');
    }
    
    // 외모 분석
    if (scores.appearance.bodyManagement >= 25) {
      strengths.push('뛰어난 자기 관리');
    } else {
      advice.push('건강한 식단과 운동으로 최상의 컨디션을 유지하세요');
    }
    
    // 가치관 분석
    if (scores.values.emotionalStability >= 40) {
      strengths.push('높은 정서적 안정성');
    } else {
      advice.push('명상이나 상담을 통해 감정 조절 능력을 기르세요');
    }
    
    return {
      strengths,
      weaknesses,
      advice,
      summary: this.generateSummary(scores)
    };
  }
}
```

---

## 📱 UI 구현 예시

### 질문 화면
```tsx
// components/test/QuestionCard.tsx
export function QuestionCard({ question, onAnswer }) {
  if (question.type === 'slider') {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{question.text}</h3>
        <Slider
          min={question.min}
          max={question.max}
          step={question.step}
          onValueChange={onAnswer}
        />
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          {Object.entries(question.labels).map(([value, label]) => (
            <span key={value}>{label}</span>
          ))}
        </div>
      </Card>
    );
  }
  
  // 다른 질문 타입들...
}
```

### 결과 화면
```tsx
// components/result/ScoreDisplay.tsx
export function ScoreDisplay({ score, grade }) {
  return (
    <div className="text-center py-8">
      <div className="relative inline-block">
        <div className={`text-8xl font-bold bg-${grade.color} bg-clip-text text-transparent`}>
          {score}
        </div>
        <div className="text-3xl font-bold mt-2">{grade.grade}급</div>
      </div>
      <h2 className="text-2xl font-semibold mt-4">{grade.title}</h2>
      <p className="text-gray-600 mt-2">{grade.description}</p>
    </div>
  );
}
```

---

## 🎯 체크포인트

### 구현 완료 기준
- [ ] 남성/여성 별도 평가 로직
- [ ] 가중치 시스템 정확한 적용
- [ ] 모든 질문 타입 구현 (select, slider, BMI)
- [ ] 점수 계산 정확도 검증
- [ ] 등급별 메시지 및 분석 생성

### 테스트 시나리오
```typescript
// __tests__/scoring.test.ts
describe('점수 계산 시스템', () => {
  it('남성 고소득자 점수 계산', () => {
    const answers = {
      income: 12000,  // 1억 초과
      assets: 30000,  // 2억 초과
      job: 'professional'
    };
    const score = calculator.calculateMaleScore(answers);
    expect(score).toBeGreaterThan(80);
  });
  
  it('여성 연령별 점수 변화', () => {
    const score25 = calculator.calculateFemaleScore({ age: 25 }, 35);
    const score35 = calculator.calculateFemaleScore({ age: 35 }, 35);
    expect(score25).toBeGreaterThan(score35);
  });
});
```

---

*이 구현 가이드는 새로운 평가 시스템을 기반으로 작성되었습니다.*
*실제 구현 시 세부 조정이 필요할 수 있습니다.*