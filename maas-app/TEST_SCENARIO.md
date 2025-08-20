# 테스트 시나리오 - 소셜 로그인 문제 해결 확인

## 테스트 준비
1. 브라우저 개발자 도구 열기 (F12)
2. Network 탭과 Console 탭 확인
3. Application > Storage > Session Storage / Local Storage 확인

## 시나리오 1: 새로운 사용자 회원가입
1. 시크릿 모드로 브라우저 열기
2. http://localhost:3000 접속
3. "지금 바로 시작하기" 클릭
4. 성별 선택 (남성/여성)
5. 모든 질문 답변 완료
6. 테스트 완료 후 Instagram ID 입력
7. Google 로그인 진행
8. **확인 사항**:
   - `/auth/callback` 호출 확인
   - `/result/save` 또는 `/result` 리다이렉션 확인
   - Session Storage에 `test_result` 데이터 확인

## 시나리오 2: 기존 사용자 재로그인
1. 로그아웃 상태에서 시작
2. http://localhost:3000/login 접속
3. Google 로그인 진행
4. **확인 사항**:
   - 프로필이 있으면 `/result`로 이동
   - 프로필이 없으면 `/test`로 이동

## 시나리오 3: 관리자 페이지 확인
1. http://localhost:3000/login?redirect=/admin 접속
2. 관리자 계정으로 로그인 (admin / maas2025)
3. **확인 사항**:
   - 회원가입한 사용자 목록 표시
   - Instagram ID 표시
   - 점수 및 티어 정보 표시

## 디버깅 체크리스트

### Console 확인 사항
- [ ] 404 에러 없음
- [ ] JavaScript 에러 없음
- [ ] Supabase 인증 에러 없음

### Network 확인 사항
- [ ] `/api/test-results` 호출 성공 (200)
- [ ] `/auth/callback` 리다이렉션 정상
- [ ] Supabase API 호출 성공

### Storage 확인 사항
- [ ] Session Storage: `test_result` 데이터 존재
- [ ] Local Storage: `adminAuth` (관리자만)
- [ ] Supabase 세션 토큰 존재

## 문제 발생 시 확인 사항

### 1. 회원 정보가 관리자 페이지에 없을 때
- Supabase Dashboard에서 직접 확인:
  - `profiles` 테이블에 데이터 있는지
  - `users` 테이블에 Instagram ID 있는지
  - `user_id` 매칭 확인

### 2. 잘못된 페이지로 리다이렉션될 때
- Console에서 로그 확인:
  - "기존 프로필 발견" 메시지
  - "프로필 없음" 메시지
  - 에러 메시지

### 3. 테스트 데이터가 저장되지 않을 때
- Session Storage 확인
- Network 탭에서 API 응답 확인
- Supabase 권한 설정 확인