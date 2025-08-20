# 디버깅 체크리스트

## 1. 브라우저 개발자 도구 확인

### Console 탭
- [ ] `테스트 데이터 저장 완료` 로그 출력됨
- [ ] `로그인 성공, user.id` 로그 출력됨
- [ ] 에러 메시지 없음

### Application 탭 → Local Storage
- [ ] `test_result` 키 존재
- [ ] 데이터에 `instagram_id` 필드 포함
- [ ] 데이터에 `instagram_public` 필드 포함

### Network 탭
- [ ] `/auth/callback` 요청 성공 (307 리다이렉트)
- [ ] `/result/save` 페이지로 이동
- [ ] `/api/test-results` 요청 (관리자 페이지)

## 2. Supabase Dashboard 확인

### profiles 테이블
- [ ] `instagram_id` 컬럼 존재
- [ ] `instagram_public` 컬럼 존재
- [ ] 새로 가입한 사용자 데이터 존재

### auth.users 테이블
- [ ] Google 로그인한 사용자 존재
- [ ] user.id 확인

## 3. 서버 로그 확인

터미널에서 확인:
- [ ] `Auth callback error` 없음
- [ ] `프로필 저장 오류` 없음
- [ ] 포트 번호 확인 (3002 또는 다른 포트)

## 4. 수정 파일 확인

다음 파일들이 수정되었는지 확인:
- [ ] `/app/signup-result/page.tsx` - localStorage 사용
- [ ] `/app/auth/callback/route.ts` - 단순화됨
- [ ] `/app/result/save/page.tsx` - localStorage 읽기
- [ ] `/app/api/test-results/route.ts` - profiles 테이블만 조회

## 5. 일반적인 문제 해결

### 문제: "Auth callback error: invalid request"
**해결**: 
- 브라우저 캐시 삭제
- 시크릿 모드 사용
- Google OAuth 설정 확인

### 문제: Instagram ID가 저장되지 않음
**해결**:
- Supabase에서 SQL 실행 확인
- localStorage 데이터 확인
- Console 로그 확인

### 문제: 관리자 페이지에 데이터 없음
**해결**:
- profiles 테이블 직접 확인
- API 응답 확인 (Network 탭)
- 관리자 인증 확인

## 6. 직접 데이터 확인 SQL

Supabase SQL Editor에서:

```sql
-- profiles 테이블 확인
SELECT * FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- instagram_id 컬럼 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('instagram_id', 'instagram_public');
```