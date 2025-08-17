import { NextRequest, NextResponse } from 'next/server';
import { createServerActionClient } from '@/lib/supabase/server';

// 구독 정보 조회
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

    // 구독 정보 조회
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subError && subError.code !== 'PGRST116') {
      throw subError;
    }

    // 구독이 없거나 만료된 경우 무료 플랜으로 처리
    if (!subscription) {
      return NextResponse.json({
        subscription: {
          plan_id: 'free',
          status: 'active',
          expires_at: null,
          features: {
            daily_views: 3,
            tier_access: 'same_or_lower',
            instagram_access: false,
            priority_display: false
          }
        }
      });
    }

    // 만료 체크
    if (subscription.expires_at) {
      const expiresAt = new Date(subscription.expires_at);
      const now = new Date();
      
      if (expiresAt < now) {
        // 만료된 구독 업데이트
        await supabase
          .from('subscriptions')
          .update({ status: 'expired' })
          .eq('id', subscription.id);
        
        return NextResponse.json({
          subscription: {
            plan_id: 'free',
            status: 'expired',
            expires_at: subscription.expires_at,
            features: {
              daily_views: 3,
              tier_access: 'same_or_lower',
              instagram_access: false,
              priority_display: false
            }
          }
        });
      }
    }

    // 플랜별 기능 설정
    const features = {
      free: {
        daily_views: 3,
        tier_access: 'same_or_lower',
        instagram_access: false,
        priority_display: false
      },
      basic: {
        daily_views: 10,
        tier_access: 'all',
        instagram_access: true,
        priority_display: false
      },
      premium: {
        daily_views: 999,
        tier_access: 'all',
        instagram_access: true,
        priority_display: true
      }
    };

    return NextResponse.json({
      subscription: {
        ...subscription,
        features: features[subscription.plan_id as keyof typeof features] || features.free
      }
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: '구독 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 구독 취소
export async function DELETE(request: NextRequest) {
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

    // 활성 구독 찾기
    const { data: subscription, error: findError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (findError || !subscription) {
      return NextResponse.json(
        { error: '활성 구독을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 구독 취소 (상태만 변경, 만료일까지는 이용 가능)
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: '구독이 취소되었습니다. 만료일까지 서비스를 이용하실 수 있습니다.'
    });
  } catch (error) {
    console.error('Subscription cancel error:', error);
    return NextResponse.json(
      { error: '구독 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}