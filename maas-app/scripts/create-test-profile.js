const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestProfile() {
  console.log('=== 테스트 프로필 생성 ===\n');
  
  // 기존 사용자 확인
  const userId = 'eb3404af-0fba-4059-881d-6385f6c43c20'; // sk1597530@gmail.com
  
  // 테스트 프로필 데이터
  const profileData = {
    user_id: userId,
    gender: 'male',
    age: 30,
    region: 'seoul',
    total_score: 75,  // INTEGER 타입이므로 정수로
    tier: 'A',
    grade: 'A',
    category_scores: {
      wealth: 8,
      sense: 7,
      physical: 7.5
    },
    evaluation_data: {
      answers: [],
      percentile: 85
    },
    last_evaluated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('프로필 생성 중...');
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileData, {
      onConflict: 'user_id'
    })
    .select()
    .single();
  
  if (error) {
    console.error('프로필 생성 실패:', error);
  } else {
    console.log('✅ 프로필 생성 성공!');
    console.log('생성된 프로필:', data);
  }
  
  console.log('\n=== 완료 ===');
}

createTestProfile().catch(console.error);