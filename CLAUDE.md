# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 응답 언어
- **항상 한국어로 응답하세요**
- 코드 주석도 한국어로 작성
- 기술 용어는 필요시 영어 병기 가능

## 개발 명령어

### 프로젝트 시작
**중요**: 모든 명령은 `maas-app` 디렉토리에서 실행
```bash
cd maas-app
```

### 개발 서버
```bash
npm run dev          # http://localhost:3000 (포트 고정, OAuth 콜백용)
npm run start        # 프로덕션 서버 실행
```

### 빌드 및 품질 검사
```bash
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 실행
npx tsc --noEmit    # TypeScript 타입 체크 (매우 중요)
```

### Supabase 설정
```bash
npm run setup        # 환경 설정 스크립트 (scripts/setup-supabase.js)
npm run check-env    # 환경 변수 확인
```

### 진단 및 테스트 스크립트
```bash
# 시스템 상태 확인
node scripts/check-db.js            # DB 연결 및 스키마 확인
node scripts/check-table-schema.js  # 테이블 스키마 확인
node scripts/fix-profile-schema.js  # profiles 테이블 스키마 수정

# OAuth 및 인증 테스트  
node scripts/test-oauth-flow.js     # OAuth 전체 플로우 테스트
node scripts/test-google-auth.js    # Google OAuth 단독 테스트
node scripts/manual-test-guide.js   # 수동 테스트 가이드

# 관리자 시스템 테스트
node scripts/test-admin-accounts.js # 관리자 계정 시스템 테스트
```

## 프로젝트 아키텍처

이 프로젝트는 결혼 매력도 평가 시스템(MAAS)으로, 사용자가 설문을 완료하고 OAuth 로그인을 통해 결과를 확인할 수 있는 플랫폼입니다.

### 핵심 아키텍처 구조

#### Next.js 15 App Router 기반 구조
```
maas-app/
├── app/              # App Router (핵심 페이지 라우팅)
│   ├── page.tsx                  # 랜딩 페이지 (성별 선택)
│   ├── test/page.tsx             # 무한 스크롤 질문 페이지
│   ├── signup-result/page.tsx    # Instagram ID 입력 후 OAuth 유도
│   ├── result/                   # 결과 관련 페이지들
│   │   ├── page.tsx              # 최종 결과 표시
│   │   ├── [id]/page.tsx         # 특정 결과 조회
│   │   ├── save/page.tsx         # OAuth 후 데이터 저장
│   │   └── simple/page.tsx       # 간단한 결과 페이지
│   ├── admin/                    # 관리자 시스템
│   │   ├── page.tsx              # 관리자 로그인
│   │   ├── accounts/page.tsx     # 계정 관리
│   │   ├── scoring/page.tsx      # 가중치 관리
│   │   └── oauth/page.tsx        # OAuth 설정 가이드
│   ├── auth/                     # 인증 관련
│   │   ├── callback/route.ts     # OAuth 콜백 처리
│   │   └── signup/page.tsx       # 회원가입 페이지
│   ├── matching/page.tsx         # 매칭 시스템
│   ├── payment/                  # 결제 관련
│   └── api/                      # API Routes
├── lib/              # 핵심 비즈니스 로직 레이어
│   ├── scoring/                  # 점수 계산 시스템
│   │   ├── calculator.ts         # 점수 계산 엔진 (남녀 다른 가중치)
│   │   └── tier-system.ts        # 티어 시스템
│   ├── questions/                # 성별별 질문 데이터
│   │   ├── male.ts               # 남성용 질문
│   │   └── female.ts             # 여성용 질문
│   ├── supabase/                 # DB 클라이언트
│   │   ├── client.ts             # 브라우저 클라이언트 (PKCE 지원)
│   │   ├── server.ts             # 서버 클라이언트
│   │   └── database.types.ts     # DB 타입 정의
│   ├── toss/payment.ts           # 토스페이먼츠 연동
│   ├── config/subscription-plans.ts # 구독 플랜 설정
│   └── types/index.ts            # TypeScript 타입 정의
├── store/test-store.ts           # Zustand 상태 관리 (localStorage 영속화)
├── components/                   # 재사용 가능한 React 컴포넌트
│   ├── result/                   # 결과 표시 컴포넌트
│   ├── test/                     # 테스트 관련 컴포넌트
│   ├── matching/                 # 매칭 관련 컴포넌트
│   └── ui/                       # shadcn/ui 기반 UI 컴포넌트
├── contexts/AuthContext.tsx      # 인증 컨텍스트
└── scripts/                      # DB 관리 및 테스트 도구
```

