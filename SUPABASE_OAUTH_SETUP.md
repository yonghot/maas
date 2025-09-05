# 🔥 Supabase OAuth 설정 가이드 (필수!)

## ⚠️ 중요: 이 설정을 하지 않으면 프로덕션에서 OAuth가 작동하지 않습니다!

## 1. Supabase 대시보드 설정

### 1.1 Supabase 대시보드 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택 (hvpyqchgimnzaotwztuy)

### 1.2 OAuth Providers 활성화
1. 왼쪽 메뉴에서 **Authentication** 클릭
2. **Providers** 탭 클릭
3. 다음 제공자 활성화 및 설정:
   - **Google**: Enable 토글 ON
   - **Kakao**: Enable 토글 ON

### 1.3 Redirect URLs 설정 (가장 중요! 🚨)
1. **Authentication** → **URL Configuration** 이동
2. **Redirect URLs** 섹션에서 다음 URL 모두 추가:
   ```
   http://localhost:3000/auth/callback
   https://maas-eight.vercel.app/auth/callback
   ```
3. **Save** 클릭

## 2. Google OAuth 설정

### 2.1 Google Cloud Console
1. https://console.cloud.google.com 접속
2. 프로젝트 선택 또는 새 프로젝트 생성
3. **APIs & Services** → **Credentials** 이동

### 2.2 OAuth 2.0 클라이언트 ID 생성
1. **Create Credentials** → **OAuth client ID** 클릭
2. Application type: **Web application** 선택
3. 설정:
   - Name: `MAAS App`
   - Authorized redirect URIs에 추가:
     ```
     https://hvpyqchgimnzaotwztuy.supabase.co/auth/v1/callback
     ```
4. **Create** 클릭
5. Client ID와 Client Secret 복사

### 2.3 Supabase에 Google 키 입력
1. Supabase 대시보드로 돌아가기
2. **Authentication** → **Providers** → **Google**
3. 입력:
   - Client ID: (Google에서 복사한 값)
   - Client Secret: (Google에서 복사한 값)
4. **Save** 클릭

## 3. Kakao OAuth 설정

### 3.1 Kakao Developers
1. https://developers.kakao.com 접속
2. 내 애플리케이션 선택 또는 새 앱 생성

### 3.2 앱 설정
1. **앱 설정** → **플랫폼** → **Web** 추가
2. 사이트 도메인:
   ```
   http://localhost:3000
   https://maas-eight.vercel.app
   ```

### 3.3 카카오 로그인 설정
1. **제품 설정** → **카카오 로그인** 활성화
2. **Redirect URI** 등록:
   ```
   https://hvpyqchgimnzaotwztuy.supabase.co/auth/v1/callback
   ```
3. 동의항목 설정에서 필요한 항목 선택

### 3.4 Supabase에 Kakao 키 입력
1. Supabase 대시보드로 돌아가기
2. **Authentication** → **Providers** → **Kakao**
3. 입력:
   - Client ID: (REST API 키)
   - Client Secret: (시크릿 키 - 보안 탭에서 생성)
4. **Save** 클릭

## 4. Vercel 환경 변수 설정

### 4.1 Vercel 대시보드
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables**

### 4.2 환경 변수 추가
다음 변수를 정확히 추가:
```
NEXT_PUBLIC_SUPABASE_URL=https://hvpyqchgimnzaotwztuy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2cHlxY2hnaW1uemFvdHd6dHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTY4ODgsImV4cCI6MjA3MTAzMjg4OH0.8prtIUesStj4xNabIKY3yVlrbvWseAYIUM11rk7KZX4
SUPABASE_SERVICE_ROLE_KEY=(Service Role Key - Supabase 대시보드에서 확인)
```

### 4.3 재배포 트리거
환경 변수 설정 후 반드시 재배포:
```bash
git commit --allow-empty -m "fix: 환경 변수 설정 후 재배포"
git push
```

## 5. 테스트

### 5.1 디버그 페이지에서 테스트
1. https://maas-eight.vercel.app/debug-oauth 접속
2. 연결 테스트 실행
3. OAuth 테스트 실행

### 5.2 체크리스트
- [ ] Supabase Redirect URLs에 프로덕션 URL 추가됨
- [ ] Google OAuth 클라이언트 ID 설정 완료
- [ ] Kakao OAuth Redirect URI 설정 완료
- [ ] Vercel 환경 변수 설정 완료
- [ ] 재배포 완료

## 🆘 문제 해결

### "Invalid API key" 오류
→ Vercel 환경 변수가 설정되지 않았거나 오타가 있음

### "Redirect URI mismatch" 오류
→ Supabase URL Configuration에 프로덕션 URL이 추가되지 않음

### OAuth 후 세션이 생성되지 않음
→ 브라우저 쿠키가 차단되었거나 PKCE 문제

## 📞 지원
문제가 지속되면 다음 정보와 함께 문의:
1. /debug-oauth 페이지 스크린샷
2. 브라우저 콘솔 에러 메시지
3. Network 탭의 실패한 요청