import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Cat, Milk, Fish } from 'lucide-react';
import CodingQuiz from './CodingQuiz';

const CatCodingGame = () => {
  const [money, setMoney] = useState(0);
  const [food, setFood] = useState(0);
  const [milk, setMilk] = useState(0);
  const [cats, setCats] = useState([
    { id: 'main', x: 150, y: 150, happiness: 50, size: 50, isCatChasing: false, showPaw: null }
  ]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [catAction, setCatAction] = useState(null);
  const [lastFedTime, setLastFedTime] = useState(Date.now());
  const [showCodingQuiz, setShowCodingQuiz] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMouseDetected, setIsMouseDetected] = useState(false);
  const [foodCount, setFoodCount] = useState(0); // 먹이 횟수
  const [milkCount, setMilkCount] = useState(0); // 우유 횟수
  const [canPoop, setCanPoop] = useState(false); // 배변 가능 여부
  const gameAreaRef = useRef(null);

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
    if (food > 0 && foodCount < 3) {  // 먹이 횟수가 3 이하일 때만 가능
      setFood(prevFood => prevFood - 1);
      setFoodCount(prevCount => prevCount + 1);
      updateCatsAndGenerateKitten(10);
      setCatAction('eating');
      setLastFedTime(Date.now());
      setCanPoop(true); // 먹이면 배변 가능 상태
      setTimeout(() => setCatAction(null), 2000);
    } else if (foodCount >= 3) {
      alert("배변을 해야 다시 먹을 수 있습니다!");
    }
  };
  
  const giveMilk = () => {
    if (milk > 0 && milkCount < 3) {  // 우유 횟수가 3 이하일 때만 가능
      setMilk(prevMilk => prevMilk - 1);
      setMilkCount(prevCount => prevCount + 1);
      updateCatsAndGenerateKitten(5);
      setCatAction('drinking');
      setLastFedTime(Date.now());
      setTimeout(() => setCatAction(null), 2000);
    } else if (milkCount >= 3) {
      alert("배변을 해야 다시 먹을 수 있습니다!");
    }
  };

  const catPoop = () => {
    if (canPoop && (foodCount >= 1 || milkCount >= 1)) {
      setCats(prevCats => prevCats.map(cat => ({
        ...cat,
        happiness: Math.min(cat.happiness + 5, 100)
      })));
      setCatAction('pooping');
      setLastFedTime(Date.now());
      setCanPoop(false);
      setFoodCount(0); // Reset food count after pooping
      setMilkCount(0); // Reset milk count after pooping
      setTimeout(() => setCatAction(null), 2000);
    } else {
      alert("고양이가 충분히 먹지 않았습니다! \n 밥을 먹거나 우유를 마셔야 배변할 수 있습니다.");
    }
  };

  const generateKitten = () => {
    return {
      id: Date.now(),
      x: 150,
      y: 150,
      happiness: 50,
      size: 30,
      isCatChasing: false,
      showPaw: null
    };
  };

  const updateCatsAndGenerateKitten = (increment) => {
    setCats(prevCats => {
      let newCats = [...prevCats];
      let shouldGenerateKitten = false;

      newCats = newCats.map(cat => {
        let newHappiness = Math.min(cat.happiness + increment, 100);
        let newSize = cat.size;
  
        if (newHappiness === 100 && cat.size < 70) {
          newSize = 70;
          newHappiness = 50;
          shouldGenerateKitten = true;
        }
        return { ...cat, happiness: newHappiness, size: newSize };
      });

      if (shouldGenerateKitten) {
        newCats.push(generateKitten());
      }

      return newCats;
    });
  };

  const moveCats = useCallback(() => {
    setCats(prevCats => prevCats.map(cat => {
      if (!cat.isCatChasing) {
        return {
          ...cat,
          x: Math.max(0, Math.min(cat.x + (Math.random() - 0.5) * 80, 950)),
          y: Math.max(0, Math.min(cat.y + (Math.random() - 0.5) * 80, 950))
        };
      }
      return cat;
    }));
  }, []);
  
  const handleMouseMove = useCallback((e) => {
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
      
      if (Math.random() < 0.8) { 
        setIsMouseDetected(true);
      } else {
        setIsMouseDetected(false);
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(moveCats, 500);
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
  }, [moveCats, handleMouseMove]);

  useEffect(() => {
    if (!catAction && isMouseDetected) {
      setCats(prevCats => prevCats.map(cat => {
        const dx = mousePosition.x - cat.x;
        const dy = mousePosition.y - cat.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) { 
          return {
            ...cat,
            x: Math.max(0, Math.min(cat.x + dx * 0.1, 950)),
            y: Math.max(0, Math.min(cat.y + dy * 0.1, 950)),
            isCatChasing: true,
            showPaw: dx < 0 ? 'left' : 'right'
          };
        } else {
          return { ...cat, isCatChasing: false, showPaw: null };
        }
      }));
    } else {
      setCats(prevCats => prevCats.map(cat => ({ ...cat, isCatChasing: false, showPaw: null })));
    }
  }, [mousePosition, catAction, isMouseDetected]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastFed = (currentTime - lastFedTime) / 1000;

      if (timeSinceLastFed > 10) {
        setCats(prevCats => {
          let updatedCats = prevCats.map(cat => ({
            ...cat,
            happiness: Math.max(cat.happiness - 1, 0)
          }));
          
          // Remove cats with 0 happiness, except the main cat
          updatedCats = updatedCats.filter(cat => cat.happiness > 0 || cat.id === 'main');
          
          if (updatedCats.length === 1 && updatedCats[0].happiness === 0) {
            setIsGameOver(true);
          }
          
          return updatedCats;
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [lastFedTime]);

  const renderPaw = (showPaw) => {
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

  const renderHappinessBar = (happiness, label) => {
    return (
      <div className="flex items-center mb-4">
        <span className="mr-2">{label}</span>
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

  const getCatColor = (isCatChasing, happiness) => {
    if (isCatChasing) {
      // 랜덤 RGB 색상 생성
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgb(${r},${g},${b})`;
    }
    if (happiness > 50) return "black";
    return "gray";
  };

  if (isGameOver) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-4 max-w-md mx-auto bg-white shadow-lg rounded-lg text-center">
          <h1 className="text-3xl font-bold mb-4">게임 오버</h1>
          <p className="mb-4">모든 고양이의 행복도가 0%가 되어 사라졌습니다.</p>
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
            {cats.map(cat => (
              <div key={cat.id} className="mb-4" style={{position: 'absolute', left: `${cat.x}px`, top: `${cat.y}px`, transition: 'all 0.5s'}}>
                <Cat size={cat.size} color={getCatColor(cat.isCatChasing, cat.happiness)} />
                {renderPaw(cat.showPaw)}
                {renderCatAction(cat.id === 'main' ? catAction : null)}
              </div>
            ))}
            <div className="mb-4 text-center">
              <p className="mb-1">고양이 행복도</p>
              {renderHappinessBar(cats.length > 0 ? cats[cats.length - 1].happiness : 0)}
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
              <p className="flex items-center justify-center mt-2">
                <span className="mr-2">고양이 수:</span>
                <span className="font-bold">{cats.length}</span>
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
