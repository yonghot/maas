import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// 가중치 조회
export async function GET() {
  try {
    const supabase = createClient();
    
    // 활성화된 가중치만 조회
    const { data, error } = await supabase
      .from('scoring_weights')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('가중치 조회 오류:', error);
      return NextResponse.json({ error: '가중치 조회 실패' }, { status: 500 });
    }

    // 가중치를 사용하기 쉬운 형태로 변환
    const weights = {
      male: {},
      female: {
        young: {},
        old: {}
      }
    };

    data?.forEach(row => {
      if (row.gender === 'male') {
        weights.male = row.weights;
      } else if (row.gender === 'female') {
        if (row.evaluator_age_group === 'young') {
          weights.female.young = row.weights;
        } else if (row.evaluator_age_group === 'old') {
          weights.female.old = row.weights;
        }
      }
    });

    return NextResponse.json({ weights }, { status: 200 });
  } catch (err) {
    console.error('가중치 조회 오류:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// 가중치 저장/업데이트
export async function POST(request: Request) {
  try {
    // 관리자 인증 확인
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== 'Bearer admin-maas-2025') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 401 });
    }

    const body = await request.json();
    const { maleWeights, femaleYoungWeights, femaleOldWeights } = body;

    const supabase = createClient();

    // 기존 활성 가중치를 비활성화
    await supabase
      .from('scoring_weights')
      .update({ is_active: false })
      .eq('is_active', true);

    // 새로운 가중치 저장
    const { error: insertError } = await supabase
      .from('scoring_weights')
      .insert([
        {
          gender: 'male',
          evaluator_age_group: null,
          weights: maleWeights,
          is_active: true
        },
        {
          gender: 'female',
          evaluator_age_group: 'young',
          weights: femaleYoungWeights,
          is_active: true
        },
        {
          gender: 'female',
          evaluator_age_group: 'old',
          weights: femaleOldWeights,
          is_active: true
        }
      ]);

    if (insertError) {
      console.error('가중치 저장 오류:', insertError);
      return NextResponse.json({ error: '가중치 저장 실패' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('가중치 저장 오류:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}