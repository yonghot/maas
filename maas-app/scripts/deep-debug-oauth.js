/**
 * OAuth 문제 심층 진단 및 해결 스크립트
 * 
 * 현재까지 파악된 문제:
 * 1. 로컬에서는 정상 작동
 * 2. Vercel 프로덕션에서만 "Invalid API key" 오류 발생
 * 3. Edge Runtime → Node.js Runtime 변경 후에도 문제 지속
 * 
 * 추정 원인:
 * - Vercel 환경 변수가 실제로 설정되지 않았을 가능성
 * - 환경 변수명 오타
 * - Build time vs Runtime 환경 변수 문제
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 ===== OAuth 문제 심층 진단 =====\n');

// 1. 환경 변수 파일 체크
console.log('1️⃣ 환경 변수 파일 체크');
console.log('================================');

const envFiles = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.production.local'
];

envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} 파일 존재`);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(l => l.includes('SUPABASE'));
    console.log(`   - Supabase 관련 변수: ${lines.length}개`);
  } else {
    console.log(`❌ ${file} 파일 없음`);
  }
});

// 2. 실제 문제 해결 방안
console.log('\n2️⃣ 문제 해결 체크리스트');
console.log('================================');

const solutions = [
  {
    title: 'Vercel 환경 변수 확인',
    steps: [
      'https://vercel.com/dashboard 접속',
      'maas-app 프로젝트 선택',
      'Settings → Environment Variables',
      '다음 변수가 설정되어 있는지 확인:',
      '  - NEXT_PUBLIC_SUPABASE_URL',
      '  - NEXT_PUBLIC_SUPABASE_ANON_KEY',
      '  - SUPABASE_SERVICE_ROLE_KEY',
      '⚠️ 변수명 대소문자와 언더스코어 정확히 일치 확인'
    ]
  },
  {
    title: 'Build Time vs Runtime 환경 변수',
    steps: [
      'NEXT_PUBLIC_ 접두사가 있는 변수는 빌드 시점에 주입됨',
      'Vercel에서 환경 변수 변경 후 재배포 필요',
      '재배포 방법: git commit --allow-empty -m "재배포"'
    ]
  },
  {
    title: 'Supabase 프로젝트 설정',
    steps: [
      'https://supabase.com/dashboard 접속',
      'Settings → API',
      'Project URL과 Anon Key 확인',
      'Vercel 환경 변수와 정확히 일치하는지 확인'
    ]
  }
];

solutions.forEach((solution, index) => {
  console.log(`\n${index + 1}. ${solution.title}`);
  solution.steps.forEach(step => {
    console.log(`   ${step}`);
  });
});

// 3. 코드 레벨 해결책
console.log('\n3️⃣ 즉시 적용 가능한 코드 수정');
console.log('================================');

console.log(`
// app/auth/callback/route.ts 수정 제안
export async function GET(request: Request) {
  // 1. 환경 변수 직접 하드코딩 테스트 (임시)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hvpyqchgimnzaotwztuy.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  
  console.log('환경 변수 폴백 사용:', {
    urlFromEnv: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    keyFromEnv: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
  
  // ... 나머지 코드
}
`);

console.log('\n4️⃣ 최종 점검 사항');
console.log('================================');
console.log('1. Vercel 대시보드에서 환경 변수 설정 확인 (가장 중요!)');
console.log('2. 변수명 오타 없는지 재확인');
console.log('3. 환경 변수 설정 후 재배포 필수');
console.log('4. 브라우저 캐시 및 쿠키 삭제 후 테스트');
console.log('\n⚠️ 대부분의 경우 Vercel 환경 변수 미설정이 원인입니다.');
console.log('   Vercel 대시보드에서 반드시 확인하세요!\n');