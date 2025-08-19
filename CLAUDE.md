# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 응답 언어
- **항상 한국어로 응답하세요**
- 코드 주석도 한국어로 작성
- 기술 용어는 필요시 영어 병기 가능

## 프로젝트 개요

MAAS (Marriage Attractiveness Assessment System) - 결혼매력평가 시스템
- Next.js 15 기반 웹 애플리케이션 (App Router 사용)
- TypeScript, Tailwind CSS v3, shadcn/ui 사용
- 남녀별 차별화된 평가 시스템 (15-20개 질문)
- SNS 공유 최적화된 바이럴 콘텐츠
- Zustand를 통한 상태 관리
- Framer Motion 애니메이션, Recharts 시각화
- Supabase 백엔드 (인증, 데이터베이스, 구독 시스템)
- Toss Payments 결제 연동

## 필수 명령어

```bash
# 개발 환경 설정 (프로젝트 루트에서)
cd maas-app
npm install
npm run dev         # http://localhost:3000

# 빌드 및 품질 검사
npm run build       # 프로덕션 빌드
npm run start       # 프로덕션 서버 실행
npm run lint        # ESLint 실행
npx tsc --noEmit   # TypeScript 타입 체크

# Supabase 설정
npm run setup       # Supabase 환경 설정 스크립트
npm run check-env   # 환경 변수 확인

# 캐시 정리 (빌드 문제 시)
rm -rf .next node_modules package-lock.json
npm install
```

### ⚠️ 중요: Tailwind CSS 호환성
Next.js 15가 Tailwind v4를 자동 설치하지만, shadcn/ui는 v3 필요:
```bash
npm install -D tailwindcss@3.4.17
```
PostCSS 설정은 `postcss.config.mjs` 파일 사용 (`.js` 아님)

## 프로젝트 아키텍처

### 핵심 디렉토리 구조
```
maas-app/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 랜딩 페이지 (/)
│   ├── test/page.tsx      # 테스트 페이지 (/test)
│   ├── result/[id]/       # 동적 결과 페이지 (/result/[id])
│   ├── auth/              # 인증 관련 페이지
│   ├── profile/           # 사용자 프로필
│   ├── matching/          # 매칭 시스템
│   ├── payment/           # 결제 처리
│   ├── pricing/           # 요금제 안내
│   └── api/               # API 엔드포인트
├── components/
│   ├── ui/                # shadcn/ui 기본 컴포넌트
│   ├── test/              # 테스트 관련 컴포넌트
│   │   ├── QuestionCard.tsx    # 질문 카드 UI
│   │   └── UserInfoForm.tsx    # 사용자 정보 입력
│   └── result/            # 결과 페이지 컴포넌트
│       ├── RadarChart.tsx      # 레이더 차트 시각화
│       ├── ScoreDisplay.tsx    # 점수 표시
│       └── ShareButtons.tsx    # SNS 공유 버튼
├── lib/
│   ├── questions/         # 질문 데이터
│   │   ├── male.ts       # 남성용 질문 세트
│   │   └── female.ts     # 여성용 질문 세트
│   ├── scoring/
│   │   └── calculator.ts # 점수 계산 로직
│   ├── supabase/          # Supabase 클라이언트 및 타입
│   ├── toss/              # Toss Payments 통합
│   ├── hooks/             # React 커스텀 훅
│   ├── config/            # 설정 파일
│   ├── types/             # TypeScript 타입 정의
│   └── utils.ts          # 유틸리티 함수 (cn 등)
├── store/
│   └── test-store.ts      # Zustand 전역 상태 관리
├── middleware.ts          # Next.js 미들웨어 (인증 등)
└── scripts/
    └── setup-supabase.js  # Supabase 초기 설정 스크립트
```

### 핵심 비즈니스 로직

#### 점수 계산 시스템 (`lib/scoring/calculator.ts`)
- **성별별 차별화된 가중치**:
  - 남성: 경제력(35%), 성격(25%), 외모(15%), 관계(15%), 생활(10%)
  - 여성: 외모(25%), 성격(25%), 경제력(20%), 생활(15%), 관계(15%)
