# MAAS 개발 가이드
## Marriage Attractiveness Assessment System - Development Guide

---

## 🎯 프로젝트 핵심 목표

### 즉시 달성 목표 (MVP)
1. **5분 내 완료** - 빠르고 간단한 테스트
2. **모바일 최적화** - 90% 이상이 모바일 사용
3. **SNS 공유 최적화** - 원클릭 공유, 매력적인 결과 카드
4. **즉각적인 만족감** - 재미있는 결과와 시각적 효과

### 핵심 성공 지표
- 완료율 > 80%
- 공유율 > 30%
- 재방문율 > 20%

---

## 🏗️ 기술 스택 및 프로젝트 구조

### 기술 스택
```javascript
// package.json 의존성
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "tailwindcss": "3.x",
    "shadcn-ui": "latest",
    "zustand": "4.x",
    "framer-motion": "11.x",
    "recharts": "2.x",
    "react-share": "5.x"
  }
}
```

### 프로젝트 구조
```
maas/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx             # 랜딩 페이지
│   ├── test/
│   │   └── page.tsx         # 테스트 페이지
│   ├── result/
│   │   └── [id]/page.tsx    # 결과 페이지
│   └── api/
│       └── calculate/       # 점수 계산 API
├── components/
│   ├── ui/                  # shadcn/ui 컴포넌트
│   ├── landing/            # 랜딩 페이지 컴포넌트
│   ├── test/               # 테스트 관련 컴포넌트
│   └── result/             # 결과 페이지 컴포넌트
├── lib/
│   ├── scoring/            # 점수 계산 로직
│   ├── questions/          # 질문 데이터
│   └── utils/              # 유틸리티 함수
├── hooks/                  # 커스텀 훅
├── store/                  # Zustand 스토어
└── public/                 # 정적 파일
```

---

## 📊 데이터 모델

### 1. 사용자 응답 데이터
```typescript
interface UserResponse {
  gender: 'male' | 'female';
  ageGroup: '20-25' | '26-30' | '31-35' | '36-40' | '40+';
  nickname?: string;
  answers: {
    [questionId: string]: number | string;
  };
  timestamp: Date;
}
```

### 2. 질문 데이터 구조
```typescript
interface Question {
  id: string;
  category: 'appearance' | 'economic' | 'personality' | 'lifestyle' | 'relationship';
  text: string;
  type: 'single' | 'slider' | 'image' | 'ranking';
  options?: Option[];
  weight: number;
  genderSpecific?: 'male' | 'female' | 'all';
}

interface Option {
  value: string | number;
  label: string;
  score: number;
  image?: string;
}
```

### 3. 결과 데이터
```typescript
interface TestResult {
  id: string;
  score: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  categories: {
    appearance: number;
    economic: number;
    personality: number;
    lifestyle: number;
    relationship: number;
  };
  strengths: string[];
  weaknesses: string[];
  advice: string;
  shareImage: string;
  createdAt: Date;
}
```

---

## 🎨 UI/UX 구현 가이드

### 1. 랜딩 페이지
```tsx
// 핵심 컴포넌트
<Hero />           // 매력적인 헤드라인과 CTA
<TestPreview />    // 테스트 미리보기
<Statistics />     // 참여자 수, 평균 점수 등
<StartButton />    // 큰 시작 버튼
```

### 2. 테스트 페이지
```tsx
// 필수 기능
- 프로그레스 바 (상단 고정)
- 질문 전환 애니메이션
- 뒤로가기 버튼
- 자동 저장 (localStorage)
```

### 3. 결과 페이지
```tsx
// 구성 요소
<ScoreDisplay />    // 큰 점수와 등급
<RadarChart />      // 5각형 레이더 차트
<Analysis />        // 장단점 분석
<ShareButtons />    // SNS 공유 버튼
<RetryButton />     // 재도전 버튼
```

---

## 💡 핵심 기능 구현

