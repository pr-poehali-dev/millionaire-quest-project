import { useState } from 'react';
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
  prize: string;
}

const questions: Question[] = [
  { id: 1, question: "Какой город является столицей России?", answers: ["Москва", "Санкт-Петербург", "Казань", "Новосибирск"], correct: 0, prize: "500 ₽" },
  { id: 2, question: "Сколько планет в Солнечной системе?", answers: ["7", "8", "9", "10"], correct: 1, prize: "1 000 ₽" },
  { id: 3, question: "Кто написал роман 'Война и мир'?", answers: ["Достоевский", "Пушкин", "Толстой", "Чехов"], correct: 2, prize: "2 000 ₽" },
  { id: 4, question: "В каком году началась Вторая мировая война?", answers: ["1939", "1941", "1945", "1937"], correct: 0, prize: "3 000 ₽" },
  { id: 5, question: "Какой элемент имеет химический символ 'O'?", answers: ["Золото", "Кислород", "Водород", "Железо"], correct: 1, prize: "5 000 ₽" },
  { id: 6, question: "Какая самая большая пустыня в мире?", answers: ["Сахара", "Гоби", "Антарктида", "Атакама"], correct: 2, prize: "10 000 ₽" },
  { id: 7, question: "Кто изобрел телефон?", answers: ["Эдисон", "Белл", "Тесла", "Маркони"], correct: 1, prize: "15 000 ₽" },
  { id: 8, question: "Какая планета самая большая в Солнечной системе?", answers: ["Марс", "Сатурн", "Юпитер", "Нептун"], correct: 2, prize: "25 000 ₽" },
  { id: 9, question: "Сколько костей в теле взрослого человека?", answers: ["186", "206", "226", "246"], correct: 1, prize: "50 000 ₽" },
  { id: 10, question: "В каком году был основан Google?", answers: ["1996", "1998", "2000", "2002"], correct: 1, prize: "100 000 ₽" },
  { id: 11, question: "Какой океан самый большой?", answers: ["Атлантический", "Индийский", "Тихий", "Северный Ледовитый"], correct: 2, prize: "200 000 ₽" },
  { id: 12, question: "Кто написал 'Мастер и Маргарита'?", answers: ["Булгаков", "Пастернак", "Набоков", "Замятин"], correct: 0, prize: "400 000 ₽" },
  { id: 13, question: "Какая страна подарила США Статую Свободы?", answers: ["Великобритания", "Франция", "Испания", "Италия"], correct: 1, prize: "800 000 ₽" },
  { id: 14, question: "Сколько струн у классической гитары?", answers: ["4", "5", "6", "7"], correct: 2, prize: "1 500 000 ₽" },
  { id: 15, question: "В каком году человек впервые высадился на Луну?", answers: ["1965", "1967", "1969", "1971"], correct: 2, prize: "3 000 000 ₽" }
];

const prizeList = [
  "500 ₽", "1 000 ₽", "2 000 ₽", "3 000 ₽", "5 000 ₽",
  "10 000 ₽", "15 000 ₽", "25 000 ₽", "50 000 ₽", "100 000 ₽",
  "200 000 ₽", "400 000 ₽", "800 000 ₽", "1 500 000 ₽", "3 000 000 ₽"
];

type GameScreen = 'welcome' | 'game' | 'result';

