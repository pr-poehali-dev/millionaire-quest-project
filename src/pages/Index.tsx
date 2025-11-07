import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface Question {
  id: number;
  question: string;
  answers: string[];
  correct: number;
  hint?: string;
}

const questions: Question[] = [
  { 
    id: 1, 
    question: "Какую функцию выполняет осциллограф?", 
    answers: ["Измеряет силу тока", "Измеряет форму и параметры сигнала", "Определяет мощность", "Измеряет сопротивление"], 
    correct: 1,
    hint: "Осциллограф визуализирует электрические сигналы во времени"
  },
  { 
    id: 2, 
    question: "Какая функция соответствует элементу 'Регулятор яркости'?", 
    answers: [
      "Изменяет яркость луча",
      "Делает изображение четким", 
      "Удерживает изображение на экране",
      "Формирует временную шкалу"
    ],
    correct: 0,
    hint: "Регулятор яркости управляет интенсивностью электронного луча"
  },
  { 
    id: 3, 
    question: "Какой элемент осциллографа 'Удерживает изображение на экране'?", 
    answers: ["Регулятор яркости", "Фокусировка", "Синхронизация", "Развертка"], 
    correct: 2,
    hint: "Синхронизация стабилизирует и фиксирует изображение сигнала"
  },
  { 
    id: 4, 
    question: "Цифровой осциллограф сохраняет сигнал в памяти.", 
    answers: ["Верно", "Неверно"], 
    correct: 0,
    hint: "Одно из главных преимуществ цифровых моделей — возможность хранения данных"
  },
  { 
    id: 5, 
    question: "Электронно-лучевая трубка используется в цифровых осциллографах.", 
    answers: ["Верно", "Неверно"], 
    correct: 1,
    hint: "Цифровые осциллографы используют LCD или OLED дисплеи"
  },
  { 
    id: 6, 
    question: "В каком режиме осциллограф позволяет измерять несколько сигналов одновременно?", 
    answers: ["XY-режим", "Двухканальный режим", "Синхронный захват", "Автоматический триггер"], 
    correct: 1,
    hint: "Название режима указывает на количество каналов"
  },
  { 
    id: 7, 
    question: "Выбери правильную цепочку прохождения сигнала внутри осциллографа:", 
    answers: [
      "Усилитель Y → ЭЛТ → Развертка", 
      "Вход → Усилитель Y → Электронно-лучевая трубка", 
      "Развертка → Вход → Синхронизация", 
      "Блок питания → Усилитель X"
    ], 
    correct: 1,
    hint: "Сигнал сначала входит, затем усиливается, потом отображается"
  },
  { 
    id: 8, 
    question: "Цифровой осциллограф позволяет измерять частоту автоматически.", 
    answers: ["Верно", "Неверно"], 
    correct: 0,
    hint: "Встроенные процессоры цифровых осциллографов делают автоматические расчёты"
  },
  { 
    id: 9, 
    question: "Если осциллограф показывает 3 деления по вертикали при калибровке 0,2 В/дел, чему равна амплитуда сигнала?", 
    answers: ["0,3 В", "0,6 В", "1,5 В", "2 В"], 
    correct: 1,
    hint: "Умножь количество делений на калибровку: 3 × 0,2 В"
  },
  { 
    id: 10, 
    question: "Перед тобой осциллограмма: синусоида стала \"сплющенной\" сверху. Какое явление ты наблюдаешь?", 
    answers: ["Интерференция", "Клиппинг (ограничение сигнала)", "Уменьшение частоты", "Ошибка синхронизации"], 
    correct: 1,
    hint: "Это происходит, когда сигнал превышает допустимый диапазон усилителя"
  },
  { 
    id: 11, 
    question: "Что произойдёт, если поменять местами каналы X и Y при подаче двух сигналов одинаковой частоты, но сдвинутых по фазе на 90°?", 
    answers: ["На экране появится диагональ", "Появится окружность", "Появится синусоида", "Сигнал исчезнет"], 
    correct: 1,
    hint: "Два синусоидальных сигнала со сдвигом 90° образуют фигуру Лиссажу в виде круга"
  }
];

interface AttemptLog {
  questionId: number;
  attempts: number[];
  usedHint: boolean;
  correctAnswer: number;
}

