/* ----------------------------------------------------
   HAPPY BIRTHDAY AUDIO SEQUENCER
   ---------------------------------------------------- */

// Melody data: Happy Birthday in key of C
const FREQS = {
    'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
    'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99,
    'REST': 0
};

const NOTES = [
    // Phrase 1
    { pitch: 'G4', duration: 0.75 },
    { pitch: 'G4', duration: 0.25 },
    { pitch: 'A4', duration: 1.0 },
    { pitch: 'G4', duration: 1.0 },
    { pitch: 'C5', duration: 1.0 },
    { pitch: 'B4', duration: 2.0 },
    { pitch: 'REST', duration: 0.8 },
    
    // Phrase 2
    { pitch: 'G4', duration: 0.75 },
    { pitch: 'G4', duration: 0.25 },
    { pitch: 'A4', duration: 1.0 },
    { pitch: 'G4', duration: 1.0 },
    { pitch: 'D5', duration: 1.0 },
    { pitch: 'C5', duration: 2.0 },
    { pitch: 'REST', duration: 0.8 },
    
    // Phrase 3
    { pitch: 'G4', duration: 0.75 },
    { pitch: 'G4', duration: 0.25 },
    { pitch: 'G5', duration: 1.0 },
    { pitch: 'E5', duration: 1.0 },
    { pitch: 'C5', duration: 1.0 },
    { pitch: 'B4', duration: 1.0 },
    { pitch: 'A4', duration: 2.0 },
    { pitch: 'REST', duration: 0.8 },
    
    // Phrase 4
    { pitch: 'F5', duration: 0.75 },
    { pitch: 'F5', duration: 0.25 },
    { pitch: 'E5', duration: 1.0 },
    { pitch: 'C5', duration: 1.0 },
    { pitch: 'D5', duration: 1.0 },
    { pitch: 'C5', duration: 2.0 },
    { pitch: 'REST', duration: 2.0 }
];

let audioCtx = null;
let synthTimeoutId = null;
let currentNoteIndex = 0;
let isMusicPlaying = false;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playNote(freq, startTime, duration) {
    if (freq === 0) return;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.02);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
    
    const subOsc = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    subOsc.connect(subGain);
    subGain.connect(audioCtx.destination);
    
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(freq / 2, startTime);
    
    subGain.gain.setValueAtTime(0, startTime);
    subGain.gain.linearRampToValueAtTime(0.08, startTime + 0.04);
    subGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.02);
    
    subOsc.start(startTime);
    subOsc.stop(startTime + duration);
}

function playMelodyStep() {
    if (!isMusicPlaying) return;
    
    initAudio();
    const note = NOTES[currentNoteIndex];
    const tempo = 450;
    const noteDuration = note.duration * (tempo / 1000);
    
    playNote(FREQS[note.pitch], audioCtx.currentTime, noteDuration);
    
    currentNoteIndex = (currentNoteIndex + 1) % NOTES.length;
    synthTimeoutId = setTimeout(playMelodyStep, note.duration * tempo);
}

function startMusic() {
    initAudio();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    if (!isMusicPlaying) {
        isMusicPlaying = true;
        currentNoteIndex = 0;
        playMelodyStep();
        updateMusicButton(true);
    }
}

function stopMusic() {
    isMusicPlaying = false;
    if (synthTimeoutId) {
        clearTimeout(synthTimeoutId);
    }
    updateMusicButton(false);
}

function playBlowSound() {
    initAudio();
    if (!audioCtx) return;
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
}

function playCelebrationSound() {
    initAudio();
    if (!audioCtx) return;
    
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
        
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
    });
}

function updateMusicButton(isPlaying) {
    const playIcon = document.querySelector('.icon-play');
    const pauseIcon = document.querySelector('.icon-pause');
    if (isPlaying) {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
    } else {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    }
}


/* ----------------------------------------------------
   CANVAS CONFETTI PARTICLE SYSTEM
   ---------------------------------------------------- */
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let animationFrameId = null;
let isCelebrating = false;

const CONFETTI_COLORS = [
    '#ff4d6d', '#ff758f', '#ff85a1', '#f72585',
    '#7209b7', '#b794f4', '#3f37c9', '#4cc9f0',
    '#ffd166', '#ffb703', '#ffd819',
    '#4dadff', '#48cae4', '#00b4d8'
];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class ConfettiParticle {
    constructor(x, y, isExplosion = false) {
        this.x = x;
        this.y = y;
        this.size = {
            width: Math.random() * 8 + 6,
            height: Math.random() * 12 + 8
        };
        this.color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        
        if (isExplosion) {
            const angle = Math.random() * Math.PI + Math.PI;
            const speed = Math.random() * 14 + 6;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        } else {
            this.vx = Math.random() * 4 - 2;
            this.vy = Math.random() * 3 + 2;
        }
        
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
        
        this.wobble = Math.random() * 10;
        this.wobbleSpeed = Math.random() * 0.05 + 0.02;
        this.gravity = 0.22;
        this.drag = 0.97;
    }

    update() {
        this.vy += this.gravity;
        this.vx *= this.drag;
        this.vy *= this.drag;
        
        this.x += this.vx;
        this.y += this.vy;
        
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.5;
        
        this.rotation += this.rotationSpeed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size.width / 2, -this.size.height / 2, this.size.width, this.size.height);
        ctx.restore();
    }
}

