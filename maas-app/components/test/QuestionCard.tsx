'use client';

import { useState, useEffect } from 'react';
import { Question, QuestionOption, UserAnswer } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

interface QuestionCardProps {
  question: Question;
  answer?: UserAnswer;
  onAnswerChange: (questionId: string, value: string | number) => void;
}

export function QuestionCard({ question, answer, onAnswerChange }: QuestionCardProps) {
  const [localValue, setLocalValue] = useState<string | number>('');

  // 답변 값 초기화
  useEffect(() => {
    if (answer) {
      setLocalValue(answer.value);
    } else {
      // 질문 타입별 기본값 설정
      switch (question.type) {
        case 'slider':
          setLocalValue(question.min || 0);
          break;
        case 'number':
          setLocalValue('');
          break;
        case 'select':
          setLocalValue('');
          break;
        default:
          setLocalValue('');
      }
    }
  }, [question.id, answer]);

  // 값 변경 처리
  const handleValueChange = (newValue: string | number) => {
    setLocalValue(newValue);
    onAnswerChange(question.id, newValue);
  };

  // Select 타입 질문 렌더링
  const renderSelectQuestion = () => {
    if (!question.options) return null;

    return (
      <RadioGroup
        value={localValue.toString()}
        onValueChange={(value) => {
          const option = question.options?.find(opt => opt.value.toString() === value);
          if (option) {
            handleValueChange(option.value);
          }
        }}
        className="space-y-3"
      >
        {question.options.map((option: QuestionOption) => (
          <div key={option.value.toString()} className="flex items-center space-x-3">
            <RadioGroupItem
              value={option.value.toString()}
              id={`${question.id}-${option.value}`}
            />
            <Label
              htmlFor={`${question.id}-${option.value}`}
              className="flex-1 cursor-pointer text-sm leading-relaxed"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    );
  };

  // Slider 타입 질문 렌더링
  const renderSliderQuestion = () => {
    const min = question.min || 0;
    const max = question.max || 100;
    const step = question.step || 1;
    const currentValue = typeof localValue === 'number' ? localValue : min;

    return (
      <div className="space-y-4">
        {/* 슬라이더 */}
        <div className="px-3">
          <Slider
            value={[currentValue]}
            onValueChange={(values) => handleValueChange(values[0])}
            min={min}
            max={max}
            step={step}
            className="w-full"
          />
        </div>

        {/* 현재 값 표시 */}
        <div className="text-center">
          <span className="text-lg font-semibold text-primary">
            {currentValue}
          </span>
          {question.labels && question.labels[currentValue] && (
            <p className="text-sm text-gray-600 mt-1">
              {question.labels[currentValue]}
            </p>
          )}
        </div>

        {/* 라벨 범위 표시 */}
        {question.labels && (
          <div className="flex justify-between text-xs text-gray-500 px-1">
            <span>{question.labels[min] || min}</span>
            <span>{question.labels[max] || max}</span>
          </div>
        )}
      </div>
    );
  };

  // Number 타입 질문 렌더링
  const renderNumberQuestion = () => {
    return (
      <div className="space-y-3">
        <Input
          type="number"
          value={localValue}
          onChange={(e) => {
            const value = e.target.value;
            setLocalValue(value);
            if (value && !isNaN(Number(value))) {
              handleValueChange(Number(value));
            }
          }}
          min={question.min}
          max={question.max}
          placeholder={`${question.min || 0} ~ ${question.max || 100} 사이의 값을 입력하세요`}
          className="text-center text-lg"
        />
        
        {question.min !== undefined && question.max !== undefined && (
          <p className="text-xs text-gray-500 text-center">
            입력 범위: {question.min} ~ {question.max}
          </p>
        )}
      </div>
    );
  };

  // BMI Calculator 타입 질문 렌더링 (미래 확장용)
  const renderBMICalculator = () => {
    return (
      <div className="space-y-4">
        <p className="text-center text-gray-600">
          BMI 계산기 기능은 곧 추가될 예정입니다.
        </p>
      </div>
    );
  };

  // 질문 타입별 컴포넌트 선택
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'select':
        return renderSelectQuestion();
      case 'slider':
        return renderSliderQuestion();
      case 'number':
        return renderNumberQuestion();
      case 'bmi-calculator':
        return renderBMICalculator();
      default:
        return (
          <p className="text-center text-gray-500">
            지원하지 않는 질문 타입입니다.
          </p>
        );
    }
  };

  return (
    <Card className="w-full shadow-2xl border-0 backdrop-blur-lg bg-white/90">
      <CardHeader className="pb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-purple-700 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1.5 rounded-full">
              {question.category}
            </span>
            {question.required && (
              <span className="text-xs font-medium text-red-600 bg-red-100 px-3 py-1.5 rounded-full">
                필수
              </span>
            )}
          </div>
          
          <CardTitle className="text-xl leading-relaxed text-gray-800">
            {question.text}
          </CardTitle>
          
          {question.subText && (
            <CardDescription className="text-sm text-gray-600">
              {question.subText}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {renderQuestionContent()}
        
        {/* 답변 상태 표시 */}
        {answer && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-700 font-medium">
              ✓ 답변 완료: {typeof answer.value === 'number' ? answer.value : `"${answer.value}"`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}