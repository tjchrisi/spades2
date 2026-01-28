import React, { useState, useEffect } from 'react';
import Card from './Card.jsx';
import { calculateBid } from '../utils/gameLogic.js';

const BiddingPhase = ({ gameState, setGameState, onStartGame }) => {
  const [playerBid, setPlayerBid] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Handle AI bidding for computer players
  useEffect(() => {
    if (gameState.currentPlayer !== 0 && gameState.gamePhase === 'bidding' && !isProcessing) {
      const timer = setTimeout(() => {
        handleComputerBid();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.gamePhase, isProcessing]);
  
  const handleComputerBid = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const player = gameState.players[gameState.currentPlayer];
    const bid = calculateBid(player.hand);
    
    const newState = { ...gameState };
    newState.players[gameState.currentPlayer].bid = bid;
    
    // Check if this is the last player to bid
    if (gameState.currentPlayer === 3) {
      newState.gamePhase = 'playing';
      newState.currentPlayer = 0;
    } else {
      newState.currentPlayer = (gameState.currentPlayer + 1) % 4;
    }
    
    setGameState(newState);
    setIsProcessing(false);
  };
  
  const handleBidSubmit = () => {
    const bid = parseInt(playerBid);
    
    if (isNaN(bid) || bid < 0 || bid > 13) {
      alert('Please enter a valid bid between 0 and 13');
      return;
    }
    
    setIsProcessing(true);
    const newState = { ...gameState };
    newState.players[0].bid = bid;
    
    // Move to next player (West - AI player 1)
    newState.currentPlayer = 1;
    
    setGameState(newState);
    setPlayerBid('');
    setIsProcessing(false);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleBidSubmit();
    }
  };
  
  const renderBiddingInfo = () => {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const previousBids = gameState.players
      .filter((p, index) => index < gameState.currentPlayer && p.bid !== null)
      .map((p, index) => `${p.name}: ${p.bid}`);
    
    return (
      <div className="bidding-info">
        <h3>Bidding Phase</h3>
        <div className="current-player">
          <span>Current Player: {currentPlayer.name}</span>
          {isProcessing && <span> - Thinking...</span>}
        </div>
        {previousBids.length > 0 && (
          <div className="previous-bids">
            <span>Previous Bids: {previousBids.join(', ')}</span>
          </div>
        )}
        <div className="bidding-progress">
          <span>Players who have bid: {gameState.players.filter(p => p.bid !== null).length}/4</span>
        </div>
      </div>
    );
  };
  
  const renderPlayerHand = () => {
    const player = gameState.players[0];
    
    return (
      <div className="player-hand-section">
        <h3>Your Hand</h3>
        <div className="player-hand">
          {player.hand.map((card, index) => (
            <Card key={`${card.suit}-${card.rank}-${index}`} card={card} />
          ))}
        </div>
      </div>
    );
  };
  
  const renderCurrentBids = () => {
    const bids = gameState.players.map((player, index) => {
      const status = player.bid !== null ? `Bid: ${player.bid}` : 'Waiting...';
      return (
        <div key={index} className="player-bid-status">
          <span>{player.name}: {status}</span>
        </div>
      );
    });
    
    return (
      <div className="current-bids">
        <h4>Bidding Status</h4>
        {bids}
      </div>
    );
  };
  
  const renderBidInput = () => {
    if (gameState.currentPlayer !== 0) return null;
    
    return (
      <div className="bid-input-section">
        <h4>Enter Your Bid</h4>
        <div className="bid-input">
          <input
            type="number"
            min="0"
            max="13"
            value={playerBid}
            onChange={(e) => setPlayerBid(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="0-13"
            className="bid-input-field"
            autoFocus
            disabled={isProcessing}
          />
          <button 
            className="bid-submit-button" 
            onClick={handleBidSubmit}
            disabled={!playerBid || isProcessing}
          >
            🎯 Submit Bid
          </button>
        </div>
        <div className="bid-help">
          <p>How many tricks do you think you can win?</p>
          <p>Tip: Count your spades and high cards!</p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bidding-phase">
      <div className="bidding-header">
        <h1>Spades - 4 Player Individual</h1>
        <h2>Round {gameState.roundNumber}</h2>
      </div>
      
      <div className="bidding-content">
        {renderBiddingInfo()}
        {renderCurrentBids()}
        {renderPlayerHand()}
        {renderBidInput()}
      </div>
      
      <div className="bidding-controls">
        <button className="control-button" onClick={onStartGame} disabled={isProcessing}>
          🔀 Shuffle & Deal
        </button>
        <button className="control-button" onClick={() => window.location.reload()} disabled={isProcessing}>
          🔄 New Game
        </button>
      </div>
    </div>
  );
};

export default BiddingPhase;