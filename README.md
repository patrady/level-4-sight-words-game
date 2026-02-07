# Level 4 Sight Words Matching Game

A two-player memory/matching card game for children ages 5–16 using Barton Reading & Spelling System Level 4 sight words. Built with vanilla HTML, CSS (Tailwind), and JavaScript.

## How to Play

1. **Select words** from one or more lessons (Lesson 1, 4, or 8)
2. **Start the game** — cards are shuffled and placed face-down
3. **Take turns** flipping two cards per turn to find matching word pairs
4. **Match a pair** to score a point and take another turn
5. **Win** by having the most points when all pairs are matched

## Features

- 42 sight words across 3 lessons with flexible word selection
- Small (≤8), Medium (9–12), and Large (13+) game sizes
- Editable player names
- 5 player colors (maroon, purple, green, orange, blue) changeable mid-game
- Sound effects for card flips, matches, mismatches, and victory
- Adjustable volume control
- Confetti celebration on victory
- Responsive design for mobile, tablet, and desktop

## Project Structure

```
├── index.html          # Main HTML structure and styles
├── js/
│   ├── data.js         # Lesson word data
│   ├── state.js        # Game state and player color system
│   ├── audio.js        # Sound effects (Web Audio API + MP3)
│   ├── confetti.js     # Confetti particle animation (Canvas API)
│   ├── ui.js           # Screen management, word selection, color picker, volume, restart
│   ├── board.js        # Game setup, board, card interaction, scoring, victory
│   └── main.js         # Initialization and global event listeners
└── plan.md             # Business requirements and development plan
```

## Tech Stack

- **HTML5** — semantic structure
- **Tailwind CSS** (CDN) — all styling
- **Vanilla JavaScript** — no frameworks or build tools
- **Web Audio API** — flip and mismatch sounds
- **HTML5 Audio** — match and victory MP3s
- **Canvas API** — confetti animation

## Running Locally

Serve the project directory with any static file server:

```bash
# Python
python3 -m http.server 8768

# Node.js
npx serve .
```

Then open `http://localhost:8768` in your browser.

## Attribution

- Copyright © by Janna Brenhaug. All rights reserved.
- This game assumes the student is being tutored using the Barton Reading & Spelling System.
- Units are used with prior written permission from Susan Barton.