- **카테고리별 평가**: 외모/건강, 경제력, 성격/인성, 생활능력, 관계능력
- **등급 시스템**: S급(95-100) ~ F급(0-39)
- **ScoringCalculator 클래스**: 남녀별 점수 계산 메서드 분리

#### 사용자 플로우
1. **랜딩 페이지** → 성별 선택 → `/test` 이동
2. **테스트 페이지** → 15-20개 질문 진행 → 점수 계산
3. **결과 페이지** → 점수/등급 표시 → SNS 공유
4. **선택적**: 회원가입 → 프로필 생성 → 매칭 시스템 이용

#### 상태 관리 (Zustand - `store/test-store.ts`)
- 사용자 정보 (성별, 나이, 지역)
- 질문 응답 저장
- 테스트 진행 상태
- 최종 점수 및 카테고리별 점수
- 세션 관리

#### Supabase 통합
- **인증**: 이메일/비밀번호, 소셜 로그인
- **데이터베이스**: PostgreSQL 기반
- **테이블**: profiles, test_results, subscriptions
- **RLS (Row Level Security)**: 사용자별 데이터 격리
- **환경 변수**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 설정 파일 참고사항

### shadcn/ui 설정 (`components.json`)
- Style: new-york
- Base color: neutral
- CSS variables 사용
- Component alias: `@/components`
- Utils alias: `@/lib/utils`

### TypeScript 설정
- Path alias: `@/*` → 프로젝트 루트 기준
- Strict mode 활성화
- Target: ES2017

### Vercel 배포 설정 (`vercel.json`)
- Build command: `cd maas-app && npm run build`
- Output directory: `maas-app/.next`
- Install command: `cd maas-app && npm install`

## 알려진 이슈 및 해결책

### Tailwind CSS 작동 안 함
```bash
# Tailwind v3로 다운그레이드
npm install -D tailwindcss@3.4.17
# postcss.config.mjs 확인 (NOT .js)
```

### shadcn/ui 컴포넌트 에러
```bash
# 필수 패키지 설치
npm install @radix-ui/react-icons
npm install @radix-ui/react-slot
```

### TypeScript 경로 별칭
`tsconfig.json`에 설정된 `@/*` 별칭 사용:
```typescript
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

### 빌드 에러 발생 시
```bash
# 캐시 및 의존성 완전 제거 후 재설치
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Supabase 연결 문제
- `.env.local` 파일 확인
- 환경 변수 설정 확인: `npm run check-env`
- Supabase 대시보드에서 프로젝트 상태 확인

## 개발 가이드라인

### 기능 구현 원칙
- **최소한의 구현**: 요청된 기능의 핵심만 구현하고, 추가 기능은 최소화
- **보수적 접근**: 요청 범위를 벗어나는 기능 추가는 자제
- **필수 요소 우선**: 반드시 필요한 요소만 포함하여 구현
- **단계적 확장**: 기본 기능 구현 후 필요시 점진적 확장

### 코드 스타일
- TypeScript strict mode 준수
- ESLint 규칙 따르기 (`npm run lint`)
- shadcn/ui 컴포넌트 우선 사용
- Tailwind CSS 클래스 사용 (인라인 스타일 지양)

## 작업 기록 (2025년 8월)

### 2025-08-18 완료 작업
1. **Supabase 통합** ✅
   - 사용자 인증 시스템 구현
   - 프로필 데이터 저장/관리
   - 구독 플랜 시스템 (Free/Basic/Premium)

2. **TypeScript 타입 에러 수정** ✅
   - UserInfo, TestResult 인터페이스 업데이트
   - calculator.ts 남녀별 categoryScores 타입 수정
   - 중복 속성 제거

3. **CSS/Tailwind 빌드 문제 해결** ✅
   - postcss.config.js → postcss.config.mjs 변경
   - tailwind.config.ts content 경로 업데이트

4. **Vercel 배포 설정** ⚠️
   - vercel.json 추가
   - GitHub 푸시 완료
   - 자동 배포 트리거 문제 (Vercel 대시보드 확인 필요)

### 환경 변수 설정
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://hvpyqchgimnzaotwztuy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 배포 정보
- **Production URL**: https://maas-eight.vercel.app
- **GitHub**: https://github.com/yonghot/maas