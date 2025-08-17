import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 48, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 배경 그라데이션 정의 */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      
      {/* 배경 사각형 */}
      <rect width="200" height="200" rx="40" fill="url(#logoGradient)" />
      
      {/* 기어 모양 (공학적 요소) */}
      <g transform="translate(100, 100)">
        {/* 외부 기어 */}
        <path
          d="M 0,-45 L 10,-42 L 8,-38 L 12,-35 L 10,-30 L 15,-27 L 13,-22 L 18,-18 L 16,-13 L 21,-9 L 19,-4 L 24,0 L 19,4 L 21,9 L 16,13 L 18,18 L 13,22 L 15,27 L 10,30 L 12,35 L 8,38 L 10,42 L 0,45 L -10,42 L -8,38 L -12,35 L -10,30 L -15,27 L -13,22 L -18,18 L -16,13 L -21,9 L -19,4 L -24,0 L -19,-4 L -21,-9 L -16,-13 L -18,-18 L -13,-22 L -15,-27 L -10,-30 L -12,-35 L -8,-38 L -10,-42 Z"
          fill="white"
          opacity="0.2"
        />
        
        {/* 중앙 하트 (배우자/사랑 요소) */}
        <g transform="scale(1.5)">
          <path
            d="M 0,8 C -2,0 -8,-2 -8,-6 C -8,-10 -5,-12 -2,-12 C 0,-12 1,-11 2,-10 C 3,-11 4,-12 6,-12 C 9,-12 12,-10 12,-6 C 12,-2 6,0 4,8 L 0,14 Z"
            fill="white"
            opacity="0.95"
          />
          <path
            d="M 0,6 C -1.5,0 -6,-1.5 -6,-4.5 C -6,-7.5 -3.75,-9 -1.5,-9 C 0,-9 0.75,-8.25 1.5,-7.5 C 2.25,-8.25 3,-9 4.5,-9 C 6.75,-9 9,-7.5 9,-4.5 C 9,-1.5 4.5,0 3,6 L 0,10.5 Z"
            fill="url(#heartGradient)"
          />
        </g>
        
        {/* 데이터 포인트 (탐색기 요소) */}
        <circle cx="-35" cy="-35" r="4" fill="white" opacity="0.8" />
        <circle cx="35" cy="-35" r="4" fill="white" opacity="0.8" />
        <circle cx="35" cy="35" r="4" fill="white" opacity="0.8" />
        <circle cx="-35" cy="35" r="4" fill="white" opacity="0.8" />
        
        {/* 연결선 */}
        <line x1="-35" y1="-35" x2="0" y2="-10" stroke="white" strokeWidth="2" opacity="0.4" />
        <line x1="35" y1="-35" x2="0" y2="-10" stroke="white" strokeWidth="2" opacity="0.4" />
        <line x1="35" y1="35" x2="0" y2="10" stroke="white" strokeWidth="2" opacity="0.4" />
        <line x1="-35" y1="35" x2="0" y2="10" stroke="white" strokeWidth="2" opacity="0.4" />
      </g>
      
      {/* 하단 텍스트 (선택적) */}
      <text
        x="100"
        y="170"
        textAnchor="middle"
        fill="white"
        fontSize="16"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        MAAS
      </text>
    </svg>
  );
};

export const LogoWithText: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={48} />
      <div className="flex flex-col">
        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          공학적배우자탐색기
        </span>
        <span className="text-xs text-gray-500">Marriage Attractiveness Assessment System</span>
      </div>
    </div>
  );
};

export default Logo;