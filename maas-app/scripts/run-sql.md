# SQL 실행 가이드

## 방법 1: Supabase Dashboard에서 직접 실행 (권장)

1. 아래 링크를 클릭하여 Supabase Dashboard SQL Editor로 이동:
   https://supabase.com/dashboard/project/hvpyqchgimnzaotwztuy/sql/new

2. `scripts/fix-database-issues.sql` 파일의 내용을 복사하여 붙여넣기

3. "Run" 버튼 클릭

## 방법 2: Migration으로 실행

터미널에서 다음 명령 실행:

```bash
cd maas-app
npx supabase db push --db-url "postgresql://postgres.hvpyqchgimnzaotwztuy:[YOUR_DB_PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres"
```

⚠️ [YOUR_DB_PASSWORD]를 실제 데이터베이스 비밀번호로 교체하세요.
비밀번호는 Supabase Dashboard > Settings > Database에서 확인할 수 있습니다.

## 방법 3: PowerShell 스크립트로 자동 실행

아래 PowerShell 스크립트를 실행하면 브라우저가 자동으로 열립니다:

```powershell
# run-sql.ps1
Start-Process "https://supabase.com/dashboard/project/hvpyqchgimnzaotwztuy/sql/new"
```

## 실행해야 할 SQL

migration 파일이 이미 생성되어 있습니다:
- 위치: `supabase/migrations/20240820000001_fix_database_issues.sql`

이 파일은 다음 문제들을 해결합니다:
- ✅ region 컬럼 NULL 허용 및 기본값 설정
- ✅ 외래키를 auth.users로 변경
- ✅ Instagram 컬럼 추가 (instagram_id, instagram_public)
- ✅ RLS 정책 최적화
- ✅ 인덱스 생성
- ✅ 불필요한 public.users 테이블 삭제