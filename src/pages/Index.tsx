import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import WelcomeScreen from '@/components/quiz/WelcomeScreen';
import QuestionCard from '@/components/quiz/QuestionCard';
import ResultScreen from '@/components/quiz/ResultScreen';
import ProgressCard from '@/components/quiz/ProgressCard';
import { questions } from '@/components/quiz/questions';
import { playSound } from '@/components/quiz/soundUtils';
import { AttemptLog, GameScreen } from '@/components/quiz/types';

const Index = () => {
  const [screen, setScreen] = useState<GameScreen>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const { toast } = useToast();

  const [totalHints, setTotalHints] = useState(3);
  const [attemptLogs, setAttemptLogs] = useState<AttemptLog[]>([]);
  const [currentAttempts, setCurrentAttempts] = useState<number[]>([]);
  const [usedHintOnCurrent, setUsedHintOnCurrent] = useState(false);
  const [showHintText, setShowHintText] = useState(false);
  const [hasSentResults, setHasSentResults] = useState(false);

  const sendResultsToEmail = async () => {
    if (hasSentResults || attemptLogs.length === 0) return;
    
    setHasSentResults(true);
    const score = attemptLogs.reduce((sum, log) => sum + (log.attempts.length === 1 && !log.usedHint ? 1 : 0), 0);
    const totalAttempts = attemptLogs.reduce((sum, log) => sum + log.attempts.length, 0);
    const hintsUsed = 3 - totalHints;
    
    const resultsText = `
Результаты теста по осциллографам
Имя: ${userName}
Email: ${email || 'не указан'}

Правильных ответов с первой попытки: ${score}/${questions.length}
Всего попыток: ${totalAttempts}
Использовано подсказок: ${hintsUsed}/3

Детальные результаты:
${attemptLogs.map((log, idx) => {
  const q = questions[idx];
  return `
Вопрос ${idx + 1}: ${q.question}
Попытки: ${log.attempts.map(a => q.answers[a]).join(', ')}
Правильный ответ: ${q.answers[log.correctAnswer]}
Подсказка использована: ${log.usedHint ? 'Да' : 'Нет'}
`;
}).join('\n')}
    `.trim();

    try {
      await fetch('https://functions.poehali.dev/516f355c-339d-44bd-8085-2ccd12756ee9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          email: email || 'не указан',
          resultsText
        })
      });
      
      console.log('Результаты отправлены на dina-zyskina@rambler.ru:', resultsText);
    } catch (error) {
      console.error('Ошибка отправки:', error);
    }
  };

  useEffect(() => {
    if (screen === 'result' && !hasSentResults && attemptLogs.length > 0) {
      sendResultsToEmail();
    }
  }, [screen, attemptLogs, hasSentResults]);

  const startGame = () => {
    if (!userName.trim()) {
      toast({
        title: "Введите имя",
        description: "Пожалуйста, введите ваше имя для участия",
        variant: "destructive"
      });
      return;
    }
    setScreen('game');
  };

  const useHint = () => {
    if (totalHints <= 0 || showHintText) return;
    
    setTotalHints(totalHints - 1);
    setUsedHintOnCurrent(true);
    setShowHintText(true);
    
    toast({
      title: "Подсказка",
      description: questions[currentQuestion].hint,
      duration: 8000
    });
  };

  const selectAnswer = (index: number) => {
    if (isAnswered) return;
    playSound('select');
    setSelectedAnswer(index);
  };

  const confirmAnswer = () => {
    if (selectedAnswer === null || isAnswered) return;
    
    setIsAnswered(true);
    const current = questions[currentQuestion];
    const isCorrect = selectedAnswer === current.correct;
    
    const newAttempts = [...currentAttempts, selectedAnswer];
    setCurrentAttempts(newAttempts);
    
    setTimeout(() => {
      if (isCorrect) {
        playSound('correct');
        const log: AttemptLog = {
          questionId: current.id,
          attempts: newAttempts,
          usedHint: usedHintOnCurrent,
          correctAnswer: current.correct
        };
        setAttemptLogs([...attemptLogs, log]);
        
        if (currentQuestion === questions.length - 1) {
          setScreen('result');
        } else {
          setTimeout(() => {
            playSound('next');
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setCurrentAttempts([]);
            setUsedHintOnCurrent(false);
            setShowHintText(false);
          }, 1000);
        }
      } else {
        playSound('wrong');
        toast({
          title: "Неправильно!",
          description: "Попробуй ещё раз. Можешь использовать подсказку.",
          variant: "destructive",
          duration: 3000
        });
        setSelectedAnswer(null);
        setIsAnswered(false);
      }
    }, 2000);
  };

  const restartGame = () => {
    setScreen('welcome');
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setEmail("");
    setTotalHints(3);
    setAttemptLogs([]);
    setCurrentAttempts([]);
    setUsedHintOnCurrent(false);
    setShowHintText(false);
    setHasSentResults(false);
  };

  const handleSendResults = () => {
    toast({
      title: "Результаты отправлены!",
      description: "Твои результаты автоматически отправлены преподавателю"
    });
  };

  if (screen === 'welcome') {
    return (
      <WelcomeScreen 
        userName={userName}
        setUserName={setUserName}
        onStart={startGame}
      />
    );
  }

  if (screen === 'result') {
    return (
      <ResultScreen
        userName={userName}
        attemptLogs={attemptLogs}
        totalHints={totalHints}
        email={email}
        setEmail={setEmail}
        onSendResults={handleSendResults}
        onRestart={restartGame}
        totalQuestions={questions.length}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <QuestionCard
            question={questions[currentQuestion]}
            currentQuestionIndex={currentQuestion}
            totalQuestions={questions.length}
            currentAttempts={currentAttempts}
            totalHints={totalHints}
            showHintText={showHintText}
            selectedAnswer={selectedAnswer}
            isAnswered={isAnswered}
            onSelectAnswer={selectAnswer}
            onConfirmAnswer={confirmAnswer}
            onUseHint={useHint}
          />
          
          <ProgressCard 
            questions={questions}
            currentQuestionIndex={currentQuestion}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
