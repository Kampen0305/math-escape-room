import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Lock,
  Unlock,
  Star,
  Volume2,
  VolumeX,
  Trophy,
  Play
} from 'lucide-react';

// Geluidseffecten aanmaken
const createSound = (path) => {
  const audio = new Audio(path);
  audio.onerror = () => console.warn(`Geluid niet gevonden: ${path}`);
  return audio;
};

const sounds = {
  correct: createSound('/sounds/correct.mp3'),
  wrong: createSound('/sounds/wrong.mp3'),
  victory: createSound('/sounds/victory.mp3')
};

// Dynamisch rekenvragen genereren
const generateMathChallenges = (difficulty) => {
  const operations = [
    { type: 'add', range: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 50 },
    { type: 'subtract', range: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 50 },
    { type: 'multiply', range: difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 20 }
  ];

  return operations.flatMap(op =>
    Array(3).fill().map(() => {
      let num1, num2, answer;
      switch (op.type) {
        case 'add':
          num1 = Math.floor(Math.random() * op.range);
          num2 = Math.floor(Math.random() * op.range);
          answer = num1 + num2;
          return {
            question: `Hoeveel is ${num1} + ${num2}?`,
            answer,
            hint: `Tel ${num1} en ${num2} bij elkaar op`,
            reward: `Je hebt ${answer} muntjes verdiend! 💰`
          };
        case 'subtract':
          num1 = Math.floor(Math.random() * op.range) + 10;
          num2 = Math.floor(Math.random() * (num1 - 5));
          answer = num1 - num2;
          return {
            question: `Hoeveel is ${num1} - ${num2}?`,
            answer,
            hint: `Neem ${num2} weg van ${num1}`,
            reward: `Een geheime sleutel ontgrendeld! 🔑`
          };
        case 'multiply':
          num1 = Math.floor(Math.random() * op.range) + 1;
          num2 = Math.floor(Math.random() * op.range) + 1;
          answer = num1 * num2;
          return {
            question: `Hoeveel is ${num1} x ${num2}?`,
            answer,
            hint: `Denk aan groepjes van ${num1}`,
            reward: `Vlieg door naar het volgende level! 🚀`
          };
        default:
          return {};
      }
    })
  );
};

