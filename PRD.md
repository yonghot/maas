# 결혼매력평가 시스템 (MAAS - Marriage Attractiveness Assessment System)
## Product Requirements Document v2.0

---

## 1. 제품 개요

### 1.1 비전
결혼매력평가를 통해 자신의 매력도를 파악하고, 비슷한 티어의 이성과 매칭될 수 있는 소셜 데이팅 플랫폼

### 1.2 목표
- **사용자 참여**: 5분 이내 완료 가능한 간단하고 재미있는 테스트
- **매칭 서비스**: 티어 기반 이성 매칭 시스템
- **소셜 네트워킹**: 인스타그램 연동을 통한 자연스러운 연결
- **바이럴 효과**: SNS 공유를 통한 자연스러운 확산
- **수익화 가능성**: 프리미엄 매칭 기능 추가 가능

### 1.3 타겟 사용자
- **주 타겟**: 20-35세 미혼 남녀
- **부 타겟**: 결혼에 관심 있는 모든 연령층
- **페르소나**: SNS 활동이 활발하고, 새로운 만남에 열려있으며, 결혼을 고려하는 사용자

---

## 2. 핵심 기능

### 2.1 평가 시스템

#### 2.1.1 랜딩 페이지 즉시 평가
- **즉시 시작**: 랜딩 페이지 접속 시 바로 주요 변수 입력
- **핵심 정보 수집**:
  - 성별
  - 나이
  - 지역
  - 직업/소득 수준
  - 외모 자가평가
  - 라이프스타일 질문 (5-10개)

#### 2.1.2 평가 카테고리
1. **남성 평가 (CAI-M)**
   - 재력 (Wealth)
   - 센스 (Sense)
   - 피지컬 (Physical)

2. **여성 평가 (CAI-F)**
   - 나이 (Age)
   - 외모 (Appearance)
   - 가치관 (Values)

### 2.2 회원가입 시스템

#### 2.2.1 소셜 로그인 기반 회원가입
- **지원 로그인 방법**:
  - 구글 로그인 (OAuth 2.0)
  - 카카오톡 로그인 (Kakao OAuth)
  - 이메일 회원가입 제거됨 ✗
  
- **회원가입 후 확인 가능한 정보**:
  ✓ 종합 점수 (10점 만점, 소수점 1자리)
  ✓ 상위 백분위수 (정규분포 기반)
  ✓ 카테고리별 상세 점수
    - 남성: 재력, 센스, 피지컬
    - 여성: 나이, 외모, 가치관
  ✓ 맞춤형 개선 방안
  ✓ 비슷한 점수대 사람들의 특징
  ✓ 정규분포 차트와 나의 위치
  
- **인스타그램 아이디 연동** (신규):
  - 로그인 전 Instagram ID 입력 필수
  - 공개/비공개 토글 선택 가능
  - 공개: 다른 사용자에게 연락 가능
  - 비공개: 다른 사용자 정보만 열람 가능
  - 인증 수단이 아닌 연락 수단으로만 사용

#### 2.2.2 회원 데이터 저장 프로세스
- **프로필 생성 플로우**:
  1. 테스트 완료 → localStorage에 결과 저장 (영속성 보장)
  2. Instagram ID 입력 및 공개/비공개 설정
  3. 소셜 로그인 (Google/Kakao OAuth)
  4. OAuth 콜백 → auth.users 테이블에 자동 생성
  5. `/result/save` 페이지에서 profiles 테이블에 테스트 결과 + Instagram ID 저장
  6. 결과 페이지로 자동 리다이렉트

- **저장되는 데이터**:
  - 평가 입력 변수 및 응답 데이터
  - 평가 결과 (10점 만점 점수, 백분위수, 티어)
  - 카테고리별 상세 점수
  - 소셜 계정 정보 (Google/Kakao)
  - Instagram ID 및 공개/비공개 설정

### 2.3 매칭 시스템

#### 2.3.1 티어 기반 매칭
- **자동 매칭**: 로그인 시 자동으로 비슷한 티어의 이성 표시
- **티어 범위**: ±1 등급 내에서 매칭
  - S급 → A급, S급
  - A급 → S급, A급, B급
  - B급 → A급, B급, C급

#### 2.3.2 카드형 인터페이스
- **무한 스크롤**: 계속해서 새로운 프로필 로드
- **프로필 카드 정보**:
  - 닉네임 또는 이니셜
  - 나이, 지역
  - 티어/등급
  - 주요 매력 포인트 3개
  - 인스타그램 아이디 (공개 설정인 경우)

