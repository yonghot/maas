# DESIGN.md - MAAS 디자인 시스템

## 목차
1. [브랜드 아이덴티티](#브랜드-아이덴티티)
2. [색상 시스템](#색상-시스템)
3. [타이포그래피](#타이포그래피)
4. [레이아웃 시스템](#레이아웃-시스템)
5. [컴포넌트 디자인](#컴포넌트-디자인)
6. [애니메이션 & 인터랙션](#애니메이션--인터랙션)
7. [반응형 디자인](#반응형-디자인)
8. [접근성](#접근성)
9. [디자인 토큰](#디자인-토큰)
10. [아이콘 시스템](#아이콘-시스템)

---

## 브랜드 아이덴티티

### 핵심 가치
- **신뢰성**: 데이터 기반의 객관적 평가
- **친근함**: 부담없이 접근 가능한 UI/UX
- **현대적**: 트렌디하고 세련된 비주얼
- **재미**: 가벼운 마음으로 즐길 수 있는 경험

### 비주얼 컨셉
- **메인 테마**: 라벤더(Purple) 색상 기반의 우아하고 세련된 느낌
- **분위기**: 밝고 긍정적이며 희망적인 톤
- **스타일**: 미니멀하면서도 부드러운 그라데이션 활용

---

## 색상 시스템

### 브랜드 컬러 (Purple/Lavender 계열)

#### Primary Palette
```css
/* 메인 퍼플 색상 */
--primary: hsl(270, 70%, 55%);        /* #8B5CF6 - 메인 퍼플 */
--primary-foreground: hsl(0, 0%, 100%); /* 흰색 텍스트 */

/* Tailwind 라벤더 팔레트 */
lavender-50:  #FAF5FF  /* 가장 연한 라벤더 */
lavender-100: #F3E8FF
lavender-200: #E9D5FF
lavender-300: #D8B4FE
lavender-400: #C084FC  /* Purple-400 메인 사용 */
lavender-500: #A855F7  /* Purple-500 강조색 */
lavender-600: #9333EA  /* Purple-600 다크 액센트 */
lavender-700: #7E22CE
lavender-800: #6B21A8
lavender-900: #581C87  /* 가장 진한 라벤더 */
```

#### Secondary Palette
```css
--secondary: hsl(270, 50%, 95%);       /* 연한 라벤더 배경 */
--secondary-foreground: hsl(270, 70%, 30%);

--accent: hsl(270, 60%, 85%);          /* 라벤더 액센트 */
--accent-foreground: hsl(270, 70%, 25%);
```

#### System Colors
```css
--background: hsl(0, 0%, 100%);        /* 흰색 배경 */
--foreground: hsl(270, 40%, 20%);      /* 다크 퍼플 텍스트 */

--muted: hsl(270, 20%, 96%);           /* 매우 연한 라벤더 */
--muted-foreground: hsl(270, 20%, 40%);

--border: hsl(270, 30%, 90%);          /* 라벤더빛 테두리 */
--input: hsl(270, 30%, 95%);           /* 입력 필드 배경 */
--ring: hsl(270, 70%, 55%);            /* 포커스 링 */
```

#### Chart Colors (데이터 시각화)
```css
--chart-1: hsl(270, 76%, 61%);  /* 밝은 라벤더 */
--chart-2: hsl(270, 58%, 49%);  /* 중간 퍼플 */
--chart-3: hsl(270, 45%, 55%);  /* 연한 보라 */
--chart-4: hsl(270, 65%, 70%);  /* 파스텔 라벤더 */
--chart-5: hsl(270, 85%, 75%);  /* 매우 연한 라벤더 */
```

### 성별 구분 색상
```css
/* 남성 */
--male-primary: #3B82F6;    /* Blue-500 */
--male-secondary: #DBEAFE;  /* Blue-100 */

/* 여성 */
--female-primary: #EC4899;  /* Pink-500 */
--female-secondary: #FCE7F3; /* Pink-100 */
```

### 등급별 색상 (Gradient)
```css
S급: from-yellow-400 to-yellow-600
A급: from-purple-400 to-purple-600
B급: from-blue-400 to-blue-600
C급: from-green-400 to-green-600
D급: from-orange-400 to-orange-600
F급: from-red-400 to-red-600
```

---

## 타이포그래피

### 폰트 패밀리
```css
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

### 텍스트 스케일
```css
/* 헤딩 */
text-6xl: 3.75rem  /* 60px - 데스크톱 메인 타이틀 */
text-5xl: 3rem     /* 48px - 태블릿 메인 타이틀 */
text-3xl: 1.875rem /* 30px - 모바일 메인 타이틀 */
text-2xl: 1.5rem   /* 24px - 섹션 타이틀 */
text-xl: 1.25rem   /* 20px - 서브 타이틀 */

/* 바디 */
text-lg: 1.125rem  /* 18px - 큰 본문 */
text-base: 1rem    /* 16px - 기본 본문 */
text-sm: 0.875rem  /* 14px - 작은 본문 */
text-xs: 0.75rem   /* 12px - 캡션 */
```

### 폰트 웨이트
```css
font-normal: 400   /* 본문 */
font-medium: 500   /* 버튼, 레이블 */
font-semibold: 600 /* 서브 타이틀 */
font-bold: 700     /* 타이틀 */
```

### 텍스트 스타일링
```css
/* 폰트 스무딩 */
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;

/* 줄 간격 */
leading-relaxed: 1.625;  /* 편안한 읽기 */
leading-none: 1;         /* 타이트한 제목 */
```

---

## 레이아웃 시스템

### 컨테이너 크기
```css
max-w-2xl: 42rem   /* 672px - 메인 컨텐츠 */
max-w-4xl: 56rem   /* 896px - 와이드 컨텐츠 */
max-w-6xl: 72rem   /* 1152px - 관리자 페이지 */
```

### 스페이싱 시스템
```css
/* 패딩/마진 스케일 */
space-1: 0.25rem   /* 4px */
space-2: 0.5rem    /* 8px */
space-3: 0.75rem   /* 12px */
space-4: 1rem      /* 16px */
space-5: 1.25rem   /* 20px */
space-6: 1.5rem    /* 24px */
space-8: 2rem      /* 32px */
space-12: 3rem     /* 48px */
space-16: 4rem     /* 64px */
space-20: 5rem     /* 80px */
```

### 그리드 시스템
```css
/* 반응형 그리드 */
grid-cols-1         /* 모바일: 1열 */
sm:grid-cols-2      /* 태블릿: 2열 */
md:grid-cols-3      /* 데스크톱: 3열 */
lg:grid-cols-4      /* 와이드: 4열 */

/* 갭 */
gap-4: 1rem         /* 기본 갭 */
gap-6: 1.5rem       /* 넓은 갭 */
```

### Border Radius
```css
--radius: 1rem;                    /* 16px - 기본 */
rounded-sm: calc(var(--radius) - 4px)  /* 12px */
rounded-md: calc(var(--radius) - 2px)  /* 14px */
rounded-lg: var(--radius)              /* 16px */
rounded-xl: 0.75rem                    /* 12px */
rounded-2xl: 1rem                      /* 16px */
rounded-full: 9999px                   /* 원형 */
```

---

## 컴포넌트 디자인

### Button Component
```tsx
/* Variants */
- default: 퍼플 그라데이션 배경, 흰색 텍스트
- secondary: 연한 라벤더 배경, 진한 퍼플 텍스트  
- outline: 투명 배경, 퍼플 테두리
- ghost: 호버시만 배경색
- link: 밑줄 텍스트 스타일

/* Sizes */
- sm: h-8, px-3, text-xs
- default: h-9, px-4, text-sm
- lg: h-10, px-8, text-base

/* 특징 */
- 모바일 최소 높이: 44px (터치 최적화)
- 그라데이션 호버 효과
- 트랜지션 애니메이션
- 포커스 링 표시
```

### Card Component
```css
/* 기본 스타일 */
- 배경: white/80 (반투명)
- 테두리: border-purple-100
- 그림자: shadow-lg on hover
- 라운드: rounded-xl (12px)
- 백드롭 블러: backdrop-blur

/* 패딩 */
- CardHeader: p-6
- CardContent: p-6 pt-0
- CardFooter: p-6 pt-0
```

### Input Component
```css
/* 기본 스타일 */
- 배경: 연한 라벤더 (--input)
- 테두리: 퍼플빛 (--border)
- 텍스트 정렬: center
- 폰트 크기: 16px (iOS 줌 방지)
- 포커스: 퍼플 링
```

### Badge Component
```css
/* 등급 배지 */
- 그라데이션 배경
- 둥근 모서리 (rounded-full)
- 패딩: px-3 py-1
- 폰트: font-semibold
```

---

## 애니메이션 & 인터랙션

### Framer Motion 설정

#### 페이드 인 애니메이션
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8 }}
```

#### 스케일 애니메이션
```tsx
initial={{ scale: 0.9 }}
animate={{ scale: 1 }}
transition={{ duration: 0.5 }}
```

#### 플로팅 하트 애니메이션
```tsx
initial={{ y: windowHeight + 100 }}
animate={{ y: -100 }}
transition={{
  duration: 20 + Math.random() * 10,
  repeat: Infinity
}}
```

#### 호버 효과
```css
/* 버튼 호버 */
transform: scale(1.05);
transition: all 200ms;

/* 카드 호버 */
shadow: shadow-lg;
transition: shadow 300ms;
```

### 마이크로 인터랙션
```css
/* 터치 피드백 제거 */
-webkit-tap-highlight-color: transparent;

/* 부드러운 스크롤 */
scroll-behavior: smooth;
-webkit-overflow-scrolling: touch;

/* 트랜지션 기본값 */
transition-colors: 150ms;
transition-all: 200ms;
transition-shadow: 300ms;
```

---

## 반응형 디자인

### 브레이크포인트
```css
sm: 640px   /* 태블릿 */
md: 768px   /* 작은 랩톱 */
lg: 1024px  /* 데스크톱 */
xl: 1280px  /* 와이드 스크린 */
2xl: 1536px /* 울트라 와이드 */
```

### 모바일 우선 설계
```css
/* 기본 (모바일) */
text-3xl font-bold

/* 태블릿 이상 */
sm:text-5xl

/* 데스크톱 이상 */
md:text-6xl
```

### 안전 영역 (iOS)
```css
/* 안전 영역 패딩 */
pt-safe: env(safe-area-inset-top, 1rem);
pb-safe: env(safe-area-inset-bottom, 1rem);
```

### 뷰포트 높이 수정
```css
@supports (-webkit-touch-callout: none) {
  .min-h-screen {
    min-height: -webkit-fill-available;
  }
}
```

---

## 접근성

### WCAG 2.1 준수
- **색상 대비**: 최소 4.5:1 (일반 텍스트), 3:1 (큰 텍스트)
- **포커스 표시**: visible focus ring on all interactive elements
- **터치 타겟**: 최소 44x44px (Apple HIG)
- **키보드 네비게이션**: 모든 인터랙티브 요소 접근 가능

### ARIA 속성
```tsx
/* 버튼 */
aria-label="테스트 시작하기"
aria-pressed={isPressed}

/* 로딩 상태 */
aria-busy={isLoading}
aria-live="polite"

/* 폼 요소 */
aria-required="true"
aria-invalid={hasError}
```

### 시맨틱 HTML
- `<nav>` for navigation
- `<main>` for main content
- `<section>` for content sections
- `<article>` for self-contained content
- `<button>` for interactive elements (not div)

---

## 디자인 토큰

### CSS 변수 구조
```css
:root {
  /* Colors */
  --background: 0 0% 100%;
  --foreground: 173 40% 20%;
  
  /* Spacing */
  --radius: 1rem;
  
  /* Typography */
  --font-sans: 'Pretendard', sans-serif;
}
```

### Tailwind 확장
```js
theme: {
  extend: {
    colors: {
      lavender: { /* 50-900 scale */ },
      chart: { /* 1-5 scale */ }
    },
    borderRadius: {
      lg: "var(--radius)"
    }
  }
}
```

---

## 아이콘 시스템

### Lucide React Icons
```tsx
/* 주요 사용 아이콘 */
- Heart: 좋아요, 매력도
- Users: 참여자 수
- Trophy: 점수, 등급
- ArrowRight: 진행 방향
- Sparkles: 특별함
- CheckCircle2: 완료
- Target: 목표
- BarChart3: 통계
- Mars (♂): 남성 심볼
- Venus (♀): 여성 심볼
```

### 아이콘 스타일링
```css
/* 기본 크기 */
w-4 h-4: 16px (인라인)
w-5 h-5: 20px (버튼)
w-6 h-6: 24px (카드)
w-10 h-10: 40px (히어로)

/* 색상 */
text-purple-600: 메인 컬러
text-purple-400: 라이트
fill="currentColor": 채움
```

---

## 디자인 원칙

### 1. 일관성 (Consistency)
- 동일한 컴포넌트는 동일한 스타일 유지
- 색상, 스페이싱, 타이포그래피 일관성
- 인터랙션 패턴 통일

### 2. 명확성 (Clarity)
- 직관적인 UI 구조
- 명확한 시각적 위계
- 읽기 쉬운 타이포그래피

### 3. 반응성 (Responsiveness)
- 모든 디바이스에서 최적화
- 터치 친화적 인터페이스
- 빠른 시각적 피드백

### 4. 접근성 (Accessibility)  
- 모든 사용자가 접근 가능
- 키보드 네비게이션 지원
- 스크린 리더 호환

### 5. 성능 (Performance)
- 최소한의 애니메이션
- 효율적인 리소스 사용
- 빠른 로딩 시간

---

## 디자인 기술 스택

### UI 컴포넌트 라이브러리
```json
{
  "primary": "shadcn/ui",
  "components": [
    "Button", "Card", "Input", "Label", "Select",
    "Slider", "Switch", "Tabs", "Badge", "Progress",
    "RadioGroup", "Checkbox", "Table"
  ],
  "customization": "Tailwind CSS utilities",
  "theme": "new-york style"
}
```

### 스타일링 도구
- **Tailwind CSS**: v3.4.17 (유틸리티 클래스)
- **CSS Modules**: 컴포넌트별 격리
- **PostCSS**: 자동 프리픽싱
- **tailwindcss-animate**: 애니메이션 유틸리티

### 애니메이션 라이브러리
- **Framer Motion**: v11.16.0
- **사용 케이스**: 페이지 전환, 카드 애니메이션, 플로팅 요소

### 차트 & 데이터 시각화
- **Recharts**: v2.15.4
- **차트 타입**: RadarChart (레이더차트), AreaChart (정규분포)
- **커스터마이징**: Tailwind 색상 변수 활용

### 아이콘
- **Lucide React**: 메인 아이콘 세트
- **React Icons**: 추가 아이콘 (FaMars, FaVenus)

---

## 디자인 레퍼런스

### 벤치마킹 서비스
1. **Tinder** - 카드 스와이프 UI, 매칭 인터랙션
2. **Bumble** - 프로필 레이아웃, 온보딩 플로우
3. **16Personalities** - 테스트 진행 UI, 결과 페이지
4. **MBTI 테스트** - 질문 구성, 진행률 표시
5. **Typeform** - 한 번에 하나씩 질문 UX

### UI/UX 참고 사이트
- **Dribbble**: Dating app UI 검색
- **Behance**: Assessment test design
- **Awwwards**: Interactive quiz experiences
- **UI8**: Dating app templates

### 색상 팔레트 참고
- **Coolors.co**: 퍼플/라벤더 색상 조합
- **Adobe Color**: 보색 및 유사색 선택
- **Material Design**: 색상 접근성 가이드

### 컴포넌트 라이브러리 참고
- **Material UI**: 컴포넌트 구조
- **Ant Design**: 폼 패턴
- **Chakra UI**: 접근성 구현
- **Mantine**: 훅 기반 컴포넌트

---

## 구현 가이드라인

### 컴포넌트 사용 예시
```tsx
/* shadcn/ui Button */
<Button 
  variant="default"
  size="lg"
  className="bg-gradient-to-r from-purple-500 to-purple-600"
>
  시작하기
</Button>

/* shadcn/ui Card */
<Card className="hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
  <CardHeader>
    <CardTitle>제목</CardTitle>
    <CardDescription>설명</CardDescription>
  </CardHeader>
  <CardContent>내용</CardContent>
  <CardFooter>푸터</CardFooter>
</Card>

/* shadcn/ui Input with Label */
<div className="space-y-2">
  <Label htmlFor="instagram">Instagram ID</Label>
  <Input 
    id="instagram"
    placeholder="@username"
    className="text-center"
  />
</div>
```

### 색상 적용 예시
```tsx
/* 퍼플 그라데이션 배경 */
className="bg-gradient-to-b from-purple-50 via-white to-purple-50/30"

/* 텍스트 그라데이션 */
className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent"

/* 호버 효과 */
className="hover:from-purple-600 hover:to-purple-700"
```

### Framer Motion 애니메이션 예시
```tsx
/* 페이드 인 */
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
  콘텐츠
</motion.div>

/* 스태거 애니메이션 */
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="show"
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Recharts 차트 예시
```tsx
/* 레이더 차트 */
<RadarChart data={data} width={400} height={400}>
  <PolarGrid stroke="#A855F7" strokeOpacity={0.3} />
  <PolarAngleAxis dataKey="category" />
  <PolarRadiusAxis angle={90} domain={[0, 100]} />
  <Radar 
    dataKey="score" 
    stroke="#A855F7" 
    fill="#A855F7" 
    fillOpacity={0.3} 
  />
</RadarChart>
```

---

## 디자인 체크리스트

### 개발 전 확인사항
- [ ] 컴포넌트가 shadcn/ui에 있는지 확인
- [ ] Tailwind 클래스로 구현 가능한지 검토
- [ ] 모바일 반응형 고려
- [ ] 다크모드 지원 여부 (현재 미지원)
- [ ] 접근성 요구사항 충족

### 품질 검증
- [ ] Lighthouse 성능 점수 90+
- [ ] 색상 대비 WCAG AA 준수
- [ ] 터치 타겟 44px 이상
- [ ] 애니메이션 60fps 유지
- [ ] 이미지 최적화 (WebP, lazy loading)

---

*이 문서는 MAAS 프로젝트의 디자인 시스템을 정의합니다.*
*최종 업데이트: 2025-01-04*