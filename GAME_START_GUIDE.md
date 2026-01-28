# 🎮 Spades Game - Getting Started Guide

## Step 1: Start the Development Server

**Open your terminal/command prompt and navigate to the game folder:**
```bash
cd c:/Spades
npm run dev
```

**You'll see output like this:**
```
> tic-tac-toe@0.0.0 dev
> vite

  VITE v5.4.21  ready in 321 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## Step 2: Open the Game in Your Browser

**Open your web browser and go to:**
```
http://localhost:5173
```

## Step 3: Game Flow

### 1. Welcome Screen
- You'll see: "🏆 Spades - First to 300 Wins!"
- Click the green "🎯 Start New Game" button

### 2. Bidding Phase
- You'll see your 13 cards at the bottom
- Enter your bid (0-13) in the input field
- Click "🎯 Submit Bid" button
- Watch as AI opponents bid automatically

### 3. Game Play
- Your turn: Click a card to select it (it will highlight)
- Click the same card again to play it
- AI opponents play automatically after your turn
- Current trick shows in the center of the screen

### 4. Scoring & Winning
- Round scores display after each hand
- Match scores accumulate across rounds
- First player to reach 300 points wins!

## Step 4: Game Controls

**During Game:**
- **Clear Selection**: Click "Clear Selection" if you change your mind
- **New Game**: Click "🔄 New Game" to restart completely
- **Shuffle & Deal**: Click "🔀 Shuffle & Deal" for new hands (same game)

## 🎯 How to Play Spades

### Bidding Tips:
- Count your spades (trump cards)
- Count high cards (Aces, Kings, Queens)
- Bid realistically - you lose points if you don't make your bid!

### Card Play Rules:
- **Follow Suit**: You must play the same suit as the first card if you have it
- **Trump Cards**: Spades beat all other suits
- **Winning**: Highest card of led suit wins, unless spades are played
- **Strategy**: Try to win exactly your bid number

### Scoring:
- **Made Bid**: 10 points per bid trick + 1 point per extra trick
- **Missed Bid**: -10 points per bid trick (ouch!)
- **Winning**: First to 300 points wins the match

## 🛠️ Troubleshooting

**If the server doesn't start:**
```bash
# Check if node is installed
node --version

# Install dependencies
npm install

# Try again
npm run dev
```

**If the browser won't load:**
- Make sure the server is running (you should see the VITE output)
- Check that port 5173 is available
- Try a different browser or clear cache

**Game not working?**
- Check browser console for errors (F12)
- Ensure all files are in place
- Try refreshing the page

## 🎉 Enjoy Your Game!

The Spades game is now running in your browser. Play against 3 AI opponents and try to be the first to reach 300 points!