#### 2.3.3 상호작용 기능
- **좋아요**: 관심 표시
- **슈퍼 좋아요**: 특별 관심 표시 (일일 제한)
- **패스**: 다음 프로필로 넘어가기
- **매칭 알림**: 상호 좋아요 시 알림

### 2.4 프로필 관리

#### 2.4.1 내 프로필
- **기본 정보**: 평가 결과, 티어, 등급
- **상세 점수**: 카테고리별 점수 레이더 차트
- **프로필 편집**: 자기소개, 사진 추가 (선택)
- **재평가**: 월 1회 재평가 가능

#### 2.4.2 프라이버시 설정
- **인스타그램 공개**: 공개/비공개 전환
- **프로필 가시성**: 활성/비활성
- **매칭 알림**: 온/오프

---

## 3. 사용자 경험 (UX)

### 3.1 신규 사용자 플로우
1. **랜딩 페이지** → 즉시 평가 시작
2. **주요 변수 입력** → 5-10개 핵심 질문
3. **평가 완료** → 점수 계산
4. **회원가입 유도** → "결과를 저장하고 매칭 시작하기"
5. **인스타그램 회원가입** → 3개 정보만 입력
6. **결과 확인** → 상세 분석 및 티어 확인
7. **매칭 시작** → 비슷한 티어 이성 탐색

### 3.2 기존 사용자 플로우
1. **소셜 로그인** → 구글 또는 카카오 계정으로 로그인
2. **매칭 피드** → 자동으로 매칭 대상 표시
3. **탐색** → 스와이프 또는 버튼으로 좋아요/패스
4. **매칭 성공** → 상호 좋아요 시 연결

### 3.2.1 로그인 시스템
- **일반 사용자**: 구글/카카오 소셜 로그인만 지원
- **관리자**: 별도 ID/비밀번호 로그인 (admin/maas2025)
- **OAuth 콜백**: 자동으로 Instagram ID 정보 저장

### 3.3 디자인 원칙
- **모바일 우선**: 세로 모드 최적화
- **카드 UI**: 틴더 스타일 카드 인터페이스
- **직관적 제스처**: 스와이프 기반 상호작용
- **미니멀 디자인**: 핵심 정보만 강조
- **부드러운 애니메이션**: 자연스러운 전환 효과

---

## 4. 기술 요구사항

### 4.1 프론트엔드
- **프레임워크**: Next.js 15 (App Router)
- **스타일링**: Tailwind CSS + shadcn/ui
- **상태관리**: Zustand
- **애니메이션**: Framer Motion
- **차트**: Recharts (레이더 차트)

### 4.2 백엔드
- **API**: Next.js API Routes
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **실시간**: Supabase Realtime (매칭 알림)
- **파일 저장**: Supabase Storage (프로필 이미지)

### 4.3 데이터베이스 스키마
```sql
-- 프로필 테이블 (핵심)
profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  gender TEXT NOT NULL,
  age INTEGER,
  region TEXT DEFAULT 'seoul',
  total_score INTEGER,
  percentile INTEGER,
  tier TEXT,
  answers JSONB,
  category_scores JSONB,
  instagram_id TEXT,
  instagram_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- 매칭 테이블
matches (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  target_user_id UUID REFERENCES users(id),
  action VARCHAR, -- 'like', 'superlike', 'pass'
  created_at TIMESTAMP
)

-- 매칭 성공 테이블
successful_matches (
  id UUID PRIMARY KEY,
  user1_id UUID REFERENCES users(id),
  user2_id UUID REFERENCES users(id),
  matched_at TIMESTAMP
)
```

### 4.4 배포
- **호스팅**: Vercel
- **도메인**: maas.fun
- **CDN**: Vercel Edge Network
- **데이터베이스**: Supabase Cloud

---

## 5. 수익 모델

### 5.1 프리미엄 기능
- **무제한 좋아요**: 일일 제한 해제
- **슈퍼 좋아요 추가**: 더 많은 특별 관심 표시
- **부스트**: 30분간 더 많은 노출
- **되돌리기**: 실수로 패스한 프로필 복구
- **고급 필터**: 특정 조건으로 매칭 대상 필터링

### 5.2 구독 모델
- **Basic**: 무료 (일일 좋아요 30개)
- **Plus**: 월 9,900원 (무제한 좋아요)
- **Gold**: 월 19,900원 (모든 프리미엄 기능)

### 5.3 광고
- **네이티브 광고**: 피드 사이 광고 카드
- **보상형 광고**: 광고 시청 시 좋아요 추가

