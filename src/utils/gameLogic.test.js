// Simple test file to verify game logic
import { createGameState, calculateBid, playCard, scoreRound, checkForWinner } from './gameLogic.js';

// Test game state creation
console.log('🧪 Testing Game Logic...');

try {
  const gameState = createGameState();
  console.log('✅ Game state created successfully');
  console.log('📊 Players:', gameState.players.length);
  console.log('🃏 Cards per player:', gameState.players[0].hand.length);
  console.log('🎯 Game phase:', gameState.gamePhase);
} catch (error) {
  console.error('❌ Failed to create game state:', error);
}

// Test bidding calculation
try {
  const testHand = [
    { suit: 'spades', rank: 14 }, // Ace of Spades
    { suit: 'spades', rank: 13 }, // King of Spades
    { suit: 'hearts', rank: 14 }, // Ace of Hearts
    { suit: 'diamonds', rank: 12 }, // Queen of Diamonds
  ];
  
  const bid = calculateBid(testHand);
  console.log('✅ Bid calculated:', bid);
} catch (error) {
  console.error('❌ Failed to calculate bid:', error);
}

// Test winner check
try {
  const matchScores = [320, 150, 200, 100];
  const winner = checkForWinner(matchScores);
  console.log('✅ Winner check:', winner === 0 ? 'Player 1 wins!' : 'No winner');
} catch (error) {
  console.error('❌ Failed to check winner:', error);
}

console.log('🎉 Game logic tests completed!');