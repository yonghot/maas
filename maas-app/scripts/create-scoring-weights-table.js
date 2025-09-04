const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 기본 가중치 설정
const DEFAULT_WEIGHTS = {
  male: {
    wealth: 0.6,
    sense: 0.3,
    physical: 0.1
  },
  female: {
    young: {
      age: 0.2,
      appearance: 0.4,
      values: 0.4
    },
    old: {
      age: 0.4,
      appearance: 0.2,
      values: 0.4
    }
  }
};

/**
 * scoring_weights 테이블 생성 및 초기 데이터 삽입
 * 관리자 페이지에서 실시간 가중치 조정을 위한 테이블
 */
async function createScoringWeightsTable() {
  console.log('=== scoring_weights 테이블 생성 시작 ===');
  
  // Service Role Key로 관리자 권한 클라이언트 생성
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인하세요.');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('1. 기존 테이블 확인...');
    
    // 테이블 존재 여부 확인
    const { data: existingData, error: checkError } = await supabase
      .from('scoring_weights')
      .select('*')
      .limit(1);
    
    if (!checkError) {
      console.log('⚠️  scoring_weights 테이블이 이미 존재합니다.');
      console.log('기존 데이터 개수:', existingData?.length || 0);
    }
    
    // 2. 기본 가중치 데이터 삽입/업데이트
    console.log('2. 기본 가중치 데이터 설정...');
    
    const defaultWeightRow = {
      name: 'default',
      weights: DEFAULT_WEIGHTS,
      description: '시스템 기본 가중치 설정',
      is_active: true
    };
    
    // 기존 활성 가중치 비활성화
    await supabase
      .from('scoring_weights')
      .update({ is_active: false })
      .neq('name', 'default');
    
    const { data: insertResult, error: insertError } = await supabase
      .from('scoring_weights')
      .upsert([defaultWeightRow], { onConflict: 'name' })
      .select();
    
    if (insertError) {
      console.log('⚠️  직접 데이터 삽입 실패, 테이블이 없을 수 있음:', insertError.message);
      console.log('📋 Supabase 콘솔에서 수동으로 테이블을 생성해주세요.');
      console.log('\nSQL 명령어:');
      console.log(`
CREATE TABLE public.scoring_weights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  weights JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 비활성화 (관리자만 접근)
ALTER TABLE public.scoring_weights ENABLE ROW LEVEL SECURITY;

-- 인덱스 생성
CREATE INDEX idx_scoring_weights_active ON scoring_weights(is_active);
CREATE INDEX idx_scoring_weights_name ON scoring_weights(name);
      `);
      
      console.log('\n그 후 다음 데이터를 삽입:');
      console.log(JSON.stringify({
        name: 'default',
        weights: DEFAULT_WEIGHTS,
        description: '시스템 기본 가중치 설정',
        is_active: true
      }, null, 2));
      
      return;
    }
    
    console.log('✅ 기본 가중치 데이터 설정 완료:', insertResult?.[0]?.name);
    
    // 3. 테스트 조회
    console.log('3. 설정 확인...');
    const { data: testData, error: testError } = await supabase
      .from('scoring_weights')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (testError) {
      throw new Error(`테스트 조회 실패: ${testError.message}`);
    }
    
    console.log('✅ 가중치 설정 확인 완료:');
    console.log('- 활성 가중치:', testData.name);
    console.log('- 남성 가중치:', testData.weights.male);
    console.log('- 여성 가중치 (35세 미만):', testData.weights.female.young);
    console.log('- 여성 가중치 (35세 이상):', testData.weights.female.old);
    
    console.log('\n=== scoring_weights 테이블 설정 완료 ===');
    console.log('✅ 이제 관리자 페이지에서 가중치 실시간 조정이 가능합니다.');
    
  } catch (error) {
    console.error('❌ scoring_weights 테이블 설정 실패:', error.message);
    
    // 상세 SQL 가이드 제공
    console.log('\n📋 수동 설정이 필요합니다:');
    console.log('1. https://supabase.com/dashboard 로그인');
    console.log('2. 프로젝트 선택 → SQL Editor');
    console.log('3. 아래 SQL 실행:');
    console.log(`
-- scoring_weights 테이블 생성
CREATE TABLE IF NOT EXISTS public.scoring_weights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  weights JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 데이터 삽입
INSERT INTO public.scoring_weights (name, weights, description, is_active)
VALUES (
  'default',
  '${JSON.stringify(DEFAULT_WEIGHTS).replace(/'/g, "''")}'::jsonb,
  '시스템 기본 가중치 설정',
  true
) ON CONFLICT (name) DO UPDATE SET
  weights = EXCLUDED.weights,
  is_active = EXCLUDED.is_active;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_scoring_weights_active ON scoring_weights(is_active);
CREATE INDEX IF NOT EXISTS idx_scoring_weights_name ON scoring_weights(name);
    `);
    
    process.exit(1);
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  require('dotenv').config({ path: '.env.local' });
  createScoringWeightsTable();
}

module.exports = { createScoringWeightsTable };