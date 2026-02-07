// ============================================================
// Initialization & Global Event Listeners
// ============================================================

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
