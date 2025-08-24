# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 응답 언어
- **항상 한국어로 응답하세요**
- 코드 주석도 한국어로 작성
- 기술 용어는 필요시 영어 병기 가능

## 개발 명령어

### 개발 서버 실행
```bash
cd maas-app
npm run dev          # http://localhost:3000 (포트 고정)
```

### 빌드 및 품질 검사
```bash
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행  
npm run lint         # ESLint 실행
npx tsc --noEmit    # TypeScript 타입 체크
```

### Supabase 설정
```bash
npm run setup        # Supabase 환경 설정 스크립트
npm run check-env    # 환경 변수 확인
```

### 테스트 및 검증 스크립트
```bash
# OAuth 테스트
node scripts/test-google-auth.js    # Google OAuth 테스트
node scripts/test-oauth-flow.js     # OAuth 플로우 테스트
node scripts/manual-test-guide.js   # 수동 테스트 가이드

# 데이터베이스 검증
node scripts/check-db.js            # DB 연결 및 테이블 확인
node scripts/create-test-profile.js # 테스트 프로필 생성
node scripts/fix-profile-schema.js  # 프로필 스키마 수정

# 자동화 도구
node scripts/setup-supabase.js      # Supabase 설정 자동화
node scripts/auto-fix-db.js         # DB 자동 수정
```

## 프로젝트 아키텍처

### 디렉토리 구조
```
maas-app/
├── app/              # Next.js 15 App Router
│   ├── admin/        # 관리자 대시보드
│   │   ├── oauth/    # OAuth 설정 가이드
│   │   └── scoring/  # 평가 기준 관리
│   ├── api/          # API Routes
│   ├── auth/         # Supabase Auth 콜백
│   ├── result/       # 결과 페이지
│   └── test/         # 테스트 페이지
├── components/       # React 컴포넌트
├── lib/              # 핵심 비즈니스 로직
│   ├── scoring/      # 점수 계산 시스템
│   ├── questions/    # 성별별 질문 데이터
│   └── supabase/     # Supabase 클라이언트
├── store/            # Zustand 상태 관리
├── scripts/          # 유틸리티 스크립트
└── utils/            # 공통 유틸리티 함수
```

### 핵심 비즈니스 로직

#### 점수 계산 시스템 (`lib/scoring/calculator.ts`)
- **ScoringCalculator 클래스**: 성별별 점수 계산 로직
- **남성 평가**: 재력(0.6) + 센스(0.3) + 피지컬(0.1)
- **여성 평가**: 평가자 연령별 가중치 차별화
  - 35세 미만: 나이(0.2) + 외모(0.4) + 가치관(0.4)
  - 35세 이상: 나이(0.4) + 외모(0.2) + 가치관(0.4)
- **10점 만점 시스템**: 소수점 1자리까지 표시
- **정규분포 기반**: 평균 5점, 표준편차 1.5점

#### 데이터베이스 연동 (`lib/supabase/`)
- **클라이언트**: `createClient()` - 브라우저용 Supabase 클라이언트
- **서버**: `createServerClient()` - 서버 사이드용 클라이언트
- **인증**: Supabase Auth + OAuth (Google, Kakao)
- **데이터 저장**: profiles 테이블에 테스트 결과 저장

#### 상태 관리 (`store/test-store.ts`)
- **Zustand + persist**: 브라우저 새로고침 시에도 상태 유지
- **localStorage**: 테스트 결과 임시 저장 (OAuth 연동용)
- **관리 데이터**: userInfo, answers, 진행상태, 결과

## 개발 가이드라인

### 문서 작성 원칙
- **통합 가이드 사용**: 모든 가이드와 안내는 하나의 통합 문서에 작성
- **불필요한 문서 생성 금지**: 단순 가이드나 안내를 위한 개별 .md 파일 생성 금지
- **필수 문서만 유지**: README.md, PRD.md, CLAUDE.md 등 핵심 문서만 관리
- **코드 내 주석 활용**: 간단한 설정이나 사용법은 코드 주석으로 대체

### 기능 구현 원칙
- **최소한의 구현**: 요청된 기능의 핵심만 구현
- **보수적 접근**: 요청 범위를 벗어나는 기능 추가 자제
- **필수 요소 우선**: 반드시 필요한 요소만 포함
- **단계적 확장**: 기본 기능 구현 후 필요시 점진적 확장
- **기존 파일 우선**: 새 파일 생성보다 기존 파일 수정 선호

### 코드 스타일
- **TypeScript strict mode 준수**: 엄격한 타입 체크 적용
- **ESLint 규칙 따르기**: 일관된 코드 스타일 유지
- **컴포넌트 라이브러리 우선 사용**: 기존 UI 라이브러리 활용
- **CSS-in-JS보다 유틸리티 클래스 선호**: Tailwind CSS 등 활용
- **의미 있는 변수명**: 명확하고 이해하기 쉬운 네이밍
- **한국어 주석 작성**: 복잡한 로직에 대한 설명 추가