const MathEscapeRoom = () => {
  const [difficulty, setDifficulty] = useState('easy');
  const [mathChallenges, setMathChallenges] = useState(generateMathChallenges(difficulty));
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [solved, setSolved] = useState(new Array(mathChallenges.length).fill(false));
  const [showHint, setShowHint] = useState(false);
  const [lastReward, setLastReward] = useState('');
  const [score, setScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    let timer;
    if (gameStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleGameOver();
    }
    return () => clearInterval(timer);
  }, [gameStarted, timeLeft]);

  const playSound = (type) => {
    if (soundEnabled && sounds[type]) {
      sounds[type].play();
    }
  };

  const handleSubmit = () => {
    const challenge = mathChallenges[currentChallenge];
    const parsedAnswer = parseInt(userAnswer);

    if (isNaN(parsedAnswer)) {
      alert('Voer een geldig getal in.');
      return;
    }

    if (parsedAnswer === challenge.answer) {
      playSound('correct');
      const newSolved = [...solved];
      newSolved[currentChallenge] = true;
      setSolved(newSolved);
      setLastReward(challenge.reward);
      setShowHint(false);
      setUserAnswer('');
      setScore(prev => prev + 10);

      if (currentChallenge < mathChallenges.length - 1) {
        setTimeout(() => {
          setCurrentChallenge(currentChallenge + 1);
          setLastReward('');
        }, 1500);
      } else {
        if (timeLeft > 0) setScore(prev => prev + 20); // bonus
        handleGameOver();
      }
    } else {
      playSound('wrong');
      alert('Oeps! Dat is niet helemaal goed. Probeer nog een keer of vraag een hint.');
    }
  };

  const handleGameOver = () => {
    playSound('victory');
    setGameStarted(false);
  };

  const handleRestart = () => {
    const newChallenges = generateMathChallenges(difficulty);
    setMathChallenges(newChallenges);
    setCurrentChallenge(0);
    setSolved(new Array(newChallenges.length).fill(false));
    setUserAnswer('');
    setShowHint(false);
    setLastReward('');
    setScore(0);
    setTimeLeft(60);
    setGameStarted(true);
  };

  const changeDifficulty = (level) => {
    setDifficulty(level);
    handleRestart();
  };

  const allSolved = solved.every(Boolean);

  if (!gameStarted) {
    return (
      <div className="bg-blue-50 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4 text-blue-600">Reken Escape Avontuur</h1>

          <div className="mb-4">
            <h2 className="text-xl mb-2">Kies Moeilijkheidsgraad</h2>
            <div className="flex justify-center space-x-4">
              {['easy', 'medium', 'hard'].map(level => (
                <button
                  key={level}
                  onClick={() => changeDifficulty(level)}
                  className={`p-2 rounded-lg ${difficulty === level ? 'bg-blue-500 text-white' : 'bg-blue-100'}`}
                >
                  {level === 'easy' ? 'Makkelijk' : level === 'medium' ? 'Gemiddeld' : 'Moeilijk'}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-xl mb-2">Geluid</h2>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="bg-blue-100 p-2 rounded-lg flex items-center mx-auto"
            >
              {soundEnabled ? <Volume2 /> : <VolumeX />}
              <span className="ml-2">{soundEnabled ? 'Aan' : 'Uit'}</span>
            </button>
          </div>

          <button
            onClick={() => setGameStarted(true)}
            className="bg-green-500 text-white p-3 rounded-lg flex items-center mx-auto"
          >
            <Play className="mr-2" /> Start Spel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Trophy className="mr-2" />
            <span className="font-bold">{score} punten</span>
          </div>
          <div className="text-red-500 font-bold">{timeLeft} seconden</div>
        </div>

        <p className="text-sm text-gray-500 mb-2 text-center">
          Moeilijkheid: {difficulty === 'easy' ? 'Makkelijk' : difficulty === 'medium' ? 'Gemiddeld' : 'Moeilijk'}
        </p>

        {!allSolved ? (
          <>
            <p className="text-sm text-gray-500 mb-2 text-center">
              Uitdaging {currentChallenge + 1} van {mathChallenges.length}
            </p>

            <div className="flex justify-center space-x-2 mb-4">
              {solved.map((isSolved, index) => (
                isSolved ? <Unlock key={index} color="green" /> : <Lock key={index} color="gray" />
              ))}
            </div>

            <div className="bg-blue-100 p-4 rounded-lg mb-4 text-center">
              <h2 className="text-xl font-semibold mb-2">Uitdaging {currentChallenge + 1}</h2>
              <p className="text-lg">{mathChallenges[currentChallenge].question}</p>
            </div>

            <div className="flex flex-col space-y-4">
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Typ je antwoord hier"
                className="w-full p-2 border rounded-lg text-center text-xl"
              />

              <div className="flex space-x-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-green-500 text-white p-2 rounded-lg flex items-center justify-center"
                >
                  Controleer <ChevronRight className="ml-2" />
                </button>

                <button
                  onClick={() => setShowHint(!showHint)}
                  className="bg-yellow-500 text-white p-2 rounded-lg"
                  disabled={solved[currentChallenge]}
                >
                  Hint
                </button>
              </div>

              {showHint && !solved[currentChallenge] && (
                <div className="bg-yellow-100 p-3 rounded-lg text-center">
                  {mathChallenges[currentChallenge].hint}
                </div>
              )}

              {lastReward && (
                <div className="bg-green-100 p-3 rounded-lg text-center text-green-700">
                  {lastReward}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center">
            <Star size={100} color="gold" className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Gefeliciteerd! Je hebt de escape room opgelost! 🎊
            </h2>
            <p className="text-lg mb-4">Je bent een rekentovenaar! Eindscore: {score}</p>
            <button
              onClick={handleRestart}
              className="bg-blue-500 text-white p-2 rounded-lg"
            >
              Speel opnieuw
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathEscapeRoom;
