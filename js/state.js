// ============================================================
// Game State & Player Color System
// ============================================================

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
