import React, { useState, useEffect } from 'react';
import './App.css';
import { createGameState } from './utils/gameLogic.js';
import GameBoard from './components/GameBoard.jsx';
import BiddingPhase from './components/BiddingPhase.jsx';
import TicTacToe from './components/TicTacToe.jsx';

function App() {
  const [gameState, setGameState] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameType, setGameType] = useState('spades'); // 'spades' or 'tictactoe'
  
  useEffect(() => {
    if (gameStarted && !gameState && gameType === 'spades') {
      const initialState = createGameState();
      setGameState(initialState);
    }
  }, [gameStarted, gameState, gameType]);
  
  const startGame = (type) => {
    setGameType(type);
    setGameStarted(true);
  };
  
  const resetGame = () => {
    setGameStarted(false);
    setGameState(null);
  };

  if (!gameStarted) {
    return (
      <div className="game-container">
        <div className="setup-screen">
          <h1>🎮 Game Center 🎮</h1>
          <h2>Choose a game to play</h2>
          
          <div className="game-options">
            <div className="game-option">
              <h3>♠️ Spades - First to 300 Wins!</h3>
              <p>Classic card game with AI opponents</p>
              <button
                className="start-button"
                onClick={() => startGame('spades')}
              >
                Play Spades
              </button>
            </div>
            
            <div className="game-option">
              <h3>❌ Tic Tac Toe ⭕</h3>
              <p>Classic strategy game for two players</p>
              <button
                className="start-button"
                onClick={() => startGame('tictactoe')}
              >
                Play Tic Tac Toe
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!gameState && gameType === 'spades') {
    return (
      <div className="game-container">
        <div className="loading-screen">
          <h1>🎯 Setting up your game...</h1>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }
  
  if (gameType === 'tictactoe') {
    return (
      <div className="game-container">
        <TicTacToe onReset={resetGame} />
      </div>
    );
  }
  
  if (gameState.gamePhase === 'bidding') {
    return (
      <div className="game-container">
        <BiddingPhase
          gameState={gameState}
          setGameState={setGameState}
          onStartGame={resetGame}
        />
      </div>
    );
  }
  
  return (
    <div className="game-container">
      <GameBoard
        gameState={gameState}
        setGameState={setGameState}
      />
    </div>
  );
}

export default App;