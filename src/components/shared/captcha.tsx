'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CaptchaProps {
  onValidChange: (isValid: boolean, userAnswer: number, correctAnswer: number) => void;
  locale?: string;
}

// Generate a random captcha question
function generateCaptchaQuestion() {
  const operators: ('+' | '-' | '×')[] = ['+', '-', '×'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let num1: number, num2: number, answer: number;
  
  switch (operator) {
    case '+':
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * 10) + 5;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
      break;
    case '×':
      num1 = Math.floor(Math.random() * 5) + 1;
      num2 = Math.floor(Math.random() * 5) + 1;
      answer = num1 * num2;
      break;
  }

  const question = `${num1} ${operator} ${num2} = ?`;
  return { num1, num2, operator, answer, question };
}

export function Captcha({ onValidChange, locale = 'ar' }: CaptchaProps) {
  // Initialize captcha on first render
  const [captcha, setCaptcha] = useState(() => generateCaptchaQuestion());
  const [userAnswer, setUserAnswer] = useState('');

  const handleRefresh = useCallback(() => {
    const newCaptcha = generateCaptchaQuestion();
    setCaptcha(newCaptcha);
    setUserAnswer('');
    onValidChange(false, 0, newCaptcha.answer);
  }, [onValidChange]);

  // Validate answer when user types
  useEffect(() => {
    if (userAnswer !== '') {
      const parsed = parseInt(userAnswer, 10);
      const isValid = parsed === captcha.answer;
      onValidChange(isValid, parsed, captcha.answer);
    } else {
      onValidChange(false, 0, captcha.answer);
    }
  }, [userAnswer, captcha.answer, onValidChange]);

  // Notify parent of correct answer on mount
  useEffect(() => {
    onValidChange(false, 0, captcha.answer);
  }, []);

  const placeholder = locale === 'ar' 
    ? 'أدخل النتيجة' 
    : locale === 'fr' 
    ? 'Entrez le résultat' 
    : 'Enter the result';

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {locale === 'ar' ? 'تحقق من أنك لست روبوت' : locale === 'fr' ? 'Vérifiez que vous n\'êtes pas un robot' : 'Verify you are not a robot'}
      </Label>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-3 p-3 bg-muted rounded-lg border">
          <span className="text-xl font-bold tracking-wider min-w-[80px] text-center">
            {captcha.question}
          </span>
          <Input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder={placeholder}
            className="w-28"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          title={locale === 'ar' ? 'سؤال جديد' : locale === 'fr' ? 'Nouvelle question' : 'New question'}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      {userAnswer && (
        <p className={`text-xs ${parseInt(userAnswer) === captcha.answer ? 'text-green-600' : 'text-red-500'}`}>
          {parseInt(userAnswer) === captcha.answer
            ? (locale === 'ar' ? '✓ صحيح' : locale === 'fr' ? '✓ Correct' : '✓ Correct')
            : (locale === 'ar' ? '✗ خطأ' : locale === 'fr' ? '✗ Incorrect' : '✗ Incorrect')
          }
        </p>
      )}
    </div>
  );
}

// Hook to use CAPTCHA in forms
export function useCaptcha() {
  const [isValid, setIsValid] = useState(false);
  const [answer, setAnswer] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const handleValidChange = useCallback((valid: boolean, userAns: number, correctAns: number) => {
    setIsValid(valid);
    setAnswer(userAns);
    setCorrectAnswer(correctAns);
  }, []);

  return {
    isValid,
    answer,
    correctAnswer,
    handleValidChange,
  };
}

export default Captcha;
