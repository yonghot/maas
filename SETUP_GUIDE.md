# MAAS 프로젝트 통합 설정 가이드

MAAS (Marriage Attractiveness Assessment System) - 결혼 매력도 평가 시스템의 모든 설정 및 구성 관련 안내를 하나의 파일로 통합 관리합니다.

## 1. 개발 환경 설정

### 1.1 초기 설정
```bash
# 프로젝트 클론
git clone https://github.com/yonghot/maas.git
cd maas/maas-app

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 Supabase 정보 입력
```

### 1.2 환경 변수
```env
# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq
TOSS_SECRET_KEY=test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hvpyqchgimnzaotwztuy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 2. Supabase 설정

### 2.1 데이터베이스 테이블 생성

#### profiles 테이블 (핵심 테이블)
```sql
CREATE TABLE public.profiles (
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
);

-- 인덱스 생성
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_instagram_id ON public.profiles(instagram_id);
```

### 2.2 RLS (Row Level Security) 설정
```sql
-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 정책 생성 (성능 최적화 버전)
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role bypass" ON public.profiles
  FOR ALL USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');
```

## 3. 소셜 로그인 설정

### 3.1 Google OAuth 설정 (필수)

**단계 1: Google Cloud Console 설정**
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
4. Application type: Web application
5. 승인된 리디렉션 URI 추가:
   - `https://hvpyqchgimnzaotwztuy.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/v1/callback` (로컬 개발용)
   - `http://localhost:3001/auth/v1/callback`
   - `http://localhost:3002/auth/v1/callback`
   - `http://localhost:3003/auth/v1/callback`
6. Client ID와 Client Secret 복사

**단계 2: Supabase Dashboard 설정**
1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택 (hvpyqchgimnzaotwztuy)
3. Authentication → Settings → Auth Providers
4. Google Provider 활성화 (Enable 토글)
5. Client ID와 Client Secret 입력
6. Save 클릭

**중요**: 이 설정이 완료되지 않으면 소셜 로그인이 작동하지 않습니다!

### 3.2 Kakao OAuth 설정 (필수)

**단계 1: Kakao Developers 설정**
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 내 애플리케이션 → 애플리케이션 추가하기
3. 앱 이름: "MAAS", 사업자명: 개인개발자
4. 플랫폼 설정 → Web 플랫폼 등록
5. 사이트 도메인 추가:
   - `https://hvpyqchgimnzaotwztuy.supabase.co`
   - `http://localhost:3000` ~ `http://localhost:3003`
6. 카카오 로그인 → 활성화 설정 → ON
7. Redirect URI 등록:
   - `https://hvpyqchgimnzaotwztuy.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/v1/callback`
   - `http://localhost:3001/auth/v1/callback` 
   - `http://localhost:3002/auth/v1/callback`
   - `http://localhost:3003/auth/v1/callback`
8. 제품 설정 → 카카오 로그인 → 보안
9. Client Secret → 코드 생성 → 활성화 상태: "사용함"
10. 앱 키 → REST API 키 복사 (Client ID용)
11. 보안 → Client Secret 코드 복사 (Client Secret용)

**단계 2: Supabase Dashboard 설정**
1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. Authentication → Settings → Auth Providers → Kakao
3. Enable 토글 활성화
4. Client ID: Kakao REST API 키 입력
5. Client Secret: Kakao에서 생성한 Client Secret 코드 입력
6. Save 클릭

**중요**: 카카오도 Client Secret이 필요합니다! (REST API 키 + Client Secret 모두 필요)

### 3.3 Instagram ID 연동
- 소셜 로그인 후 Instagram ID 입력
- 공개/비공개 설정:
  - 공개: 다른 사용자가 연락 가능
  - 비공개: 다른 사용자 정보만 열람 가능

## 4. Vercel 배포

### 4.1 배포 설정
```yaml
Build Command: npm run build
Output Directory: .next
Framework Preset: Next.js
Root Directory: maas-app
```

### 4.2 환경 변수 설정
Vercel Dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 5. 관리자 설정

### 5.1 관리자 계정
- URL: `/admin`
- ID: `admin`
- Password: `maas2025`

### 5.2 관리자 기능
- 통계 대시보드
- 평가 기준 가중치 관리
- 실시간 사용자 데이터 모니터링

## 6. 문제 해결

