# Supabase 프로젝트 설정 가이드

## 1. Supabase 대시보드에서 필요한 정보 찾기

### Project Settings > API 메뉴에서:
1. **Project URL**: `https://[your-project-ref].supabase.co`
2. **Anon/Public Key**: `eyJ...` (긴 문자열)
3. **Service Role Key**: `eyJ...` (긴 문자열, 보안 주의!)

## 2. 환경 변수 설정

`.env.local` 파일에 다음 값들을 입력:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...당신의_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJ...당신의_service_role_key

# Toss Payments (테스트 키 - 이미 설정됨)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq
TOSS_SECRET_KEY=test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R
```

## 3. 데이터베이스 스키마 실행

Supabase 대시보드의 **SQL Editor**에서:

1. "New Query" 클릭
2. `supabase_schema.sql` 파일의 전체 내용 복사/붙여넣기
3. "Run" 버튼 클릭

## 4. Authentication 설정

### Email 인증 비활성화 (인스타그램 ID 사용):
1. Authentication > Providers 메뉴
2. Email 항목에서:
   - "Enable Email Confirmations" 비활성화
   - "Enable Email Login" 활성화 유지

### 비밀번호 정책 설정:
1. Authentication > Policies 메뉴
2. Password Requirements:
   - Minimum password length: 6
   - 나머지는 기본값 유지

## 5. Storage 설정 (선택사항)

프로필 이미지를 추가하려면:
1. Storage > New Bucket
2. Bucket name: `avatars`
3. Public bucket: Yes

## 6. Row Level Security (RLS) 확인

Database > Tables에서 각 테이블의 RLS가 활성화되어 있는지 확인:
- ✅ users
- ✅ profiles  
- ✅ subscriptions
- ✅ payments
- ✅ daily_views
- ✅ profile_views

## 7. 테스트 계정 생성

SQL Editor에서 테스트 사용자 생성:

```sql
-- 테스트 사용자는 앱에서 회원가입으로 생성하는 것을 권장
-- 또는 Authentication > Users에서 수동 생성
```

## 8. 프로젝트 확인사항

- [ ] 환경 변수가 올바르게 설정되었는가?
- [ ] 데이터베이스 스키마가 생성되었는가?
- [ ] RLS 정책이 모든 테이블에 적용되었는가?
- [ ] Authentication 설정이 완료되었는가?

## 문제 해결

### 연결 오류 발생 시:
1. 환경 변수의 URL과 Key 확인
2. Supabase 대시보드의 프로젝트 상태 확인
3. 네트워크 연결 확인

### 인증 오류 발생 시:
1. Anon Key가 올바른지 확인
2. RLS 정책 확인
3. Authentication 설정 확인

### 데이터베이스 오류 발생 시:
1. 테이블이 생성되었는지 확인
2. RLS 정책이 올바른지 확인
3. SQL Editor에서 직접 쿼리 테스트