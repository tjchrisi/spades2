import React, { useState, useEffect } from 'react';
import Card from './Card.jsx';
import { createGameState, playCard, startNextRound, getCardDisplay } from '../utils/gameLogic.js';
import { createAIPlayer } from '../utils/aiLogic.js';

const GameBoard = ({ gameState, setGameState }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const aiPlayer = createAIPlayer('medium');
  
  useEffect(() => {
    if (gameState.gamePhase === 'bidding' && gameState.currentPlayer !== 0) {
      const timer = setTimeout(() => {
        handleComputerBid();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.gamePhase]);
  
  useEffect(() => {
    if (gameState.gamePhase === 'playing' && gameState.currentPlayer !== 0) {
      const timer = setTimeout(() => {
        handleComputerPlay();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.gamePhase]);
  
  const handleComputerBid = () => {
    const player = gameState.players[gameState.currentPlayer];
    const bid = aiPlayer.makeBid(player.hand);
    
    const newState = { ...gameState };
    newState.players[gameState.currentPlayer].bid = bid;
    
    if (gameState.currentPlayer === 3) {
      newState.gamePhase = 'playing';
      newState.currentPlayer = 0;
    } else {
      newState.currentPlayer = (gameState.currentPlayer + 1) % 4;
    }
    
    setGameState(newState);
  };
  
  const handleComputerPlay = () => {
    const player = gameState.players[gameState.currentPlayer];
    const cardIndex = aiPlayer.playCard(player.hand, gameState, gameState.currentPlayer);
    
    if (cardIndex !== -1 && cardIndex < player.hand.length) {
      const newState = playCard(gameState, gameState.currentPlayer, cardIndex);
      setGameState(newState);
    }
  };
  
  const handleCardClick = (cardIndex) => {
    if (gameState.currentPlayer !== 0 || gameState.gamePhase !== 'playing') return;
    
    const player = gameState.players[0];
    const card = player.hand[cardIndex];
    
    if (selectedCard === cardIndex) {
      const newState = playCard(gameState, 0, cardIndex);
      if (newState !== gameState) {
        setGameState(newState);
        setSelectedCard(null);
      }
    } else {
      setSelectedCard(cardIndex);
    }
  };
  
  const handleNextRound = () => {
    const newState = startNextRound(gameState);
    setGameState(newState);
    setSelectedCard(null);
  };
  
  const handleNewGame = () => {
    const newState = createGameState();
    setGameState(newState);
    setSelectedCard(null);
  };
  
  const renderCurrentTrick = () => {
    if (gameState.currentTrick.length === 0) return null;
    
    return (
      <div className="current-trick">
        <h3>Current Trick</h3>
        <div className="trick-cards">
          {gameState.currentTrick.map((entry, index) => {
            const { rank, suit, color } = getCardDisplay(entry.card);
            return (
              <div key={index} className="trick-card">
                <div className="trick-player">{gameState.players[entry.player].name}</div>
                <div className="trick-card-display" style={{ color }}>
                  {rank}{suit}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const renderPlayerHand = (playerIndex) => {
    const player = gameState.players[playerIndex];
    const isCurrentPlayer = gameState.currentPlayer === playerIndex && gameState.gamePhase === 'playing';
    
    return (
      <div className={`player-section player-${playerIndex}`}>
        <h3>{player.name}</h3>
        <div className="player-info">
          <span>Bid: {player.bid || 'None'}</span>
          <span>Tricks: {player.tricksWon}</span>
          <span>Score: {player.score}</span>
        </div>
        <div className="player-hand">
          {player.hand.map((card, index) => (
            <Card
              key={`${card.suit}-${card.rank}-${index}`}
              card={card}
              onClick={() => handleCardClick(index)}
              isPlayable={isCurrentPlayer}
              isSelected={selectedCard === index}
            />
          ))}
        </div>
      </div>
    );
  };
  
  const renderGameStatus = () => {
    return (
      <div className="game-status">
        <h3>Match Scores (First to 300 Wins)</h3>
        <div className="match-scores">
          {gameState.players.map((player, index) => (
            <div key={index} className="player-score">
              <span>{player.name}: {gameState.matchScores[index]}</span>
            </div>
          ))}
        </div>
        <div className="round-info">
          <span>Round: {gameState.roundNumber}</span>
          <span>Phase: {gameState.gamePhase}</span>
        </div>
      </div>
    );
  };
  
  if (gameState.gamePhase === 'gameOver') {
    const winner = gameState.players[gameState.gameWinner];
    return (
      <div className="game-over">
        <h1>🏆 Game Over! 🏆</h1>
        <h2>{winner.name} Wins!</h2>
        <div className="final-scores">
          <h3>Final Scores</h3>
          {gameState.players.map((player, index) => (
            <div key={index} className="final-score">
              <span>{player.name}: {gameState.matchScores[index]}</span>
            </div>
          ))}
        </div>
        <button className="new-game-button" onClick={handleNewGame}>
          🎯 Start New Game
        </button>
      </div>
    );
  }
  
  if (gameState.gamePhase === 'roundOver') {
    return (
      <div className="round-over">
        <h2>Round {gameState.roundNumber} Complete!</h2>
        <div className="round-scores">
          <h3>Round Scores</h3>
          {gameState.players.map((player, index) => (
            <div key={index} className="round-score">
              <span>{player.name}: {player.score}</span>
            </div>
          ))}
        </div>
        {renderGameStatus()}
        <button className="next-round-button" onClick={handleNextRound}>
          🔄 Next Round
        </button>
      </div>
    );
  }
  
  return (
    <div className="game-board">
      <div className="game-header">
        <h1>Spades - 4 Player Individual</h1>
        <div className="game-info">
          <span>Round: {gameState.roundNumber}</span>
          <span>Current Player: {gameState.players[gameState.currentPlayer]?.name}</span>
        </div>
      </div>
      
      <div className="players-area">
        <div className="top-player">
          {renderPlayerHand(2)} {/* North */}
        </div>
        
        <div className="side-players">
          {renderPlayerHand(1)} {/* West */}
          <div className="center-area">
            {renderCurrentTrick()}
            {renderGameStatus()}
          </div>
          {renderPlayerHand(3)} {/* East */}
        </div>
        
        <div className="bottom-player">
          {renderPlayerHand(0)} {/* South (Player) */}
        </div>
      </div>
      
      <div className="game-controls">
        <button className="control-button" onClick={handleNewGame}>
          🔄 New Game
        </button>
        <button className="control-button" onClick={() => setSelectedCard(null)}>
          Clear Selection
        </button>
      </div>
    </div>
  );
};

export default GameBoard;