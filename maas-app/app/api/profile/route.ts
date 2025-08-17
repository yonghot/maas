import { NextRequest, NextResponse } from 'next/server';
import { createServerActionClient } from '@/lib/supabase/server';

// 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerActionClient();
    
    // 현재 로그인한 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    // 프로필 데이터 조회
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // 프로필이 없는 경우
        return NextResponse.json({ profile: null });
      }
      throw profileError;
    }

    // 사용자 정보도 함께 조회
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('instagram_id, instagram_public')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    return NextResponse.json({
      profile: {
        ...profile,
        ...userData,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: '프로필 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 프로필 생성/업데이트
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerActionClient();
    const body = await request.json();
    
    // 현재 로그인한 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    // 프로필 데이터 준비
    const profileData = {
      user_id: user.id,
      gender: body.gender,
      age: body.age,
      region: body.region,
      tier: body.tier,
      grade: body.grade,
      total_score: body.totalScore,
      category_scores: body.categoryScores,
      evaluation_data: body.evaluationData,
      last_evaluated_at: new Date().toISOString(),
    };

    // 프로필이 이미 있는지 확인
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let profile;
    if (existingProfile) {
      // 업데이트
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      profile = data;
    } else {
      // 새로 생성
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (error) throw error;
      profile = data;
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profile save error:', error);
    return NextResponse.json(
      { error: '프로필 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}