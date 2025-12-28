import React, { useState, useEffect } from 'react';
import { useClassContext } from '../contexts/ClassContext';
import LiveSnapshot from './LiveSnapshot';

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
      <div className="game-content-container">
        <div className="games-main-content">
          {renderGameContent()}
        </div>
        <div className="games-sidebar">
          <LiveSnapshot maxItems={8} />
        </div>
      </div>
    </div>
  );
};

// Magic Wheel Game Component
const MagicWheelGame = () => {
  const { students } = useClassContext();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState('');
  const [rotation, setRotation] = useState(0);
  const [showWinner, setShowWinner] = useState(false);
  const [customNames, setCustomNames] = useState('');
  const [useCustomNames, setUseCustomNames] = useState(false);
  
  // Get student names from context
  const studentNames = students.map(student => student.name);
  const namesList = useCustomNames && customNames.trim() ? 
    customNames.split(',').map(name => name.trim()).filter(name => name) : 
    studentNames;

  const spinWheel = () => {
    if (spinning || namesList.length === 0) return;
    
    setSpinning(true);
    setResult('');
    setShowWinner(false);
    
    // Calculate random rotation (multiple spins + random segment)
    const extraSpins = 5; // Number of extra full rotations
    const segmentAngle = 360 / namesList.length;
    const randomSegment = Math.floor(Math.random() * namesList.length);
    const targetRotation = rotation + (360 * extraSpins) + (360 - (randomSegment * segmentAngle));
    
    setRotation(targetRotation);
    
    // Set result after animation completes
    setTimeout(() => {
      setResult(namesList[randomSegment]);
      setSpinning(false);
      setTimeout(() => setShowWinner(true), 500);
    }, 5000);
  };

  const resetWheel = () => {
    setResult('');
    setShowWinner(false);
    setRotation(0);
  };

  return (
    <div className="magic-wheel-game">
      <h2>The Magic Wheel</h2>
      
      {/* Creator Mode Toggle */}
      <div className="creator-mode-toggle glass">
        <label>
          <input 
            type="checkbox" 
            checked={useCustomNames}
            onChange={(e) => setUseCustomNames(e.target.checked)}
          />
          Use Custom Names (Creator Mode)
        </label>
        
        {useCustomNames && (
          <textarea
            value={customNames}
            onChange={(e) => setCustomNames(e.target.value)}
            placeholder="Enter names, separated by commas"
            className="custom-names-input"
          />
        )}
      </div>
      
      <div className="wheel-container">
        <svg width="300" height="300" viewBox="0 0 300 300" className="svg-wheel">
          <g transform={`rotate(${rotation} 150 150)`}>
            {namesList.map((name, index) => {
              const angle = (360 / namesList.length) * index;
              const endAngle = (360 / namesList.length) * (index + 1);
              
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
                    fill={`hsl(${(index * 360) / namesList.length}, 70%, 60%)`} 
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
      
      <div className="wheel-controls">
        <button onClick={spinWheel} disabled={spinning || namesList.length === 0} className="spin-btn">
          {spinning ? 'Spinning...' : 'Spin the Wheel!'}
        </button>
        {result && (
          <button onClick={resetWheel} className="reset-btn">
            Reset
          </button>
        )}
      </div>
      
      {result && (
        <div className={`result ${showWinner ? 'winner' : ''}`}>
          {showWinner ? (
            <div className="magic-winner-overlay">
              <h3>Magic Winner!</h3>
              <p>{result}</p>
              <div className="confetti">
                <span>✨</span>
                <span>🎉</span>
                <span>⭐</span>
                <span>🌟</span>
              </div>
            </div>
          ) : (
            <p>Selected Magic Helper: {result}</p>
          )}
        </div>
      )}
      
      {namesList.length === 0 && (
        <div className="no-names-warning">
          <p>No names available. Please add names or switch to student names.</p>
        </div>
      )}
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
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [imagePairs, setImagePairs] = useState(false); // Toggle for image pairs
  const [newImageTerm, setNewImageTerm] = useState('');
  const [newImageDefinition, setNewImageDefinition] = useState('');

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted]);

  const addPair = () => {
    if (!imagePairs && newTerm.trim() && newDefinition.trim() && pairs.length < 8) {
      setPairs([...pairs, { term: newTerm, definition: newDefinition, type: 'text' }]);
      setNewTerm('');
      setNewDefinition('');
    } else if (imagePairs && newImageTerm.trim() && newImageDefinition.trim() && pairs.length < 8) {
      setPairs([...pairs, { term: newImageTerm, definition: newImageDefinition, type: 'image' }]);
      setNewImageTerm('');
      setNewImageDefinition('');
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

    // Create card pairs
    let gameCards = [];
    pairs.forEach((pair, index) => {
      gameCards.push({ 
        id: `${index}-a`, 
        content: pair.term, 
        type: pair.type,
        pairId: index 
      });
      gameCards.push({ 
        id: `${index}-b`, 
        content: pair.definition, 
        type: pair.type,
        pairId: index 
      });
    });

    // Shuffle cards
    gameCards = gameCards
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    setCards(gameCards);
    setFlippedCards([]);
    setMatchedPairs([]);
    setGameStarted(true);
    setGameCompleted(false);
    setTimer(0);
    setAttempts(0);
    setGameMode('student');
  };

  const resetGame = () => {
    setGameMode('teacher');
    setGameStarted(false);
    setGameCompleted(false);
    setCards([]);
    setFlippedCards([]);
    setMatchedPairs([]);
    setTimer(0);
    setAttempts(0);
  };

  const handleCardClick = (index) => {
    if (flippedCards.length === 2) return; // Already two cards flipped
    if (flippedCards.includes(index)) return; // Card already flipped
    if (matchedPairs.includes(cards[index].pairId)) return; // Card already matched

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setAttempts(attempts => attempts + 1); // Increment attempts counter
      const [firstIndex, secondIndex] = newFlipped;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.pairId === secondCard.pairId) {
        // Match found
        setTimeout(() => {
          setMatchedPairs([...matchedPairs, firstCard.pairId]);
          setFlippedCards([]);

          // Check if game is completed
          if (matchedPairs.length + 1 === pairs.length) {
            setTimeout(() => {
              setGameCompleted(true);
            }, 500);
          }
        }, 1000);
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="memory-match-game">
      <h2>Memory Match Creator</h2>

      {gameMode === 'teacher' && (
        <div className="teacher-mode">
          <h3>Teacher Mode - Create Card Pairs</h3>
          
          {/* Toggle for text vs image pairs */}
          <div className="pair-type-toggle glass">
            <label>
              <input 
                type="checkbox" 
                checked={imagePairs}
                onChange={(e) => setImagePairs(e.target.checked)}
              />
              Create Image Pairs (instead of text)
            </label>
          </div>
          
          <div className="game-controls glass">
            {!imagePairs ? (
              <>
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
              </>
            ) : (
              <>
                <input 
                  type="text" 
                  placeholder="Enter image URL or description" 
                  value={newImageTerm}
                  onChange={(e) => setNewImageTerm(e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Enter matching definition" 
                  value={newImageDefinition}
                  onChange={(e) => setNewImageDefinition(e.target.value)}
                />
              </>
            )}
            <button onClick={addPair} disabled={pairs.length >= 8}>
              Add Card Pair {imagePairs ? '(Images)' : '(Text)'}
            </button>
          </div>

          <div className="pairs-list">
            <h4>Current Pairs ({pairs.length}/8)</h4>
            {pairs.map((pair, index) => (
              <div key={index} className={`pair-item glass ${pair.type}`}>
                {pair.type === 'image' ? (
                  <>
                    <div className="image-term">
                      <img src={pair.term} alt={pair.term} onError={(e) => e.target.textContent = pair.term} />
                    </div>
                    <span className="definition">{pair.definition}</span>
                  </>
                ) : (
                  <>
                    <span className="term">{pair.term}</span> ↔ <span className="definition">{pair.definition}</span>
                  </>
                )}
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
          
          {/* Game stats */}
          <div className="game-stats glass">
            <div className="stat-item">
              <span className="stat-label">Time:</span>
              <span className="stat-value">{formatTime(timer)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Attempts:</span>
              <span className="stat-value">{attempts}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Progress:</span>
              <span className="stat-value">{matchedPairs.length}/{pairs.length}</span>
            </div>
          </div>
          
          <button onClick={resetGame} className="back-to-teacher">
            Back to Creator Mode
          </button>

          {gameCompleted ? (
            <div className="game-completed glass">
              <h3>Congratulations! 🎉</h3>
              <p>You completed the game in {formatTime(timer)} with {attempts} attempts!</p>
              <button onClick={resetGame} className="play-again-btn">
                Play Again
              </button>
            </div>
          ) : (
            <div className="card-grid">
              {cards.map((card, index) => {
                const isFlipped = flippedCards.includes(index) || matchedPairs.includes(card.pairId);
                return (
                  <div 
                    key={index} 
                    className={`card ${isFlipped ? 'flipped' : ''} ${matchedPairs.includes(card.pairId) ? 'matched' : ''}`}
                    onClick={() => handleCardClick(index)}
                  >
                    {isFlipped ? (
                      card.type === 'image' ? (
                        <img src={card.content} alt={card.content} onError={(e) => e.target.textContent = card.content} />
                      ) : (
                        card.content
                      )
                    ) : (
                      '?'
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Multi-Choice Game Component
const MultiChoiceGame = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState(0);
  const [gameMode, setGameMode] = useState('creator'); // 'creator' or 'player'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  const addQuestion = () => {
    if (newQuestion.trim() && newOptions.some(opt => opt.trim())) {
      const newQ = {
        question: newQuestion,
        options: newOptions.filter(opt => opt.trim()),
        correctAnswer: newCorrectAnswer
      };
      setQuestions([...questions, newQ]);
      setNewQuestion('');
      setNewOptions(['', '', '', '']);
      setNewCorrectAnswer(0);
    }
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const startGame = () => {
    if (questions.length === 0) {
      alert('Please add at least one question to start the game');
      return;
    }
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameCompleted(false);
    setGameMode('player');
  };

  const resetGame = () => {
    setGameMode('creator');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameCompleted(false);
  };

  const handleAnswerSelect = (optionIndex) => {
    if (showResult) return; // Prevent changing answer after showing result
    setSelectedAnswer(optionIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) {
      alert('Please select an answer');
      return;
    }

    const currentQ = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // Game completed
        setGameCompleted(true);
      }
    }, 2000);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="multi-choice-game">
      <h2>Multi-Choice Quiz Engine</h2>

      {gameMode === 'creator' && (
        <div className="creator-mode">
          <h3>Creator Mode - Build Your Question Bank</h3>
          
          <div className="question-creator glass">
            <div className="form-group">
              <label>Question:</label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Enter your question"
              />
            </div>
            
            <div className="form-group">
              <label>Options:</label>
              {newOptions.map((option, index) => (
                <div key={index} className="option-input">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const updatedOptions = [...newOptions];
                      updatedOptions[index] = e.target.value;
                      setNewOptions(updatedOptions);
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                </div>
              ))}
            </div>
            
            <div className="form-group">
              <label>Correct Answer:</label>
              <select
                value={newCorrectAnswer}
                onChange={(e) => setNewCorrectAnswer(parseInt(e.target.value))}
              >
                {newOptions.map((_, index) => (
                  <option key={index} value={index}>
                    Option {index + 1}: {newOptions[index] || `Option ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
            
            <button onClick={addQuestion} className="add-question-btn">
              Add Question
            </button>
          </div>

          {questions.length > 0 && (
            <div className="questions-list">
              <h4>Question Bank ({questions.length} questions)</h4>
              {questions.map((q, index) => (
                <div key={index} className="question-item glass">
                  <div className="question-text">{q.question}</div>
                  <div className="question-options">
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className={`option ${optIndex === q.correctAnswer ? 'correct' : ''}`}>
                        {optIndex + 1}. {opt} {optIndex === q.correctAnswer && '(Correct)'}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => removeQuestion(index)} className="remove-btn">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <button onClick={startGame} disabled={questions.length === 0} className="start-game-btn">
            Start Quiz ({questions.length} questions)
          </button>
        </div>
      )}

      {gameMode === 'player' && (
        <div className="player-mode">
          <h3>Quiz Time!</h3>
          
          <div className="game-stats glass">
            <div className="stat-item">
              <span className="stat-label">Question:</span>
              <span className="stat-value">{currentQuestionIndex + 1}/{questions.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Score:</span>
              <span className="stat-value">{score}/{questions.length}</span>
            </div>
          </div>

          {gameCompleted ? (
            <div className="quiz-completed glass">
              <h3>Quiz Completed! 🎉</h3>
              <p>Your final score: {score}/{questions.length}</p>
              <p>Percentage: {Math.round((score / questions.length) * 100)}%</p>
              <button onClick={resetGame} className="play-again-btn">
                Create New Quiz
              </button>
            </div>
          ) : (
            <>
              <div className="question-display glass">
                <h4>{currentQuestion?.question}</h4>
                
                <div className="options-grid">
                  {currentQuestion?.options.map((option, index) => (
                    <button
                      key={index}
                      className={`option-btn ${
                        selectedAnswer === index ? 'selected' : 
                        (showResult && index === currentQuestion.correctAnswer) ? 'correct' :
                        (showResult && selectedAnswer === index) ? 'incorrect' : ''
                      }`}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + index)}.</span>
                      <span className="option-text">{option}</span>
                    </button>
                  ))}
                </div>
                
                {!showResult && selectedAnswer !== null && (
                  <button onClick={submitAnswer} className="submit-btn">
                    Submit Answer
                  </button>
                )}
                
                {showResult && (
                  <div className={`result-message ${selectedAnswer === currentQuestion.correctAnswer ? 'correct' : 'incorrect'}`}>
                    {selectedAnswer === currentQuestion.correctAnswer ? (
                      <div className="success-message">
                        <h4>Correct! ✨</h4>
                        <p>You're amazing! Great job!</p>
                      </div>
                    ) : (
                      <div className="incorrect-message">
                        <h4>Not quite! 😕</h4>
                        <p>The correct answer was: {currentQuestion.options[currentQuestion.correctAnswer]}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <button onClick={resetGame} className="back-to-creator">
                Back to Creator Mode
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Hangman Game Component
const HangmanGame = () => {
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [newHint, setNewHint] = useState('');
  const [gameMode, setGameMode] = useState('creator'); // 'creator' or 'player'
  const [currentWord, setCurrentWord] = useState('');
  const [currentHint, setCurrentHint] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const addWord = () => {
    if (newWord.trim()) {
      const newW = {
        word: newWord.trim().toUpperCase(),
        hint: newHint.trim()
      };
      setWords([...words, newW]);
      setNewWord('');
      setNewHint('');
    }
  };

  const removeWord = (index) => {
    setWords(words.filter((_, i) => i !== index));
  };

  const startGame = () => {
    if (words.length === 0) {
      alert('Please add at least one word to start the game');
      return;
    }
    
    // Select a random word
    const randomIndex = Math.floor(Math.random() * words.length);
    const selectedWord = words[randomIndex];
    
    setCurrentWord(selectedWord.word);
    setCurrentHint(selectedWord.hint);
    setGuessedLetters([]);
    setIncorrectGuesses(0);
    setGameCompleted(false);
    setGameWon(false);
    setGameMode('player');
  };

  const resetGame = () => {
    setGameMode('creator');
    setCurrentWord('');
    setCurrentHint('');
    setGuessedLetters([]);
    setIncorrectGuesses(0);
    setGameCompleted(false);
    setGameWon(false);
  };

  const handleLetterGuess = (letter) => {
    if (guessedLetters.includes(letter) || gameCompleted) return;
    
    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);
    
    if (!currentWord.includes(letter)) {
      const newIncorrectGuesses = incorrectGuesses + 1;
      setIncorrectGuesses(newIncorrectGuesses);
      
      if (newIncorrectGuesses >= 6) {
        setGameCompleted(true);
        setGameWon(false);
      }
    } else {
      // Check if word is completed
      const wordCompleted = currentWord.split('').every(char => 
        char === ' ' || newGuessedLetters.includes(char)
      );
      
      if (wordCompleted) {
        setGameCompleted(true);
        setGameWon(true);
      }
    }
  };

  const renderWordDisplay = () => {
    return currentWord.split('').map((char, index) => (
      <span 
        key={index} 
        className="letter-display"
      >
        {char === ' ' ? ' ' : (guessedLetters.includes(char) ? char : '_')}
      </span>
    ));
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="hangman-game">
      <h2>Hangman Game</h2>

      {gameMode === 'creator' && (
        <div className="creator-mode">
          <h3>Creator Mode - Build Your Word Bank</h3>
          
          <div className="word-creator glass">
            <div className="form-group">
              <label>Word:</label>
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Enter a word"
              />
            </div>
            
            <div className="form-group">
              <label>Hint (optional):</label>
              <input
                type="text"
                value={newHint}
                onChange={(e) => setNewHint(e.target.value)}
                placeholder="Enter a hint"
              />
            </div>
            
            <button onClick={addWord} className="add-word-btn">
              Add Word
            </button>
          </div>

          {words.length > 0 && (
            <div className="words-list">
              <h4>Word Bank ({words.length} words)</h4>
              {words.map((w, index) => (
                <div key={index} className="word-item glass">
                  <div className="word-text">{w.word}</div>
                  {w.hint && <div className="word-hint">Hint: {w.hint}</div>}
                  <button onClick={() => removeWord(index)} className="remove-btn">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <button onClick={startGame} disabled={words.length === 0} className="start-game-btn">
            Start Game ({words.length} words)
          </button>
        </div>
      )}

      {gameMode === 'player' && (
        <div className="player-mode">
          <h3>Hangman Challenge!</h3>
          
          <div className="game-stats glass">
            <div className="stat-item">
              <span className="stat-label">Incorrect Guesses:</span>
              <span className="stat-value">{incorrectGuesses}/6</span>
            </div>
            {currentHint && (
              <div className="stat-item">
                <span className="stat-label">Hint:</span>
                <span className="stat-value">{currentHint}</span>
              </div>
            )}
          </div>

          {gameCompleted ? (
            <div className={`game-completed glass ${gameWon ? 'won' : 'lost'}`}>
              <h3>{gameWon ? 'Congratulations! 🎉' : 'Game Over! 😔'}</h3>
              <p>The word was: <strong>{currentWord}</strong></p>
              <button onClick={resetGame} className="play-again-btn">
                Create New Game
              </button>
            </div>
          ) : (
            <>
              <div className="hangman-display glass">
                <div className="word-to-guess">
                  {renderWordDisplay()}
                </div>
                
                <div className="hangman-figure">
                  {/* Visual representation of hangman based on incorrect guesses */}
                  <div className="hangman-structure">
                    <div className={`gallows ${incorrectGuesses > 0 ? 'active' : ''}`}></div>
                    <div className={`head ${incorrectGuesses > 0 ? 'active' : ''}`}></div>
                    <div className={`body ${incorrectGuesses > 1 ? 'active' : ''}`}></div>
                    <div className={`left-arm ${incorrectGuesses > 2 ? 'active' : ''}`}></div>
                    <div className={`right-arm ${incorrectGuesses > 3 ? 'active' : ''}`}></div>
                    <div className={`left-leg ${incorrectGuesses > 4 ? 'active' : ''}`}></div>
                    <div className={`right-leg ${incorrectGuesses > 5 ? 'active' : ''}`}></div>
                  </div>
                </div>
                
                <div className="keyboard">
                  {alphabet.map(letter => (
                    <button
                      key={letter}
                      className={`letter-btn ${
                        guessedLetters.includes(letter) 
                          ? currentWord.includes(letter) ? 'correct' : 'incorrect' 
                          : ''
                      }`}
                      onClick={() => handleLetterGuess(letter)}
                      disabled={guessedLetters.includes(letter) || gameCompleted}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
              
              <button onClick={resetGame} className="back-to-creator">
                Back to Creator Mode
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GameCenter;