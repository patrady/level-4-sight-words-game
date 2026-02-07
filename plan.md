# Level 4 Sight Words Matching Game - Business Requirements & Development Plan

## Executive Summary
A modern, interactive memory/matching card game designed for children ages 5-16 using Barton Reading & Spelling System Level 4 sight words. Built with vanilla HTML, CSS (Tailwind), and JavaScript with a vibrant, kid-friendly interface.

---

## Business Requirements

### Game Setup & Configuration

- Allow selection of word lists organized by lessons (Lesson 1, Lesson 4, Lesson 8, etc.)
- Provide "Select all" functionality to quickly choose all words from a specific lesson
- Support individual word selection/deselection via clickable checkboxes with visual feedback
- Display word count indicator showing number of selected words
- Provide "Clear Selection" button to deselect all chosen words
- Show game size classification based on word count (e.g., "Up to 8 words = Small Game", "9-12 words = Medium Game", "Large Game" for 13+ words)
- Include "Start New Game" button with engaging animation to begin gameplay with selected words
- Provide "Close Lessons Selector" option to exit word selection interface

### Player Configuration

- Support exactly 2 players
- Display editable player name fields (default: "Player 1 Name", "Player 2 Name") with fun, colorful styling
- Assign distinct color schemes to each player (Player 1: cyan/blue theme, Player 2: orange/yellow theme)
- Show real-time score tracking for both players with animated score updates
- Display current player's turn prominently with visual indicators (e.g., "It is Player 1's turn" with glowing/pulsing effect)
- Highlight active player's score card with border or glow effect

### Game Board & Cards

- Generate game board with pairs of matching word cards (14 pairs = 28 cards for "Large Game")
- Arrange cards in a responsive grid layout that takes up 90% of screen width
- Set maximum grid width to 2500px
- Ensure grid scales appropriately for all screen sizes (mobile, tablet, desktop)
- Display all cards face-down initially with branded "Spelling Success" logo
- Use modern card design with rounded corners, shadows, and hover effects
- Implement smooth flip animations when cards are clicked
- Randomize card positions at game start
- Support different card color states: face-down (gradient background), revealed with word text, and matched cards (celebratory styling)
- Maintain card aspect ratio and readability across all screen sizes
- Add tactile feedback (scale/bounce) on card hover and click

### Gameplay Mechanics

- Implement turn-based play alternating between two players
- Allow player to flip first card on their turn (card reveals word with animated flip)
- Allow player to flip second card on their turn
- Compare the two revealed cards for matching words
- **If cards match:** Keep cards revealed/removed with celebration animation, award point to current player, allow same player another turn
- **If cards don't match:** Flip both cards back face-down after brief display (1.5-2 seconds), switch turn to other player
- Prevent clicking on already-matched/removed cards
- Prevent clicking more than 2 cards per turn
- Track which cards have been successfully matched and remove them from play
- Add sound effects for card flips, matches, and mismatches (controllable via volume)
- Provide visual feedback for all interactions (button presses, card selections)

### Scoring System

- Initialize both players at 0 points
- Award 1 point per successful match to the player who made the match
- Display scores in real-time next to player names with animated number counting
- Update scores immediately when matches are made with celebratory animation
- Determine winner as player with highest score when all cards are matched

### Navigation & UI Elements

- Display "Level 4" header with modern typography and kid-friendly styling
- Provide "Directions" link that opens PDF at https://games.spellingsuccess.com/level4-sightwords/content/Directions_for_Online_Sight_Word_Matching_Games.pdf
- Provide "Words" link to return to word selection interface
- Include audio/volume control button in header with modern icon
- Show "Spelling Success" branding with logo throughout the game
- Display current game size indicator (e.g., "Large Game", "No Words")
- Use bright, engaging colors throughout the interface
- Implement smooth transitions between all screens/states

### Audio & Volume Controls