#### 주요 데이터 플로우
1. **테스트 플로우**: `/` → `/test` → `localStorage 저장` → `/signup-result` → OAuth → `/result/save` → `/result`
2. **매칭 플로우**: 결과 완료 후 → `/matching` → 카드 기반 매칭 → 유료 구독 유도
3. **결제 플로우**: `/pricing` → 토스페이먼츠 → `/payment/success` → 구독 활성화
4. **상태 관리**: Zustand + localStorage (OAuth 전후 데이터 유지 핵심)
5. **인증 플로우**: Supabase Auth PKCE → profiles 테이블 저장

### 핵심 비즈니스 로직

#### 점수 계산 시스템 (`lib/scoring/calculator.ts`)
**ScoringCalculator 클래스**가 성별별 차별화된 점수 계산을 담당:
- **남성 평가 가중치**: 재력(60%) + 센스(30%) + 피지컬(10%)
- **여성 평가 가중치**: 나이에 따라 동적 변경
  - 35세 미만: 나이(20%) + 외모(40%) + 가치관(40%)  
  - 35세 이상: 나이(40%) + 외모(20%) + 가치관(40%)
- **정규분포 기반**: 평균 5점, 표준편차 1.5점으로 10점 만점 환산
- **DEFAULT_WEIGHTS 객체**: 관리자 페이지에서 실시간 조정 가능

#### Supabase 연동 아키텍처 (`lib/supabase/`)
**PKCE OAuth 지원 클라이언트**:
- `createClient()`: 브라우저용, localStorage + 쿠키 이중 저장으로 PKCE 지원
- `createServerClient()`: 서버사이드, 쿠키 기반 세션 관리  
- **핵심**: localStorage와 쿠키 동기화로 OAuth 콜백 시 상태 유지
- **profiles 테이블**: auth.users와 1:1 관계, 테스트 결과 + Instagram ID 저장

#### 상태 관리 시스템 (`store/test-store.ts`)
**Zustand + persist 조합**으로 OAuth 플로우 지원:
- **localStorage 키**: 'maas-test-storage'로 브라우저 새로고침/OAuth 리다이렉트 시에도 상태 유지
- **관리 객체**: userInfo, hasSubmittedLead, answers, currentQuestionIndex, result, isTestCompleted
- **핵심 기능**: OAuth 전후 데이터 연속성 보장 (가장 중요한 아키텍처 요소)
- **Partialize**: 특정 상태만 localStorage에 영속화하여 성능 최적화

#### 인증 시스템 (`contexts/AuthContext.tsx`)
**Supabase Auth 통합 컨텍스트**:
- **세션 관리**: 전역 사용자 세션 상태 관리
- **프로필 데이터**: auth.users와 연결된 profiles 테이블 데이터 자동 동기화
- **로딩 상태**: 초기 인증 로딩 처리로 UX 개선


## 개발 가이드라인

### 핵심 원칙
- **모듈화**: 특정 기능 수정 시 해당 모듈만 수정, 영향 범위 최소화
- **최소 구현**: 요청된 기능의 핵심만 구현, 기존 파일 우선 수정
- **TypeScript strict mode**: 타입 안정성 유지
- **Purple/Lavender 테마**: 모든 UI 컴포넌트에 일관된 색상 시스템 적용

### 디버깅 원칙 ⚠️
- **근본 원인 분석 필수**: 증상이 아닌 원인을 찾아 해결
- **구조적 해결 우선**: 시간이 걸리더라도 올바른 구조로 해결
- **데이터 무결성 보장**: 임시 데이터나 우회 로직으로 무결성 훼손 금지

## 중요 기술 이슈 및 해결책

### OAuth PKCE 인증 시스템 ✅
**핵심 문제**: Supabase PKCE 플로우에서 code_verifier 쿠키 전달 실패
**해결된 방식**: 
- `lib/supabase/client.ts`에서 localStorage + 쿠키 이중 저장 구현
- 포트 3000 고정으로 OAuth redirect URL 일치 보장
- `sameSite: 'lax'`, `secure: false`로 localhost 환경 지원
- **상태**: 완전 해결, Google/Kakao 소셜 로그인 정상 동작

### 데이터 영속화 아키텍처 ✅
**핵심 과제**: OAuth 리다이렉트 과정에서 테스트 데이터 유실 방지
**해결 방식**:
- Zustand persist로 `localStorage` 기반 상태 유지
- OAuth 전 `/signup-result`에서 Instagram ID 입력 후 localStorage 저장
- OAuth 콜백 후 `/result/save`에서 profiles 테이블에 저장
- **상태**: 완전 해결, 데이터 유실 없이 안정적 동작

