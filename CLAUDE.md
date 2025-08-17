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

# 캐시 정리 (빌드 문제 시)
rm -rf .next node_modules package-lock.json
npm install
```

### ⚠️ 중요: Tailwind CSS 호환성
Next.js 15가 Tailwind v4를 자동 설치하지만, shadcn/ui는 v3 필요:
```bash
npm install -D tailwindcss@3.4.17
```
PostCSS 설정은 `postcss.config.js` 파일 사용 (`.mjs` 아님)

## 프로젝트 아키텍처

### 핵심 디렉토리 구조
```
maas-app/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 랜딩 페이지 (/)
│   ├── test/page.tsx      # 테스트 페이지 (/test)
│   └── result/[id]/       # 동적 결과 페이지 (/result/[id])
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
│   ├── types/index.ts    # TypeScript 타입 정의
│   └── utils.ts          # 유틸리티 함수 (cn 등)
└── store/
    └── test-store.ts      # Zustand 전역 상태 관리
```

### 핵심 비즈니스 로직

#### 점수 계산 시스템 (`lib/scoring/calculator.ts`)
- **성별별 차별화된 가중치**:
  - 남성: 경제력(35%), 성격(25%), 외모(15%), 관계(15%), 생활(10%)
  - 여성: 외모(25%), 성격(25%), 경제력(20%), 생활(15%), 관계(15%)
- **카테고리별 평가**: 외모/건강, 경제력, 성격/인성, 생활능력, 관계능력
- **등급 시스템**: S급(95-100) ~ F급(0-39)

#### 사용자 플로우
1. **랜딩 페이지** → 성별 선택 → `/test` 이동
2. **테스트 페이지** → 15-20개 질문 진행 → 점수 계산
3. **결과 페이지** → 점수/등급 표시 → SNS 공유

#### 상태 관리 (Zustand - `store/test-store.ts`)
- 사용자 정보 (성별, 나이, 지역)
- 질문 응답 저장
- 테스트 진행 상태
- 최종 점수 및 카테고리별 점수
- 세션 관리

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

## 알려진 이슈 및 해결책

### Tailwind CSS 작동 안 함
```bash
# Tailwind v3로 다운그레이드
npm install -D tailwindcss@3.4.17
# postcss.config.js 확인 (NOT .mjs)
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