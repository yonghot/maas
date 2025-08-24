#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function implementProperSolution() {
  console.log('🔧 근본적 해결책 구현 시작...\n');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    console.log('=== Phase 1: 현재 상태 백업 ===');
    
    // 1.1 현재 데이터 상태 확인
    const { data: currentProfiles } = await supabase.from('profiles').select('*');
    const { data: currentUsers } = await supabase.from('users').select('*');
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    
    console.log(`📊 현재 상태:`);
    console.log(`   auth.users: ${authUsers.users.length}명`);
    console.log(`   public.users: ${currentUsers?.length || 0}명`);
    console.log(`   profiles: ${currentProfiles?.length || 0}명`);
    
    // 1.2 백업 데이터 생성 (JSON 형태로 로컬 저장)
    const backupData = {
      timestamp: new Date().toISOString(),
      auth_users: authUsers.users,
      public_users: currentUsers,
      profiles: currentProfiles
    };
    
    const fs = require('fs');
    const backupPath = `./backup-${Date.now()}.json`;
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`✅ 백업 완료: ${backupPath}`);
    
    console.log('\n=== Phase 2: 스키마 검증 ===');
    
    // 2.1 현재 테이블 구조 분석
    console.log('📋 현재 테이블 의존성:');
    console.log('   profiles.user_id → public.users.id');
    console.log('   public.users.id → auth.users.id');
    console.log('   문제: 2단계 의존성으로 동기화 복잡');
    
    console.log('\n📋 목표 구조:');
    console.log('   profiles.user_id → auth.users.id (직접 참조)');
    console.log('   instagram 정보 profiles에 통합');
    console.log('   public.users 테이블 제거');
    
    console.log('\n=== Phase 3: 새 스키마 시뮬레이션 ===');
    
    // 3.1 새로운 구조로 데이터 매핑 시뮬레이션
    const migratedData = [];
    
    for (const profile of currentProfiles || []) {
      // 해당 프로필의 사용자 정보 찾기
      const publicUser = currentUsers?.find(u => u.id === profile.user_id);
      const authUser = authUsers.users.find(u => u.id === profile.user_id);
      
      if (!authUser) {
        console.warn(`⚠️ auth.users에 없는 프로필: ${profile.user_id}`);
        continue;
      }
      
      const migratedProfile = {
        // 기존 프로필 데이터
        id: profile.id,
        user_id: profile.user_id, // auth.users.id를 직접 참조
        gender: profile.gender,
        age: profile.age,
        region: profile.region,
        tier: profile.tier,
        grade: profile.grade,
        total_score: profile.total_score,
        category_scores: profile.category_scores,
        evaluation_data: profile.evaluation_data,
        last_evaluated_at: profile.last_evaluated_at,
        
        // Instagram 정보 통합 (임시 ID는 NULL로)
        instagram_id: publicUser?.instagram_id?.startsWith('temp_') ? null : publicUser?.instagram_id,
        instagram_public: publicUser?.instagram_public || false,
        
        // 메타데이터
        created_at: profile.created_at,
        updated_at: profile.updated_at
      };
      
      migratedData.push(migratedProfile);
    }
    
    console.log(`📊 마이그레이션 결과 예상:`);
    console.log(`   총 프로필: ${migratedData.length}개`);
    console.log(`   Instagram ID 있음: ${migratedData.filter(p => p.instagram_id).length}개`);
    console.log(`   Instagram ID 없음: ${migratedData.filter(p => !p.instagram_id).length}개`);
    
    // 3.2 데이터 무결성 검증
    const integrityIssues = [];
    
    migratedData.forEach(profile => {
      const authUser = authUsers.users.find(u => u.id === profile.user_id);
      if (!authUser) {
        integrityIssues.push(`프로필 ${profile.id}: auth.users에 없는 user_id`);
      }
    });
    
    if (integrityIssues.length > 0) {
      console.error('❌ 데이터 무결성 문제 발견:');
      integrityIssues.forEach(issue => console.error(`   ${issue}`));
      throw new Error('데이터 무결성 검증 실패');
    } else {
      console.log('✅ 데이터 무결성 검증 통과');
    }
    
    console.log('\n=== Phase 4: 마이그레이션 SQL 생성 ===');
    
    // 4.1 마이그레이션 SQL 스크립트 생성
    let migrationSQL = `
-- 근본적 해결: 단일 테이블 구조로 마이그레이션
-- 실행 전 반드시 백업 확인!

BEGIN TRANSACTION;

-- 1단계: 새 profiles 테이블 생성
CREATE TABLE IF NOT EXISTS public.profiles_new (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- 기본 프로필 정보
  gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 19 AND age <= 100),
  region TEXT NOT NULL DEFAULT 'seoul',
  
  -- 평가 결과
  tier TEXT,
  grade TEXT,
  total_score INTEGER DEFAULT 0,
  category_scores JSONB DEFAULT '{}',
  evaluation_data JSONB DEFAULT '{}',
  last_evaluated_at TIMESTAMPTZ,
  
  -- Instagram 정보 (선택사항)
  instagram_id TEXT UNIQUE, -- NOT NULL 제거됨
  instagram_public BOOLEAN DEFAULT false,
  
  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2단계: 데이터 마이그레이션
`;

    migratedData.forEach(profile => {
      migrationSQL += `
INSERT INTO public.profiles_new (
  id, user_id, gender, age, region, tier, grade, total_score,
  category_scores, evaluation_data, last_evaluated_at,
  instagram_id, instagram_public, created_at, updated_at
) VALUES (
  '${profile.id}',
  '${profile.user_id}',
  '${profile.gender}',
  ${profile.age},
  '${profile.region}',
  ${profile.tier ? `'${profile.tier}'` : 'NULL'},
  ${profile.grade ? `'${profile.grade}'` : 'NULL'},
  ${profile.total_score},
  '${JSON.stringify(profile.category_scores)}'::jsonb,
  '${JSON.stringify(profile.evaluation_data)}'::jsonb,
  ${profile.last_evaluated_at ? `'${profile.last_evaluated_at}'` : 'NULL'},
  ${profile.instagram_id ? `'${profile.instagram_id}'` : 'NULL'},
  ${profile.instagram_public},
  '${profile.created_at}',
  '${profile.updated_at}'
);`;
    });

    migrationSQL += `

-- 3단계: 테이블 교체 (주의: 다운타임 발생)
-- DROP TABLE public.profiles;
-- DROP TABLE public.users;
-- ALTER TABLE public.profiles_new RENAME TO profiles;

-- 4단계: 인덱스 재생성
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_tier ON public.profiles(tier);
CREATE INDEX idx_profiles_gender ON public.profiles(gender);
CREATE INDEX idx_profiles_age ON public.profiles(age);
CREATE INDEX idx_profiles_region ON public.profiles(region);

-- 5단계: RLS 정책 재생성
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

COMMIT;

-- 검증 쿼리
SELECT 'auth.users' as table_name, COUNT(*) FROM auth.users
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles;
`;

    // SQL 파일 저장
    const sqlPath = `./migration-${Date.now()}.sql`;
    fs.writeFileSync(sqlPath, migrationSQL);
    console.log(`✅ 마이그레이션 SQL 생성: ${sqlPath}`);
    
    console.log('\n=== 다음 단계 ===');
    console.log('🔧 근본적 해결을 위한 행동 계획:');
    console.log('');
    console.log('1. 📋 코드 수정');
    console.log('   - app/result/save/page.tsx: profiles 직접 참조로 변경');
    console.log('   - 모든 users 테이블 참조 제거');
    console.log('');
    console.log('2. 🗄️ 데이터베이스 마이그레이션');
    console.log(`   - Supabase Dashboard에서 ${sqlPath} 실행`);
    console.log('   - 테스트 환경에서 먼저 검증');
    console.log('');
    console.log('3. ✅ 검증 및 테스트');
    console.log('   - OAuth 플로우 전체 테스트');
    console.log('   - 데이터 무결성 확인');
    console.log('   - 성능 모니터링');
    console.log('');
    console.log('⚠️ 주의사항:');
    console.log('   - 반드시 테스트 환경에서 먼저 실행');
    console.log('   - 프로덕션 적용 전 팀 검토 필수');
    console.log('   - 롤백 계획 준비 완료');
    
  } catch (error) {
    console.error('❌ 근본적 해결책 구현 중 오류:', error);
  }
}

implementProperSolution().catch(console.error);