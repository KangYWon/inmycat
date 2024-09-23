import React, { useState, useEffect } from 'react';

const quizQuestions = [
  {
    type: 'multipleChoice',
    question: "다음 중 JavaScript의 기본 데이터 타입이 아닌 것은?",
    options: ["Number", "String", "Boolean", "Array"],
    correctAnswer: "Array"
  },
  {
    type: 'multipleChoice',
    question: "다음 코드의 출력값은? console.log(typeof null);",
    options: ["null", "undefined", "object", "number"],
    correctAnswer: "object"
  },
  {
    type: 'fillInTheBlank',
    question: "다음 코드의 빈칸을 채우세요: const add = (a, b) => __ a + b;",
    correctAnswer: "return"
  },
  {
    type: 'codeReview',
    question: "다음 코드를 개선하세요:\nfunction factorial(n) {\n  if (n == 0) return 1;\n  else return n * factorial(n - 1);\n}",
    feedback: "1. '==' 대신 '===' 사용\n2. else 문 제거 가능\n3. 음수 입력 처리 추가"
  }
];

const getRandomQuestion = () => {
  return quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
};

const CodingQuiz = ({ onCorrectAnswer, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(getRandomQuestion());
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      setIsAnswered(true);
      setFeedback("시간이 초과되었습니다.");
    }
  }, [timeLeft, isAnswered]);

  const handleAnswer = (answer) => {
    setUserAnswer(answer);
    setIsAnswered(true);
    checkAnswer(answer);
  };

  const checkAnswer = (answer) => {
    let isCorrect = false;
    switch (currentQuestion.type) {
      case 'multipleChoice':
        isCorrect = answer === currentQuestion.correctAnswer;
        break;
      case 'fillInTheBlank':
        isCorrect = answer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase();
        break;
      case 'codeReview':
        isCorrect = true; // 코드 리뷰는 항상 "정답"으로 처리
        break;
      default:
      setFeedback("지원하지 않는 질문 유형입니다.");
      return;
    }

    if (isCorrect) {
      const earnedMoney = Math.max(10, timeLeft);
      setTotalEarned(totalEarned + earnedMoney);
      setFeedback(`정답입니다! $${earnedMoney}를 얻었습니다.`);
      onCorrectAnswer(earnedMoney);
    } else {
      setFeedback("틀렸습니다. 다시 시도해보세요.");
    }

    if (currentQuestion.type === 'codeReview') {
      setFeedback(currentQuestion.feedback);
    }
  };

  const nextQuestion = () => {
    setCurrentQuestion(getRandomQuestion());
    setUserAnswer('');
    setIsAnswered(false);
    setFeedback('');
    setTimeLeft(30);
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'multipleChoice':
        return (
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !isAnswered && handleAnswer(option)}
                className={`w-full p-2 rounded ${
                  isAnswered
                    ? option === currentQuestion.correctAnswer
                      ? 'bg-green-500 text-white'
                      : option === userAnswer
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                disabled={isAnswered}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 'fillInTheBlank':
      case 'codeReview':
        return (
          <div>
            <textarea
              className="w-full p-2 border rounded"
              rows="4"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={isAnswered}
            />
            <button
              onClick={() => handleAnswer(userAnswer)}
              className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              disabled={isAnswered}
            >
              제출
            </button>
          </div>
        );
        default:
        return <p>지원하지 않는 질문 유형입니다.</p>; 
    }
  };

  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">코딩 퀴즈</h2>
      <p className="mb-4">남은 시간: {timeLeft}초</p>
      <p className="mb-4">총 획득 금액: ${totalEarned}</p>
      <p className="mb-4">{currentQuestion.question}</p>
      {renderQuestion()}
      {feedback && <p className="mt-4 text-blue-600">{feedback}</p>}
      {isAnswered && (
        <div className="mt-4 space-x-2">
          <button
            onClick={nextQuestion}
            className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
          >
            다음 문제
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            그만하기
          </button>
        </div>
      )}
    </div>
  );
};

export default CodingQuiz;
