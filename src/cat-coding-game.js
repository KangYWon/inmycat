import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isGameOver, setIsGameOver] = useState(false);
  // const [isCatPlaying, setIsCatPlaying] = useState(false);
  const [isMouseDetected, setIsMouseDetected] = useState(false);
  const gameAreaRef = useRef(null);
  const [canPoop, setCanPoop] = useState(false);

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
      setCanPoop(true);
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

  // const playCat = () => {
  //   setHappiness(prevHappiness => Math.min(prevHappiness + 15, 100));
  //   setLastFedTime(Date.now());
  //   // setIsCatPlaying(true);
  //   // setTimeout(() => setIsCatPlaying(false), 5000);
  //   setTimeout(() => 5000);
  // };

  const moveCatRandomly = useCallback(() => {
    if (!isCatChasing && !catAction) {
      setCatPosition(prev => ({
        x: Math.max(0, Math.min(prev.x + (Math.random() - 0.5) * 80, 950)), 
        y: Math.max(0, Math.min(prev.y + (Math.random() - 0.5) * 80, 950)) 
      }));
    }
  }, [isCatChasing, catAction]);

  const catPoop = () => {
    if (canPoop) { // Check if the cat can poop
      setHappiness(prevHappiness => Math.max(prevHappiness + 5, 0));
      setCatAction('pooping');
      setLastFedTime(Date.now());
      setCanPoop(false); // Disable pooping after using it
      setTimeout(() => setCatAction(null), 2000);
    } else {
      alert("고양이가 먹어야 배변할 수 있습니다!"); // Alert if trying to poop without eating
    }
  };
  
  const handleMouseMove = useCallback((e) => {
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
      
      // 랜덤하게 마우스 감지 여부 결정
      if (Math.random() < 0.8) { 
        setIsMouseDetected(true);
      } else {
        setIsMouseDetected(false);
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(moveCatRandomly, 500);
    const currentRef = gameAreaRef.current;
  
    if (currentRef) {
      currentRef.addEventListener('mousemove', handleMouseMove);
    }
  
    return () => {
      clearInterval(interval);
      if (currentRef) {
        currentRef.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [moveCatRandomly, handleMouseMove]);

  useEffect(() => {
    if (!catAction && isMouseDetected) {
      const dx = mousePosition.x - catPosition.x;
      const dy = mousePosition.y - catPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) { 
        setIsCatChasing(true);
        setCatPosition(prev => ({
          x: Math.max(0, Math.min(prev.x + dx * 0.1, 950)),
          y: Math.max(0, Math.min(prev.y + dy * 0.1, 950))
        }));

        setShowPaw(dx < 0 ? 'left' : 'right'); 
      } else {
        setIsCatChasing(false);
        setShowPaw(null);
      }
    } else {
      setIsCatChasing(false);
      setShowPaw(null);
    }
  }, [mousePosition, catPosition, catAction, isMouseDetected]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastFed = (currentTime - lastFedTime) / 1000;

      if (timeSinceLastFed > 10) {
        setHappiness(prevHappiness => {
          const newHappiness = Math.max(prevHappiness - 1, 0);
          if (newHappiness === 0) {
            setIsGameOver(true);
          }
          return newHappiness;
        });
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
        {catAction === 'pooping' ? '💩' : catAction === 'eating' ? '🍖' : '🥛'}
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

  const getCatColor = () => {
    if (isCatChasing) return "rgb(209,138,155)"; 
    if (happiness > 50) return "black";
    return "gray";
  };

  const getCatSize = () => {
    return happiness === 100 ? 70 : 50;
  };

  if (isGameOver) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-4 max-w-md mx-auto bg-white shadow-lg rounded-lg text-center">
          <h1 className="text-3xl font-bold mb-4">게임 오버</h1>
          <p className="mb-4">고양이의 행복도가 0%가 되어 사라졌습니다.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white p-3 rounded-lg shadow-lg hover:bg-blue-600"
          >
            다시 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div 
        ref={gameAreaRef}
        className="p-4 max-w-md mx-auto relative bg-white shadow-lg rounded-lg" 
        style={{width: '1000px', height: '1000px'}}
      >
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
            <div className="mb-4" style={{position: 'absolute', left: `${catPosition.x}px`, top: `${catPosition.y}px`, transition: 'all 0.5s'}}>
              <Cat size={getCatSize()} color={getCatColor()} />
              {renderPaw()}
              {renderCatAction()}
            </div>
            <div className="mb-4 text-center">
              <p className="mb-1">행복도:</p>
              {renderHappinessBar()}
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
              <button onClick={catPoop} className="bg-pink-500 text-white p-3 rounded-lg shadow-lg hover:bg-pink-600">배변하기</button>
            </div>
          </>
        )}
        <div style={{
          position: 'absolute',
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
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
