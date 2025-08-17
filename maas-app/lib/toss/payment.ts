import { v4 as uuidv4 } from 'uuid';

export interface PaymentRequest {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  customerEmail: string;
  successUrl: string;
  failUrl: string;
}

export interface PaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export class TossPaymentClient {
  private readonly clientKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
    this.secretKey = process.env.TOSS_SECRET_KEY!;
    this.baseUrl = 'https://api.tosspayments.com/v1';
  }

  // Base64 인코딩된 Secret Key 생성
  private getAuthHeader(): string {
    const encoded = Buffer.from(`${this.secretKey}:`).toString('base64');
    return `Basic ${encoded}`;
  }

  // 결제 승인
  async confirmPayment(data: PaymentConfirmRequest) {
    const response = await fetch(`${this.baseUrl}/payments/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '결제 승인 실패');
    }

    return response.json();
  }

  // 결제 취소
  async cancelPayment(paymentKey: string, cancelReason: string) {
    const response = await fetch(`${this.baseUrl}/payments/${paymentKey}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cancelReason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '결제 취소 실패');
    }

    return response.json();
  }

  // 결제 조회
  async getPayment(paymentKey: string) {
    const response = await fetch(`${this.baseUrl}/payments/${paymentKey}`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '결제 조회 실패');
    }

    return response.json();
  }

  // 주문 ID 생성
  static generateOrderId(prefix: string = 'MAAS'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }
}

// 플랜별 가격 정보
export const PLAN_PRICES = {
  basic: {
    name: '베이직 플랜',
    price: 1900,
    originalPrice: 3800,
    description: '하루 10명 프로필 조회',
    features: [
      '하루 10명 프로필 조회',
      '같은 티어 + 한 단계 위 티어 조회',
      '인스타그램 ID 확인 가능',
      '30일 이용권'
    ]
  },
  premium: {
    name: '프리미엄 플랜',
    price: 3900,
    originalPrice: 7800,
    description: '무제한 프로필 조회',
    features: [
      '무제한 프로필 조회',
      '모든 티어 조회 가능',
      '인스타그램 ID 확인 가능',
      '우선 매칭 알고리즘',
      '30일 이용권'
    ]
  }
};