### Vercel 프로덕션 배포 ✅
**문제**: 환경 변수 설정 후 자동 재배포 미동작
**해결 방식**:
- 환경 변수만 변경해도 Vercel은 자동 재배포하지 않음을 확인
- 빈 커밋을 통한 수동 재배포 트리거 구현
- `git commit --allow-empty -m "fix: Vercel 재배포 트리거"`
- **상태**: 완전 해결, 프로덕션 환경 OAuth 정상 동작

### Next.js 15 메타데이터 경고
**문제**: viewport, themeColor 메타데이터 설정이 deprecated 형식
**증상**: 빌드 시 "Unsupported metadata viewport/themeColor" 경고 다수 발생
**영향**: 현재는 경고만 발생, 기능상 문제 없음
**해결 방향**: 메타데이터를 viewport export로 마이그레이션 필요

### TypeScript 및 빌드 이슈
**중요**: 매번 배포 전 `npx tsc --noEmit` 필수 실행
- Next.js 15 + TypeScript strict mode 사용
- Tailwind CSS v3.4.17 고정 (v4 호환성 문제)
- `useSearchParams` 사용 시 반드시 `<Suspense>` 래핑 필요


## 환경 변수

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://hvpyqchgimnzaotwztuy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_KEY]
```

## 관리자 정보

- **URL**: `/admin`
- **계정**: admin / maas2025
- **기능**: 통계 대시보드, 평가 기준 관리, 사용자 데이터 조회

## 핵심 사용자 플로우

### 사용자 테스트 플로우 (핵심)
1. **`/`** - 랜딩 페이지 (성별 선택) → Zustand에 userInfo 저장
2. **`/test`** - 무한 스크롤 질문 (15-20개) → answers 배열에 누적 저장  
3. **점수 계산** - ScoringCalculator로 result 생성 → localStorage 영속화
4. **`/signup-result`** - Instagram ID 입력 + 공개/비공개 토글 → userLead 저장
5. **OAuth 로그인** - Google/Kakao → Supabase Auth 처리
6. **`/auth/callback`** - OAuth 콜백 → 자동으로 `/result/save`로 리다이렉트
7. **`/result/save`** - localStorage 데이터 → profiles 테이블 저장
8. **`/result`** - 최종 결과 표시 (레이더 차트, 정규분포, 백분위수)

### 관리자 시스템 플로우
- **`/admin`** - 세션 기반 로그인 (admin:maas2025)
- **`/admin/accounts`** - 실시간 통계 대시보드, 사용자 데이터 조회
- **`/admin/scoring`** - 가중치 실시간 조정, 시뮬레이터
- **`/admin/oauth`** - OAuth 설정 가이드 (Google/Kakao 설정법)

## 테스트 데이터

### 테스트용 관리자 계정
- URL: `/admin`
- ID: `admin`
- PW: `maas2025`

### 테스트용 결제 키 (Toss Payments 테스트 환경)
- Client Key: `test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq`
- Secret Key: `test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R`

## 기술 스택

- **Frontend**: Next.js 15.4.6 App Router, React 19, TypeScript 5, Tailwind CSS v3.4.17, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + RLS), Next.js API Routes  
- **상태관리**: Zustand v5 + localStorage persist (OAuth 플로우 지원)
- **인증**: Supabase Auth PKCE (Google, Kakao OAuth)
- **결제**: 토스페이먼츠 SDK v1.9.1
- **배포**: Vercel (자동 배포)

## 데이터베이스 스키마
```sql
-- profiles 테이블 (핵심 비즈니스 데이터)
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- 중요: auth.users 참조
  email TEXT,                 -- 이메일 (auth.users와 동기화)
  gender TEXT NOT NULL,
  age INTEGER,
  total_score INTEGER,        -- 10점 만점 * 10 (정수 저장)
  percentile INTEGER,         -- 상위 백분위수
  answers JSONB,              -- 사용자 답변 원본
  category_scores JSONB,      -- 카테고리별 점수
  instagram_id TEXT,          -- @제외한 ID만 저장
  instagram_public BOOLEAN DEFAULT true,
  tier TEXT,                  -- 등급 (S, A, B, C, D, F)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- scoring_weights 테이블 (가중치 관리)
CREATE TABLE scoring_weights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gender TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  weight DECIMAL(3,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```


## 알려진 이슈

- **Next.js 15 메타데이터 경고**: viewport/themeColor deprecation 경고 (기능상 문제 없음)
- **`scoring_weights` 테이블**: 현재 DEFAULT_WEIGHTS로 우회 중