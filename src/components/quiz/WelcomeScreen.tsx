import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface WelcomeScreenProps {
  userName: string;
  setUserName: (name: string) => void;
  onStart: () => void;
}

const WelcomeScreen = ({ userName, setUserName, onStart }: WelcomeScreenProps) => {
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
            Проверь свои знания об электронных осциллографах! 10 вопросов от простых к сложным. У тебя есть 3 подсказки на всю игру.
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
              onClick={onStart}
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
              <p className="text-sm">10 вопросов</p>
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
};

export default WelcomeScreen;
