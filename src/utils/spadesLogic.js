export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export const calculateTrickWinner = (trick, trumpSuit = 'spades') => {
  if (trick.length === 0) return null;
  
  const leadSuit = trick[0].suit;
  let winningCard = trick[0];
  let winningPlayer = 0;
  
  for (let i = 1; i < trick.length; i++) {
    const currentCard = trick[i];
    const isTrump = currentCard.suit === trumpSuit;
    const winningIsTrump = winningCard.suit === trumpSuit;
    
    if (isTrump && !winningIsTrump) {
      winningCard = currentCard;
      winningPlayer = i;
    } else if (isTrump && winningIsTrump) {
      if (currentCard.rank > winningCard.rank) {
        winningCard = currentCard;
        winningPlayer = i;
      }
    } else if (!winningIsTrump && currentCard.suit === leadSuit && winningCard.suit === leadSuit) {
      if (currentCard.rank > winningCard.rank) {
        winningCard = currentCard;
        winningPlayer = i;
      }
    }
  }
  
  return winningPlayer;
};

export const calculateRoundScore = (bids, tricksWon) => {
  const scores = { player0: 0, player1: 0, player2: 0, player3: 0 };
  
  for (let i = 0; i < 4; i++) {
    const bid = bids[i];
    const tricks = tricksWon[i];
    
    if (tricks >= bid) {
      scores[`player${i}`] = bid * 10 + (tricks - bid);
    } else {
      scores[`player${i}`] = -bid * 10;
    }
  }
  
  return scores;
};

export const getGameStatus = (scores, winningScore = 500) => {
  const playerScores = Object.values(scores);
  const maxScore = Math.max(...playerScores);
  
  if (maxScore >= winningScore) {
    const winnerIndex = playerScores.indexOf(maxScore);
    const playerNames = ['South', 'West', 'North', 'East'];
    return `${playerNames[winnerIndex]} Wins!`;
  }
  
  return 'Game in Progress';
};

export const isValidPlay = (card, hand, leadSuit, trumpSuit = 'spades') => {
  if (!leadSuit) return true;
  
  const hasLeadSuit = hand.some(c => c.suit === leadSuit);
  
  if (!hasLeadSuit) {
    return true;
  }
  
  return card.suit === leadSuit || (card.suit === trumpSuit && !hand.some(c => c.suit === leadSuit));
};