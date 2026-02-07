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
    volume: 50,
    isMuted: false,
    currentScreen: 'selection'
};

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

    playMatch() {
        this.ensureContext();
        if (!this.context || this.getVolume() === 0) return;
        const now = this.context.currentTime;
        [523, 659, 784].forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.12);
            gain.gain.setValueAtTime(this.getVolume() * 0.3, now + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
            osc.connect(gain);
            gain.connect(this.context.destination);
            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 0.3);
        });
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
        this.ensureContext();
        if (!this.context || this.getVolume() === 0) return;
        const now = this.context.currentTime;
        const melody = [523, 587, 659, 784, 659, 784, 1047];
        melody.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.15);
            gain.gain.setValueAtTime(this.getVolume() * 0.3, now + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
            osc.connect(gain);
            gain.connect(this.context.destination);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.4);
        });
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
        lessonDiv.className = 'bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20';
        lessonDiv.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-xl font-extrabold">${lesson.name}</h3>
                <button onclick="toggleSelectAllLesson(${lesson.id})"
                        class="px-4 py-1.5 rounded-full bg-blue-500/60 hover:bg-blue-500/80 text-sm font-bold transition-all hover:scale-105 active:scale-95"
                        id="btn-select-all-${lesson.id}">
                    Select All
                </button>
            </div>
            <div class="flex flex-wrap gap-2" id="lesson-words-${lesson.id}">
                ${lesson.words.map(word => `
                    <label class="cursor-pointer select-none">
                        <input type="checkbox" class="hidden word-checkbox" data-lesson="${lesson.id}" data-word="${word}"
                               onchange="handleWordToggle(this)">
                        <span class="inline-block px-4 py-2 rounded-full text-base font-bold transition-all
                                     bg-white/10 hover:bg-white/20 border-2 border-transparent
                                     hover:scale-105 active:scale-95"
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

function updateWordCount() {
    const count = gameState.selectedWords.size;
    document.getElementById('word-count').textContent = count;

    const sizeEl = document.getElementById('game-size');
    const startBtn = document.getElementById('btn-start-game');

    if (count === 0) {
        sizeEl.textContent = 'No Words';
        sizeEl.className = 'bg-white/20 backdrop-blur rounded-full px-5 py-2 font-bold text-lg';
        startBtn.disabled = true;
    } else if (count <= 8) {
        sizeEl.textContent = `Small Game (${count} words)`;
        sizeEl.className = 'bg-green-500/40 backdrop-blur rounded-full px-5 py-2 font-bold text-lg';
        startBtn.disabled = false;
    } else if (count <= 12) {
        sizeEl.textContent = `Medium Game (${count} words)`;
        sizeEl.className = 'bg-yellow-500/40 backdrop-blur rounded-full px-5 py-2 font-bold text-lg';
        startBtn.disabled = false;
    } else {
        sizeEl.textContent = `Large Game (${count} words)`;
        sizeEl.className = 'bg-red-500/40 backdrop-blur rounded-full px-5 py-2 font-bold text-lg';
        startBtn.disabled = false;
    }
}

// --- Game Setup ---
function startGame() {
    if (gameState.selectedWords.size === 0) return;

    AudioSystem.ensureContext();

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
                <div class="card-front bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg border-2 border-white/30 flex flex-col items-center justify-center p-2">
                    <div class="text-2xl md:text-3xl font-extrabold text-white/30 tracking-widest">SS</div>
                    <div class="text-[10px] md:text-xs text-white/40 mt-1 font-semibold">Spelling Success</div>
                </div>
                <div class="card-back bg-gradient-to-br from-white to-gray-100 shadow-lg border-2 border-blue-300 flex items-center justify-center p-2">
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
            back1.classList.remove('bg-gradient-to-br', 'from-white', 'to-gray-100', 'border-blue-300');
            back1.classList.add('bg-gradient-to-br', 'from-green-200', 'to-emerald-300', 'border-green-400');
            back2.classList.remove('bg-gradient-to-br', 'from-white', 'to-gray-100', 'border-blue-300');
            back2.classList.add('bg-gradient-to-br', 'from-green-200', 'to-emerald-300', 'border-green-400');

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

function updateTurnIndicator() {
    const turnText = document.getElementById('turn-text');
    const player1Card = document.getElementById('player1-card');
    const player2Card = document.getElementById('player2-card');
    const playerName = document.getElementById(`player${gameState.currentPlayer}-name`).value || `Player ${gameState.currentPlayer}`;

    turnText.textContent = `It is ${playerName}'s turn`;

    if (gameState.currentPlayer === 1) {
        player1Card.classList.add('ring-4', 'ring-cyan-400', 'shadow-lg', 'shadow-cyan-400/30');
        player2Card.classList.remove('ring-4', 'ring-orange-400', 'shadow-lg', 'shadow-orange-400/30');
    } else {
        player2Card.classList.add('ring-4', 'ring-orange-400', 'shadow-lg', 'shadow-orange-400/30');
        player1Card.classList.remove('ring-4', 'ring-cyan-400', 'shadow-lg', 'shadow-cyan-400/30');
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

    if (score1 > score2) {
        winnerText.textContent = `${name1} Wins!`;
        winnerText.className = 'text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400';
    } else if (score2 > score1) {
        winnerText.textContent = `${name2} Wins!`;
        winnerText.className = 'text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-orange-300 to-yellow-400';
    } else {
        winnerText.textContent = "It's a Tie!";
        winnerText.className = 'text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-400';
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

// Close volume control when clicking outside
document.addEventListener('click', (e) => {
    const volumeControl = document.getElementById('volume-control');
    const audioBtn = document.getElementById('btn-audio');
    if (!volumeControl.contains(e.target) && !audioBtn.contains(e.target)) {
        volumeControl.classList.add('hidden');
    }
});

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
