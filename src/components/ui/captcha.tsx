'use client';

import { useState, useEffect, useCallback } from 'react';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  locale?: 'ar' | 'fr' | 'en';
}

interface CaptchaQuestion {
  num1: number;
  num2: number;
  operator: '+' | '-' | '*';
  answer: number;
}

export function SimpleCaptcha({ onVerify, locale = 'ar' }: CaptchaProps) {
  const [question, setQuestion] = useState<CaptchaQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const generateQuestion = useCallback(() => {
    const operators: ('+' | '-' | '*')[] = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let num1: number;
    let num2: number;
    
    // Keep numbers simple for mental math
    if (operator === '*') {
      num1 = Math.floor(Math.random() * 10) + 1; // 1-10
      num2 = Math.floor(Math.random() * 10) + 1; // 1-10
    } else if (operator === '-') {
      num1 = Math.floor(Math.random() * 50) + 10; // 10-59
      num2 = Math.floor(Math.random() * num1); // Ensure positive result
    } else {
      num1 = Math.floor(Math.random() * 50) + 10; // 10-59
      num2 = Math.floor(Math.random() * 40) + 1; // 1-40
    }

    let answer: number;
    switch (operator) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        answer = num1 - num2;
        break;
      case '*':
        answer = num1 * num2;
        break;
    }

    return { num1, num2, operator, answer };
  }, []);

  useEffect(() => {
    setQuestion(generateQuestion());
  }, [generateQuestion]);

  const handleSubmit = () => {
    if (!question) return;

    const userNum = parseInt(userAnswer, 10);
    
    if (isNaN(userNum)) {
      setError(
        locale === 'ar' 
          ? 'يرجى إدخال رقم صحيح' 
          : locale === 'fr' 
            ? 'Veuillez entrer un nombre valide' 
            : 'Please enter a valid number'
      );
      return;
    }

    if (userNum === question.answer) {
      setVerified(true);
      setError(null);
      onVerify(true);
    } else {
      setError(
        locale === 'ar' 
          ? 'الإجابة غير صحيحة، حاول مرة أخرى' 
          : locale === 'fr' 
            ? 'Réponse incorrecte, réessayez' 
            : 'Incorrect answer, please try again'
      );
      setUserAnswer('');
      setQuestion(generateQuestion());
      onVerify(false);
    }
  };

  const handleRefresh = () => {
    setQuestion(generateQuestion());
    setUserAnswer('');
    setError(null);
    setVerified(false);
    onVerify(false);
  };

  if (!question) return null;

  const labels = {
    question: locale === 'ar' ? 'كم يساوي' : locale === 'fr' ? 'Combien fait' : 'What is',
    verify: locale === 'ar' ? 'تحقق' : locale === 'fr' ? 'Vérifier' : 'Verify',
    verified: locale === 'ar' ? 'تم التحقق ✓' : locale === 'fr' ? 'Vérifié ✓' : 'Verified ✓',
    newQuestion: locale === 'ar' ? 'سؤال جديد' : locale === 'fr' ? 'Nouvelle question' : 'New question',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
        <span className="text-lg font-medium">
          {labels.question}: <span className="text-primary font-bold">{question.num1} {question.operator} {question.num2} = ?</span>
        </span>
        <button
          type="button"
          onClick={handleRefresh}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title={labels.newQuestion}
        >
          🔄
        </button>
      </div>

      {verified ? (
        <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
          <span className="font-medium">{labels.verified}</span>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="?"
            className="flex-1 px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent text-center text-lg font-medium"
            autoFocus
          />
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            {labels.verify}
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
