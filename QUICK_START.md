# MAAS 빠른 시작 가이드

## 📋 필수 사전 준비

1. **Node.js 18+ 설치**
2. **GitHub 계정** (Supabase 로그인용)

## 🚀 5분 안에 시작하기

### 1단계: Supabase 프로젝트 생성 (2분)

1. [Supabase](https://supabase.com) 접속
2. GitHub로 로그인
3. "New Project" 클릭
4. 다음 정보 입력:
   - **Project Name**: `maas-app`
   - **Database Password**: 강력한 비밀번호 (저장 필수!)
   - **Region**: `Northeast Asia (Seoul)`
   - **Plan**: Free

### 2단계: 환경 변수 설정 (1분)

1. Supabase 대시보드에서 **Settings > API** 이동
2. 다음 정보 복사:
   - Project URL
   - anon public key

3. `.env.local` 파일 생성:
```bash
cd maas-app
cp .env.local.example .env.local
```

4. `.env.local` 파일 편집하여 값 입력:
```env
NEXT_PUBLIC_SUPABASE_URL=여기에_Project_URL_붙여넣기
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_key_붙여넣기
```

### 3단계: 데이터베이스 설정 (1분)

1. Supabase 대시보드에서 **SQL Editor** 이동
2. "New Query" 클릭
3. `supabase_schema.sql` 파일 내용 전체 복사
4. SQL Editor에 붙여넣기
5. "Run" 버튼 클릭

### 4단계: 프로젝트 실행 (1분)

```bash
# 의존성 설치 (최초 1회)
npm install

# 환경 설정 확인
npm run setup

# 개발 서버 시작
npm run dev
```

## ✅ 설정 확인

`npm run setup` 실행 시 다음과 같이 표시되면 성공:

```
✅ 환경 변수가 설정되었습니다.
✅ Supabase 연결 성공!
✅ users 테이블 확인
✅ profiles 테이블 확인
✅ subscriptions 테이블 확인
✅ payments 테이블 확인
✅ daily_views 테이블 확인
✅ profile_views 테이블 확인

✅ 모든 설정이 완료되었습니다!
```

## 🎯 첫 테스트

1. http://localhost:3000 접속
2. "시작하기" 클릭
3. 회원가입:
   - 인스타그램 ID: `testuser`
   - 비밀번호: `test123`
4. 성별 선택 후 테스트 진행
5. 결과 확인

## 🔧 문제 해결

### "Supabase 연결 실패" 오류
- `.env.local` 파일의 URL과 Key 확인
- Supabase 프로젝트가 활성화되었는지 확인

### "테이블이 없습니다" 오류
- SQL Editor에서 `supabase_schema.sql` 다시 실행
- 실행 후 "Success" 메시지 확인

### "인증 실패" 오류
- Authentication > Settings에서 이메일 확인 비활성화
- `.env.local`의 anon key가 올바른지 확인

## 📱 모바일 테스트

개발 서버 실행 후:
- 같은 네트워크의 모바일에서 `http://[컴퓨터IP]:3000` 접속

## 🚢 배포 준비

1. Vercel에 배포:
```bash
npx vercel
```

2. 환경 변수 설정:
- Vercel 대시보드 > Settings > Environment Variables
- `.env.local`의 모든 변수 추가

## 📚 추가 리소스

- [Supabase 문서](https://supabase.com/docs)
- [Next.js 문서](https://nextjs.org/docs)
- [Toss Payments 문서](https://docs.tosspayments.com)