### 6.1 빌드 오류
```bash
# 캐시 및 의존성 초기화
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### 6.2 Tailwind CSS 버전 충돌
```bash
# Next.js 15가 v4를 설치하는 경우
npm install -D tailwindcss@3.4.17
```

### 6.3 TypeScript 오류
```bash
# 타입 체크
npx tsc --noEmit
```

## 7. 테스트

### 7.1 로컬 테스트
```bash
npm run dev
# http://localhost:3000 접속
```

### 7.2 프로덕션 테스트
```bash
npm run build
npm run start
```

## 8. 점수 계산 시스템

### 8.1 가중치 설정
- 남성: 재력(0.6) + 센스(0.3) + 피지컬(0.1)
- 여성(35세 미만): 나이(0.2) + 외모(0.4) + 가치관(0.4)
- 여성(35세 이상): 나이(0.4) + 외모(0.2) + 가치관(0.4)

### 8.2 점수 체계
- 10점 만점 (소수점 1자리)
- 정규분포 기반 백분위수
- 평균 5점, 표준편차 1.5점

## 9. 주요 API 엔드포인트

- `/api/test-results` - 테스트 결과 저장
- `/api/scoring-weights` - 가중치 조회/수정
- `/api/auth/callback` - 소셜 로그인 콜백

## 10. 보안 고려사항

- Supabase RLS로 데이터 보호
- 관리자 API는 인증 토큰 필수
- 환경 변수는 절대 커밋하지 않음
- CORS 설정 확인

## 11. SQL 자동 실행 도구

### 11.1 PowerShell 스크립트 (권장)
SQL을 클립보드에 복사하고 브라우저를 자동으로 엽니다:
```bash
cd maas-app
powershell -ExecutionPolicy Bypass -File scripts/run-sql.ps1
```

### 11.2 준비된 SQL 스크립트들
- `supabase/migrations/20240820000001_fix_database_issues.sql` - 데이터베이스 문제 종합 해결
- `scripts/create-scoring-weights.sql` - 점수 가중치 테이블 생성
- `scripts/create-views.sql` - 뷰 생성

### 11.3 Node.js 스크립트
데이터베이스 상태 확인 및 테스트:
```bash
node scripts/fix-db-now.js  # 데이터베이스 상태 확인
node scripts/auto-fix-db.js  # 자동 수정 시도
```

### 11.4 Supabase DDL 제한사항
**중요**: Supabase는 보안상 DDL(ALTER TABLE, CREATE, DROP) 명령을 API로 직접 실행 불가
- Service Role Key를 사용해도 Dashboard에서만 실행 가능
- 해결: PowerShell 스크립트로 SQL 자동 복사 → Dashboard에서 붙여넣기
- 링크: https://supabase.com/dashboard/project/hvpyqchgimnzaotwztuy/sql/new

## 12. MCP (Model Context Protocol) 설정

### 12.1 MCP 서버 설치
```bash
# Supabase MCP 서버들
npm install -g supabase-mcp
npm install -g @joshuarileydev/supabase-mcp-server
```

### 12.2 MCP 설정 파일 (`.mcp.json`)
프로젝트 루트에 통합된 설정:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["playwright", "test"],
      "env": {}
    },
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest"],
      "env": {}
    },
    "supabase-local": {
      "type": "stdio",
      "command": "npx supabase-mcp",
      "args": [],
      "env": {
        "SUPABASE_URL": "your_supabase_url",
        "SUPABASE_SERVICE_ROLE_KEY": "your_service_role_key"
      }
    }
  }
}
```

### 12.3 MCP 서버 확인
```bash
claude mcp list  # 설치된 MCP 서버 목록 확인
```

## 13. 알려진 문제 및 해결 방법

### 13.1 소셜 로그인 후 데이터 저장 문제

#### 문제
- Google OAuth 로그인 후 Instagram ID가 저장되지 않음
- OAuth 과정에서 URL 파라미터가 유실됨

#### 해결 방법
1. **localStorage 사용**: sessionStorage 대신 localStorage로 데이터 영속성 보장
2. **저장 플로우 수정**:
   - 테스트 완료 → localStorage에 결과 저장
   - OAuth 로그인 → 콜백에서 localStorage 읽기
   - `/result/save` 페이지에서 프로필 저장

#### 관련 파일
- `/app/signup-result/page.tsx` - localStorage 저장
- `/app/auth/callback/route.ts` - OAuth 콜백 처리
- `/app/result/save/page.tsx` - 프로필 저장

### 13.2 데이터베이스 제약 조건 오류

#### 문제
- `region` 컬럼 NOT NULL 제약
- 외래키가 `public.users` 대신 `auth.users` 참조 필요

#### 해결 SQL
```sql
-- region 컬럼 NULL 허용 및 기본값 설정
ALTER TABLE public.profiles 
ALTER COLUMN region DROP NOT NULL;

ALTER TABLE public.profiles 
ALTER COLUMN region SET DEFAULT 'seoul';

-- 외래키 수정
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;
```

## 14. 프로젝트 구조

```
maas/
├── .mcp.json                    # MCP 서버 설정 (통합됨)
├── maas-app/
│   ├── app/                     # Next.js App Router
│   │   ├── admin/               # 관리자 페이지
│   │   ├── api/                 # API 라우트
│   │   ├── auth/callback/       # OAuth 콜백
│   │   ├── login/               # 로그인
│   │   ├── result/              # 결과 페이지
│   │   ├── signup-result/       # 회원가입 결과
│   │   └── test/                # 테스트 페이지
│   ├── components/              # React 컴포넌트
│   ├── lib/
│   │   ├── supabase/           # Supabase 클라이언트
│   │   ├── scoring/            # 점수 계산 로직
│   │   └── types/              # TypeScript 타입
│   ├── scripts/                # 유틸리티 스크립트
│   │   ├── run-sql.ps1         # PowerShell SQL 실행
│   │   ├── fix-db-now.js       # DB 상태 확인
│   │   └── auto-fix-db.js      # 자동 수정 시도
│   └── supabase/
│       └── migrations/         # SQL 마이그레이션
```

---

이 가이드는 MAAS 프로젝트의 모든 설정 관련 정보를 포함합니다.
개별 가이드 파일을 생성하지 말고 이 파일에 통합하여 관리하세요.

*마지막 업데이트: 2025-08-21*