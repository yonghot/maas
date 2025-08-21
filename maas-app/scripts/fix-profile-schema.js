const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixProfileSchema() {
  console.log('=== 프로필 스키마 수정 및 데이터 생성 ===\n');
  
  // 1. public.users 테이블 생성 (auth.users를 참조)
  console.log('1. public.users 테이블 생성 시도...');
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS public.users (
      id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
      instagram_id TEXT,
      instagram_public BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  
  // SQL 실행은 Supabase SDK에서 직접 지원하지 않으므로, 
  // 대신 public.users에 데이터를 직접 삽입해보겠습니다.
  
  const userId = 'eb3404af-0fba-4059-881d-6385f6c43c20';
  
  // 2. public.users에 사용자 추가
  console.log('2. public.users에 사용자 추가 시도...');
  const { data: userData, error: userError } = await supabase
    .from('users')
    .upsert({
      id: userId,
      instagram_id: 'test_user',
      instagram_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    })
    .select()
    .single();
  
  if (userError) {
    console.error('users 테이블 삽입 실패:', userError);
    console.log('\n⚠️ public.users 테이블이 없는 것 같습니다.');
    console.log('Supabase Dashboard에서 직접 SQL을 실행해주세요:');
    console.log('https://supabase.com/dashboard/project/hvpyqchgimnzaotwztuy/sql/new');
    console.log('\n다음 SQL을 실행하세요:');
    console.log('```sql');
    console.log(createUsersTable);
    console.log(`INSERT INTO public.users (id, instagram_id, instagram_public) 
VALUES ('${userId}', 'test_user', true)
ON CONFLICT (id) DO UPDATE SET 
  instagram_id = EXCLUDED.instagram_id,
  instagram_public = EXCLUDED.instagram_public;`);
    console.log('```');
  } else {
    console.log('✅ users 테이블에 사용자 추가 성공!');
    
    // 3. profiles에 프로필 추가
    console.log('\n3. profiles 테이블에 프로필 추가 시도...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        gender: 'male',
        age: 30,
        region: 'seoul',
        total_score: 75,
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
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('프로필 생성 실패:', profileError);
    } else {
      console.log('✅ 프로필 생성 성공!');
      console.log('생성된 프로필:', profileData);
    }
  }
  
  console.log('\n=== 완료 ===');
}

fixProfileSchema().catch(console.error);