### 품질 관리
- **타입 체크**: TypeScript 컴파일 오류 없도록 유지
- **린트 통과**: ESLint 경고/오류 해결
- **빌드 성공**: 프로덕션 빌드 정상 동작 확인
- **테스트 실행**: 단위 테스트 및 통합 테스트 통과

### 보안 원칙
- **환경 변수 사용**: API 키, 비밀번호 등 민감 정보는 환경 변수로 관리
- **입력 검증**: 모든 사용자 입력은 검증 후 처리
- **SQL 인젝션 방지**: Prepared statements 사용
- **XSS 방지**: 사용자 입력 값 이스케이프 처리
- **CORS 설정**: 적절한 Origin 제한

### 성능 최적화
- **레이지 로딩**: 필요한 시점에 리소스 로드
- **코드 스플리팅**: 번들 크기 최적화
- **이미지 최적화**: 적절한 포맷과 크기 사용
- **캐싱 전략**: 브라우저 캐싱 및 CDN 활용
- **메모이제이션**: 불필요한 재계산 방지

### 접근성 (A11y)
- **시맨틱 HTML**: 의미 있는 태그 사용
- **ARIA 레이블**: 스크린 리더 지원
- **키보드 네비게이션**: 마우스 없이도 사용 가능
- **충분한 색상 대비**: WCAG 기준 준수
- **대체 텍스트**: 이미지와 미디어에 설명 추가

### 버전 관리
- **의미 있는 커밋 메시지**: 변경 사항을 명확히 설명
- **작은 단위 커밋**: 기능별로 분리하여 커밋
- **브랜치 전략**: Git Flow 또는 GitHub Flow 준수
- **.gitignore 관리**: 불필요한 파일 제외

### 오류 처리
- **명확한 오류 메시지**: 사용자가 이해할 수 있는 메시지
- **로깅**: 개발/프로덕션 환경별 적절한 로깅
- **복구 가능한 오류**: 재시도 로직 구현
- **오류 경계**: React Error Boundary 등 활용

### 디버깅 원칙 ⚠️
- **근본 원인 분석 필수**: 증상이 아닌 원인을 찾아 해결
- **임시 우회책 금지**: 임시방편으로 문제를 덮지 않음
- **구조적 해결 우선**: 시간이 걸리더라도 올바른 구조로 해결
- **재발 방지 메커니즘**: 동일한 문제가 다시 발생하지 않도록 설계
- **데이터 무결성 보장**: 임시 데이터나 우회 로직으로 무결성 훼손 금지
- **심층적 분석**: 문제의 배경, 설계 의도, 비즈니스 로직 모순까지 분석

### 협업 원칙
- **코드 리뷰 준비**: 리뷰어가 이해하기 쉽게 작성
- **문서화**: API, 컴포넌트, 함수 등에 대한 설명 추가
- **일관성 유지**: 프로젝트 전체에서 동일한 패턴 사용
- **의존성 최소화**: 외부 라이브러리 신중히 선택

## 알려진 이슈 및 해결책

### OAuth PKCE 인증 오류
- **문제**: "invalid request: both auth code and code verifier should be non-empty"
- **해결**: 
  - NextResponse 쿠키 처리 방식 수정 (`/app/api/auth/signin/route.ts`)
  - 포트 3000 고정 (`package.json`에서 `-p 3000` 옵션)
  - 쿠키 설정: `sameSite: 'lax'`, `secure: false` (localhost용)

### 데이터베이스 연동
- **문제**: OAuth 후 프로필 저장 실패
- **해결**: 
  - localStorage에 테스트 결과 임시 저장
  - OAuth 콜백 후 `/result/save` 페이지에서 프로필 생성
  - `profiles` 테이블에 결과 저장

### Tailwind CSS 버전
- **문제**: Next.js 15가 v4 설치
- **해결**: `npm install -D tailwindcss@3.4.17`

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

## 주요 페이지 플로우

### 테스트 플로우
1. `/` - 랜딩 페이지 (성별 선택)
2. `/test` - 무한 스크롤 형식의 질문 페이지
3. `/signup-result` - 테스트 완료 후 회원가입 유도
4. OAuth 로그인 → `/auth/callback` → `/result/save` → `/result`
5. `/result` - 최종 결과 페이지 (점수, 티어, 상위 퍼센트)

### 관리자 플로우
- `/admin` - 로그인 페이지 (admin/maas2025)
- `/admin/dashboard` - 통계 대시보드
- `/admin/scoring` - 평가 기준 관리
- `/admin/oauth` - OAuth 설정 가이드

## 테스트 데이터

### 테스트용 관리자 계정
- URL: `/admin`
- ID: `admin`
- PW: `maas2025`

### 테스트용 결제 키 (Toss Payments 테스트 환경)
- Client Key: `test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq`
- Secret Key: `test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R`

## 프로젝트별 구체적인 정보

추가 정보는 PRD.md, SETUP_GUIDE.md, USER_PROMPTS.md를 참조하세요.