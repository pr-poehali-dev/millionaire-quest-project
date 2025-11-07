import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { AttemptLog } from './types';

interface ResultScreenProps {
  userName: string;
  attemptLogs: AttemptLog[];
  totalHints: number;
  email: string;
  setEmail: (email: string) => void;
  onSendResults: () => void;
  onRestart: () => void;
  totalQuestions: number;
}

const ResultScreen = ({ 
  userName, 
  attemptLogs, 
  totalHints, 
  email, 
  setEmail, 
  onSendResults, 
  onRestart,
  totalQuestions 
}: ResultScreenProps) => {
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
                {score} / {totalQuestions}
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
              onClick={onSendResults}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
            >
              <Icon name="Send" className="mr-2" size={20} />
              Результаты отправлены ✓
            </Button>
          </div>

          <Button
            onClick={onRestart}
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
};

export default ResultScreen;