// ============================================================
// Level 4 Sight Words Matching Game
// ============================================================

// --- Lesson Data ---
const lessons = [
    {
        id: 1,
        name: "Lesson 1",
        words: ["put", "how", "both", "walk", "once", "none", "two", "pull", "now", "know", "their", "her", "these", "come"]
    },
    {
        id: 4,
        name: "Lesson 4",
        words: ["very", "sure", "mother", "brother", "only", "push", "nothing", "about", "because", "father", "friend", "full", "busy", "love"]
    },
    {
        id: 8,
        name: "Lesson 8",
        words: ["our", "please", "month", "change", "people", "which", "through", "gone", "other", "cover", "strange", "look", "listen", "right"]
    }
];

// --- Game State ---
const gameState = {
    selectedWords: new Set(),
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 0,
    currentPlayer: 1,
    scores: { 1: 0, 2: 0 },
    isProcessing: false,
    volume: 20,
    isMuted: false,
    currentScreen: 'selection'
};

// --- Player Color System ---
const PLAYER_COLORS = {
    maroon:  { bg700: 'bg-red-900',    bg500: 'bg-red-800',    border300: 'border-red-300',    border400_30: 'border-red-400/30',   shadow: 'shadow-red-400/40',    text300: 'text-red-300',    hex: '#7f1d1d' },
    purple:  { bg700: 'bg-purple-700',  bg500: 'bg-purple-500',  border300: 'border-purple-300',  border400_30: 'border-purple-400/30', shadow: 'shadow-purple-400/40',  text300: 'text-purple-300',  hex: '#7e22ce' },
    green:   { bg700: 'bg-green-700',   bg500: 'bg-green-500',   border300: 'border-green-300',   border400_30: 'border-green-400/30',  shadow: 'shadow-green-400/40',   text300: 'text-green-300',   hex: '#15803d' },
    orange:  { bg700: 'bg-orange-700',  bg500: 'bg-orange-500',  border300: 'border-orange-300',  border400_30: 'border-orange-400/30', shadow: 'shadow-orange-400/40',  text300: 'text-orange-300',  hex: '#c2410c' },
    blue:    { bg700: 'bg-cyan-700',    bg500: 'bg-cyan-500',    border300: 'border-cyan-300',    border400_30: 'border-cyan-400/30',   shadow: 'shadow-cyan-400/40',    text300: 'text-cyan-300',    hex: '#0e7490' }
};

const colorChoices = { 1: 'blue', 2: 'orange' };

function getPlayerColor(player) {
    return PLAYER_COLORS[colorChoices[player]];
}

// --- Audio System ---
const AudioSystem = {
    context: null,

    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    },

    ensureContext() {
        if (!this.context) this.init();
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    },

    getVolume() {
        if (gameState.isMuted) return 0;
        return gameState.volume / 100;
    },

    playTone(frequency, duration, type = 'sine', ramp = true) {
        this.ensureContext();
        if (!this.context || this.getVolume() === 0) return;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

        gainNode.gain.setValueAtTime(this.getVolume() * 0.3, this.context.currentTime);
        if (ramp) {
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
        }

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    },

    playFlip() {
        this.playTone(800, 0.1, 'sine');
    },

    matchSound: new Audio('https://games.spellingsuccess.com/level4-sightwords/gmgs/yay.mp3'),
    victorySound: new Audio('https://games.spellingsuccess.com/level4-sightwords/gmgs/cheers_v4.mp3'),

    playMatch() {
        if (this.getVolume() === 0) return;
        this.matchSound.volume = this.getVolume();
        this.matchSound.currentTime = 0;
        this.matchSound.play().catch(() => {});
    },

    playNoMatch() {
        this.ensureContext();
        if (!this.context || this.getVolume() === 0) return;
        const now = this.context.currentTime;
        [300, 250].forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now + i * 0.15);
            gain.gain.setValueAtTime(this.getVolume() * 0.15, now + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.2);
            osc.connect(gain);
            gain.connect(this.context.destination);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.2);
        });
    },

    playVictory() {
        if (this.getVolume() === 0) return;
        this.victorySound.volume = this.getVolume();
        this.victorySound.currentTime = 0;
        this.victorySound.play().catch(() => {});
    }
};

// --- Confetti System ---
const ConfettiSystem = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,
    running: false,

    init() {
        this.canvas = document.getElementById('confetti-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    start() {
        this.running = true;
        this.particles = [];
        const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6fff', '#ffa500', '#00d4ff', '#ff4757'];

        for (let i = 0; i < 150; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height - this.canvas.height,
                w: Math.random() * 10 + 5,
                h: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 3 + 2,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                wobble: Math.random() * 10,
                wobbleSpeed: Math.random() * 0.1 + 0.05
            });
        }
        this.animate();
    },

    stop() {
        this.running = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },

    animate() {
        if (!this.running) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            p.y += p.speed;
            p.rotation += p.rotationSpeed;
            p.x += Math.sin(p.y * p.wobbleSpeed) * p.wobble * 0.05;

            if (p.y > this.canvas.height + 20) {
                p.y = -20;
                p.x = Math.random() * this.canvas.width;
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            this.ctx.restore();
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }
};

