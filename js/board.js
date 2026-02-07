// ============================================================
// Game Setup, Board, Card Interaction, Scoring, Victory
// ============================================================

// --- Game Setup ---
function startGame() {
    if (gameState.selectedWords.size === 0) return;
    AudioSystem.ensureContext();

    // Reset to default colors
    colorChoices[1] = 'blue';
    colorChoices[2] = 'orange';
    applyPlayerColor(1);
    applyPlayerColor(2);

    launchGame();
}

function launchGame() {
    const words = Array.from(gameState.selectedWords);
    const cardPairs = [];

    words.forEach((word, index) => {
        cardPairs.push({ id: index * 2, word, pairId: index });
        cardPairs.push({ id: index * 2 + 1, word, pairId: index });
    });

    // Shuffle cards (Fisher-Yates)
    for (let i = cardPairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    gameState.cards = cardPairs;
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.totalPairs = words.length;
    gameState.currentPlayer = 1;
    gameState.scores = { 1: 0, 2: 0 };
    gameState.isProcessing = false;

    updateScoreDisplay();
    updateTurnIndicator();
    updateGameSizeBadge();
    buildGameBoard();
    showScreen('game');
    window.scrollTo(0, 0);
}

function buildGameBoard() {
    const board = document.getElementById('game-board');
    const cardCount = gameState.cards.length;

    // Determine grid columns based on card count and screen size
    let cols;
    if (cardCount <= 8) cols = 4;
    else if (cardCount <= 12) cols = 4;
    else if (cardCount <= 18) cols = 6;
    else if (cardCount <= 28) cols = 7;
    else cols = 8;

    board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    board.innerHTML = '';

    gameState.cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card-container aspect-[4/3] min-h-[60px] cursor-pointer';
        cardEl.dataset.cardId = card.id;
        cardEl.dataset.pairId = card.pairId;
        cardEl.innerHTML = `
            <div class="card-inner" id="card-inner-${card.id}">
                <div class="card-front bg-indigo-500 shadow-lg border-2 border-white/30 flex flex-col items-center justify-center p-2">
                    <div class="text-xs md:text-sm font-extrabold text-white/40 tracking-wide text-center leading-tight">Spelling<br>Success</div>
                </div>
                <div class="card-back bg-white shadow-lg border-2 border-blue-300 flex items-center justify-center p-2">
                    <span class="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 text-center leading-tight">${card.word}</span>
                </div>
            </div>
        `;
        cardEl.addEventListener('click', () => handleCardClick(card.id));
        board.appendChild(cardEl);
    });

    // Responsive column adjustment
    updateGridColumns(cols);
}

function updateGridColumns(baseCols) {
    const board = document.getElementById('game-board');
    const width = window.innerWidth;

    let cols = baseCols;
    if (width < 480) {
        cols = Math.min(baseCols, 3);
    } else if (width < 768) {
        cols = Math.min(baseCols, 4);
    } else if (width < 1024) {
        cols = Math.min(baseCols, 6);
    }

    board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
}

function updateGameSizeBadge() {
    const badge = document.getElementById('game-size-badge');
    const count = gameState.totalPairs;
    if (count <= 8) badge.textContent = `Small Game - ${count} pairs`;
    else if (count <= 12) badge.textContent = `Medium Game - ${count} pairs`;
    else badge.textContent = `Large Game - ${count} pairs`;
}

// --- Card Interaction ---
function handleCardClick(cardId) {
    if (gameState.isProcessing) return;

    const card = gameState.cards.find(c => c.id === cardId);
    if (!card) return;

    // Prevent clicking already flipped or matched cards
    const cardInner = document.getElementById(`card-inner-${cardId}`);
    if (cardInner.classList.contains('flipped') || cardInner.classList.contains('matched')) return;

    // Prevent clicking more than 2 cards
    if (gameState.flippedCards.length >= 2) return;

    // Flip the card
    cardInner.classList.add('flipped');
    gameState.flippedCards.push(card);
    AudioSystem.playFlip();

    if (gameState.flippedCards.length === 2) {
        gameState.isProcessing = true;
        checkForMatch();
    }
}

function checkForMatch() {
    const [card1, card2] = gameState.flippedCards;

    if (card1.pairId === card2.pairId) {
        // Match found!
        setTimeout(() => {
            const inner1 = document.getElementById(`card-inner-${card1.id}`);
            const inner2 = document.getElementById(`card-inner-${card2.id}`);
            inner1.classList.add('matched');
            inner2.classList.add('matched');

            // Add matched styling
            const container1 = inner1.closest('.card-container');
            const container2 = inner2.closest('.card-container');
            container1.classList.add('matched');
            container2.classList.add('matched');

            // Update card back with matched appearance
            const back1 = inner1.querySelector('.card-back');
            const back2 = inner2.querySelector('.card-back');
            back1.classList.remove('bg-white', 'border-blue-300');
            back1.classList.add('bg-emerald-200', 'border-green-400');
            back2.classList.remove('bg-white', 'border-blue-300');
            back2.classList.add('bg-emerald-200', 'border-green-400');

            // Award point
            gameState.scores[gameState.currentPlayer]++;
            gameState.matchedPairs++;
            updateScoreDisplay();
            AudioSystem.playMatch();

            gameState.flippedCards = [];
            gameState.isProcessing = false;

            // Check for game end
            if (gameState.matchedPairs === gameState.totalPairs) {
                setTimeout(() => showVictory(), 800);
            }
            // Same player gets another turn (no switch)
        }, 500);
    } else {
        // No match
        setTimeout(() => {
            AudioSystem.playNoMatch();

            const inner1 = document.getElementById(`card-inner-${card1.id}`);
            const inner2 = document.getElementById(`card-inner-${card2.id}`);
            inner1.classList.remove('flipped');
            inner2.classList.remove('flipped');

            gameState.flippedCards = [];
            gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
            updateTurnIndicator();
            gameState.isProcessing = false;
        }, 1500);
    }
}