---

## 6. 성공 지표 (KPI)

### 6.1 단기 (3개월)
- **가입자 수**: 10,000명
- **DAU**: 3,000명
- **매칭 성공률**: 15%
- **유료 전환율**: 5%

### 6.2 중기 (6개월)
- **가입자 수**: 50,000명
- **DAU**: 15,000명
- **매칭 성공률**: 20%
- **유료 전환율**: 10%
- **월 매출**: 500만원

### 6.3 장기 (1년)
- **가입자 수**: 200,000명
- **DAU**: 60,000명
- **매칭 성공률**: 25%
- **유료 전환율**: 15%
- **월 매출**: 3,000만원

---

## 7. 개발 로드맵

### Phase 1: MVP (3주) - ✅ 완료
- [x] 기본 평가 시스템
- [x] 성별별 차별화된 질문 시스템 (15-20개 질문)
- [x] 무한 스크롤 테스트 UI
- [x] 점수 계산 알고리즘 (남녀별 가중치)
- [x] 등급 시스템 (S-F급, 상세 등급)
- [x] 회원가입 유도 시스템
- [x] 간단한 결과 미리보기 (점수/등급 숨김)
- [x] 상세 결과 페이지 (레이더 차트, 카테고리별 분석)
- [x] 데이터베이스 스키마 설계 및 구현
- [x] 관리자 대시보드 (로그인 시스템 포함)
- [x] 반응형 모바일 최적화
- [x] Supabase 완전 연동
- [x] 테스트 결과 저장 시스템
- [x] 소셜 로그인 시스템 (Google/Kakao OAuth)
- [x] Instagram ID 연동 (공개/비공개 설정)
- [x] 관리자 평가 기준 관리 페이지
- [x] 실시간 가중치 조절 시뮬레이터

### Phase 2: 매칭 시스템 (대기중)
- [ ] 사용자 프로필 관리 고도화
- [ ] 티어 기반 매칭 알고리즘
- [ ] 카드형 UI 구현
- [ ] 매칭 상호작용 기능

### Phase 3: 수익화 (4주)
- [ ] 프리미엄 기능 구현
- [ ] 결제 시스템 연동
- [ ] 광고 시스템
- [ ] A/B 테스트

### Phase 4: 성장 (지속)
- [ ] AI 기반 매칭 최적화
- [ ] 커뮤니티 기능
- [ ] 이벤트 매칭
- [ ] 오프라인 연계

---

## 8. 리스크 및 대응

### 8.1 리스크
- **가짜 프로필**: 허위 정보 입력
- **프라이버시 우려**: 인스타그램 정보 노출
- **매칭 불균형**: 성비 불균형
- **부적절한 행동**: 스팸, 희롱

### 8.2 대응 방안
- **인증 시스템**: 인스타그램 계정 검증
- **신고 기능**: 부적절한 사용자 신고
- **AI 모니터링**: 이상 행동 패턴 감지
- **프라이버시 보호**: 단계적 정보 공개

---

## 9. 법적 고려사항

- **이용약관**: 서비스 이용 조건 명시
- **개인정보처리방침**: KISA 가이드라인 준수
- **청소년 보호**: 19세 이상만 가입 가능
- **데이팅 앱 규제**: 관련 법규 준수

---

---

## 10. 현재 구현 현황 (2025-08-20)

### ✅ 완료된 기능
- **기본 테스트 시스템**: 성별별 15-20개 질문, 무한 스크롤 UI
- **점수 계산**: 남녀별 차별화된 가중치 알고리즘
- **등급 시스템**: S-F급 티어, 상세 등급 (S+, S, S- 등)
- **결과 표시**: 레이더 차트, 카테고리별 분석, 정규분포 차트
- **회원가입 시스템**: Supabase Auth 완전 연동
- **관리자 시스템**: 
  - 관리자 로그인 (admin/maas2025)
  - 통계 대시보드, PC 최적화
  - **평가 기준 관리 페이지** (신규)
  - 실시간 가중치 조절 시뮬레이터
- **데이터베이스**: Supabase 연동, 테스트 결과 저장 (회원/비회원 분리)
- **모바일 최적화**: 반응형 디자인, 민트 색상 테마
- **배포 시스템**: Vercel 배포 완료, 환경 변수 설정

### 🔧 기술 스택
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS v3, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Charts**: Recharts (레이더 차트, 정규분포 차트)
- **Animation**: Framer Motion
- **State**: Zustand
- **Deploy**: Vercel
- **Database**: PostgreSQL (registered/anonymous 테이블 분리)