// --- Screen Management ---
function showScreen(screen) {
    document.getElementById('screen-selection').classList.toggle('hidden', screen !== 'selection');
    document.getElementById('screen-game').classList.toggle('hidden', screen !== 'game');
    document.getElementById('screen-victory').classList.toggle('hidden', screen !== 'victory');
    gameState.currentScreen = screen;

    if (screen !== 'victory') {
        ConfettiSystem.stop();
    }
}

// --- Word Selection ---
function buildLessonUI() {
    const container = document.getElementById('lessons-container');
    container.innerHTML = '';

    lessons.forEach(lesson => {
        const lessonDiv = document.createElement('div');
        lessonDiv.className = 'bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 flex flex-col';
        lessonDiv.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-xl font-extrabold">${lesson.name}</h3>
                <button onclick="toggleSelectAllLesson(${lesson.id})"
                        class="px-4 py-1.5 rounded-full bg-blue-500/60 hover:bg-blue-500/80 text-sm font-bold transition-all hover:scale-105 active:scale-95"
                        id="btn-select-all-${lesson.id}">
                    Select All
                </button>
            </div>
            <div class="flex flex-col gap-1.5" id="lesson-words-${lesson.id}">
                ${lesson.words.map(word => `
                    <label class="cursor-pointer select-none">
                        <input type="checkbox" class="hidden word-checkbox" data-lesson="${lesson.id}" data-word="${word}"
                               onchange="handleWordToggle(this)">
                        <span class="block px-4 py-2 rounded-lg text-base font-bold transition-all
                                     bg-white/10 hover:bg-white/20 border-2 border-transparent
                                     hover:scale-[1.02] active:scale-95 text-center"
                              id="word-chip-${lesson.id}-${word}">
                            ${word}
                        </span>
                    </label>
                `).join('')}
            </div>
        `;
        container.appendChild(lessonDiv);
    });
}

function handleWordToggle(checkbox) {
    const word = checkbox.dataset.word;
    const lessonId = checkbox.dataset.lesson;
    const chip = document.getElementById(`word-chip-${lessonId}-${word}`);

    if (checkbox.checked) {
        gameState.selectedWords.add(word);
        chip.classList.remove('bg-white/10', 'border-transparent');
        chip.classList.add('bg-green-500/60', 'border-green-400', 'shadow-lg', 'shadow-green-500/20');
    } else {
        gameState.selectedWords.delete(word);
        chip.classList.add('bg-white/10', 'border-transparent');
        chip.classList.remove('bg-green-500/60', 'border-green-400', 'shadow-lg', 'shadow-green-500/20');
    }

    updateWordCount();
    updateSelectAllButton(parseInt(lessonId));
}

function toggleSelectAllLesson(lessonId) {
    const lesson = lessons.find(l => l.id === lessonId);
    const checkboxes = document.querySelectorAll(`.word-checkbox[data-lesson="${lessonId}"]`);
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
        handleWordToggle(cb);
    });
}

function updateSelectAllButton(lessonId) {
    const checkboxes = document.querySelectorAll(`.word-checkbox[data-lesson="${lessonId}"]`);
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    const btn = document.getElementById(`btn-select-all-${lessonId}`);
    btn.textContent = allChecked ? 'Deselect All' : 'Select All';
}

function clearAllSelections() {
    document.querySelectorAll('.word-checkbox').forEach(cb => {
        cb.checked = false;
        handleWordToggle(cb);
    });
}

function getGameSizeLabel(count) {
    if (count <= 8) return 'Small';
    if (count <= 12) return 'Medium';
    return 'Large';
}

function updateWordCount() {
    const count = gameState.selectedWords.size;

    const sizeEl = document.getElementById('game-size');
    const startBtn = document.getElementById('btn-start-game');
    const clearBtn = document.getElementById('btn-clear-selection');

    if (count === 0) {
        sizeEl.textContent = 'No words selected';
        startBtn.textContent = 'Start New Game';
        startBtn.disabled = true;
        clearBtn.disabled = true;
    } else {
        const sizeLabel = getGameSizeLabel(count);
        sizeEl.textContent = `${count} word${count === 1 ? '' : 's'} selected`;
        startBtn.textContent = `Start ${sizeLabel} Game`;
        startBtn.disabled = false;
        clearBtn.disabled = false;
    }
}

// --- Per-Player Color Picker Dialog ---
let activeColorPickerPlayer = null;

function togglePlayerColorPicker(player) {
    const dialog = document.getElementById('color-picker-dialog');
    const isOpen = !dialog.classList.contains('hidden') && activeColorPickerPlayer === player;

    if (isOpen) {
        closeColorPickerDialog();
        return;
    }

    activeColorPickerPlayer = player;
    const playerName = document.getElementById(`player${player}-name`).value || `Player ${player}`;
    document.getElementById('color-picker-subtitle').textContent = playerName;
    renderColorPickerOptions(player);
    dialog.classList.remove('hidden');
}

function closeColorPickerDialog() {
    document.getElementById('color-picker-dialog').classList.add('hidden');
    activeColorPickerPlayer = null;
}

function renderColorPickerOptions(player) {
    const container = document.getElementById('color-picker-options');
    container.innerHTML = '';
    const colorNames = Object.keys(PLAYER_COLORS);
    const otherPlayer = player === 1 ? 2 : 1;

    colorNames.forEach(colorName => {
        const color = PLAYER_COLORS[colorName];
        const isDisabled = colorChoices[otherPlayer] === colorName;
        const isSelected = colorChoices[player] === colorName;

        const btn = document.createElement('button');
        btn.className = `w-12 h-12 rounded-full border-4 transition-all ${
            isSelected ? 'border-gray-800 scale-110 ring-2 ring-gray-400' : 'border-transparent'
        } ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}`;
        btn.style.backgroundColor = color.hex;
        btn.disabled = isDisabled;
        btn.title = colorName.charAt(0).toUpperCase() + colorName.slice(1);

        if (!isDisabled) {
            btn.addEventListener('click', () => {
                colorChoices[player] = colorName;
                applyPlayerColor(player);
                closeColorPickerDialog();
            });
        }

        container.appendChild(btn);
    });
}

function applyPlayerColor(player) {
    const c = getPlayerColor(player);

    // Update badge
    const badge = document.getElementById(`player${player}-badge`);
    const allBgClasses = Object.values(PLAYER_COLORS).map(col => col.bg500);
    badge.classList.remove(...allBgClasses);
    badge.classList.add(c.bg500);

    // Update the small color button
    const colorBtn = document.getElementById(`player${player}-color-btn`);
    colorBtn.style.backgroundColor = c.hex;

    // Update player card border
    const card = document.getElementById(`player${player}-card`);
    card.className = card.className.replace(/border-\S+\/50/g, '').trim();
    card.classList.add(c.border400_30.replace('/30', '/50'));

    // Re-apply turn indicator styles
    updateTurnIndicator();
}

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

    scoresText.textContent = `${name1}: ${score1}  |  ${name2}: ${score2}`;

    showScreen('victory');
    ConfettiSystem.init();
    ConfettiSystem.start();
    AudioSystem.playVictory();
}

function playAgain() {
    ConfettiSystem.stop();
    showScreen('selection');
}

// --- Volume Controls ---
function toggleVolumeControl() {
    const control = document.getElementById('volume-control');
    control.classList.toggle('hidden');
}

function setVolume(value) {
    gameState.volume = parseInt(value);
    document.getElementById('volume-value').textContent = `${value}%`;

    const iconOn = document.getElementById('icon-audio-on');
    const iconOff = document.getElementById('icon-audio-off');

    if (parseInt(value) === 0) {
        gameState.isMuted = true;
        iconOn.classList.add('hidden');
        iconOff.classList.remove('hidden');
    } else {
        gameState.isMuted = false;
        iconOn.classList.remove('hidden');
        iconOff.classList.add('hidden');
    }
}

// Close volume control and color pickers when clicking outside
document.addEventListener('click', (e) => {
    const volumeControl = document.getElementById('volume-control');
    const audioBtn = document.getElementById('btn-audio');
    if (!volumeControl.contains(e.target) && !audioBtn.contains(e.target)) {
        volumeControl.classList.add('hidden');
    }

    // Close color picker dialog when clicking backdrop
    const colorDialog = document.getElementById('color-picker-dialog');
    if (e.target === colorDialog) {
        closeColorPickerDialog();
    }
});

// --- Restart Modal ---
function openRestartModal() {
    document.getElementById('restart-modal').classList.remove('hidden');
}

function closeRestartModal() {
    document.getElementById('restart-modal').classList.add('hidden');
}

function confirmRestart() {
    closeRestartModal();
    ConfettiSystem.stop();
    showScreen('selection');
}

// --- Responsive Grid on Resize ---
window.addEventListener('resize', () => {
    if (gameState.currentScreen === 'game' && gameState.cards.length > 0) {
        const cardCount = gameState.cards.length;
        let baseCols;
        if (cardCount <= 8) baseCols = 4;
        else if (cardCount <= 12) baseCols = 4;
        else if (cardCount <= 18) baseCols = 6;
        else if (cardCount <= 28) baseCols = 7;
        else baseCols = 8;
        updateGridColumns(baseCols);
    }
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('copyright-year').textContent = new Date().getFullYear();
    buildLessonUI();
    updateWordCount();
    showScreen('selection');
});