### 1. 점수 계산 시스템
```typescript
// lib/scoring/calculator.ts
export function calculateScore(
  responses: UserResponse
): TestResult {
  // 1. 성별별 가중치 적용
  const weights = getWeights(responses.gender);
  
  // 2. 카테고리별 점수 계산
  const categoryScores = calculateCategoryScores(
    responses.answers,
    weights
  );
  
  // 3. 보정 계수 적용
  const adjustedScore = applyModifiers(
    categoryScores,
    responses.ageGroup
  );
  
  // 4. 등급 산정
  const grade = determineGrade(adjustedScore);
  
  return generateResult(adjustedScore, grade);
}
```

### 2. SNS 공유 기능
```typescript
// 카카오톡 공유
const shareToKakao = () => {
  Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: `나의 결혼매력점수는 ${score}점!`,
      description: `${grade}급 - ${gradeText}`,
      imageUrl: shareImageUrl,
      link: { mobileWebUrl: url, webUrl: url }
    },
    buttons: [{
      title: '나도 테스트하기',
      link: { mobileWebUrl: url, webUrl: url }
    }]
  });
};
```

### 3. 결과 이미지 생성
```typescript
// API Route: app/api/generate-image/route.ts
export async function POST(request: Request) {
  const { score, grade, nickname } = await request.json();
  
  // Canvas API 또는 서버사이드 이미지 생성
  const image = await generateShareImage({
    score,
    grade,
    nickname,
    template: 'default'
  });
  
  return new Response(image, {
    headers: { 'Content-Type': 'image/png' }
  });
}
```

---

## 🚀 개발 우선순위

### Phase 1: MVP (필수)
```markdown
1. [ ] Next.js 프로젝트 설정
2. [ ] 랜딩 페이지 구현
3. [ ] 기본 정보 입력 폼
4. [ ] 15개 질문 구현 (텍스트 선택만)
5. [ ] 점수 계산 로직
6. [ ] 간단한 결과 페이지
7. [ ] 카카오톡 공유
```

### Phase 2: 개선
```markdown
8. [ ] 레이더 차트 추가
9. [ ] 애니메이션 효과
10. [ ] 다양한 질문 타입
11. [ ] 모든 SNS 공유
12. [ ] 결과 이미지 생성
```

### Phase 3: 고도화
```markdown
13. [ ] 랭킹 시스템
14. [ ] 친구 비교
15. [ ] 데이터 분석
16. [ ] A/B 테스트
```

---

## 📱 모바일 최적화 체크리스트

```markdown
- [ ] 뷰포트 메타 태그
- [ ] 터치 친화적 버튼 (최소 44x44px)
- [ ] 스와이프 제스처 지원
- [ ] 세로 모드 최적화
- [ ] 폰트 크기 최소 14px
- [ ] 입력 필드 자동 확대 방지
- [ ] 하단 고정 버튼 (safe-area-inset)
```

---

## 🎯 성능 최적화

### 1. 초기 로딩
```typescript
// 필수 최적화
- Next.js Image 컴포넌트 사용
- 폰트 최적화 (next/font)
- 코드 스플리팅
- 프리페칭
```

### 2. 런타임 최적화
```typescript
// 상태 관리
- 질문별 컴포넌트 메모이제이션
- 불필요한 리렌더링 방지
- 로컬 스토리지 캐싱
```

---

## 🔧 환경 변수

```env
# .env.local
NEXT_PUBLIC_SITE_URL=https://maas.fun
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_app_key
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## 📝 개발 시작 명령어

```bash
# 프로젝트 생성
npx create-next-app@latest maas-app --typescript --tailwind --app

# shadcn/ui 설치
npx shadcn@latest init

# 필수 컴포넌트 설치
npx shadcn@latest add button card form input label progress radio-group slider

# 추가 패키지 설치
npm install zustand framer-motion recharts react-share

# 개발 서버 실행
npm run dev
```

---

## ✅ 개발 체크포인트

### MVP 완성 기준
- [ ] 모바일에서 5분 내 테스트 완료 가능
- [ ] 카카오톡 공유 정상 작동
- [ ] 점수 계산 정확도 검증
- [ ] 3초 내 초기 로딩
- [ ] 에러 없이 전체 플로우 완료

### 품질 기준
- [ ] Lighthouse 성능 점수 > 90
- [ ] 모바일 친화성 테스트 통과
- [ ] 크로스 브라우저 테스트
- [ ] 접근성 기본 준수

---

*이 가이드는 실제 개발 진행에 따라 업데이트됩니다.*