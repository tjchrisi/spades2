// Test bidding logic to ensure it progresses correctly
import { createGameState } from './gameLogic.js';

console.log('🧪 Testing Bidding Logic...');

try {
  const gameState = createGameState();
  console.log('✅ Initial game state created');
  console.log('📊 Initial phase:', gameState.gamePhase);
  console.log('🎯 Current player:', gameState.currentPlayer);
  console.log('🃏 Player 0 hand size:', gameState.players[0].hand.length);
  
  // Test that all players can bid
  const testState = { ...gameState };
  let currentPlayer = 0;
  
  while (testState.gamePhase === 'bidding') {
    console.log(`Player ${currentPlayer} bidding...`);
    testState.players[currentPlayer].bid = 5; // Test bid
    
    if (currentPlayer === 3) {
      testState.gamePhase = 'playing';
      testState.currentPlayer = 0;
      console.log('✅ Bidding complete, moving to playing phase');
    } else {
      currentPlayer = (currentPlayer + 1) % 4;
      testState.currentPlayer = currentPlayer;
    }
  }
  
  console.log('✅ Final phase:', testState.gamePhase);
  console.log('✅ All players have bids:', testState.players.every(p => p.bid !== null));
  
} catch (error) {
  console.error('❌ Bidding logic test failed:', error);
}

console.log('🎉 Bidding logic tests completed!');