function triggerExplosion() {
    const cakeRect = document.querySelector('.cake-wrapper').getBoundingClientRect();
    const startX = cakeRect.left + cakeRect.width / 2;
    const startY = cakeRect.top + cakeRect.height / 2;
    
    for (let i = 0; i < 160; i++) {
        particles.push(new ConfettiParticle(startX, startY, true));
    }
}

function updateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (isCelebrating && Math.random() < 0.25) {
        particles.push(new ConfettiParticle(Math.random() * canvas.width, -20, false));
    }
    
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        
        if (p.y > canvas.height + 20 || p.x < -20 || p.x > canvas.width + 20) {
            particles.splice(i, 1);
        }
    }
    
    animationFrameId = requestAnimationFrame(updateConfetti);
}

function startConfettiEngine() {
    if (!animationFrameId) {
        updateConfetti();
    }
}


/* ----------------------------------------------------
   INTERACTION LOGIC
   ---------------------------------------------------- */
const candles = document.querySelectorAll('.candle');
const cakeWrapper = document.querySelector('.cake-wrapper');
const greetingCard = document.getElementById('greeting-card');
const triggerBtn = document.getElementById('trigger-btn');
const giftSection = document.getElementById('gift-section');
const musicToggle = document.getElementById('music-toggle');

const giftCinema = document.getElementById('gift-cinema');
const giftBreakfast = document.getElementById('gift-breakfast');
const selectionModal = document.getElementById('selection-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

let blownOutCount = 0;
let hasCelebrated = false;

// 1. Candle Clicking Logic
candles.forEach((candle) => {
    candle.addEventListener('click', () => {
        if (!candle.classList.contains('blown-out')) {
            candle.classList.add('blown-out');
            blownOutCount++;
            
            playBlowSound();
            createSmokePuff(candle);
            
            if (blownOutCount === candles.length) {
                celebrateSurprise();
            }
        }
    });
});

function createSmokePuff(candleElement) {
    const rect = candleElement.getBoundingClientRect();
    const puff = document.createElement('div');
    puff.className = 'smoke-puff';
    
    puff.style.left = `${rect.left + rect.width / 2 + window.scrollX - 8}px`;
    puff.style.top = `${rect.top + window.scrollY - 10}px`;
    
    document.body.appendChild(puff);
    
    setTimeout(() => {
        puff.remove();
    }, 800);
}

// 2. Surprise Celebrate Action
function celebrateSurprise() {
    if (hasCelebrated) return;
    hasCelebrated = true;
    isCelebrating = true;
    
    playCelebrationSound();
    
    cakeWrapper.classList.add('celebrating');
    candles.forEach(c => c.classList.add('blown-out'));
    triggerBtn.classList.add('hidden');
    
    startConfettiEngine();
    triggerExplosion();
    
    // Show premium gold-rimmed letter card above the cake
    setTimeout(() => {
        greetingCard.classList.remove('hidden');
        // Force reflow for CSS transition
        void greetingCard.offsetWidth;
        greetingCard.classList.add('show');
    }, 1200);

    setTimeout(() => {
        giftSection.classList.add('reveal');
        giftSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1800);
    
    setTimeout(() => {
        startMusic();
    }, 1500);
}

triggerBtn.addEventListener('click', celebrateSurprise);

// 3. Music Floating Toggle Button
musicToggle.addEventListener('click', () => {
    initAudio();
    if (isMusicPlaying) {
        stopMusic();
    } else {
        startMusic();
    }
});

// 4. Gift Selection Modal Logic (Emoji-free text)
giftCinema.addEventListener('click', () => {
    showSelectionModal(
        "Kinobesuch mit Emily",
        "Wir gehen zusammen ins Kino deiner Wahl. Ich lade dich auf großes Popcorn, Snacks und ein kühles Getränk ein. Such dir schon mal einen tollen Film aus, Papa. Ich freue mich riesig."
    );
});

giftBreakfast.addEventListener('click', () => {
    showSelectionModal(
        "Frühstücken gehen mit Emily",
        "Wir gehen gemütlich zusammen frühstücken. Such dir dein absolutes Lieblingscafé aus – ich lade dich ein auf Kaffee, frische Brötchen, Rührei und eine schöne gemeinsame Zeit."
    );
});

function showSelectionModal(title, body) {
    modalTitle.textContent = title;
    modalBody.textContent = body;
    selectionModal.classList.add('show');
}

modalClose.addEventListener('click', () => {
    selectionModal.classList.remove('show');
});

selectionModal.addEventListener('click', (e) => {
    if (e.target === selectionModal) {
        selectionModal.classList.remove('show');
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        selectionModal.classList.remove('show');
    }
});
