import { isValidPlay } from './spadesLogic.js';
import { getValidMoves } from './gameLogic.js';

export const createAIPlayer = (difficulty = 'medium') => {
  return {
    difficulty,
    makeBid: (hand) => calculateBid(hand),
    playCard: (hand, gameState, playerId) => selectCardToPlay(hand, gameState, playerId, difficulty)
  };
};

const calculateBid = (hand) => {
  let score = 0;
  
  hand.forEach(card => {
    if (card.suit === 'spades') {
      score += getSpadeValue(card.rank);
    } else {
      score += getNonSpadeValue(card.rank);
    }
  });
  
  return Math.max(1, Math.min(13, Math.floor(score)));
};

const getSpadeValue = (rank) => {
  if (rank === 14) return 1.0; // Ace
  if (rank === 13) return 0.9; // King
  if (rank === 12) return 0.8; // Queen
  if (rank === 11) return 0.7; // Jack
  if (rank >= 8) return 0.6; // 10, 9, 8
  return 0.4; // Lower spades
};

const getNonSpadeValue = (rank) => {
  if (rank === 14) return 0.8; // Ace
  if (rank === 13) return 0.6; // King
  if (rank === 12) return 0.4; // Queen
  if (rank === 11) return 0.2; // Jack
  return 0.1; // Lower cards
};

const selectCardToPlay = (hand, gameState, playerId, difficulty) => {
  const leadingSuit = gameState.leadingSuit;
  const validMoves = getValidMoves(hand, leadingSuit);
  
  if (validMoves.length === 0) return 0;
  if (validMoves.length === 1) return validMoves[0];
  
  const currentTrick = gameState.currentTrick;
  const playerBid = gameState.players[playerId].bid;
  const playerTricksWon = gameState.players[playerId].tricksWon;
  
  switch (difficulty) {
    case 'easy':
      return selectEasyCard(hand, validMoves, currentTrick, leadingSuit);
    case 'medium':
      return selectMediumCard(hand, validMoves, currentTrick, leadingSuit, playerBid, playerTricksWon);
    case 'hard':
      return selectHardCard(hand, validMoves, currentTrick, leadingSuit, playerBid, playerTricksWon, gameState);
    default:
      return selectMediumCard(hand, validMoves, currentTrick, leadingSuit, playerBid, playerTricksWon);
  }
};

const selectEasyCard = (hand, validMoves, currentTrick, leadingSuit) => {
  const validCards = validMoves.map(index => ({ index, card: hand[index] }));
  
  if (currentTrick.length === 0) {
    return validCards[Math.floor(Math.random() * validCards.length)].index;
  }
  
  return validCards[Math.floor(Math.random() * validCards.length)].index;
};

const selectMediumCard = (hand, validMoves, currentTrick, leadingSuit, playerBid, playerTricksWon) => {
  const validCards = validMoves.map(index => ({ index, card: hand[index] }));
  
  if (currentTrick.length === 0) {
    return selectLeadCard(validCards, playerBid, playerTricksWon);
  }
  
  return selectFollowCard(validCards, currentTrick, leadingSuit, playerBid, playerTricksWon);
};

const selectHardCard = (hand, validMoves, currentTrick, leadingSuit, playerBid, playerTricksWon, gameState) => {
  const validCards = validMoves.map(index => ({ index, card: hand[index] }));
  
  if (currentTrick.length === 0) {
    return selectAdvancedLeadCard(validCards, playerBid, playerTricksWon, gameState);
  }
  
  return selectAdvancedFollowCard(validCards, currentTrick, leadingSuit, playerBid, playerTricksWon, gameState);
};

const selectLeadCard = (validCards, playerBid, playerTricksWon) => {
  const needsTricks = playerTricksWon < playerBid;
  
  if (needsTricks) {
    const highCards = validCards.filter(({ card }) => card.rank >= 11);
    if (highCards.length > 0) {
      return highCards.reduce((best, current) => 
        current.card.rank > best.card.rank ? current : best
      ).index;
    }
  }
  
  const lowCards = validCards.filter(({ card }) => card.rank <= 8);
  if (lowCards.length > 0) {
    return lowCards.reduce((best, current) => 
      current.card.rank < best.card.rank ? current : best
    ).index;
  }
  
  return validCards[0].index;
};

const selectFollowCard = (validCards, currentTrick, leadingSuit, playerBid, playerTricksWon) => {
  const needsTricks = playerTricksWon < playerBid;
  const canWin = canWinTrick(validCards, currentTrick, leadingSuit);
  
  if (needsTricks && canWin) {
    return selectWinningCard(validCards, currentTrick, leadingSuit);
  }
  
  if (!needsTricks) {
    const losingCards = validCards.filter(({ card }) => {
      const trickCards = currentTrick.map(t => t.card);
      return !wouldWinTrick(card, trickCards, leadingSuit);
    });
    
    if (losingCards.length > 0) {
      return losingCards.reduce((best, current) => 
        current.card.rank < best.card.rank ? current : best
      ).index;
    }
  }
  
  return validCards[0].index;
};

const selectAdvancedLeadCard = (validCards, playerBid, playerTricksWon, gameState) => {
  return selectLeadCard(validCards, playerBid, playerTricksWon);
};

const selectAdvancedFollowCard = (validCards, currentTrick, leadingSuit, playerBid, playerTricksWon, gameState) => {
  return selectFollowCard(validCards, currentTrick, leadingSuit, playerBid, playerTricksWon);
};

const canWinTrick = (validCards, currentTrick, leadingSuit) => {
  const trickCards = currentTrick.map(t => t.card);
  return validCards.some(({ card }) => wouldWinTrick(card, trickCards, leadingSuit));
};

const wouldWinTrick = (card, trickCards, leadingSuit) => {
  const currentWinner = findCurrentWinner(trickCards, leadingSuit);
  
  if (card.suit === 'spades') {
    if (currentWinner.suit === 'spades') {
      return card.rank > currentWinner.rank;
    }
    return true;
  }
  
  if (card.suit === leadingSuit) {
    if (currentWinner.suit === 'spades') return false;
    if (currentWinner.suit === leadingSuit) {
      return card.rank > currentWinner.rank;
    }
    return true;
  }
  
  return false;
};

const findCurrentWinner = (trickCards, leadingSuit) => {
  let winner = trickCards[0];
  
  for (let i = 1; i < trickCards.length; i++) {
    const currentCard = trickCards[i];
    
    if (currentCard.suit === 'spades') {
      if (winner.suit !== 'spades' || currentCard.rank > winner.rank) {
        winner = currentCard;
      }
    } else if (currentCard.suit === leadingSuit) {
      if (winner.suit !== 'spades' && (winner.suit !== leadingSuit || currentCard.rank > winner.rank)) {
        winner = currentCard;
      }
    }
  }
  
  return winner;
};

const selectWinningCard = (validCards, currentTrick, leadingSuit) => {
  const trickCards = currentTrick.map(t => t.card);
  const winningCards = validCards.filter(({ card }) => wouldWinTrick(card, trickCards, leadingSuit));
  
  if (winningCards.length === 0) return validCards[0].index;
  
  return winningCards.reduce((best, current) => 
    current.card.rank < best.card.rank ? current : best
  ).index;
};