type GameScreen = 'welcome' | 'game' | 'result';

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

  const playSound = (type: 'select' | 'correct' | 'wrong' | 'next') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'select') {
      oscillator.frequency.value = 400;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'correct') {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } else if (type === 'wrong') {
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === 'next') {
      oscillator.frequency.value = 600;
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  };

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

  if (screen === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
        <Card className="w-full max-w-2xl p-8 md:p-12 bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] border-2 border-yellow-500/30 shadow-2xl animate-fade-in">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <div className="flex justify-center mb-4">
                <Icon name="Activity" size={80} className="text-yellow-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                КВИЗ ПО ОСЦИЛЛОГРАФАМ
              </h1>
              <h2 className="text-2xl md:text-3xl font-bold text-yellow-400">
                Электронный осциллограф
              </h2>
            </div>
            
            <p className="text-gray-300 text-lg md:text-xl max-w-xl mx-auto">
              Проверь свои знания об электронных осциллографах! 11 вопросов от простых к сложным. У тебя есть 3 подсказки на всю игру.
            </p>

            <div className="space-y-4 max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Введите ваше имя"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="text-lg bg-[#0a0e27] border-yellow-500/50 text-white placeholder:text-gray-500"
              />
              
              <Button
                onClick={startGame}
                size="lg"
                className="w-full text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 animate-pulse-gold"
              >
                <Icon name="Play" className="mr-2" size={24} />
                НАЧАТЬ ТЕСТ
              </Button>
            </div>

            <div className="flex justify-center gap-8 pt-6 text-yellow-400/80">
              <div className="text-center">
                <Icon name="CircleHelp" size={32} className="mx-auto mb-2" />
                <p className="text-sm">11 вопросов</p>
              </div>
              <div className="text-center">
                <Icon name="Lightbulb" size={32} className="mx-auto mb-2" />
                <p className="text-sm">3 подсказки</p>
              </div>
              <div className="text-center">
                <Icon name="TrendingUp" size={32} className="mx-auto mb-2" />
                <p className="text-sm">Растущая сложность</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (screen === 'result') {
    const score = attemptLogs.reduce((sum, log) => sum + (log.attempts.length === 1 && !log.usedHint ? 1 : 0), 0);
    const totalAttempts = attemptLogs.reduce((sum, log) => sum + log.attempts.length, 0);
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
        <Card className="w-full max-w-2xl p-8 md:p-12 bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] border-2 border-yellow-500/30 shadow-2xl animate-fade-in">
          <div className="text-center space-y-6">
            <Icon name="Trophy" size={80} className="mx-auto text-yellow-400" />
            
            <h2 className="text-3xl md:text-5xl font-bold text-yellow-400">
              Тест завершён, {userName}!
            </h2>
            
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/50">
                <p className="text-gray-300 text-xl mb-2">Правильно с первой попытки:</p>
                <p className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  {score} / {questions.length}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#0a0e27] rounded-lg border border-yellow-500/30">
                  <p className="text-gray-400 text-sm">Всего попыток</p>
                  <p className="text-2xl font-bold text-yellow-400">{totalAttempts}</p>
                </div>
                <div className="p-4 bg-[#0a0e27] rounded-lg border border-yellow-500/30">
                  <p className="text-gray-400 text-sm">Использовано подсказок</p>
                  <p className="text-2xl font-bold text-yellow-400">{3 - totalHints} / 3</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <p className="text-gray-300">Результаты будут отправлены на email преподавателя</p>
              <Input
                type="email"
                placeholder="Введите ваш email (опционально)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0a0e27] border-yellow-500/50 text-white placeholder:text-gray-500"
              />
              <Button
                onClick={() => {
                  toast({
                    title: "Результаты отправлены!",
                    description: "Твои результаты автоматически отправлены преподавателю"
                  });
                }}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
              >
                <Icon name="Send" className="mr-2" size={20} />
                Результаты отправлены ✓
              </Button>
            </div>

            <Button
              onClick={restartGame}
              variant="outline"
              className="w-full max-w-md border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
            >
              <Icon name="RotateCcw" className="mr-2" size={20} />
              Пройти заново
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const current = questions[currentQuestion];
  const isCorrect = isAnswered && selectedAnswer === current.correct;
  const isWrong = isAnswered && selectedAnswer !== null && selectedAnswer !== current.correct;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] border-2 border-yellow-500/30 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-xl">
                  {currentQuestion + 1}
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Вопрос {currentQuestion + 1} из {questions.length}</p>
                  {currentAttempts.length > 0 && (
                    <p className="text-orange-400 text-sm">Попыток: {currentAttempts.length + 1}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Подсказок осталось</p>
                  <p className="text-yellow-400 font-bold text-xl">{totalHints}</p>
                </div>
                <Button
                  onClick={useHint}
                  disabled={totalHints === 0 || showHintText}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:bg-gray-700"
                >
                  <Icon name="Lightbulb" className="mr-2" size={20} />
                  Подсказка
                </Button>
              </div>
            </div>

            {showHintText && (
              <div className="mb-6 p-4 bg-blue-600/20 border border-blue-500/50 rounded-lg animate-fade-in">
                <div className="flex items-start gap-3">
                  <Icon name="Lightbulb" className="text-blue-400 flex-shrink-0 mt-1" size={24} />
                  <p className="text-blue-200">{current.hint}</p>
                </div>
              </div>
            )}

            <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-relaxed">
              {current.question}
            </h3>

            <div className="grid gap-4">
              {current.answers.map((answer, index) => {
                const isSelected = selectedAnswer === index;
                const showCorrect = isAnswered && index === current.correct;
                const showWrong = isAnswered && isSelected && index !== current.correct;
                
                return (
                  <Button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    disabled={isAnswered}
                    className={`h-auto py-6 px-6 text-lg font-semibold transition-all duration-300 ${
                      showCorrect
                        ? 'bg-green-600 hover:bg-green-600 border-green-400 text-white animate-pulse-gold'
                        : showWrong
                        ? 'bg-red-600 hover:bg-red-600 border-red-400 text-white'
                        : isSelected
                        ? 'bg-yellow-500 hover:bg-yellow-500 text-black border-yellow-400'
                        : 'bg-[#0a0e27] hover:bg-yellow-500/20 border-yellow-500/50 text-white'
                    } border-2`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold flex-shrink-0">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-left flex-1">{answer}</span>
                      {showCorrect && <Icon name="Check" size={24} />}
                      {showWrong && <Icon name="X" size={24} />}
                    </div>
                  </Button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                onClick={confirmAnswer}
                disabled={selectedAnswer === null || isAnswered}
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-xl px-12 disabled:opacity-50"
              >
                Ответить
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] border-2 border-yellow-500/30">
            <h4 className="text-yellow-400 font-bold mb-4 flex items-center gap-2">
              <Icon name="ListChecks" size={24} />
              Прогресс
            </h4>
            <div className="flex gap-2 flex-wrap">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    index < currentQuestion
                      ? 'bg-green-600 text-white'
                      : index === currentQuestion
                      ? 'bg-yellow-400 text-black animate-pulse-gold'
                      : 'bg-[#0a0e27] text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;