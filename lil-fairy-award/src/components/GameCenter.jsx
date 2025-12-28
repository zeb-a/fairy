import React, { useState } from 'react';
import { useClassContext } from '../contexts/ClassContext';

const GameCenter = () => {
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      id: 'magic-wheel',
      name: 'The Magic Wheel',
      description: 'A random name/term picker with a custom SVG rotation engine',
      icon: '🎡'
    },
    {
      id: 'memory-match',
      name: 'Memory Match Creator',
      description: 'Create custom card sets (Vocabulary pairs or Image pairs)',
      icon: '🧠'
    },
    {
      id: 'multi-choice',
      name: 'Multi-Choice',
      description: 'Game mode that utilizes teacher-created "Question Banks"',
      icon: '❓'
    },
    {
      id: 'hangman',
      name: 'Hangman',
      description: 'Game mode that utilizes teacher-created "Question Banks"',
      icon: '🔤'
    }
  ];

  const renderGameContent = () => {
    if (!selectedGame) {
      return (
        <div className="game-grid">
          {games.map(game => (
            <div 
              key={game.id} 
              className="game-card"
              onClick={() => setSelectedGame(game.id)}
            >
              <div className="game-icon">{game.icon}</div>
              <h3>{game.name}</h3>
              <p>{game.description}</p>
            </div>
          ))}
        </div>
      );
    }

    // Render individual game based on selection
    switch(selectedGame) {
      case 'magic-wheel':
        return <MagicWheelGame />;
      case 'memory-match':
        return <MemoryMatchGame />;
      case 'multi-choice':
        return <MultiChoiceGame />;
      case 'hangman':
        return <HangmanGame />;
      default:
        return (
          <div className="game-content">
            <h2>Select a game to play</h2>
            <button onClick={() => setSelectedGame(null)}>Back to Games</button>
          </div>
        );
    }
  };

  return (
    <div className="game-center">
      <h1>Game Center</h1>
      {renderGameContent()}
    </div>
  );
};