const Index = () => {
  const [screen, setScreen] = useState<GameScreen>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [wonPrize, setWonPrize] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const { toast } = useToast();

  const [lifelines, setLifelines] = useState({
    fifty: true,
    phone: true,
    audience: true
  });

  const [eliminatedAnswers, setEliminatedAnswers] = useState<number[]>([]);

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

  const useFiftyFifty = () => {
    if (!lifelines.fifty || isAnswered) return;
    
    const current = questions[currentQuestion];
    const wrongAnswers = [0, 1, 2, 3].filter(i => i !== current.correct);
    const toEliminate = wrongAnswers.slice(0, 2);
    
    setEliminatedAnswers(toEliminate);
    setLifelines({ ...lifelines, fifty: false });
    
    toast({
      title: "50/50 использована",
      description: "Два неправильных ответа убраны"
    });
  };

  const usePhoneFriend = () => {
    if (!lifelines.phone || isAnswered) return;
    
    const current = questions[currentQuestion];
    const friendConfidence = Math.random() > 0.3 ? current.correct : Math.floor(Math.random() * 4);
    
    setLifelines({ ...lifelines, phone: false });
    
    toast({
      title: "Звонок другу",
      description: `Друг считает, что правильный ответ: ${current.answers[friendConfidence]}`,
      duration: 5000
    });
  };

  const useAudienceHelp = () => {
    if (!lifelines.audience || isAnswered) return;
    
    const current = questions[currentQuestion];
    const percentages = [0, 0, 0, 0];
    percentages[current.correct] = 50 + Math.floor(Math.random() * 30);
    
    let remaining = 100 - percentages[current.correct];
    for (let i = 0; i < 4; i++) {
      if (i !== current.correct) {
        const share = i === 3 ? remaining : Math.floor(Math.random() * remaining);
        percentages[i] = share;
        remaining -= share;
      }
    }
    
    setLifelines({ ...lifelines, audience: false });
    
    toast({
      title: "Помощь зала",
      description: current.answers.map((ans, idx) => `${ans}: ${percentages[idx]}%`).join('\n'),
      duration: 7000
    });
  };

  const selectAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
  };

  const confirmAnswer = () => {
    if (selectedAnswer === null || isAnswered) return;
    
    setIsAnswered(true);
    const current = questions[currentQuestion];
    const isCorrect = selectedAnswer === current.correct;
    
    setTimeout(() => {
      if (isCorrect) {
        if (currentQuestion === questions.length - 1) {
          setWonPrize(current.prize);
          setScreen('result');
        } else {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
          setIsAnswered(false);
          setEliminatedAnswers([]);
        }
      } else {
        let finalPrize = "0 ₽";
        if (currentQuestion >= 10) finalPrize = "100 000 ₽";
        else if (currentQuestion >= 5) finalPrize = "5 000 ₽";
        
        setWonPrize(finalPrize);
        setScreen('result');
      }
    }, 2000);
  };

  const takeTheMoney = () => {
    const prize = currentQuestion > 0 ? questions[currentQuestion - 1].prize : "0 ₽";
    setWonPrize(prize);
    setScreen('result');
  };

  const sendResults = async () => {
    if (!email.trim()) {
      toast({
        title: "Введите email",
        description: "Пожалуйста, введите email для отправки результатов",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Результаты отправлены!",
      description: `Ваш выигрыш ${wonPrize} отправлен на ${email}`
    });
  };

  const restartGame = () => {
    setScreen('welcome');
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setWonPrize("");
    setEmail("");
    setLifelines({ fifty: true, phone: true, audience: true });
    setEliminatedAnswers([]);
  };

  if (screen === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
        <Card className="w-full max-w-2xl p-8 md:p-12 bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] border-2 border-yellow-500/30 shadow-2xl animate-fade-in">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 animate-shimmer bg-[length:200%_auto]">
                КТО ХОЧЕТ СТАТЬ
              </h1>
              <h2 className="text-5xl md:text-7xl font-extrabold text-yellow-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                МИЛЛИОНЕРОМ?
              </h2>
            </div>
            
            <p className="text-gray-300 text-lg md:text-xl max-w-xl mx-auto">
              Ответьте на 15 вопросов и выиграйте до 3 000 000 рублей! У вас есть три подсказки и возможность забрать деньги в любой момент.
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
                НАЧАТЬ ИГРУ
              </Button>
            </div>

            <div className="flex justify-center gap-8 pt-6 text-yellow-400/80">
              <div className="text-center">
                <Icon name="CircleHelp" size={32} className="mx-auto mb-2" />
                <p className="text-sm">15 вопросов</p>
              </div>
              <div className="text-center">
                <Icon name="Lightbulb" size={32} className="mx-auto mb-2" />
                <p className="text-sm">3 подсказки</p>
              </div>
              <div className="text-center">
                <Icon name="Trophy" size={32} className="mx-auto mb-2" />
                <p className="text-sm">3 млн ₽</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (screen === 'result') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
        <Card className="w-full max-w-2xl p-8 md:p-12 bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] border-2 border-yellow-500/30 shadow-2xl animate-fade-in">
          <div className="text-center space-y-6">
            <Icon name="Trophy" size={80} className="mx-auto text-yellow-400" />
            
            <h2 className="text-3xl md:text-5xl font-bold text-yellow-400">
              Игра окончена, {userName}!
            </h2>
            
            <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/50">
              <p className="text-gray-300 text-xl mb-2">Ваш выигрыш:</p>
              <p className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                {wonPrize}
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <p className="text-gray-300">Получите результаты на email:</p>
              <Input
                type="email"
                placeholder="Введите ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0a0e27] border-yellow-500/50 text-white placeholder:text-gray-500"
              />
              <Button
                onClick={sendResults}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
              >
                <Icon name="Send" className="mr-2" size={20} />
                Отправить результаты
              </Button>
            </div>

            <Button
              onClick={restartGame}
              variant="outline"
              className="w-full max-w-md border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
            >
              <Icon name="RotateCcw" className="mr-2" size={20} />
              Начать заново
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
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] border-2 border-yellow-500/30 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-xl">
                    {currentQuestion + 1}
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Вопрос {currentQuestion + 1} из 15</p>
                    <p className="text-yellow-400 font-bold text-xl">{current.prize}</p>
                  </div>
                </div>
                
                <Button
                  onClick={takeTheMoney}
                  variant="outline"
                  disabled={isAnswered || currentQuestion === 0}
                  className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                >
                  <Icon name="HandCoins" className="mr-2" size={20} />
                  Забрать деньги
                </Button>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-relaxed">
                {current.question}
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {current.answers.map((answer, index) => {
                  const isEliminated = eliminatedAnswers.includes(index);
                  const isSelected = selectedAnswer === index;
                  const showCorrect = isAnswered && index === current.correct;
                  const showWrong = isAnswered && isSelected && index !== current.correct;
                  
                  return (
                    <Button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      disabled={isAnswered || isEliminated}
                      className={`h-auto py-6 px-6 text-lg font-semibold transition-all duration-300 ${
                        isEliminated 
                          ? 'opacity-20 cursor-not-allowed bg-gray-800' 
                          : showCorrect
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
                  Ответить окончательно
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] border-2 border-yellow-500/30">
              <h4 className="text-yellow-400 font-bold mb-4 flex items-center gap-2">
                <Icon name="Lightbulb" size={24} />
                Подсказки
              </h4>
              <div className="flex gap-4 flex-wrap">
                <Button
                  onClick={useFiftyFifty}
                  disabled={!lifelines.fifty || isAnswered}
                  className="flex-1 min-w-[150px] bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:bg-gray-700 text-white"
                >
                  <Icon name="Scissors" className="mr-2" size={20} />
                  50/50
                </Button>
                <Button
                  onClick={usePhoneFriend}
                  disabled={!lifelines.phone || isAnswered}
                  className="flex-1 min-w-[150px] bg-green-600 hover:bg-green-700 disabled:opacity-30 disabled:bg-gray-700 text-white"
                >
                  <Icon name="Phone" className="mr-2" size={20} />
                  Звонок другу
                </Button>
                <Button
                  onClick={useAudienceHelp}
                  disabled={!lifelines.audience || isAnswered}
                  className="flex-1 min-w-[150px] bg-purple-600 hover:bg-purple-700 disabled:opacity-30 disabled:bg-gray-700 text-white"
                >
                  <Icon name="Users" className="mr-2" size={20} />
                  Помощь зала
                </Button>
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] border-2 border-yellow-500/30 h-fit lg:sticky lg:top-4">
            <h4 className="text-yellow-400 font-bold mb-4 flex items-center gap-2">
              <Icon name="TrendingUp" size={24} />
              Призовая лестница
            </h4>
            <div className="space-y-2">
              {prizeList.map((prize, index) => {
                const isFireproof = index === 4 || index === 9;
                const isCurrent = index === currentQuestion;
                const isPassed = index < currentQuestion;
                
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold scale-105 shadow-lg'
                        : isPassed
                        ? 'bg-green-600/30 text-green-400'
                        : 'bg-[#0a0e27] text-gray-400'
                    } ${isFireproof ? 'border-2 border-orange-500' : ''}`}
                  >
                    <span className="font-mono">{15 - index}.</span>
                    <span className="font-bold">{prizeList[14 - index]}</span>
                    {isFireproof && <Icon name="Flame" size={16} className="text-orange-500" />}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
