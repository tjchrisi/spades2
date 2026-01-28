
# -*- coding: utf-8 -*-
"""
Cutthroat Spades (4 players, no teams)

Terminal game: 1 human vs 3 bots. Spades are trump, standard 52-card deck.

Rules implemented:
- 4 players, individual (no partnerships).
- Each round: 13 tricks.
- Bidding: integer bids (0..13). Optional Nil and Blind Nil (disabled by default).
- Scoring: 10x bid if you make your bid; -10x bid if you miss. Each overtrick = 1 bag.
  Every 10 bags = -100 penalty. (Classic cutthroat style.)
- Spades cannot be led until broken (a spade has been played to a non-spade lead), unless
  the leader has only spades.
- Must follow suit if possible. Highest of led suit wins unless spade(s) are played;
  highest spade wins. Card order: A>K>Q>J>10..2.
- First to TARGET_SCORE wins (default 200).

Author: M365 Copilot
"""
from __future__ import annotations
import random
import sys
from typing import List, Tuple, Optional

# ------------------------------ CONFIGURATION ------------------------------ #
TARGET_SCORE = 200          # points to win the game
ALLOW_NIL = False           # allow Nil bids (+100 on success, -100 on fail)
ALLOW_BLIND_NIL = False     # allow Blind Nil (before looking at hand). Not enabled in this UI.
SHOW_BOT_THINKING = False   # print extra info from bot decisions

# ------------------------------ CARD MODEL -------------------------------- #
SUITS = ['♠', '♥', '♦', '♣']
RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
RANK_VALUE = {r:i for i,r in enumerate(RANKS)}  # 2 lowest, A highest

Card = Tuple[str, str]  # (suit, rank)

def card_str(card: Card) -> str:
    s, r = card
    return f"{r}{s}"

def sort_hand(hand: List[Card]) -> List[Card]:
    # Sort by suit (♠, ♥, ♦, ♣) then by rank ascending
    suit_order = {s:i for i,s in enumerate(SUITS)}
    return sorted(hand, key=lambda c: (suit_order[c[0]], RANK_VALUE[c[1]]))

def beats(c1: Card, c2: Card, led_suit: str) -> bool:
    """Return True if c1 beats c2 in a trick where led_suit was led. Spades trump."""
    s1, r1 = c1
    s2, r2 = c2
    if s1 == '♠' and s2 != '♠':
        return True
    if s1 == '♠' and s2 == '♠':
        return RANK_VALUE[r1] > RANK_VALUE[r2]
    if s1 == led_suit and s2 == led_suit:
        return RANK_VALUE[r1] > RANK_VALUE[r2]
    if s1 == led_suit and s2 != led_suit and s2 != '♠':
        return True
    # Otherwise c1 doesn't beat c2
    return False

# ------------------------------ DECK -------------------------------------- #
class Deck:
    def __init__(self):
        self.cards: List[Card] = [(s, r) for s in SUITS for r in RANKS]

    def shuffle(self):
        random.shuffle(self.cards)

    def deal(self, players: List['Player']):
        assert len(players) == 4
        self.shuffle()
        for p in players:
            p.hand.clear()
            p.tricks_won = 0
        # 13 cards each
        for i in range(13):
            for p in players:
                p.hand.append(self.cards.pop())
        for p in players:
            p.hand = sort_hand(p.hand)

