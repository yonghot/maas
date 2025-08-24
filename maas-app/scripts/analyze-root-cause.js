#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function analyzeRootCause() {
  console.log('🔍 근본 원인 심층 분석...\n');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    console.log('=== 1. 데이터베이스 구조 분석 ===');
    
    // 1.1 테이블 의존성 분석
    console.log('\n📊 테이블 간 의존성:');
    console.log('   auth.users (Supabase 관리)');
    console.log('   ├── 소셜 로그인 시 자동 생성');
    console.log('   └── id, email, created_at');
    console.log('');
    console.log('   public.users (수동 관리)');
    console.log('   ├── instagram_id TEXT UNIQUE NOT NULL ← 🚨 제약조건');
    console.log('   ├── instagram_public BOOLEAN');
    console.log('   └── id REFERENCES auth.users(id)');
    console.log('');
    console.log('   profiles');
    console.log('   ├── user_id REFERENCES public.users(id) ← 🚨 단절');
    console.log('   └── 테스트 결과 데이터');
    
    // 1.2 현재 데이터 상태 분석
    console.log('\n📈 현재 데이터 상태:');
    
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const { data: publicUsers } = await supabase.from('users').select('*');
    const { data: profiles } = await supabase.from('profiles').select('*');
    
    console.log(`   auth.users: ${authUsers.users.length}명`);
    console.log(`   public.users: ${publicUsers?.length || 0}명`);
    console.log(`   profiles: ${profiles?.length || 0}명`);
    
    // 1.3 동기화 상태 분석
    console.log('\n🔄 동기화 분석:');
    const authUserIds = new Set(authUsers.users.map(u => u.id));
    const publicUserIds = new Set(publicUsers?.map(u => u.id) || []);
    const profileUserIds = new Set(profiles?.map(p => p.user_id) || []);
    
    const missingInPublic = authUsers.users.filter(u => !publicUserIds.has(u.id));
    const missingProfiles = authUsers.users.filter(u => !profileUserIds.has(u.id));
    
    console.log(`   public.users에 없는 auth.users: ${missingInPublic.length}명`);
    console.log(`   profiles에 없는 사용자: ${missingProfiles.length}명`);
    
    console.log('\n=== 2. OAuth 플로우 문제 분석 ===');
    
    // 2.1 OAuth 플로우 단계별 분석
    console.log('\n🔄 OAuth 플로우:');
    console.log('   1. 사용자 소셜 로그인 클릭');
    console.log('   2. Supabase Auth → auth.users에 자동 생성 ✅');
    console.log('   3. /auth/callback → 세션 생성 ✅');
    console.log('   4. /result/save → 프로필 저장 시도');
    console.log('   5. public.users 확인 ❌ (없음)');
    console.log('   6. profiles 생성 시도 ❌ (FK 제약 위반)');
    
    // 2.2 코드 흐름 분석
    console.log('\n💻 코드 흐름 분석:');
    console.log('   callback/route.ts:');
    console.log('   ├── auth.users 생성됨 ✅');
    console.log('   ├── /result/save로 리다이렉트 ✅');
    console.log('   └── public.users 생성 없음 ❌');
    console.log('');
    console.log('   result/save/page.tsx:');
    console.log('   ├── 프로필 데이터 준비 ✅');
    console.log('   ├── profiles 테이블에 INSERT 시도');
    console.log('   └── FK 제약 위반 (public.users에 없음) ❌');
    
    console.log('\n=== 3. 설계 결함 분석 ===');
    
    // 3.1 구조적 문제
    console.log('\n🏗️ 구조적 문제:');
    console.log('   문제 1: 이중 사용자 테이블');
    console.log('   ├── auth.users: Supabase 자동 관리');
    console.log('   ├── public.users: 수동 관리 필요');
    console.log('   └── 동기화 메커니즘 부재');
    console.log('');
    console.log('   문제 2: 잘못된 비즈니스 로직');
    console.log('   ├── Instagram 필수 가정 (instagram_id NOT NULL)');
    console.log('   ├── 소셜 로그인은 Instagram 불필요');
    console.log('   └── 모순된 사용자 등록 경로');
    
    // 3.2 데이터 일관성 문제
    console.log('\n📊 데이터 일관성 문제:');
    console.log('   현재 상황:');
    authUsers.users.forEach((user, i) => {
      const hasPublicUser = publicUserIds.has(user.id);
      const hasProfile = profileUserIds.has(user.id);
      console.log(`   ${i+1}. ${user.email} (${user.app_metadata?.provider})`);
      console.log(`      auth.users: ✅ | public.users: ${hasPublicUser ? '✅' : '❌'} | profiles: ${hasProfile ? '✅' : '❌'}`);
    });
    
    console.log('\n=== 4. 근본적 해결 방향 ===');
    console.log('\n🎯 올바른 해결책:');
    console.log('   옵션 1: 단일 테이블 구조 (권장)');
    console.log('   ├── profiles.user_id → auth.users(id) 직접 참조');
    console.log('   ├── Instagram 정보를 profiles에 통합');
    console.log('   └── public.users 테이블 제거');
    console.log('');
    console.log('   옵션 2: 자동 동기화 메커니즘');
    console.log('   ├── Database Trigger/Function으로 auto-sync');
    console.log('   ├── Instagram ID를 선택사항으로 변경');
    console.log('   └── 코드에서 동기화 로직 추가');
    
    console.log('\n❌ 임시방편 (현재 적용된 것):');
    console.log('   ├── 가짜 Instagram ID 생성');
    console.log('   ├── 데이터 무결성 훼손');
    console.log('   └── 향후 버그 발생 위험');
    
  } catch (error) {
    console.error('❌ 분석 중 오류:', error);
  }
}

analyzeRootCause().catch(console.error);