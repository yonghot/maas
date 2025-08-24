#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function fixSchemaIssue() {
  console.log('🔧 데이터베이스 스키마 문제 해결 시작...\n');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // 1. 현재 auth.users 사용자들 확인
    console.log('1️⃣ auth.users 사용자들 확인...');
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    console.log(`✅ auth.users에 ${authUsers.users.length}명 존재`);
    
    // 2. public.users 테이블 확인
    console.log('\n2️⃣ public.users 테이블 확인...');
    const { data: publicUsers, error: publicUsersError } = await supabase
      .from('users')
      .select('*');
      
    if (publicUsersError) {
      console.log('❌ public.users 테이블 접근 실패:', publicUsersError.message);
      
      // public.users 테이블 생성 필요
      console.log('\n3️⃣ public.users 테이블 생성...');
      
      // auth.users의 사용자들을 public.users에 복사
      for (const user of authUsers.users) {
        console.log(`   📝 사용자 복사: ${user.email} (${user.id})`);
        
        const { error: insertError } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            instagram_id: null, // 기본값
            instagram_public: false,
            created_at: user.created_at,
            updated_at: user.updated_at || user.created_at
          });
          
        if (insertError) {
          console.error(`   ❌ ${user.email} 복사 실패:`, insertError.message);
        } else {
          console.log(`   ✅ ${user.email} 복사 성공`);
        }
      }
    } else {
      console.log(`✅ public.users 테이블 존재, ${publicUsers.length}개 레코드`);
      
      // auth.users와 public.users 동기화 확인
      console.log('\n3️⃣ auth.users와 public.users 동기화 확인...');
      const publicUserIds = new Set(publicUsers.map(u => u.id));
      
      for (const user of authUsers.users) {
        if (!publicUserIds.has(user.id)) {
          console.log(`   📝 누락된 사용자 추가: ${user.email}`);
          
          const { error: insertError } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              instagram_id: null,
              instagram_public: false,
              created_at: user.created_at,
              updated_at: user.updated_at || user.created_at
            });
            
          if (insertError) {
            console.error(`   ❌ ${user.email} 추가 실패:`, insertError.message);
          } else {
            console.log(`   ✅ ${user.email} 추가 성공`);
          }
        } else {
          console.log(`   ✅ ${user.email} 이미 동기화됨`);
        }
      }
    }
    
    // 4. profiles 테이블에 누락된 프로필 생성 시도
    console.log('\n4️⃣ 누락된 프로필 생성 시도...');
    
    for (const user of authUsers.users) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (profileError && profileError.code === 'PGRST116') {
        // 프로필이 없음 - 생성 시도
        console.log(`   📝 프로필 생성 시도: ${user.email}`);
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            gender: 'male', // 기본값
            age: 25,
            region: 'seoul',
            total_score: 0,
            tier: 'F',
            grade: 'F',
            evaluation_data: {},
            category_scores: {},
            instagram_id: null,
            instagram_public: true,
            created_at: user.created_at,
            updated_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error(`   ❌ ${user.email} 프로필 생성 실패:`, insertError.message);
        } else {
          console.log(`   ✅ ${user.email} 프로필 생성 성공`);
        }
      } else if (profile) {
        console.log(`   ✅ ${user.email} 프로필 이미 존재`);
      } else {
        console.error(`   ❌ ${user.email} 프로필 조회 오류:`, profileError?.message);
      }
    }
    
    console.log('\n✅ 스키마 문제 해결 완료!');
    
  } catch (error) {
    console.error('❌ 스키마 수정 중 오류:', error);
  }
}

fixSchemaIssue().catch(console.error);