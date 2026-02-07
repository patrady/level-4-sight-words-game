// ============================================================
// Audio System
// ============================================================

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
