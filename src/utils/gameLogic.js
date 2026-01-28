import { createDeck, shuffleDeck, dealCards, sortHand, getRankDisplay } from './deck.js';
import { calculateTrickWinner, calculateRoundScore, isValidPlay } from './spadesLogic.js';

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
export const SUIT_SYMBOLS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };

export const createGameState = () => {
  const deck = shuffleDeck(createDeck());
  const hands = dealCards(deck);
  
  return {
    players: [
      { id: 0, name: 'South (You)', hand: sortHand(hands[0]), bid: null, tricksWon: 0, score: 0 },
      { id: 1, name: 'West', hand: sortHand(hands[1]), bid: null, tricksWon: 0, score: 0 },
      { id: 2, name: 'North', hand: sortHand(hands[2]), bid: null, tricksWon: 0, score: 0 },
      { id: 3, name: 'East', hand: sortHand(hands[3]), bid: null, tricksWon: 0, score: 0 }
    ],
    currentPlayer: 0,
    gamePhase: 'bidding',
    currentTrick: [],
    leadingSuit: null,
    roundNumber: 1,
    matchScores: [0, 0, 0, 0],
    gameWinner: null,
    winningScore: 300
  };
};

export const calculateBid = (hand) => {
  let score = 0;
  hand.forEach(card => {
    if (card.suit === 'spades') score += 0.8;
    if ([14, 13, 12].includes(card.rank)) score += 1.2;
  });
  return Math.max(1, Math.floor(score / 2));
};

export const getNextPlayer = (currentPlayer, totalPlayers = 4) => {
  return (currentPlayer + 1) % totalPlayers;
};

export const playCard = (gameState, playerId, cardIndex) => {
  const newState = { ...gameState };
  const player = newState.players[playerId];
  const card = player.hand[cardIndex];
  
  if (!card) return gameState;
  
  if (!isValidPlay(card, player.hand, newState.leadingSuit)) {
    return gameState;
  }
  
  if (newState.currentTrick.length === 0) {
    newState.leadingSuit = card.suit;
  }
  
  newState.currentTrick.push({ card, player: playerId });
  player.hand.splice(cardIndex, 1);
  
  newState.currentPlayer = getNextPlayer(playerId);
  
  if (newState.currentTrick.length === 4) {
    const winnerIndex = calculateTrickWinner(newState.currentTrick.map(t => t.card));
    const winnerPlayer = newState.currentTrick[winnerIndex].player;
    
    newState.players[winnerPlayer].tricksWon++;
    newState.currentTrick = [];
    newState.leadingSuit = null;
    newState.currentPlayer = winnerPlayer;
    
    if (newState.players.every(p => p.hand.length === 0)) {
      newState.gamePhase = 'scoring';
      scoreRound(newState);
    }
  }
  
  return newState;
};

export const scoreRound = (gameState) => {
  const bids = gameState.players.map(p => p.bid);
  const tricksWon = gameState.players.map(p => p.tricksWon);
  const roundScores = calculateRoundScore(bids, tricksWon);
  
  gameState.players.forEach((player, index) => {
    const roundScore = roundScores[`player${index}`];
    player.score = roundScore;
    gameState.matchScores[index] += roundScore;
  });
  
  const winner = checkForWinner(gameState.matchScores, gameState.winningScore);
  if (winner !== null) {
    gameState.gameWinner = winner;
    gameState.gamePhase = 'gameOver';
  } else {
    gameState.gamePhase = 'roundOver';
  }
  
  return gameState;
};

export const checkForWinner = (matchScores, winningScore = 300) => {
  for (let i = 0; i < matchScores.length; i++) {
    if (matchScores[i] >= winningScore) {
      return i;
    }
  }
  return null;
};

export const startNextRound = (gameState) => {
  const deck = shuffleDeck(createDeck());
  const hands = dealCards(deck);
  
  const newState = {
    ...gameState,
    players: gameState.players.map((player, index) => ({
      ...player,
      hand: sortHand(hands[index]),
      bid: null,
      tricksWon: 0,
      score: 0
    })),
    currentPlayer: 0,
    gamePhase: 'bidding',
    currentTrick: [],
    leadingSuit: null,
    roundNumber: gameState.roundNumber + 1
  };
  
  return newState;
};

export const getValidMoves = (hand, leadingSuit) => {
  if (!leadingSuit) return hand.map((_, index) => index);
  
  const hasLeadSuit = hand.some(card => card.suit === leadingSuit);
  
  if (hasLeadSuit) {
    return hand.map((card, index) => card.suit === leadingSuit ? index : -1).filter(i => i !== -1);
  }
  
  return hand.map((_, index) => index);
};

export const getCardColor = (suit) => {
  return ['hearts', 'diamonds'].includes(suit) ? 'red' : 'black';
};

export const getCardDisplay = (card) => {
  return {
    rank: getRankDisplay(card.rank),
    suit: SUIT_SYMBOLS[card.suit],
    color: getCardColor(card.suit)
  };
};