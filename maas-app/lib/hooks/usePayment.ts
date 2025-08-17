'use client';

import { useEffect, useState } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';

export function usePayment() {
  const [tossPayments, setTossPayments] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initTossPayments = async () => {
      try {
        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
        const payments = await loadTossPayments(clientKey);
        setTossPayments(payments);
      } catch (error) {
        console.error('Failed to initialize Toss Payments:', error);
      } finally {
        setLoading(false);
      }
    };

    initTossPayments();
  }, []);

  const requestPayment = async (
    planId: string,
    planName: string,
    amount: number
  ) => {
    if (!tossPayments) {
      throw new Error('Toss Payments가 초기화되지 않았습니다.');
    }

    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      await tossPayments.requestPayment('카드', {
        amount,
        orderId,
        orderName: `공학적배우자탐색기 ${planName}`,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: '', // 사용자 이메일 (로그인 구현 후 추가)
        customerName: '', // 사용자 이름 (로그인 구현 후 추가)
      });
    } catch (error) {
      console.error('Payment request failed:', error);
      throw error;
    }
  };

  return {
    tossPayments,
    loading,
    requestPayment,
  };
}