### 📊 주요 변경사항
- 기존 "MAAS 테스트" → "나의 결혼 점수는?" 브랜딩 변경
- 회원가입 전까지 점수/등급 숨김으로 가입 유도 강화
- 관리자 페이지로 실시간 사용자 데이터 모니터링 가능
- Mars(♂)/Venus(♀) 심볼로 성별 구분 개선
- 테스트 안내 문구 완전 제거로 UX 간소화
- 세션 기반 관리자 인증 시스템 구현

### 🛠 최근 수정사항 (2025-08-21)
- **데이터베이스 문제 해결**:
  - localStorage 사용으로 OAuth 후 데이터 유실 문제 해결
  - region 컬럼 NULL 허용 및 기본값 'seoul' 설정
  - 외래키를 auth.users로 변경 (public.users 테이블 삭제)
  - RLS 정책 성능 최적화
  - profiles 테이블에 Instagram 컬럼 추가

- **SQL 자동 실행 도구 구축**:
  - PowerShell 스크립트 (run-sql.ps1) - SQL 클립보드 복사 + 브라우저 자동 열기
  - Node.js 스크립트 (fix-db-now.js) - 데이터베이스 상태 확인
  - Supabase Migration 파일 생성
  - (주의: Supabase는 DDL 명령을 API로 직접 실행 불가)

- **MCP 서버 설정**:
  - Supabase MCP 서버 설치 (supabase-mcp, @joshuarileydev/supabase-mcp-server)
  - .mcp.json 파일 통합 (프로젝트 루트에 통합)
  - MCP 서버 환경 변수 설정

### 🛠 이전 수정사항 (2025-08-20 오후)
- **Instagram ID 연동 시스템**:
  - 이메일 회원가입 완전 제거
  - Instagram ID 입력 필드 추가 (@기호 자동 표시)
  - 공개/비공개 토글 스위치 구현
  - 소셜 로그인과 Instagram ID 통합
  - OAuth 콜백에서 Instagram ID 자동 저장

- **OAuth 설정 시스템**:
  - Google/Kakao OAuth 설정 가이드 완성
  - OAuth 설정 관리자 페이지 구현 (/admin/oauth)
  - 단계별 설정 가이드 및 Redirect URI 복사 기능
  - 설정 상태 추적 및 테스트 기능

### 🛠 이전 수정사항 (2025-08-20 오전)
- **10점 만점 시스템**: 100점 → 10점 (소수점 1자리) 변경
- **백분위수 시스템**: 정규분포 기반 상위 X% 표시 및 시각화
- **소셜 로그인**: 구글, 카카오톡 로그인 구현
- **등급 제거**: 등급 표시 제거, 백분위수로 대체
- **비슷한 점수대 특징**: 결과 페이지에 비슷한 점수대 사람들의 특징 추가
- **카테고리별 점수 수정**: 성별별 실제 카테고리 구조 반영
- **UI 개선**: "나중에 하기" 옵션 제거, 회원가입 유도 강화

### 🛠 이전 수정사항 (2025-08-19)
- **Vercel 배포 오류 해결**: Supabase 서버 클라이언트, useSearchParams Suspense 처리
- **API 키 문제 해결**: 환경 변수 설정 및 배포 환경 최적화
- **타입 오류 수정**: UserInfo 인터페이스 ageGroup 속성 추가
- **빌드 최적화**: Next.js 15 호환성 확보

---

## 11. 프로젝트 아키텍처 및 구현 세부사항

### 11.1 디렉토리 구조
```
maas-app/
├── app/              # Next.js 15 App Router
│   ├── admin/        # 관리자 대시보드 (admin/maas2025 로그인)
│   │   ├── oauth/    # OAuth 설정 가이드 페이지
│   │   └── scoring/  # 평가 기준 관리 페이지
│   ├── api/          # API Routes (payment, profile, subscription, test-results, scoring-weights)
│   ├── auth/         # Supabase Auth 콜백
│   ├── login/        # 로그인 페이지 (소셜 로그인 지원)
│   ├── signup-result/ # 회원가입 유도 페이지 (Instagram ID 입력)
│   ├── test/         # 테스트 실행 페이지
│   └── result/       # 결과 페이지 (simple, save, [id])
├── components/       # React 컴포넌트
│   ├── auth/         # 인증 관련 컴포넌트
│   ├── result/       # 결과 표시 컴포넌트 (차트, 점수, 정규분포)
│   ├── test/         # 테스트 진행 컴포넌트
│   └── ui/           # shadcn/ui 컴포넌트
├── lib/              # 핵심 비즈니스 로직
│   ├── scoring/      # 점수 계산 시스템
│   ├── questions/    # 성별별 질문 데이터
│   ├── supabase/     # Supabase 클라이언트
│   └── types/        # TypeScript 타입 정의
├── store/            # Zustand 상태 관리
├── contexts/         # React Context (AuthContext)
└── scripts/          # 설정 및 마이그레이션 스크립트
```