// Magic Wheel Game Component
const MagicWheelGame = () => {
  const { students } = useClassContext();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState('');
  const [rotation, setRotation] = useState(0);
  
  // Get student names from context
  const studentNames = students.map(student => student.name);

  const spinWheel = () => {
    if (spinning) return;
    
    setSpinning(true);
    setResult('');
    
    // Calculate random rotation (multiple spins + random segment)
    const extraSpins = 5; // Number of extra full rotations
    const segmentAngle = 360 / studentNames.length;
    const randomSegment = Math.floor(Math.random() * studentNames.length);
    const targetRotation = rotation + (360 * extraSpins) + (360 - (randomSegment * segmentAngle));
    
    setRotation(targetRotation);
    
    // Set result after animation completes
    setTimeout(() => {
      setResult(studentNames[randomSegment]);
      setSpinning(false);
    }, 5000);
  };

  return (
    <div className="magic-wheel-game">
      <h2>The Magic Wheel</h2>
      <div className="wheel-container">
        <svg width="300" height="300" viewBox="0 0 300 300" className="svg-wheel">
          <g transform={`rotate(${rotation} 150 150)`}>
            {studentNames.map((name, index) => {
              const angle = (360 / studentNames.length) * index;
              const endAngle = (360 / studentNames.length) * (index + 1);
              
              // Calculate the path for the segment
              const startAngleRad = (angle - 90) * (Math.PI / 180);
              const endAngleRad = (endAngle - 90) * (Math.PI / 180);
              const x1 = 150 + 140 * Math.cos(startAngleRad);
              const y1 = 150 + 140 * Math.sin(startAngleRad);
              const x2 = 150 + 140 * Math.cos(endAngleRad);
              const y2 = 150 + 140 * Math.sin(endAngleRad);
              
              const largeArcFlag = endAngle - angle <= 180 ? "0" : "1";
              
              const pathData = [
                `M 150 150`,
                `L ${x1} ${y1}`,
                `A 140 140 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                "Z"
              ].join(" ");
              
              // Calculate text position
              const textAngle = angle + (endAngle - angle) / 2;
              const textAngleRad = (textAngle - 90) * (Math.PI / 180);
              const textX = 150 + 100 * Math.cos(textAngleRad);
              const textY = 150 + 100 * Math.sin(textAngleRad);
              
              // Calculate rotation for text to be readable
              const textRotation = textAngle > 90 && textAngle < 270 ? textAngle + 180 : textAngle;
              
              return (
                <g key={index}>
                  <path 
                    d={pathData} 
                    fill={`hsl(${(index * 360) / studentNames.length}, 70%, 60%)`} 
                    stroke="white" 
                    strokeWidth="2"
                  />
                  <text 
                    x={textX} 
                    y={textY} 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    fill="white" 
                    fontSize="12" 
                    fontWeight="bold"
                    transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                  >
                    {name}
                  </text>
                </g>
              );
            })}
          </g>
          {/* Center circle */}
          <circle cx="150" cy="150" r="20" fill="#6B46FF" stroke="white" strokeWidth="2" />
        </svg>
        <div className="wheel-pointer">
          <div className="pointer"></div>
        </div>
      </div>
      <button onClick={spinWheel} disabled={spinning} className="spin-btn">
        {spinning ? 'Spinning...' : 'Spin the Wheel!'}
      </button>
      {result && <div className="result">Selected Magic Helper: {result}</div>}
    </div>
  );
};

// Memory Match Game Component
const MemoryMatchGame = () => {
  const [pairs, setPairs] = useState([]);
  const [newTerm, setNewTerm] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [gameMode, setGameMode] = useState('teacher'); // 'teacher' or 'student'
  
  const addPair = () => {
    if (newTerm.trim() && newDefinition.trim() && pairs.length < 8) {
      setPairs([...pairs, { term: newTerm, definition: newDefinition }]);
      setNewTerm('');
      setNewDefinition('');
    }
  };
  
  const removePair = (index) => {
    setPairs(pairs.filter((_, i) => i !== index));
  };
  
  const startGame = () => {
    if (pairs.length < 4) {
      alert('Please add at least 4 pairs to start the game');
      return;
    }
    
    // Create card pairs (each term and definition appears twice)
    let gameCards = [];
    pairs.forEach((pair, index) => {
      gameCards.push({ id: `${index}-a`, content: pair.term, type: 'term', pairId: index });
      gameCards.push({ id: `${index}-b`, content: pair.definition, type: 'definition', pairId: index });
    });
    
    // Shuffle cards
    gameCards = [...gameCards, ...gameCards] // duplicate to create pairs
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    
    setCards(gameCards);
    setFlippedCards([]);
    setMatchedPairs([]);
    setGameMode('student');
  };
  
  const handleCardClick = (index) => {
    if (flippedCards.length === 2) return; // Already two cards flipped
    if (flippedCards.includes(index)) return; // Card already flipped
    if (matchedPairs.includes(cards[index].pairId)) return; // Card already matched
    
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);
    
    if (newFlipped.length === 2) {
      const [firstIndex, secondIndex] = newFlipped;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];
      
      if (firstCard.pairId === secondCard.pairId) {
        // Match found
        setTimeout(() => {
          setMatchedPairs([...matchedPairs, firstCard.pairId]);
          setFlippedCards([]);
        }, 1000);
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="memory-match-game">
      <h2>Memory Match Creator</h2>
      
      {gameMode === 'teacher' && (
        <div className="teacher-mode">
          <h3>Teacher Mode - Create Card Pairs</h3>
          <div className="game-controls glass">
            <input 
              type="text" 
              placeholder="Enter vocabulary term" 
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Enter matching definition" 
              value={newDefinition}
              onChange={(e) => setNewDefinition(e.target.value)}
            />
            <button onClick={addPair} disabled={pairs.length >= 8}>Add Card Pair</button>
          </div>
          
          <div className="pairs-list">
            <h4>Current Pairs ({pairs.length}/8)</h4>
            {pairs.map((pair, index) => (
              <div key={index} className="pair-item glass">
                <span className="term">{pair.term}</span> ↔ <span className="definition">{pair.definition}</span>
                <button onClick={() => removePair(index)} className="remove-btn">Remove</button>
              </div>
            ))}
          </div>
          
          <button onClick={startGame} disabled={pairs.length < 4} className="start-game-btn">
            Start Game ({pairs.length} pairs)
          </button>
        </div>
      )}
      
      {gameMode === 'student' && (
        <div className="student-mode">
          <h3>Memory Match Game</h3>
          <button onClick={() => setGameMode('teacher')} className="back-to-teacher">Back to Teacher Mode</button>
          
          <div className="card-grid">
            {cards.map((card, index) => {
              const isFlipped = flippedCards.includes(index) || matchedPairs.includes(card.pairId);
              return (
                <div 
                  key={index} 
                  className={`card ${isFlipped ? 'flipped' : ''} ${matchedPairs.includes(card.pairId) ? 'matched' : ''}`}
                  onClick={() => handleCardClick(index)}
                >
                  {isFlipped ? card.content : '?'}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Multi-Choice Game Component
const MultiChoiceGame = () => {
  return (
    <div className="multi-choice-game">
      <h2>Multi-Choice Quiz</h2>
      <p>Answer questions from the teacher-created question bank</p>
      <div className="question">
        <h3>Sample Question?</h3>
        <div className="options">
          <label><input type="radio" name="answer" /> Option A</label>
          <label><input type="radio" name="answer" /> Option B</label>
          <label><input type="radio" name="answer" /> Option C</label>
          <label><input type="radio" name="answer" /> Option D</label>
        </div>
        <button>Submit Answer</button>
      </div>
    </div>
  );
};

// Hangman Game Component
const HangmanGame = () => {
  return (
    <div className="hangman-game">
      <h2>Hangman Game</h2>
      <p>Guess the word from the teacher-created word bank</p>
      <div className="hangman-display">
        <div className="word-display">_ _ _ _ _</div>
        <div className="hangman-image"> gallows image here </div>
        <div className="guess-section">
          <input type="text" maxLength="1" placeholder="Guess a letter" />
          <button>Guess</button>
        </div>
      </div>
    </div>
  );
};

export default GameCenter;