// --- Score & Turn Display ---
function updateScoreDisplay() {
    const score1El = document.getElementById('player1-score');
    const score2El = document.getElementById('player2-score');

    score1El.textContent = gameState.scores[1];
    score2El.textContent = gameState.scores[2];

    // Animate the score that changed
    const activeScoreEl = gameState.currentPlayer === 1 ? score1El : score2El;
    activeScoreEl.classList.remove('animate-score-pop');
    // Force reflow
    void activeScoreEl.offsetWidth;
    activeScoreEl.classList.add('animate-score-pop');
}

// Player card style classes for active/inactive states (dynamic based on color choices)
function getPlayerStyles() {
    const c1 = getPlayerColor(1);
    const c2 = getPlayerColor(2);
    return {
        1: {
            active: [c1.bg700, c1.border300, 'shadow-lg', c1.shadow],
            inactive: ['bg-white/5', c1.border400_30]
        },
        2: {
            active: [c2.bg700, c2.border300, 'shadow-lg', c2.shadow],
            inactive: ['bg-white/5', c2.border400_30]
        }
    };
}

function updateTurnIndicator() {
    const turnText = document.getElementById('turn-text');
    const player1Card = document.getElementById('player1-card');
    const player2Card = document.getElementById('player2-card');
    const playerName = document.getElementById(`player${gameState.currentPlayer}-name`).value || `Player ${gameState.currentPlayer}`;

    turnText.textContent = `It is ${playerName}'s turn`;

    const styles = getPlayerStyles();

    // Remove all dynamic styles first
    const allStyles = [...styles[1].active, ...styles[1].inactive, ...styles[2].active, ...styles[2].inactive];
    player1Card.classList.remove(...allStyles);
    player2Card.classList.remove(...allStyles);

    // Also remove all possible color classes to avoid stale styles from previous color choices
    const allColorClasses = Object.values(PLAYER_COLORS).flatMap(c => [c.bg700, c.border300, c.shadow, c.border400_30]);
    player1Card.classList.remove(...allColorClasses, 'bg-white/5', 'shadow-lg');
    player2Card.classList.remove(...allColorClasses, 'bg-white/5', 'shadow-lg');

    if (gameState.currentPlayer === 1) {
        player1Card.classList.add(...styles[1].active);
        player2Card.classList.add(...styles[2].inactive);
    } else {
        player2Card.classList.add(...styles[2].active);
        player1Card.classList.add(...styles[1].inactive);
    }
}

// --- Victory ---
function showVictory() {
    const score1 = gameState.scores[1];
    const score2 = gameState.scores[2];
    const name1 = document.getElementById('player1-name').value || 'Player 1';
    const name2 = document.getElementById('player2-name').value || 'Player 2';

    const winnerText = document.getElementById('winner-text');
    const scoresText = document.getElementById('victory-scores');

    const c1 = getPlayerColor(1);
    const c2 = getPlayerColor(2);

    if (score1 > score2) {
        winnerText.textContent = `${name1} Wins!`;
        winnerText.className = `text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg ${c1.text300}`;
    } else if (score2 > score1) {
        winnerText.textContent = `${name2} Wins!`;
        winnerText.className = `text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg ${c2.text300}`;
    } else {
        winnerText.textContent = "It's a Tie!";
        winnerText.className = 'text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg text-pink-300';
    }

    const pts1 = score1 === 1 ? 'point' : 'points';
    const pts2 = score2 === 1 ? 'point' : 'points';
    scoresText.innerHTML = `
        <span class="inline-block px-4 py-1.5 rounded-full text-lg md:text-2xl font-bold ${c1.bg700} ${c1.text300} border ${c1.border300}">${name1}: ${score1} ${pts1}</span>
        <span class="text-xl md:text-2xl font-bold text-white/70">vs</span>
        <span class="inline-block px-4 py-1.5 rounded-full text-lg md:text-2xl font-bold ${c2.bg700} ${c2.text300} border ${c2.border300}">${name2}: ${score2} ${pts2}</span>
    `;

    showScreen('victory');
    ConfettiSystem.init();
    ConfettiSystem.start();
    AudioSystem.playVictory();
}

function playAgain() {
    ConfettiSystem.stop();
    showScreen('selection');
}
