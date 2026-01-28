# 🏆 Spades Game - First to 300 Wins!

A complete implementation of 4-player individual Spades based on the classic HTML version, enhanced with modern React components and strategic AI opponents.

## 🎮 Game Features

- **Complete Spades Rules**: Full implementation of standard Spades gameplay
- **4 Player Individual**: Play against 3 AI opponents
- **300-Point Winning Condition**: First player to reach 300 points wins the match
- **Strategic AI Opponents**: Computer players with intelligent bidding and card play
- **Maximum Card Visibility**: All cards are visible for optimal gameplay experience
- **Multiple Rounds**: Game continues until a player reaches 300 points
- **Responsive Design**: Works on desktop and mobile devices

## 🃏 Game Rules

### Bidding Phase
- Each player bids the number of tricks they expect to win (0-13)
- Players must follow suit if possible
- Spades are trump cards and beat all other suits

### Scoring
- Players score 10 points per trick won if they meet their bid
- Additional tricks (bags) score 1 point each
- Failing to meet bid results in negative score (bid × -10)
- First player to reach 300 points wins the match

### Card Play
- Player must follow the led suit if possible
- If unable to follow suit, may play any card
- Highest card of led suit wins, unless spades are played
- Highest spade wins if any spades are played

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd spades-game

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
npm run build
```

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── App.jsx         # Main application component
│   ├── Card.jsx        # Individual card component
│   ├── GameBoard.jsx   # Main game board
│   └── BiddingPhase.jsx # Bidding interface
├── utils/              # Game logic utilities
│   ├── deck.js         # Deck creation and shuffling
│   ├── spadesLogic.js  # Core Spades rules
│   ├── gameLogic.js    # Game state management
│   ├── aiLogic.js      # AI opponent logic
│   └── gameLogic.test.js # Basic tests
├── App.css             # Main styling
└── main.jsx            # Application entry point
```

## 🎯 How to Play

1. **Start Game**: Click "Start New Game" to begin
2. **Bidding**: Enter your bid (0-13 tricks) based on your hand strength
3. **Card Play**: Click a card to select it, then click again to play it
4. **Follow Rules**: You must follow suit if possible
5. **Win Tricks**: Try to win exactly the number of tricks you bid
6. **Reach 300**: First player to 300 points wins the match!

## 🤖 AI Opponents

The game features 3 AI opponents with strategic gameplay:
- **Intelligent Bidding**: AI calculates bids based on hand strength
- **Strategic Card Play**: AI considers trump cards, following suit, and winning/losing strategies
- **Adaptive Gameplay**: AI adjusts play based on current game state and bid requirements

## 🎨 Styling

The game features a rich, card-table aesthetic with:
- Green felt background reminiscent of casino tables
- Golden accents for premium feel
- Card animations and hover effects
- Responsive design for all screen sizes
- Maximum card visibility for optimal gameplay

## 🧪 Testing

Basic game logic tests are included:
```bash
node src/utils/gameLogic.test.js
```

## 🛠️ Technologies Used

- **React 18** - Modern UI framework
- **Vite** - Fast build tool and development server
- **JavaScript ES6+** - Modern JavaScript features
- **CSS3** - Advanced styling and animations

## 🎮 Game Flow

1. **Setup**: Cards are shuffled and dealt to 4 players
2. **Bidding**: Each player bids tricks they expect to win
3. **Play**: Players take turns playing cards in tricks
4. **Scoring**: Points awarded based on bid accuracy
5. **Repeat**: Multiple rounds until someone reaches 300 points
6. **Victory**: Winner announced when 300 points reached

## 🌟 Enhanced Features vs HTML Version

- **Modern React Architecture**: Component-based design
- **Enhanced AI**: More sophisticated opponent logic
- **Better Styling**: Responsive design with modern CSS
- **Improved UX**: Smooth animations and interactions
- **Game State Management**: Robust state handling
- **Testing**: Basic test coverage for core logic

Enjoy playing Spades! 🃏✨