- Display audio button/icon in the game header with modern speaker icon
- When audio button is clicked, display a volume control interface with a range slider (modern, colorful design)
- Volume slider should allow adjustment from 0% (muted) to 100% (full volume)
- Apply volume changes to all game audio in real-time as slider is adjusted
- When volume slider reaches 0, automatically change audio icon to a "mute" icon
- When volume slider is moved above 0 from muted state, change icon back to standard audio/speaker icon
- Persist volume setting throughout the game session
- Allow volume control to be dismissed/closed after adjustment
- Provide visual feedback on current volume level with color gradient on slider

### End Game Conditions & Victory Screen

- Detect when all card pairs have been matched
- Trigger confetti animation that rains down from the top of the screen (colorful, animated particles)
- Display winner announcement in the center of the screen with animated text
- Implement font-size increasing animation for winner text (grows larger as it appears)
- Show winning player's name in the victory message with their theme color
- Handle tie scenario with "It's a Tie" message and both players' scores
- Display "Play Again" button below the victory message with engaging hover effect
- When "Play Again" is clicked, return to word selection screen to start a new game
- Maintain confetti animation during victory screen display
- Ensure victory screen is visually celebratory and engaging with modern design
- Add celebratory sound effect when victory screen appears

### Educational Content Requirements

- Source sight words from Barton Reading & Spelling System Level 4 curriculum
- Organize words by lesson numbers (Lesson 1, Lesson 4, Lesson 8, etc.)
- Include words appropriate for the educational level organized as follows:
  - **Lesson 1:** put, how, both, walk, once, none, two, pull, now, know, their, her, these, come
  - **Lesson 4:** very, sure, mother, brother, only, push, nothing, about, because, father, friend, full, busy, love
  - **Lesson 8:** our, please, month, change, people, which, through, gone, other, cover, strange, look, listen, right
- Display words clearly in readable, kid-friendly font on revealed cards (large, bold text)
- Use high contrast between text and background for accessibility

### Legal & Attribution

- Display copyright notice with dynamically generated current year: "Copyright © [Current Year] by Janna Brenhaug. All rights reserved."
- Include attribution: "This game assumes the student is being tutored using the Barton Reading & Spelling System"
- Note permission usage: "These units are used with prior written permission from Susan Barton"
- Display legal text in footer with subtle, non-intrusive styling

### Design & UX Requirements for Kids Ages 5-16

- Use **Tailwind CSS** for all styling (include via CDN)
- Implement bright, vibrant color palette with gradients
- Use large, rounded corners on all interactive elements
- Add playful micro-interactions (hover effects, click animations, bounce effects)
- Ensure text is large and easy to read (minimum 16px, larger for card text)
- Use sans-serif fonts that are clear and friendly (e.g., system fonts or web-safe fonts)
- Implement smooth transitions and animations throughout
- Add visual feedback for all interactions (buttons, cards, inputs)
- Use icons where appropriate to make interface intuitive
- Ensure high contrast for readability
- Make all touch targets at least 44x44px for mobile users
- Use gamification elements (progress indicators, celebrations, animations)
- Create distinct visual themes for each player (colors, patterns)
- Implement particle effects and celebrations to make wins exciting
- Use subtle shadows and depth to create modern, layered design

---

## Technical Requirements

### Core Technology Stack

- **Must be written in plain HTML, CSS, and vanilla JavaScript only**
- **Use Tailwind CSS via CDN for all styling** (no custom CSS compilation required)
- **Do not use any JavaScript frameworks or libraries** (no React, Vue, jQuery, etc.)
- **All functionality must be implemented using native browser APIs**

### Implementation Details

