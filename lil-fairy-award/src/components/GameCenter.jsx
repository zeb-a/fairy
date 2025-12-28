import React, { useState } from 'react';

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
  const [names] = useState(['Emma Johnson', 'Michael Chen', 'Sophia Williams', 'James Wilson']);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState('');

  const spinWheel = () => {
    setSpinning(true);
    setResult('');
    
    // Simulate spinning
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * names.length);
      setResult(names[randomIndex]);
      setSpinning(false);
    }, 3000);
  };

  return (
    <div className="magic-wheel-game">
      <h2>The Magic Wheel</h2>
      <div className={`wheel-container ${spinning ? 'spinning' : ''}`}>
        <div className="wheel">
          {names.map((name, index) => (
            <div 
              key={index} 
              className="wheel-segment"
              style={{ transform: `rotate(${index * (360 / names.length)}deg)` }}
            >
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={spinWheel} disabled={spinning}>
        {spinning ? 'Spinning...' : 'Spin the Wheel!'}
      </button>
      {result && <div className="result">Selected: {result}</div>}
    </div>
  );
};

// Memory Match Game Component
const MemoryMatchGame = () => {
  return (
    <div className="memory-match-game">
      <h2>Memory Match Creator</h2>
      <p>Create custom card sets for vocabulary or image matching</p>
      <div className="game-controls">
        <input type="text" placeholder="Enter vocabulary term" />
        <input type="text" placeholder="Enter matching definition" />
        <button>Add Card Pair</button>
      </div>
      <div className="card-grid">
        <div className="card">Card 1</div>
        <div className="card">Card 2</div>
        <div className="card">Card 3</div>
        <div className="card">Card 4</div>
      </div>
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