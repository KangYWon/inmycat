import React, { useState, useEffect, useCallback } from 'react';
import { Cat, Milk, Fish } from 'lucide-react';
import CodingQuiz from './CodingQuiz';

const CatCodingGame = () => {
  const [money, setMoney] = useState(0);
  const [food, setFood] = useState(0);
  const [milk, setMilk] = useState(0);
  const [happiness, setHappiness] = useState(50);
  const [catPosition, setCatPosition] = useState({ x: 150, y: 150 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isCatChasing, setIsCatChasing] = useState(false);
  const [showPaw, setShowPaw] = useState(null);
  const [catAction, setCatAction] = useState(null);
  const [lastFedTime, setLastFedTime] = useState(Date.now());
  const [showCodingQuiz, setShowCodingQuiz] = useState(false);

  const earnMoney = (amount) => {
    setMoney(prevMoney => prevMoney + amount);
  };

  const buyFood = () => {
    if (money >= 5) {
      setMoney(prevMoney => prevMoney - 5);
      setFood(prevFood => prevFood + 1);
    }
  };

  const buyMilk = () => {
    if (money >= 3) {
      setMoney(prevMoney => prevMoney - 3);
      setMilk(prevMilk => prevMilk + 1);
    }
  };

  const feedCat = () => {
    if (food > 0) {
      setFood(prevFood => prevFood - 1);
      setHappiness(prevHappiness => Math.min(prevHappiness + 10, 100));
      setCatAction('eating');
      setLastFedTime(Date.now());
      setTimeout(() => setCatAction(null), 2000);
    }
  };

  const giveMilk = () => {
    if (milk > 0) {
      setMilk(prevMilk => prevMilk - 1);
      setHappiness(prevHappiness => Math.min(prevHappiness + 5, 100));
      setCatAction('drinking');
      setLastFedTime(Date.now());
      setTimeout(() => setCatAction(null), 2000);
    }
  };

  const playCat = () => {
    setHappiness(prevHappiness => Math.min(prevHappiness + 15, 100));
    setLastFedTime(Date.now());
  };

  const moveCatRandomly = useCallback(() => {
    if (!isCatChasing && !catAction) {
      setCatPosition(prev => ({
        x: prev.x + (Math.random() - 0.5) * 20,
        y: prev.y + (Math.random() - 0.5) * 20
      }));
    }
  }, [isCatChasing, catAction]);

  const handleMouseMove = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    const interval = setInterval(moveCatRandomly, 1000);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [moveCatRandomly, handleMouseMove]);

  useEffect(() => {
    if (!catAction) {
      const dx = mousePosition.x - catPosition.x;
      const dy = mousePosition.y - catPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        setIsCatChasing(true);
        setCatPosition(prev => ({
          x: prev.x + dx * 0.05,
          y: prev.y + dy * 0.05
        }));

        setShowPaw(dx > 0 ? 'right' : 'left');
      } else {
        setIsCatChasing(false);
        setShowPaw(null);
      }
    }
  }, [mousePosition, catPosition, catAction]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastFed = (currentTime - lastFedTime) / 1000;

      if (timeSinceLastFed > 10) {
        setHappiness(prevHappiness => Math.max(prevHappiness - 1, 0));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [lastFedTime]);

  const renderPaw = () => {
    if (!showPaw) return null;

    const pawStyle = {
      position: 'absolute',
      fontSize: '24px',
      transform: showPaw === 'left' ? 'translateX(-30px) rotate(90deg)' : 'translateX(30px) rotate(-90deg)',
    };

    return <span style={pawStyle}>🐾</span>;
  };

  const renderCatAction = () => {
    if (!catAction) return null;

    const actionStyle = {
      position: 'absolute',
      fontSize: '24px',
      left: '60px',
      top: '-20px',
    };

    return (
      <span style={actionStyle}>
        {catAction === 'eating' ? '🍖' : '🥛'}
      </span>
    );
  };

  const renderHappinessBar = () => {
    return (
      <div className="flex items-center mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{width: `${happiness}%`}}
          ></div>
        </div>
        <span className="text-sm font-medium">{happiness}%</span>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-4 max-w-md mx-auto relative bg-white shadow-lg rounded-lg" style={{height: '500px'}}>
        {showCodingQuiz ? (
          <CodingQuiz 
            onCorrectAnswer={(amount) => {
              earnMoney(amount);
            }}
            onClose={() => setShowCodingQuiz(false)}
          />
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-4 text-center">고양이 코딩 게임</h1>
            <div className="mb-4" style={{position: 'absolute', left: `${catPosition.x}px`, top: `${catPosition.y}px`, transition: 'all 1s'}}>
              <Cat size={50} color={happiness > 50 ? "black" : "gray"} />
              {renderPaw()}
              {renderCatAction()}
            </div>
            <div className="mb-4 text-center">
              <p className="mb-1">행복도:</p>
              {renderHappinessBar()} {/* 여기에 추가 */}
              <p className="flex items-center justify-center mb-1">
                <span className="mr-2">돈:</span>
                <span className="font-bold">${money}</span>
              </p>
              <p className="flex items-center justify-center mb-1">
                <span className="mr-2">먹이:</span>
                <span className="font-bold">{food}</span>
                <Fish size={16} className="ml-2" />
              </p>
              <p className="flex items-center justify-center">
                <span className="mr-2">우유:</span>
                <span className="font-bold">{milk}</span>
                <Milk size={16} className="ml-2" />
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <button onClick={() => setShowCodingQuiz(true)} className="bg-blue-500 text-white p-3 rounded-lg shadow-lg hover:bg-blue-600">코딩하기</button>
              <button onClick={buyFood} className="bg-green-500 text-white p-3 rounded-lg shadow-lg hover:bg-green-600">먹이 구매 ($5)</button>
              <button onClick={feedCat} className="bg-red-500 text-white p-3 rounded-lg shadow-lg hover:bg-red-600">먹이 주기</button>
              <button onClick={buyMilk} className="bg-yellow-500 text-white p-3 rounded-lg shadow-lg hover:bg-yellow-600">우유 구매 ($3)</button>
              <button onClick={giveMilk} className="bg-purple-500 text-white p-3 rounded-lg shadow-lg hover:bg-purple-600">우유 주기</button>
              <button onClick={playCat} className="bg-pink-500 text-white p-3 rounded-lg shadow-lg hover:bg-pink-600">놀아주기</button>
            </div>
          </>
        )}
        <div style={{
          position: 'absolute',
          left: `${mousePosition.x -500}px`,
          top: `${mousePosition.y-200}px`,
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: 'black',
          pointerEvents: 'none'
        }} />
      </div>
    </div>
  );
};

export default CatCodingGame;