### 11.2 핵심 비즈니스 로직 구현 세부사항

#### 점수 계산 시스템 (`lib/scoring/calculator.ts`)
- **ScoringCalculator 클래스**: 성별별 점수 계산 메인 로직
- **남성 평가 (CAI-M)**: 재력(0.6) + 센스(0.3) + 피지컬(0.1) 가중치
- **여성 평가 (CAI-F)**: 평가자 연령별 가중치 차별화
  - 35세 미만: 나이(0.2) + 외모(0.4) + 가치관(0.4)
  - 35세 이상: 나이(0.4) + 외모(0.2) + 가치관(0.4)
- **등급 시스템**: S(95+), A(85+), B(70+), C(55+), D(40+), F(40-)

#### 티어 시스템 (`lib/scoring/tier-system.ts`)
- **정규분포 기반**: 평균 50, 표준편차 15
- **LOL 티어 체계**: 10단계 (Challenger ~ Iron)
- **백분위수 계산**: Z-score 기반 CDF 계산

#### 상태 관리 (`store/test-store.ts`)
- **Zustand + persist**: 브라우저 새로고침 시에도 상태 유지
- **관리 데이터**: userInfo, userLead, answers, 진행상태, 결과
- **localStorage 키**: 'maas-test-storage'

### 11.3 데이터베이스 구조 세부사항 (Supabase)
- **profiles**: 소셜 로그인 사용자 프로필 및 테스트 결과
- **users**: 사용자 계정 정보 (Instagram ID, 공개/비공개 설정)
- **test_results**: 테스트 결과 (현재 미사용)
- **anonymous_test_results**: 비회원 테스트 결과 (현재 미사용)
- **subscriptions**: 구독 정보 (준비중)
- **RLS(Row Level Security)**: 모든 테이블에 적용

### 11.4 테마 및 스타일 가이드
- **메인 컬러**: Teal/Mint 계열 (teal-400, teal-500, teal-600)
- **차트 컬러**: chart-1 ~ chart-5 CSS 변수
- **애니메이션**: Framer Motion 활용
- **컴포넌트**: shadcn/ui new-york 스타일
- **반응형**: 모바일 우선 디자인

### 11.5 개발 명령어
```bash
# 프로젝트는 maas-app 디렉토리에 위치
cd maas-app

# 개발 서버 실행
npm run dev         # http://localhost:3000

# 빌드 및 품질 검사
npm run build       # 프로덕션 빌드
npm run start       # 프로덕션 서버 실행
npm run lint        # ESLint 실행
npx tsc --noEmit   # TypeScript 타입 체크

# Supabase 설정
npm run setup       # Supabase 환경 설정 스크립트 (scripts/setup-supabase.js)
npm run check-env   # 환경 변수 확인

# 빌드 문제 해결 시
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### 11.6 환경 변수 설정
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://hvpyqchgimnzaotwztuy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Vercel 환경 변수 (대시보드에서 설정)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 11.7 배포 설정
- **Production URL**: https://maas-eight.vercel.app
- **GitHub**: https://github.com/yonghot/maas
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Framework**: Next.js (자동 감지)
- **Root Directory**: maas-app (Vercel 설정)

### 11.8 알려진 이슈 및 해결책

#### Tailwind CSS v3 호환성
```bash
# Next.js 15가 v4를 설치하는 경우 v3로 다운그레이드
npm install -D tailwindcss@3.4.17
```

#### PostCSS 설정
- `postcss.config.mjs` 사용 (`.js` 아님)

#### TypeScript 경로 별칭
- `@/*` → `./` 매핑 (tsconfig.json)

#### Vercel 배포 이슈
- useSearchParams는 Suspense boundary 필요
- 환경 변수는 Vercel 대시보드에서 설정
- Root Directory는 maas-app로 설정

---

*이 문서는 MAAS 프로젝트의 제품 요구사항 문서입니다.*
*최종 업데이트: 2025-08-21*
*버전: 2.5*