import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { DEFAULT_WEIGHTS } from '@/lib/scoring/calculator';

// 가중치 조회
export async function GET() {
  try {
    const supabase = createClient();
    
    // 활성화된 가중치 조회 (새로운 스키마 구조)
    const { data, error } = await supabase
      .from('scoring_weights')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('가중치 조회 오류:', error);
      return NextResponse.json({ error: '가중치 조회 실패' }, { status: 500 });
    }

    // 데이터가 있으면 해당 가중치 반환
    if (data && data.weights) {
      return NextResponse.json({ weights: data.weights }, { status: 200 });
    }

    // 데이터가 없으면 오류 반환
    return NextResponse.json({ error: '활성 가중치가 없습니다' }, { status: 404 });
    
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
    const { weights } = body;

    // 가중치 데이터 검증
    if (!weights || !weights.male || !weights.female) {
      return NextResponse.json({ error: '잘못된 가중치 데이터입니다' }, { status: 400 });
    }

    const supabase = createClient();

    // 새로운 스키마에 맞는 가중치 저장
    const { error: upsertError } = await supabase
      .from('scoring_weights')
      .upsert([{
        name: 'admin_updated',
        weights: weights,
        description: `관리자 업데이트 (${new Date().toISOString()})`,
        is_active: true
      }], { 
        onConflict: 'name' 
      });

    if (upsertError) {
      console.error('가중치 저장 오류:', upsertError);
      return NextResponse.json({ 
        error: '가중치 저장 실패 - 테이블이 존재하지 않을 수 있습니다',
        details: upsertError.message 
      }, { status: 500 });
    }

    // 기존 'default' 가중치 비활성화
    await supabase
      .from('scoring_weights')
      .update({ is_active: false })
      .eq('name', 'default');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('가중치 저장 오류:', err);
    return NextResponse.json({ 
      error: '서버 오류',
      message: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}