# ------------------------------ PLAYER ------------------------------------ #
class Player:
    def __init__(self, name: str, is_human: bool=False):
        self.name = name
        self.is_human = is_human
        self.hand: List[Card] = []
        self.bid: int = 0
        self.tricks_won: int = 0
        self.score: int = 0
        self.bags: int = 0
        self.last_bid_nil: bool = False

    def has_suit(self, suit: str) -> bool:
        return any(s == suit for s,_ in self.hand)

    def legal_moves(self, led_suit: Optional[str], spades_broken: bool) -> List[Card]:
        if led_suit is None:
            # Lead: cannot lead spades unless broken or only spades
            if spades_broken or all(s == '♠' for s,_ in self.hand):
                return list(self.hand)
            else:
                return [c for c in self.hand if c[0] != '♠'] or list(self.hand)
        else:
            # Must follow suit if possible
            follow = [c for c in self.hand if c[0] == led_suit]
            return follow if follow else list(self.hand)

    def remove_card(self, card: Card):
        self.hand.remove(card)

    # ---------------- BOT LOGIC ---------------- #
    def bot_bid(self) -> int:
        # Simple heuristic: count spades and high cards
        spades = [c for c in self.hand if c[0] == '♠']
        other = [c for c in self.hand if c[0] != '♠']
        score = 0.0
        # Spades value
        for s,r in spades:
            if r == 'A': score += 1.2
            elif r == 'K': score += 1.0
            elif r == 'Q': score += 0.8
            elif r == 'J': score += 0.6
            else: score += 0.3
        # Other suits: A/K strong if shortness exists
        suit_counts = {s:0 for s in SUITS}
        for s,_ in self.hand:
            suit_counts[s] += 1
        for s,r in other:
            base = 0.0
            if r == 'A': base = 0.7
            elif r == 'K': base = 0.5
            elif r == 'Q': base = 0.3
            # Short suit bonus (more likely to trump)
            if suit_counts[s] <= 2:
                base += 0.3
            score += base
        # Clamp and adjust
        est = int(round(score))
        # Avoid extremes
        est = max(1, min(est, 7))
        if SHOW_BOT_THINKING:
            print(f"    [AI {self.name}] bid heuristic score={score:.2f} -> bid {est}")
        return est

    def bot_play(self, led_suit: Optional[str], spades_broken: bool, trick_cards: List[Card]) -> Card:
        legal = self.legal_moves(led_suit, spades_broken)
        # Strategy:
        # - If following suit: play lowest card of that suit unless needed to win (if currently losing)
        # - If can't follow:
        #     - If holding spades: play lowest spade to try to win if valuable
        #     - Else discard highest of longest suit
        def lowest(cards: List[Card]) -> Card:
            return sorted(cards, key=lambda c: RANK_VALUE[c[1]])[0]
        def highest(cards: List[Card]) -> Card:
            return sorted(cards, key=lambda c: RANK_VALUE[c[1]], reverse=True)[0]

        # Follow suit if possible
        if led_suit is not None:
            follow = [c for c in legal if c[0] == led_suit]
            if follow:
                # See current winning card
                current = trick_cards[0]
                winner = current
                for c in trick_cards[1:]:
                    if beats(c, winner, led_suit):
                        winner = c
                # Try to beat if we can with minimal card
                beating = [c for c in follow if beats(c, winner, led_suit)]
                if beating:
                    # play the smallest card that still wins
                    choice = sorted(beating, key=lambda c: RANK_VALUE[c[1]])[0]
                else:
                    choice = lowest(follow)
                return choice
        # Can't follow: consider trumping
        spades = [c for c in legal if c[0] == '♠']
        if spades:
            # Play lowest spade
            return lowest(spades)
        # Otherwise discard highest from longest suit
        suit_counts = {}
        for s,_ in self.hand:
            suit_counts[s] = suit_counts.get(s,0) + 1
        # pick legal card from suit with max count
        by_suit = {}
        for c in legal:
            by_suit.setdefault(c[0], []).append(c)
        longest_suit = max(by_suit.items(), key=lambda kv: len(kv[1]))[0]
        return highest(by_suit[longest_suit])

