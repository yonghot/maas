import { NextRequest, NextResponse } from 'next/server';
import { createServerActionClient } from '@/lib/supabase/server';
import { TossPaymentClient } from '@/lib/toss/payment';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerActionClient();
    const body = await request.json();
    const { paymentKey, orderId, amount } = body;

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    // Toss Payments 결제 승인
    const tossClient = new TossPaymentClient();
    const paymentResult = await tossClient.confirmPayment({
      paymentKey,
      orderId,
      amount,
    });

    // 결제 정보 저장
    const planId = amount === 1900 ? 'basic' : 'premium';
    
    // payments 테이블에 결제 정보 저장
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        order_id: orderId,
        payment_key: paymentKey,
        amount,
        plan_id: planId,
        status: 'completed',
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // 구독 정보 업데이트 또는 생성
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30일 구독

    // 기존 구독 확인
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingSubscription) {
      // 기존 구독 업데이트
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          plan_id: planId,
          expires_at: expiresAt.toISOString(),
          payment_id: payment.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubscription.id);

      if (updateError) throw updateError;
    } else {
      // 새 구독 생성
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: 'active',
          expires_at: expiresAt.toISOString(),
          payment_id: payment.id,
        });

      if (insertError) throw insertError;
    }

    return NextResponse.json({
      success: true,
      payment: paymentResult,
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}