import musicUrl from '../assets/music.mp3';

class SoundPlayer {
  constructor() {
    this.context = null;
    this.buffer = null;
    this.unlocked = false;
    this.enabled = true;
  }

  init() {
    if (this.context || typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.context = new AudioCtx();

    // Fetch and decode audio buffer
    fetch(musicUrl)
      .then(res => res.arrayBuffer())
      .then(arrayBuf => this.context.decodeAudioData(arrayBuf))
      .then(decoded => {
        this.buffer = decoded;
      })
      .catch(err => {
        console.warn('Audio load error:', err);
      });

    // Auto unlock on first interaction
    const unlock = () => {
      if (this.unlocked) return;
      this.unlocked = true;
      if (this.context && this.context.state === 'suspended') {
        this.context.resume();
      }
      try {
        const buf = this.context.createBuffer(1, 1, 22050);
        const src = this.context.createBufferSource();
        src.buffer = buf;
        src.connect(this.context.destination);
        src.start(0);
      } catch (e) {
        console.warn('Audio unlock error:', e);
      }
      ['touchstart', 'touchend', 'mousedown', 'keydown'].forEach(evt => {
        document.removeEventListener(evt, unlock, true);
      });
    };
    ['touchstart', 'touchend', 'mousedown', 'keydown'].forEach(evt => {
      document.addEventListener(evt, unlock, true);
    });
  }

  playSegment(start, duration) {
    if (!this.enabled || !this.context || !this.buffer) return;
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
    try {
      const source = this.context.createBufferSource();
      source.buffer = this.buffer;
      source.connect(this.context.destination);
      source.start(0, start, duration);
    } catch (e) {
      console.warn('Play audio error:', e);
    }
  }

  start() {
    this.playSegment(3.7202, 3.6224);
  }

  clear() {
    this.playSegment(0, 0.7675);
  }

  fall() {
    this.playSegment(1.2558, 0.3546);
  }

  gameover() {
    this.playSegment(8.1276, 1.1437);
  }

  rotate() {
    this.playSegment(2.2471, 0.0807);
  }

  move() {
    this.playSegment(2.9088, 0.1437);
  }
}

export const sound = new SoundPlayer();
