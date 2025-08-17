#!/usr/bin/env node

/**
 * Supabase 빠른 설정 스크립트
 * 사용법: node scripts/quick-setup.js [SUPABASE_URL] [ANON_KEY]
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MAAS Supabase 빠른 설정 도구
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

사용법:
  node scripts/quick-setup.js [SUPABASE_URL] [ANON_KEY]

예시:
  node scripts/quick-setup.js https://abcdefgh.supabase.co eyJhbGciOi...

Supabase 대시보드에서 찾는 방법:
1. Settings > API 메뉴 이동
2. Project URL 복사
3. anon public key 복사
4. 위 명령어 실행

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
  process.exit(1);
}

const [supabaseUrl, anonKey] = args;

// .env.local 파일 경로
const envPath = path.join(__dirname, '..', '.env.local');

// 현재 .env.local 내용 읽기
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// URL과 Key 업데이트
envContent = envContent.replace(
  /NEXT_PUBLIC_SUPABASE_URL=.*/,
  `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`
);
envContent = envContent.replace(
  /NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`
);

// 파일 저장
fs.writeFileSync(envPath, envContent);

console.log(`
✅ 환경 변수가 업데이트되었습니다!

설정된 값:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
URL: ${supabaseUrl}
Key: ${anonKey.substring(0, 20)}...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

다음 단계:
1. Supabase SQL Editor에서 supabase_schema.sql 실행
2. npm run setup 으로 연결 확인
3. npm run dev 로 개발 서버 시작
`);

// 자동으로 setup 실행
const { exec } = require('child_process');
exec('npm run setup', (error, stdout, stderr) => {
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
});