- Render game interface in web browser
- Support responsive card flip animations using CSS transitions/animations
- Handle click/touch interactions for card selection using native event listeners
- Maintain game state (card positions, revealed cards, scores, current turn) using JavaScript variables/objects
- Persist player names during game session using in-memory storage
- Support audio playback with variable volume control using HTML5 Audio API
- Implement volume slider UI component using HTML range input (styled with Tailwind)
- Handle audio icon state changes based on volume level using DOM manipulation
- Implement confetti particle animation system using Canvas API or CSS animations
- Support CSS animations for text scaling/growing effects using @keyframes
- Ensure responsive design works on mobile devices (phones, tablets) and desktop screens using Tailwind's responsive utilities
- Support grid layout that adapts to different viewport sizes while maintaining 90% width and 2500px max-width using Tailwind's grid system
- Open external PDF links in new tab/window using target="_blank" and rel="noopener noreferrer"
- Dynamically retrieve and display current year for copyright notice using JavaScript Date object
- Use Tailwind utility classes for all styling (colors, spacing, typography, animations)
- Implement all game logic using vanilla JavaScript (ES6+ syntax)
- Use semantic HTML5 elements for proper document structure
- Ensure cross-browser compatibility for modern browsers (Chrome, Firefox, Safari, Edge)
- Optimize performance for smooth animations and interactions without external dependencies
- Include Tailwind CSS from CDN (https://cdn.tailwindcss.com)

### Responsive Design Specifications

- Game board grid: 90% of viewport width
- Maximum grid width: 2500px
- Grid should center on screen when below maximum width
- Cards should resize proportionally to fit grid at all screen sizes
- Maintain readable text size on cards across all devices (use Tailwind's responsive text utilities)
- Ensure touch targets are appropriately sized for mobile devices (minimum 44x44px)
- Victory screen and confetti animation should work across all screen sizes
- Use Tailwind breakpoints (sm, md, lg, xl, 2xl) for responsive behavior
- Stack player info vertically on mobile, horizontally on desktop
- Adjust card grid columns based on screen size (e.g., 3 cols on mobile, 6 on tablet, 9 on desktop)

### Performance & Optimization

- Minimize DOM manipulation for better performance
- Use CSS transforms for animations (hardware accelerated)
- Implement efficient event delegation where possible
- Optimize confetti animation to not block UI thread
- Ensure game remains responsive during all animations
- Lazy-load audio files if needed

---

## Development Plan & Agent Architecture

### Phase 1: Project Setup & Foundation (Claude Sonnet 4)
**Agent:** Main Development Agent  
**Model:** Claude Sonnet 4 (for balanced reasoning and code generation)  
**Context Window:** Full requirements document

**Tasks:**
1. Create initial HTML structure with semantic elements
2. Include Tailwind CSS CDN in `<head>`
3. Set up basic page layout (header, main content area, footer)
4. Implement legal/attribution footer with dynamic year
5. Create placeholder sections for all main screens (word selection, game board, victory screen)
6. Set up basic JavaScript file structure with game state management
7. Implement navigation between screens (word selection ↔ game board ↔ victory)

**Deliverables:**
- `index.html` - Main HTML structure
- `styles.css` - Any custom CSS overrides (minimal, if needed beyond Tailwind)
- `game.js` - Main game logic file with state management skeleton

---

### Phase 2: Word Selection Interface (Claude Sonnet 4)
**Agent:** UI Development Agent  
**Model:** Claude Sonnet 4  
**Context:** Phase 1 deliverables + word selection requirements

**Tasks:**
1. Create lesson containers with checkboxes for all words
2. Implement "Select All" functionality for each lesson
3. Create "Clear Selection" button
4. Build word count indicator with real-time updates
5. Display game size classification (Small/Medium/Large)
6. Style with Tailwind for kid-friendly appearance (bright colors, large buttons, rounded corners)
7. Implement "Start New Game" and "Close Lessons Selector" buttons
8. Add hover effects and micro-interactions
9. Make responsive for all screen sizes

**Deliverables:**
- Word selection UI component (HTML)
- Word selection logic (JavaScript)
- Lesson data structure with all sight words organized by lesson

---

### Phase 3: Game Board & Card System (Claude Opus 4.5)
**Agent:** Game Mechanics Agent  
**Model:** Claude Opus 4.5 (for complex game logic and state management)  
**Context:** Phase 1-2 deliverables + game board requirements

**Tasks:**
1. Create responsive card grid system using Tailwind Grid
2. Implement card flip animations (CSS transforms + transitions)
3. Build card state management (face-down, revealed, matched)
4. Create card randomization algorithm for game start
5. Implement turn-based logic (player alternation)
6. Build match detection algorithm
7. Handle card reveal/hide timing
8. Prevent invalid clicks (already matched, too many cards)
9. Style cards with modern design (gradients, shadows, rounded corners)
10. Add hover and click effects for interactivity
11. Implement responsive grid that scales properly (90% width, max 2500px)
12. Add visual indicators for current player's turn

**Deliverables:**
- Game board UI component
- Card flip animation system
- Core game logic (matching, turns, validation)
- Card state management system

---

### Phase 4: Player Management & Scoring (Claude Sonnet 4)
**Agent:** Scoring System Agent  
**Model:** Claude Sonnet 4  
**Context:** Phase 3 deliverables + player/scoring requirements

**Tasks:**
1. Create player info cards with editable name fields
2. Implement real-time score tracking
3. Build score update animations (number counting, celebratory effects)
4. Create distinct visual themes for each player (colors, borders, glows)
5. Highlight active player's card with animation
6. Display "It is Player X's turn" message with styling
7. Implement score persistence during game session
8. Handle winner determination logic
9. Style with Tailwind using player-specific color schemes

**Deliverables:**
- Player UI components
- Score tracking system
- Player turn indicator with animations
- Winner determination logic

---

### Phase 5: Audio System & Volume Controls (Claude Haiku 4.5)
**Agent:** Audio Implementation Agent  
**Model:** Claude Haiku 4.5 (simpler, focused task)  
**Context:** Audio requirements only

**Tasks:**
1. Implement HTML5 Audio API integration
2. Create volume slider UI with Tailwind styling
3. Build volume control popup/modal
4. Implement mute/unmute icon switching
5. Add sound effects for:
   - Card flip
   - Successful match
   - Failed match
   - Victory/celebration
6. Connect volume slider to audio playback
7. Persist volume setting in memory
8. Style volume controls for kid-friendly appearance

**Deliverables:**
- Audio system with HTML5 Audio API
- Volume control UI component
- Sound effect integration
- Icon state management (mute/unmute)

---

### Phase 6: Victory Screen & Confetti Animation (Claude Sonnet 4)
**Agent:** Animation & Victory Agent  
**Model:** Claude Sonnet 4  
**Context:** Phase 4 deliverables + victory screen requirements

**Tasks:**
1. Create victory screen overlay with modern design
2. Implement confetti particle system using Canvas API
3. Build text scaling animation for winner announcement
4. Create "Play Again" button with hover effects
5. Handle tie scenario display
6. Integrate victory sound effect
7. Style victory screen with Tailwind (centered, vibrant, celebratory)
8. Implement smooth transitions to/from victory screen
9. Ensure confetti animation is performant across devices
10. Make victory screen responsive

**Deliverables:**
- Victory screen UI component
- Confetti animation system (Canvas API)
- Text animation for winner reveal
- Victory screen logic and transitions

---

### Phase 7: Responsive Design & Polish (Claude Sonnet 4)
**Agent:** UI/UX Polish Agent  
**Model:** Claude Sonnet 4  
**Context:** All previous deliverables + responsive requirements

**Tasks:**
1. Test and refine responsive behavior across all screen sizes
2. Implement Tailwind breakpoints for mobile, tablet, desktop
3. Adjust card grid columns based on viewport (3/6/9 columns)
4. Ensure all text is readable at all sizes
5. Verify touch targets meet 44x44px minimum
6. Add micro-interactions and hover effects throughout
7. Ensure consistent spacing and alignment with Tailwind utilities
8. Optimize animations for mobile performance
9. Test on multiple devices and browsers
10. Add accessibility improvements (ARIA labels, keyboard navigation)
11. Implement color contrast checks
12. Add smooth page transitions

**Deliverables:**
- Fully responsive application
- Cross-browser compatible code
- Accessibility enhancements
- Performance optimizations

---

### Phase 8: Integration & Testing (Claude Opus 4.5)
**Agent:** Integration & QA Agent  
**Model:** Claude Opus 4.5 (for complex debugging and integration)  
**Context:** All deliverables from Phases 1-7

**Tasks:**
1. Integrate all components into single cohesive application
2. Test complete user flows:
   - Word selection → Game play → Victory → Play again
   - Audio controls throughout gameplay
   - Player name editing and persistence
   - Scoring accuracy
3. Debug any integration issues
4. Verify all business requirements are met
5. Test edge cases (all matches, ties, minimum/maximum words)
6. Optimize code for performance
7. Remove any redundant code
8. Add code comments for maintainability
9. Verify legal/attribution text displays correctly
10. Final cross-browser testing

**Deliverables:**
- Fully integrated, tested application
- Bug-free gameplay
- Performance-optimized code
- Complete documentation

---

## Agent Coordination Strategy

### Primary Agent (Orchestrator)
- **Model:** Claude Opus 4.5
- **Role:** Coordinates all sub-agents, maintains overall project context, makes architectural decisions
- **Responsibilities:**
  - Review deliverables from each phase
  - Ensure consistency across components
  - Resolve integration conflicts
  - Make final decisions on implementation approaches

### Sub-Agent Model Selection Rationale

1. **Claude Opus 4.5** - Use for:
   - Complex game logic and state management (Phase 3)
   - Integration and debugging (Phase 8)
   - Situations requiring deep reasoning and complex problem-solving

2. **Claude Sonnet 4** - Use for:
   - Standard UI development (Phases 1, 2, 4, 6, 7)
   - Balanced code generation with good context retention
   - Most phases where quality and efficiency are both important

3. **Claude Haiku 4.5** - Use for:
   - Focused, simpler tasks (Phase 5 - Audio)
   - Fast iteration on well-defined problems
   - Cost optimization for straightforward implementations

### Context Management

- Each sub-agent receives:
  - Relevant business requirements section
  - Deliverables from prerequisite phases
  - Specific task list for their phase
  
- Orchestrator maintains:
  - Full requirements document
  - Complete codebase
  - Integration checklist
  - Cross-phase dependencies

### Handoff Protocol

1. Sub-agent completes phase deliverables
2. Orchestrator reviews against requirements
3. If approved, deliverables added to main codebase
4. Next sub-agent receives updated context
5. If revisions needed, sub-agent iterates with feedback

---

## File Structure

```
level4-sightwords/
├── index.html              # Main HTML file
├── game.js                 # Game logic and state management
├── audio.js                # Audio system (if separated)
├── animations.js           # Confetti and animation logic (if separated)
├── assets/
│   ├── logo.png           # Spelling Success logo
│   └── sounds/
│       ├── flip.mp3       # Card flip sound
│       ├── match.mp3      # Successful match sound
│       ├── nomatch.mp3    # Failed match sound
│       └── victory.mp3    # Victory celebration sound
└── README.md              # Documentation
```

---

## Success Criteria

The project is complete when:

✅ All business requirements are implemented  
✅ Game functions correctly across all major browsers  
✅ Responsive design works on mobile, tablet, and desktop  
✅ All animations are smooth and performant  
✅ Audio system works with volume control  
✅ Victory screen displays with confetti  
✅ Legal attribution displays with current year  
✅ Code is clean, commented, and maintainable  
✅ No external dependencies beyond Tailwind CDN  
✅ Kid-friendly design is vibrant and engaging  
✅ Application loads quickly and runs smoothly  

---

## Notes for Development Agent

- Prioritize user experience and visual appeal for kids
- Keep code simple and maintainable (vanilla JS)
- Use Tailwind utility classes extensively
- Test frequently on multiple devices
- Ensure all animations enhance, not hinder, gameplay
- Make the game fun and rewarding for young learners
- Follow semantic HTML best practices
- Implement keyboard navigation where applicable
- Ensure color contrast meets WCAG standards