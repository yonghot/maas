'use client';

import { useEffect, useRef } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';

interface TossPaymentProps {
  clientKey: string;
  customerKey: string;
  price: number;
  orderName: string;
  orderId: string;
  successUrl: string;
  failUrl: string;
}

export default function TossPayment({
  clientKey,
  customerKey,
  price,
  orderName,
  orderId,
  successUrl,
  failUrl
}: TossPaymentProps) {
  const paymentMethodsRef = useRef<HTMLDivElement>(null);
  const agreementRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<any>(null);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        
        // 결제 위젯 초기화
        const payment = tossPayments.payment({
          customerKey,
        });

        // 결제 UI 렌더링
        await payment.requestPayment({
          method: 'CARD', // 카드 결제
          amount: {
            currency: 'KRW',
            value: price,
          },
          orderId,
          orderName,
          successUrl,
          failUrl,
          card: {
            useEscrow: false,
            flowMode: 'DEFAULT',
            useCardPoint: false,
            useAppCardOnly: false,
          },
        });

        paymentRef.current = payment;
      } catch (error) {
        console.error('Payment initialization error:', error);
      }
    };

    initializePayment();
  }, [clientKey, customerKey, price, orderName, orderId, successUrl, failUrl]);

  return (
    <div className="space-y-4">
      <div id="payment-method" ref={paymentMethodsRef} />
      <div id="agreement" ref={agreementRef} />
    </div>
  );
}