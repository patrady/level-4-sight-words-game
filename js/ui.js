// ============================================================
// UI: Screen Management, Word Selection, Color Picker, Volume, Restart
// ============================================================

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

// --- Mobile Menu ---
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const openIcon = document.getElementById('hamburger-icon');
    const closeIcon = document.getElementById('hamburger-close-icon');
    const isOpen = !menu.classList.contains('hidden');

    menu.classList.toggle('hidden');
    openIcon.classList.toggle('hidden', !isOpen);
    closeIcon.classList.toggle('hidden', isOpen);
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