# ------------------------------ GAME -------------------------------------- #
class CutthroatSpadesGame:
    def __init__(self, player_names: Optional[List[str]] = None, human_index: int = 0):
        if player_names is None:
            player_names = ['You', 'Alex', 'Blake', 'Casey']
        self.players = [Player(n, is_human=(i==human_index)) for i,n in enumerate(player_names)]
        self.dealer_index = 0
        self.spades_broken = False

    def next_index(self, i: int) -> int:
        return (i + 1) % 4

    def run(self):
        print("\n=== Cutthroat Spades ===\n")
        print(f"First to {TARGET_SCORE} points wins.\n")
        round_no = 1
        while all(p.score < TARGET_SCORE for p in self.players):
            print(f"\n--- Round {round_no} ---")
            self.play_round()
            self.dealer_index = self.next_index(self.dealer_index)
            round_no += 1
        # Winner(s)
        max_score = max(p.score for p in self.players)
        winners = [p for p in self.players if p.score == max_score]
        if len(winners) == 1:
            print(f"\nWinner: {winners[0].name} with {winners[0].score} points!")
        else:
            names = ', '.join(p.name for p in winners)
            print(f"\nTie between {names} at {max_score} points!")

    def play_round(self):
        # Deal
        deck = Deck()
        deck.deal(self.players)
        self.spades_broken = False
        # Bidding
        print("\nBidding phase:")
        for i in range(4):
            idx = (self.dealer_index + 1 + i) % 4
            p = self.players[idx]
            if p.is_human:
                self.prompt_human_bid(p)
            else:
                p.bid = p.bot_bid()
            p.last_bid_nil = (ALLOW_NIL and p.bid == 0)
            print(f"- {p.name} bids {p.bid}")
        # Play 13 tricks
        leader = self.next_index(self.dealer_index)
        for trick_no in range(1, 14):
            print(f"\nTrick {trick_no}")
            leader = self.play_trick(leader)
            # show current trick totals
            for p in self.players:
                print(f"  {p.name}: tricks={p.tricks_won}")
        # Scoring
        print("\nScoring:")
        for p in self.players:
            self.score_player(p)
        self.show_scoreboard()

    def prompt_human_bid(self, player: Player):
        print("\nYour hand:")
        self.show_hand(player)
        while True:
            try:
                if ALLOW_NIL:
                    raw = input("Enter your bid (0-13): ")
                else:
                    raw = input("Enter your bid (1-13): ")
                bid = int(raw)
                if not ALLOW_NIL and bid == 0:
                    print("Nil is disabled in this game.")
                    continue
                if bid < 0 or bid > 13:
                    print("Bid must be between 0 and 13.")
                    continue
                player.bid = bid
                return
            except ValueError:
                print("Please enter a whole number.")

    def show_hand(self, player: Player):
        # Group by suit
        grouped = {s: [] for s in SUITS}
        for c in sort_hand(player.hand):
            grouped[c[0]].append(c)
        for s in SUITS:
            cards = ' '.join(card_str(c) for c in grouped[s])
            print(f"  {s}: {cards}")

    def play_trick(self, leader_index: int) -> int:
        trick_cards: List[Card] = []
        trick_play_order = []
        led_suit: Optional[str] = None

        for offset in range(4):
            idx = (leader_index + offset) % 4
            p = self.players[idx]
            print(f"\n{p.name}'s turn")
            if p.is_human:
                card = self.prompt_human_play(p, led_suit)
            else:
                card = p.bot_play(led_suit, self.spades_broken, trick_cards)
                print(f"  {p.name} plays {card_str(card)}")
            # Validate spade breaking on lead
            if led_suit is None and card[0] == '♠':
                if not self.spades_broken:
                    # Only allowed if player has only spades
                    if all(s == '♠' for s,_ in p.hand):
                        pass
                    else:
                        # If illegal selection came from human, we already filtered legal_moves.
                        # For bots, ensure compliance by choosing a non-spade card.
                        if not p.is_human:
                            legal = p.legal_moves(None, self.spades_broken)
                            non_spades = [c for c in legal if c[0] != '♠']
                            if non_spades:
                                card = sorted(non_spades, key=lambda c: RANK_VALUE[c[1]])[0]
                                print(f"  (Spades not broken; AI changes to {card_str(card)})")
            # Apply play
            p.remove_card(card)
            trick_play_order.append(idx)
            trick_cards.append(card)
            if led_suit is None:
                led_suit = card[0]
            if card[0] == '♠' and led_suit != '♠':
                self.spades_broken = True
        # Determine winner
        winner_idx = trick_play_order[0]
        winning_card = trick_cards[0]
        for pos in range(1,4):
            idx = trick_play_order[pos]
            c = trick_cards[pos]
            if beats(c, winning_card, led_suit):
                winner_idx = idx
                winning_card = c
        winner = self.players[winner_idx]
        winner.tricks_won += 1
        print(f"\nTrick taken by {winner.name} with {card_str(winning_card)}")
        return winner_idx

    def prompt_human_play(self, player: Player, led_suit: Optional[str]) -> Card:
        legal = player.legal_moves(led_suit, self.spades_broken)
        # Show hand with indices, highlighting legal moves
        print("Your hand:")
        hand_sorted = sort_hand(player.hand)
        for i, c in enumerate(hand_sorted):
            mark = "*" if c in legal else " "
            print(f"  [{i}] {card_str(c)}{mark}")
        print("  * indicates a legal play")
        while True:
            raw = input("Choose card index to play: ")
            try:
                idx = int(raw)
                if idx < 0 or idx >= len(hand_sorted):
                    print("Index out of range.")
                    continue
                choice = hand_sorted[idx]
                if choice not in legal:
                    print("That card is not a legal move. You must follow suit if possible, and cannot lead spades until broken.")
                    continue
                print(f"  You play {card_str(choice)}")
                return choice
            except ValueError:
                print("Please enter a whole number index.")

    def score_player(self, p: Player):
        # Nil scoring override if enabled
        if ALLOW_NIL and p.last_bid_nil:
            if p.tricks_won == 0:
                p.score += 100
                print(f"- {p.name}: Nil successful (+100) -> score {p.score}")
            else:
                p.score -= 100
                print(f"- {p.name}: Nil failed (-100) -> score {p.score}")
        else:
            if p.tricks_won >= p.bid:
                over = p.tricks_won - p.bid
                p.score += 10 * p.bid
                p.bags += over
                print(f"- {p.name}: made bid {p.bid} (+{10*p.bid}), overtricks={over} (bags now {p.bags}) -> score {p.score}")
            else:
                p.score -= 10 * p.bid
                print(f"- {p.name}: missed bid {p.bid} (-{10*p.bid}) -> score {p.score}")
        # Bag penalty
        while p.bags >= 10:
            p.bags -= 10
            p.score -= 100
            print(f"  Bag penalty: -100 (bags reduced to {p.bags}) -> score {p.score}")
        # Reset tricks for next round
        p.tricks_won = 0

    def show_scoreboard(self):
        print("\nScoreboard:")
        for p in self.players:
            print(f"  {p.name}: {p.score} (bags {p.bags})")

# ------------------------------ MAIN -------------------------------------- #
if __name__ == '__main__':
    # Optional: allow setting human seat via command line arg (0-3)
    # Usage: python spades_cutthroat.py [human_index]
    human_index = 0
    if len(sys.argv) >= 2:
        try:
            idx = int(sys.argv[1])
            if 0 <= idx <= 3:
                human_index = idx
        except ValueError:
            pass
    game = CutthroatSpadesGame(human_index=human_index)
    game.run()
