const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabase() {
  console.log('=== 데이터베이스 확인 시작 ===\n');
  
  // 1. auth.users 테이블 확인
  console.log('1. 인증된 사용자 목록:');
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('사용자 조회 오류:', usersError);
  } else {
    console.log(`총 ${users.users.length}명의 사용자가 있습니다.`);
    users.users.forEach(user => {
      console.log(`- ID: ${user.id}`);
      console.log(`  Email: ${user.email || '없음'}`);
      console.log(`  Provider: ${user.app_metadata?.provider || '알 수 없음'}`);
      console.log(`  생성일: ${user.created_at}`);
      console.log('');
    });
  }
  
  // 2. profiles 테이블 확인
  console.log('\n2. 프로필 테이블 데이터:');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (profilesError) {
    console.error('프로필 조회 오류:', profilesError);
  } else {
    console.log(`총 ${profiles.length}개의 프로필이 있습니다.`);
    profiles.forEach(profile => {
      console.log(`- User ID: ${profile.user_id}`);
      console.log(`  Instagram: ${profile.instagram_id || '없음'}`);
      console.log(`  Gender: ${profile.gender}`);
      console.log(`  Score: ${profile.total_score}`);
      console.log(`  생성일: ${profile.created_at}`);
      console.log('');
    });
  }
  
  // 3. 테이블 스키마 확인
  console.log('\n3. 사용 가능한 테이블 목록:');
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');
  
  if (tablesError) {
    // 다른 방법으로 시도
    console.log('테이블 목록 조회 실패, profiles 테이블 직접 확인...');
    const { error: testError } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1);
    
    if (!testError) {
      console.log('✅ profiles 테이블 존재 확인');
    } else {
      console.log('❌ profiles 테이블 접근 불가:', testError.message);
    }
  } else {
    console.log('Public 스키마의 테이블들:');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
  }
  
  console.log('\n=== 확인 완료 ===');
}

checkDatabase().catch(console.error);