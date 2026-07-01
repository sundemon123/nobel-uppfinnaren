/**
 * ============================================================================
 * NOBEL: UPPFINNARENS VAG - Complete Sound & Music System
 * ============================================================================
 *
 * Procedural audio system using Web Audio API. No external files needed.
 * All sounds and music are generated in real-time with oscillators,
 * noise generators, and envelope shaping.
 *
 * USAGE:
 *   1. Include this file: <script src="nobel-sound-system.js"></script>
 *   2. Call NobelSound.init() on first user interaction (click/tap)
 *   3. Use NobelSound.playMusic(chapter) to start chapter music (1-7)
 *   4. Use NobelSound.play('sfx_explosion') etc. for sound effects
 *
 * INTEGRATION EXAMPLE (add to the game's goToScreen function):
 *   // At the top of goToScreen, after determining chNum:
 *   if (NobelSound._initialized) {
 *     NobelSound.play('sfx_pageFlip');
 *     var chNum = parseInt(screenId.charAt(2));
 *     if (!isNaN(chNum)) NobelSound.playMusic(chNum);
 *   }
 *
 * API:
 *   NobelSound.init()              - Initialize (call on first user click)
 *   NobelSound.playMusic(chapter)  - Crossfade to chapter music (1-7)
 *   NobelSound.stopMusic()         - Fade out current music
 *   NobelSound.play(sfxName)       - Play a sound effect
 *   NobelSound.setVolume(0-1)      - Set master volume
 *   NobelSound.toggleMute()        - Toggle mute on/off
 *   NobelSound.isMuted()           - Check if muted
 *   NobelSound.createVolumeUI()    - Inject floating volume control
 *
 * ============================================================================
 */

var NobelSound = (function () {
  'use strict';

  // ========================================================================
  // INTERNAL STATE
  // ========================================================================

  var ctx = null;              // AudioContext
  var masterGain = null;       // Master gain node
  var musicGain = null;        // Music bus gain node
  var sfxGain = null;          // SFX bus gain node
  var _initialized = false;
  var _muted = false;
  var _volume = 0.6;           // Default master volume
  var _currentChapter = 0;     // Currently playing chapter music
  var _musicNodes = [];        // Active music oscillator/gain nodes for cleanup
  var _musicLoopId = null;     // setInterval ID for music loop scheduling
  var FADE_TIME = 1.5;         // Crossfade duration in seconds
  var MUSIC_VOLUME = 0.25;     // Music bus relative volume (keep subtle)
  var SFX_VOLUME = 0.7;        // SFX bus relative volume

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  /**
   * Initialize the audio system. MUST be called from a user gesture (click/tap)
   * due to browser autoplay policies.
   */
  function init() {
    if (_initialized) return;

    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();

      // Create routing: sources -> musicGain/sfxGain -> masterGain -> destination
      masterGain = ctx.createGain();
      masterGain.gain.value = _volume;
      masterGain.connect(ctx.destination);

      musicGain = ctx.createGain();
      musicGain.gain.value = MUSIC_VOLUME;
      musicGain.connect(masterGain);

      sfxGain = ctx.createGain();
      sfxGain.gain.value = SFX_VOLUME;
      sfxGain.connect(masterGain);

      _initialized = true;

      // Resume context if suspended (Chrome autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Inject the volume UI
      createVolumeUI();

    } catch (e) {
      console.warn('NobelSound: Web Audio API not supported.', e);
    }
  }

  // ========================================================================
  // UTILITY: NOISE BUFFER
  // ========================================================================

  /** Create a buffer of white noise (used for many SFX). */
  function createNoiseBuffer(duration) {
    var sampleRate = ctx.sampleRate;
    var length = sampleRate * duration;
    var buffer = ctx.createBuffer(1, length, sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /** Create a filtered noise burst (bandpass around a frequency). */
  function playFilteredNoise(freq, q, duration, volume, dest, startTime) {
    var t = startTime || ctx.currentTime;
    var noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(duration + 0.1);
    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = q;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest || sfxGain);
    noise.start(t);
    noise.stop(t + duration + 0.1);
    return noise;
  }

  // ========================================================================
  // UTILITY: ENVELOPE HELPER
  // ========================================================================

  /**
   * Play a simple tone with ADSR-like envelope.
   * Returns the oscillator node.
   */
  function playTone(options) {
    var o = options || {};
    var freq = o.freq || 440;
    var type = o.type || 'sine';
    var attack = o.attack || 0.01;
    var decay = o.decay || 0.1;
    var sustain = o.sustain || 0.5;
    var release = o.release || 0.3;
    var sustainTime = o.sustainTime || 0.1;
    var volume = o.volume || 0.3;
    var dest = o.dest || sfxGain;
    var startTime = o.startTime || ctx.currentTime;
    var detune = o.detune || 0;
    var freqEnd = o.freqEnd || null;

    var osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (detune) osc.detune.value = detune;
    if (freqEnd !== null) {
      osc.frequency.linearRampToValueAtTime(freqEnd, startTime + attack + decay + sustainTime + release);
    }

    var env = ctx.createGain();
    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(volume, startTime + attack);
    env.gain.linearRampToValueAtTime(volume * sustain, startTime + attack + decay);
    env.gain.setValueAtTime(volume * sustain, startTime + attack + decay + sustainTime);
    env.gain.linearRampToValueAtTime(0, startTime + attack + decay + sustainTime + release);

    osc.connect(env);
    env.connect(dest);

    var totalDuration = attack + decay + sustainTime + release;
    osc.start(startTime);
    osc.stop(startTime + totalDuration + 0.05);

    return osc;
  }

  // ========================================================================
  // SOUND EFFECTS
  // ========================================================================

  var sfxFunctions = {};

  // --- Page Flip: short breathy whoosh ---
  sfxFunctions.sfx_pageFlip = function () {
    var t = ctx.currentTime;
    // High-pass filtered noise burst for paper sound
    var noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.25);
    var hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2000;
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(4000, t);
    bp.frequency.linearRampToValueAtTime(2000, t + 0.15);
    bp.Q.value = 1.5;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.03);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.1);
    gain.gain.linearRampToValueAtTime(0, t + 0.2);
    noise.connect(hp);
    hp.connect(bp);
    bp.connect(gain);
    gain.connect(sfxGain);
    noise.start(t);
    noise.stop(t + 0.3);
  };

  // --- Choice Select: satisfying click with subtle resonance ---
  sfxFunctions.sfx_choiceSelect = function () {
    var t = ctx.currentTime;
    // Short click: high-freq sine blip
    playTone({ freq: 1200, type: 'sine', attack: 0.001, decay: 0.04, sustain: 0, release: 0.06, volume: 0.25, startTime: t });
    // Resonant tail
    playTone({ freq: 800, type: 'triangle', attack: 0.005, decay: 0.08, sustain: 0.2, release: 0.12, volume: 0.1, startTime: t + 0.01 });
  };

  // --- Choice Reveal: gentle whoosh upward ---
  sfxFunctions.sfx_choiceReveal = function () {
    var t = ctx.currentTime;
    playTone({ freq: 300, freqEnd: 900, type: 'sine', attack: 0.05, decay: 0.15, sustain: 0.3, release: 0.3, volume: 0.12, startTime: t });
    playFilteredNoise(3000, 1, 0.4, 0.08, sfxGain, t);
  };

  // --- Resource Up: positive ascending chime ---
  sfxFunctions.sfx_resourceUp = function () {
    var t = ctx.currentTime;
    // Three ascending notes: C5, E5, G5
    playTone({ freq: 523, type: 'sine', attack: 0.01, decay: 0.08, sustain: 0.4, sustainTime: 0.05, release: 0.15, volume: 0.2, startTime: t });
    playTone({ freq: 659, type: 'sine', attack: 0.01, decay: 0.08, sustain: 0.4, sustainTime: 0.05, release: 0.15, volume: 0.2, startTime: t + 0.1 });
    playTone({ freq: 784, type: 'sine', attack: 0.01, decay: 0.08, sustain: 0.5, sustainTime: 0.08, release: 0.25, volume: 0.22, startTime: t + 0.2 });
    // Subtle shimmer
    playTone({ freq: 1568, type: 'sine', attack: 0.05, decay: 0.15, sustain: 0.2, release: 0.3, volume: 0.06, startTime: t + 0.25 });
  };

  // --- Resource Down: negative descending buzz ---
  sfxFunctions.sfx_resourceDown = function () {
    var t = ctx.currentTime;
    // Descending minor notes with slight buzz
    playTone({ freq: 440, type: 'sawtooth', attack: 0.01, decay: 0.1, sustain: 0.5, sustainTime: 0.05, release: 0.15, volume: 0.1, startTime: t });
    playTone({ freq: 370, type: 'sawtooth', attack: 0.01, decay: 0.1, sustain: 0.5, sustainTime: 0.05, release: 0.15, volume: 0.1, startTime: t + 0.1 });
    playTone({ freq: 311, type: 'sawtooth', attack: 0.01, decay: 0.12, sustain: 0.4, sustainTime: 0.08, release: 0.2, volume: 0.12, startTime: t + 0.2 });
    // Low rumble undertone
    playTone({ freq: 80, type: 'sine', attack: 0.02, decay: 0.2, sustain: 0.3, release: 0.2, volume: 0.1, startTime: t });
  };

  // --- Explosion: deep boom with crackle layer ---
  sfxFunctions.sfx_explosion = function () {
    var t = ctx.currentTime;

    // Sub-bass boom
    playTone({ freq: 60, freqEnd: 20, type: 'sine', attack: 0.005, decay: 0.4, sustain: 0.3, sustainTime: 0.3, release: 0.8, volume: 0.5, startTime: t });
    // Mid impact
    playTone({ freq: 150, freqEnd: 40, type: 'sawtooth', attack: 0.002, decay: 0.15, sustain: 0.2, sustainTime: 0.1, release: 0.4, volume: 0.25, startTime: t });
    // High crack
    playFilteredNoise(1500, 2, 0.3, 0.35, sfxGain, t);
    // Debris scatter (high noise tail)
    playFilteredNoise(4000, 0.8, 0.8, 0.15, sfxGain, t + 0.1);
    // Rumble tail (low noise)
    playFilteredNoise(100, 3, 1.5, 0.2, sfxGain, t + 0.05);
    // Secondary boom echo
    playTone({ freq: 45, freqEnd: 18, type: 'sine', attack: 0.02, decay: 0.3, sustain: 0.2, sustainTime: 0.2, release: 0.6, volume: 0.2, startTime: t + 0.15 });
  };

  // --- Confetti: sparkly celebration arpeggio ---
  sfxFunctions.sfx_confetti = function () {
    var t = ctx.currentTime;
    var notes = [523, 659, 784, 1047, 1319, 1568]; // C5 E5 G5 C6 E6 G6
    for (var i = 0; i < notes.length; i++) {
      playTone({
        freq: notes[i], type: 'sine',
        attack: 0.005, decay: 0.08, sustain: 0.3, sustainTime: 0.03, release: 0.2,
        volume: 0.12 - i * 0.01,
        startTime: t + i * 0.06
      });
    }
    // Shimmer overlay
    playFilteredNoise(8000, 0.5, 0.6, 0.06, sfxGain, t + 0.1);
  };

  // --- Newspaper: paper rustling / crinkle ---
  sfxFunctions.sfx_newspaper = function () {
    var t = ctx.currentTime;
    // Multiple bursts of high-freq noise for crinkle texture
    for (var i = 0; i < 4; i++) {
      var offset = i * 0.08 + Math.random() * 0.03;
      playFilteredNoise(3000 + Math.random() * 2000, 2, 0.1, 0.15 + Math.random() * 0.1, sfxGain, t + offset);
    }
    // Base rustle
    playFilteredNoise(1500, 1, 0.5, 0.08, sfxGain, t);
  };

  // --- Pen Write: scratchy writing sound ---
  sfxFunctions.sfx_penWrite = function () {
    var t = ctx.currentTime;
    // Series of tiny scratch bursts
    for (var i = 0; i < 6; i++) {
      var offset = i * 0.12 + Math.random() * 0.04;
      playFilteredNoise(5000 + Math.random() * 3000, 4, 0.06 + Math.random() * 0.04, 0.08, sfxGain, t + offset);
      // Subtle tonal scratch
      playTone({
        freq: 2000 + Math.random() * 1000, type: 'sawtooth',
        attack: 0.002, decay: 0.03, sustain: 0.1, release: 0.03,
        volume: 0.02, startTime: t + offset
      });
    }
  };

  // --- Mini-game Correct: happy ding ---
  sfxFunctions.sfx_minigameCorrect = function () {
    var t = ctx.currentTime;
    // Bright two-note chime: G5 -> C6
    playTone({ freq: 784, type: 'sine', attack: 0.005, decay: 0.1, sustain: 0.5, sustainTime: 0.05, release: 0.2, volume: 0.2, startTime: t });
    playTone({ freq: 1047, type: 'sine', attack: 0.005, decay: 0.12, sustain: 0.5, sustainTime: 0.08, release: 0.3, volume: 0.22, startTime: t + 0.12 });
    // Sparkle overtone
    playTone({ freq: 2094, type: 'sine', attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.2, volume: 0.04, startTime: t + 0.15 });
  };

  // --- Mini-game Wrong: error buzz ---
  sfxFunctions.sfx_minigameWrong = function () {
    var t = ctx.currentTime;
    // Dissonant buzz: two close frequencies create beating
    playTone({ freq: 185, type: 'square', attack: 0.005, decay: 0.15, sustain: 0.6, sustainTime: 0.15, release: 0.15, volume: 0.12, startTime: t });
    playTone({ freq: 196, type: 'square', attack: 0.005, decay: 0.15, sustain: 0.6, sustainTime: 0.15, release: 0.15, volume: 0.12, startTime: t });
    // Low thud
    playTone({ freq: 80, type: 'sine', attack: 0.005, decay: 0.08, sustain: 0.2, release: 0.1, volume: 0.15, startTime: t });
  };

  // --- Mini-game Complete: short fanfare ---
  sfxFunctions.sfx_minigameComplete = function () {
    var t = ctx.currentTime;
    // Triumphant four-note fanfare: C5 -> E5 -> G5 -> C6
    var fanfareNotes = [
      { freq: 523, delay: 0, dur: 0.15 },
      { freq: 659, delay: 0.15, dur: 0.15 },
      { freq: 784, delay: 0.3, dur: 0.15 },
      { freq: 1047, delay: 0.45, dur: 0.35 }
    ];
    for (var i = 0; i < fanfareNotes.length; i++) {
      var n = fanfareNotes[i];
      playTone({
        freq: n.freq, type: 'sine',
        attack: 0.01, decay: 0.05, sustain: 0.7, sustainTime: n.dur * 0.6, release: n.dur * 0.4,
        volume: 0.2, startTime: t + n.delay
      });
      // Harmonic layer (fifth above, quieter)
      playTone({
        freq: n.freq * 1.5, type: 'sine',
        attack: 0.015, decay: 0.06, sustain: 0.4, sustainTime: n.dur * 0.5, release: n.dur * 0.3,
        volume: 0.06, startTime: t + n.delay
      });
    }
  };

  // --- Heartbeat: low rhythmic thump ---
  sfxFunctions.sfx_heartbeat = function () {
    var t = ctx.currentTime;
    // Double beat pattern: lub-dub
    // Lub (lower, stronger)
    playTone({ freq: 55, type: 'sine', attack: 0.01, decay: 0.12, sustain: 0.2, release: 0.1, volume: 0.35, startTime: t });
    playTone({ freq: 90, type: 'sine', attack: 0.01, decay: 0.08, sustain: 0.1, release: 0.08, volume: 0.15, startTime: t });
    // Dub (slightly higher, softer)
    playTone({ freq: 65, type: 'sine', attack: 0.01, decay: 0.1, sustain: 0.15, release: 0.08, volume: 0.25, startTime: t + 0.2 });
    playTone({ freq: 100, type: 'sine', attack: 0.01, decay: 0.06, sustain: 0.1, release: 0.06, volume: 0.1, startTime: t + 0.2 });
  };

  // --- Clock Tick: mechanical click ---
  sfxFunctions.sfx_clockTick = function () {
    var t = ctx.currentTime;
    // Sharp attack, very short
    playTone({ freq: 1800, type: 'sine', attack: 0.001, decay: 0.015, sustain: 0, release: 0.03, volume: 0.2, startTime: t });
    // Subtle resonance body
    playTone({ freq: 600, type: 'triangle', attack: 0.001, decay: 0.02, sustain: 0.1, release: 0.04, volume: 0.08, startTime: t });
    // Tiny noise click
    playFilteredNoise(4000, 5, 0.02, 0.1, sfxGain, t);
  };


  // ========================================================================
  // MUSIC SYSTEM
  // ========================================================================

  /**
   * Stop all currently playing music nodes and clear the loop scheduler.
   * Optionally fade out over the given duration.
   */
  function _stopCurrentMusic(fadeTime) {
    var ft = (fadeTime !== undefined) ? fadeTime : FADE_TIME;
    var t = ctx.currentTime;

    // Clear the loop scheduler
    if (_musicLoopId !== null) {
      clearInterval(_musicLoopId);
      _musicLoopId = null;
    }

    // Fade out all active music nodes
    for (var i = 0; i < _musicNodes.length; i++) {
      var node = _musicNodes[i];
      if (node && node.gain) {
        try {
          node.gain.gain.cancelScheduledValues(t);
          node.gain.gain.setValueAtTime(node.gain.gain.value, t);
          node.gain.gain.linearRampToValueAtTime(0, t + ft);
        } catch (e) { /* node may already be stopped */ }
      }
      // Schedule stop after fade
      if (node && node.osc) {
        try { node.osc.stop(t + ft + 0.1); } catch (e) { /* already stopped */ }
      }
      if (node && node.source) {
        try { node.source.stop(t + ft + 0.1); } catch (e) { /* already stopped */ }
      }
    }

    // Clear the array after a delay to allow fade
    var oldNodes = _musicNodes;
    _musicNodes = [];
    setTimeout(function () {
      for (var i = 0; i < oldNodes.length; i++) {
        try {
          if (oldNodes[i] && oldNodes[i].gain) oldNodes[i].gain.disconnect();
          if (oldNodes[i] && oldNodes[i].osc) oldNodes[i].osc.disconnect();
          if (oldNodes[i] && oldNodes[i].source) oldNodes[i].source.disconnect();
        } catch (e) { /* ignore */ }
      }
    }, (ft + 0.5) * 1000);
  }

  /**
   * Create a persistent drone oscillator connected to musicGain.
   * Returns { osc, gain } for tracking and cleanup.
   */
  function _createDrone(freq, type, volume, detuneVal) {
    var osc = ctx.createOscillator();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    if (detuneVal) osc.detune.value = detuneVal;

    var gain = ctx.createGain();
    gain.gain.value = 0; // Start silent, we will fade in
    osc.connect(gain);
    gain.connect(musicGain);
    osc.start();

    // Fade in
    var t = ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + FADE_TIME);

    var node = { osc: osc, gain: gain };
    _musicNodes.push(node);
    return node;
  }

  /**
   * Create a filtered noise layer for texture.
   */
  function _createNoisePad(freq, q, volume) {
    // Create a long noise buffer (30 seconds) that we loop
    var bufferDuration = 30;
    var buffer = createNoiseBuffer(bufferDuration);
    var source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = q || 1;

    var gain = ctx.createGain();
    gain.gain.value = 0;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(musicGain);
    source.start();

    // Fade in
    var t = ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + FADE_TIME);

    var node = { source: source, gain: gain };
    _musicNodes.push(node);
    return node;
  }

  /**
   * Schedule a slow LFO (low-frequency oscillation) on a gain node to create
   * gentle pulsing/breathing in the music.
   */
  function _applyLFO(gainNode, rate, depth) {
    var lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = rate; // Hz, very slow
    var lfoGain = ctx.createGain();
    lfoGain.gain.value = depth;
    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);
    lfo.start();
    var node = { osc: lfo, gain: lfoGain };
    _musicNodes.push(node);
    return node;
  }

  /**
   * Schedule repeating melodic notes over the music drones.
   * notes: array of { freq, duration, delay } relative to cycle start
   * cycleDuration: total cycle length in seconds
   * volume: gain level for notes
   * type: oscillator type
   */
  function _startMelodyLoop(notes, cycleDuration, volume, type) {
    var oscType = type || 'sine';

    function playOneCycle() {
      if (_musicNodes.length === 0) return; // Music was stopped
      var now = ctx.currentTime;
      for (var i = 0; i < notes.length; i++) {
        var n = notes[i];
        playTone({
          freq: n.freq,
          type: oscType,
          attack: n.attack || 0.08,
          decay: n.decay || 0.15,
          sustain: n.sustain || 0.3,
          sustainTime: n.sustainTime || (n.duration * 0.5),
          release: n.release || (n.duration * 0.5),
          volume: volume,
          dest: musicGain,
          startTime: now + n.delay
        });
      }
    }

    // Play first cycle immediately
    playOneCycle();
    // Then repeat
    _musicLoopId = setInterval(playOneCycle, cycleDuration * 1000);
  }


  // ========================================================================
  // CHAPTER MUSIC DEFINITIONS
  // ========================================================================

  var musicGenerators = {};

  // ------------------------------------------------------------------
  // CH1: Childhood, Stockholm - Warm, gentle, curious
  // Key: C major, soft pads with gentle melody
  // ------------------------------------------------------------------
  musicGenerators[1] = function () {
    // Warm pad: C3 + E3 + G3 (C major triad, low register)
    _createDrone(131, 'sine', 0.15);       // C3
    _createDrone(165, 'sine', 0.10);       // E3
    _createDrone(196, 'sine', 0.08);       // G3
    // Slightly detuned layer for warmth
    _createDrone(131, 'sine', 0.06, 5);    // C3 +5 cents
    _createDrone(165, 'sine', 0.04, -5);   // E3 -5 cents

    // Gentle high shimmer
    _createDrone(523, 'sine', 0.02);       // C5 very quiet

    // Soft noise texture (like distant wind)
    _createNoisePad(400, 0.5, 0.02);

    // Breathing LFO on the main pad
    _applyLFO(_musicNodes[0].gain, 0.15, 0.04);

    // Simple curious melody: C4-E4-G4-E4-D4-C4
    _startMelodyLoop([
      { freq: 262, delay: 0,    duration: 1.0, attack: 0.15, sustain: 0.4, release: 0.5 },
      { freq: 330, delay: 1.5,  duration: 0.8, attack: 0.12, sustain: 0.4, release: 0.4 },
      { freq: 392, delay: 3.0,  duration: 1.2, attack: 0.15, sustain: 0.5, release: 0.6 },
      { freq: 330, delay: 5.0,  duration: 0.8, attack: 0.12, sustain: 0.3, release: 0.4 },
      { freq: 294, delay: 6.5,  duration: 1.0, attack: 0.15, sustain: 0.4, release: 0.5 },
      { freq: 262, delay: 8.5,  duration: 1.5, attack: 0.2,  sustain: 0.5, release: 0.8 }
    ], 12, 0.07, 'sine');
  };

  // ------------------------------------------------------------------
  // CH2: Education, St Petersburg - Sophisticated, scholarly
  // Key: D minor / F major, slightly richer harmonics
  // ------------------------------------------------------------------
  musicGenerators[2] = function () {
    // Scholarly pad: Dm7 voicing (D3 + F3 + A3 + C4)
    _createDrone(147, 'sine', 0.12);       // D3
    _createDrone(175, 'triangle', 0.08);   // F3
    _createDrone(220, 'sine', 0.10);       // A3
    _createDrone(262, 'sine', 0.05);       // C4

    // Slight detuning for depth
    _createDrone(147, 'sine', 0.04, 7);
    _createDrone(220, 'sine', 0.03, -6);

    // Warm noise floor
    _createNoisePad(300, 0.3, 0.015);

    // Gentle breathing
    _applyLFO(_musicNodes[1].gain, 0.12, 0.03);

    // Scholarly melody: more stepwise, thoughtful
    _startMelodyLoop([
      { freq: 294, delay: 0,    duration: 1.2, attack: 0.2, sustain: 0.5, release: 0.6 },
      { freq: 330, delay: 2.0,  duration: 1.0, attack: 0.15, sustain: 0.4, release: 0.5 },
      { freq: 349, delay: 3.5,  duration: 1.3, attack: 0.2, sustain: 0.5, release: 0.7 },
      { freq: 330, delay: 5.5,  duration: 0.8, attack: 0.12, sustain: 0.3, release: 0.4 },
      { freq: 294, delay: 7.0,  duration: 1.0, attack: 0.15, sustain: 0.4, release: 0.5 },
      { freq: 262, delay: 9.0,  duration: 1.5, attack: 0.25, sustain: 0.5, release: 0.8 },
      { freq: 294, delay: 11.0, duration: 1.5, attack: 0.2, sustain: 0.5, release: 0.8 }
    ], 14, 0.06, 'triangle');
  };

  // ------------------------------------------------------------------
  // CH3: Explosion - Tense, dark, building dread
  // Key: C# minor, dissonant intervals, low rumble
  // ------------------------------------------------------------------
  musicGenerators[3] = function () {
    // Dark droning bass: C#2 + G#2 (fifth, low and ominous)
    _createDrone(69, 'sawtooth', 0.06);    // C#2
    _createDrone(104, 'sine', 0.10);       // G#2
    // Dissonant minor second for tension
    _createDrone(73, 'sine', 0.04);        // D2 (rubs against C#)

    // Filtered saw for industrial texture
    var sawNode = _createDrone(139, 'sawtooth', 0.03); // C#3
    // (already connected to musicGain)

    // Low rumbling noise
    _createNoisePad(80, 2, 0.04);
    // Higher eerie wind
    _createNoisePad(2000, 0.3, 0.01);

    // Slow menacing LFO - pulsing
    _applyLFO(_musicNodes[0].gain, 0.08, 0.03);
    _applyLFO(_musicNodes[1].gain, 0.06, 0.04);

    // Sparse, unsettling notes
    _startMelodyLoop([
      { freq: 139, delay: 0,    duration: 2.0, attack: 0.5, sustain: 0.6, release: 1.0 },
      { freq: 147, delay: 4.0,  duration: 1.5, attack: 0.4, sustain: 0.5, release: 0.8 },  // D3 (dissonant)
      { freq: 131, delay: 7.0,  duration: 2.0, attack: 0.5, sustain: 0.6, release: 1.2 },  // C3
      { freq: 139, delay: 11.0, duration: 2.5, attack: 0.6, sustain: 0.5, release: 1.5 }   // C#3 return
    ], 16, 0.04, 'sine');
  };

  // ------------------------------------------------------------------
  // CH4: Dynamite - Triumphant, energetic, discovery
  // Key: G major, bright and forward-moving
  // ------------------------------------------------------------------
  musicGenerators[4] = function () {
    // Triumphant pad: G major (G3 + B3 + D4)
    _createDrone(196, 'sine', 0.12);       // G3
    _createDrone(247, 'sine', 0.10);       // B3
    _createDrone(294, 'sine', 0.08);       // D4
    // Octave reinforcement
    _createDrone(392, 'sine', 0.04);       // G4

    // Bright detuned layer
    _createDrone(196, 'triangle', 0.05, 4);
    _createDrone(294, 'triangle', 0.03, -4);

    // Subtle energy texture
    _createNoisePad(600, 0.5, 0.015);

    // Forward-moving LFO
    _applyLFO(_musicNodes[0].gain, 0.2, 0.04);

    // Triumphant melody: ascending and confident
    _startMelodyLoop([
      { freq: 392, delay: 0,    duration: 0.8, attack: 0.08, sustain: 0.5, release: 0.4 },  // G4
      { freq: 440, delay: 1.0,  duration: 0.6, attack: 0.06, sustain: 0.4, release: 0.3 },  // A4
      { freq: 494, delay: 1.8,  duration: 0.8, attack: 0.08, sustain: 0.5, release: 0.4 },  // B4
      { freq: 587, delay: 2.8,  duration: 1.2, attack: 0.1,  sustain: 0.6, release: 0.6 },  // D5
      { freq: 494, delay: 4.5,  duration: 0.7, attack: 0.08, sustain: 0.4, release: 0.35 }, // B4
      { freq: 440, delay: 5.5,  duration: 0.6, attack: 0.06, sustain: 0.4, release: 0.3 },  // A4
      { freq: 392, delay: 6.5,  duration: 1.5, attack: 0.12, sustain: 0.5, release: 0.8 }   // G4
    ], 10, 0.07, 'sine');
  };

  // ------------------------------------------------------------------
  // CH5: Empire - Grand, powerful, industrial
  // Key: Bb major, wide voicings, gravitas
  // ------------------------------------------------------------------
  musicGenerators[5] = function () {
    // Grand pad: Bb major with wide voicing
    _createDrone(117, 'sine', 0.14);       // Bb2
    _createDrone(175, 'sine', 0.10);       // F3
    _createDrone(233, 'sine', 0.08);       // Bb3
    _createDrone(294, 'triangle', 0.06);   // D4
    _createDrone(349, 'sine', 0.04);       // F4

    // Deep detuned foundation
    _createDrone(58, 'sine', 0.08);        // Bb1 sub-bass
    _createDrone(117, 'sawtooth', 0.02, 3); // Industrial edge

    // Industrial noise texture
    _createNoisePad(200, 1, 0.025);
    _createNoisePad(1000, 0.3, 0.008);

    // Majestic slow LFO
    _applyLFO(_musicNodes[0].gain, 0.1, 0.05);
    _applyLFO(_musicNodes[2].gain, 0.08, 0.03);

    // Powerful, stately melody
    _startMelodyLoop([
      { freq: 233, delay: 0,    duration: 1.5, attack: 0.25, sustain: 0.6, release: 0.8 },  // Bb3
      { freq: 294, delay: 2.5,  duration: 1.2, attack: 0.2,  sustain: 0.5, release: 0.6 },  // D4
      { freq: 349, delay: 4.5,  duration: 1.5, attack: 0.25, sustain: 0.6, release: 0.8 },  // F4
      { freq: 330, delay: 7.0,  duration: 1.0, attack: 0.15, sustain: 0.4, release: 0.5 },  // E4 (passing)
      { freq: 294, delay: 8.5,  duration: 1.2, attack: 0.2,  sustain: 0.5, release: 0.7 },  // D4
      { freq: 262, delay: 10.5, duration: 1.0, attack: 0.15, sustain: 0.4, release: 0.5 },  // C4
      { freq: 233, delay: 12.0, duration: 2.0, attack: 0.3,  sustain: 0.6, release: 1.0 }   // Bb3
    ], 16, 0.06, 'triangle');
  };

  // ------------------------------------------------------------------
  // CH6: Merchant of Death - Dark, somber, introspective
  // Key: E minor, sparse, lonely
  // ------------------------------------------------------------------
  musicGenerators[6] = function () {
    // Sparse, lonely pad: Em (E3 + B3)
    _createDrone(165, 'sine', 0.10);       // E3
    _createDrone(247, 'sine', 0.06);       // B3
    // Hollow fifth, very open
    _createDrone(82, 'sine', 0.08);        // E2

    // Subtle dissonance: minor second rub
    _createDrone(175, 'sine', 0.02);       // F3 (haunting)

    // Cold, empty noise
    _createNoisePad(150, 1, 0.02);
    // Distant wind
    _createNoisePad(3000, 0.2, 0.008);

    // Very slow, mournful breathing
    _applyLFO(_musicNodes[0].gain, 0.06, 0.04);

    // Sparse, lonely melody - lots of silence between notes
    _startMelodyLoop([
      { freq: 330, delay: 0,    duration: 2.5, attack: 0.5, sustain: 0.4, release: 1.5 },  // E4
      { freq: 294, delay: 5.0,  duration: 2.0, attack: 0.4, sustain: 0.3, release: 1.2 },  // D4
      { freq: 262, delay: 9.0,  duration: 2.0, attack: 0.5, sustain: 0.4, release: 1.2 },  // C4
      { freq: 247, delay: 13.0, duration: 3.0, attack: 0.6, sustain: 0.5, release: 1.8 }   // B3
    ], 20, 0.04, 'sine');
  };

  // ------------------------------------------------------------------
  // CH7: Testament / Finale - Majestic, hopeful, emotional, building
  // Key: D major -> climactic, rich harmonics
  // ------------------------------------------------------------------
  musicGenerators[7] = function () {
    // Rich, warm pad: D major (D3 + F#3 + A3 + D4)
    _createDrone(147, 'sine', 0.14);       // D3
    _createDrone(185, 'sine', 0.10);       // F#3
    _createDrone(220, 'sine', 0.10);       // A3
    _createDrone(294, 'sine', 0.08);       // D4

    // Upper harmonics for majesty
    _createDrone(370, 'sine', 0.05);       // F#4
    _createDrone(440, 'sine', 0.03);       // A4
    _createDrone(587, 'sine', 0.02);       // D5

    // Warm detuned layers
    _createDrone(147, 'sine', 0.05, 6);
    _createDrone(220, 'sine', 0.04, -5);
    _createDrone(294, 'triangle', 0.03, 4);

    // Soft golden shimmer
    _createNoisePad(500, 0.4, 0.015);
    _createNoisePad(4000, 0.2, 0.005);

    // Hopeful, swelling LFO
    _applyLFO(_musicNodes[0].gain, 0.12, 0.05);
    _applyLFO(_musicNodes[3].gain, 0.1, 0.03);

    // Emotional, building melody
    _startMelodyLoop([
      { freq: 294, delay: 0,    duration: 1.2, attack: 0.2,  sustain: 0.6, release: 0.6 },  // D4
      { freq: 330, delay: 1.5,  duration: 1.0, attack: 0.15, sustain: 0.5, release: 0.5 },  // E4
      { freq: 370, delay: 3.0,  duration: 1.5, attack: 0.2,  sustain: 0.6, release: 0.8 },  // F#4
      { freq: 440, delay: 5.0,  duration: 1.2, attack: 0.15, sustain: 0.5, release: 0.6 },  // A4
      { freq: 494, delay: 6.5,  duration: 1.5, attack: 0.2,  sustain: 0.6, release: 0.8 },  // B4
      { freq: 587, delay: 8.5,  duration: 2.0, attack: 0.3,  sustain: 0.7, release: 1.0 },  // D5 (climax)
      { freq: 494, delay: 11.0, duration: 1.0, attack: 0.15, sustain: 0.4, release: 0.5 },  // B4
      { freq: 440, delay: 12.5, duration: 1.2, attack: 0.2,  sustain: 0.5, release: 0.6 },  // A4
      { freq: 370, delay: 14.0, duration: 1.5, attack: 0.2,  sustain: 0.5, release: 0.8 },  // F#4
      { freq: 294, delay: 16.0, duration: 2.0, attack: 0.3,  sustain: 0.6, release: 1.0 }   // D4 (resolve)
    ], 20, 0.07, 'sine');
  };


  // ========================================================================
  // PUBLIC API
  // ========================================================================

  /**
   * Start playing music for the given chapter (1-7).
   * If music is already playing for that chapter, does nothing.
   * Crossfades from any currently playing chapter.
   */
  function playMusic(chapter) {
    if (!_initialized || !ctx) return;
    if (chapter === _currentChapter) return;

    var chNum = Math.max(1, Math.min(7, parseInt(chapter)));
    if (!musicGenerators[chNum]) return;

    // Crossfade: stop current, then start new
    _stopCurrentMusic(FADE_TIME);
    _currentChapter = chNum;

    // Small delay to let the fade begin before starting new music
    setTimeout(function () {
      if (_currentChapter === chNum) { // Still want this chapter
        musicGenerators[chNum]();
      }
    }, 200);
  }

  /**
   * Stop all music with a fade out.
   */
  function stopMusic() {
    if (!_initialized || !ctx) return;
    _stopCurrentMusic(FADE_TIME);
    _currentChapter = 0;
  }

  /**
   * Play a sound effect by name.
   * Valid names: sfx_pageFlip, sfx_choiceSelect, sfx_choiceReveal,
   *   sfx_resourceUp, sfx_resourceDown, sfx_explosion, sfx_confetti,
   *   sfx_newspaper, sfx_penWrite, sfx_minigameCorrect, sfx_minigameWrong,
   *   sfx_minigameComplete, sfx_heartbeat, sfx_clockTick
   */
  function play(sfxName) {
    if (!_initialized || !ctx || _muted) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (sfxFunctions[sfxName]) {
      sfxFunctions[sfxName]();
    } else {
      console.warn('NobelSound: Unknown SFX "' + sfxName + '"');
    }
  }

  /**
   * Set master volume (0 to 1).
   */
  function setVolume(v) {
    _volume = Math.max(0, Math.min(1, v));
    if (masterGain) {
      masterGain.gain.setValueAtTime(_volume, ctx.currentTime);
    }
    _updateVolumeUI();
  }

  /**
   * Toggle mute on/off.
   */
  function toggleMute() {
    _muted = !_muted;
    if (masterGain) {
      masterGain.gain.setValueAtTime(_muted ? 0 : _volume, ctx.currentTime);
    }
    _updateVolumeUI();
  }

  /**
   * Check if currently muted.
   */
  function isMuted() {
    return _muted;
  }

  // ========================================================================
  // VOLUME CONTROL UI
  // ========================================================================

  var _uiCreated = false;

  function _updateVolumeUI() {
    var icon = document.getElementById('nobel-sound-icon');
    var slider = document.getElementById('nobel-sound-slider');
    if (!icon || !slider) return;

    // Update icon
    if (_muted || _volume === 0) {
      icon.innerHTML = _svgMuted;
      icon.title = 'Ljud av';
    } else if (_volume < 0.5) {
      icon.innerHTML = _svgLow;
      icon.title = 'Ljud';
    } else {
      icon.innerHTML = _svgFull;
      icon.title = 'Ljud';
    }

    slider.value = _muted ? 0 : _volume * 100;
  }

  // SVG icons for speaker states (small, clean)
  var _svgFull = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
  var _svgLow = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
  var _svgMuted = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';

  /**
   * Create and inject the floating volume control UI into the page.
   * Styled to match the game's parchment/brown aesthetic.
   */
  function createVolumeUI() {
    if (_uiCreated) return;
    _uiCreated = true;

    // --- CSS ---
    var style = document.createElement('style');
    style.textContent = [
      '#nobel-sound-control {',
      '  position: fixed;',
      '  top: 12px;',
      '  right: 12px;',
      '  z-index: 200;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 0;',
      '  font-family: var(--font-body, "Source Sans 3", sans-serif);',
      '}',
      '#nobel-sound-icon {',
      '  width: 36px;',
      '  height: 36px;',
      '  border-radius: 50%;',
      '  background: var(--parchment, #f5edd6);',
      '  border: 1.5px solid var(--gold, #8b6914);',
      '  color: var(--brown-dark, #2c1810);',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '  box-shadow: 0 2px 8px rgba(44, 24, 16, 0.12);',
      '  flex-shrink: 0;',
      '}',
      '#nobel-sound-icon:hover {',
      '  background: var(--parchment-light, #faf6ea);',
      '  border-color: var(--copper, #b87333);',
      '  box-shadow: 0 3px 12px rgba(44, 24, 16, 0.2);',
      '  transform: scale(1.05);',
      '}',
      '#nobel-sound-slider-wrap {',
      '  overflow: hidden;',
      '  max-width: 0;',
      '  opacity: 0;',
      '  transition: max-width 0.3s ease, opacity 0.25s ease, padding 0.3s ease;',
      '  padding: 0;',
      '  display: flex;',
      '  align-items: center;',
      '  background: var(--parchment, #f5edd6);',
      '  border: 1.5px solid var(--gold, #8b6914);',
      '  border-left: none;',
      '  border-radius: 0 18px 18px 0;',
      '  height: 36px;',
      '  box-shadow: 0 2px 8px rgba(44, 24, 16, 0.12);',
      '}',
      '#nobel-sound-control:hover #nobel-sound-slider-wrap,',
      '#nobel-sound-control.slider-open #nobel-sound-slider-wrap {',
      '  max-width: 120px;',
      '  opacity: 1;',
      '  padding: 0 14px 0 8px;',
      '}',
      '#nobel-sound-slider {',
      '  -webkit-appearance: none;',
      '  appearance: none;',
      '  width: 80px;',
      '  height: 4px;',
      '  border-radius: 2px;',
      '  background: var(--brown-light, #8b7a62);',
      '  outline: none;',
      '  cursor: pointer;',
      '}',
      '#nobel-sound-slider::-webkit-slider-thumb {',
      '  -webkit-appearance: none;',
      '  appearance: none;',
      '  width: 14px;',
      '  height: 14px;',
      '  border-radius: 50%;',
      '  background: var(--copper, #b87333);',
      '  border: 2px solid var(--gold, #8b6914);',
      '  cursor: pointer;',
      '  transition: transform 0.15s ease;',
      '}',
      '#nobel-sound-slider::-webkit-slider-thumb:hover {',
      '  transform: scale(1.2);',
      '}',
      '#nobel-sound-slider::-moz-range-thumb {',
      '  width: 14px;',
      '  height: 14px;',
      '  border-radius: 50%;',
      '  background: var(--copper, #b87333);',
      '  border: 2px solid var(--gold, #8b6914);',
      '  cursor: pointer;',
      '}',
      '/* On small screens, position slightly different */',
      '@media (max-width: 600px) {',
      '  #nobel-sound-control { top: 8px; right: 8px; }',
      '  #nobel-sound-icon { width: 32px; height: 32px; }',
      '  #nobel-sound-slider-wrap { height: 32px; }',
      '  #nobel-sound-slider { width: 60px; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);

    // --- HTML ---
    var container = document.createElement('div');
    container.id = 'nobel-sound-control';
    container.innerHTML =
      '<div id="nobel-sound-icon" role="button" aria-label="Ljud av/p&aring;" tabindex="0">' + _svgFull + '</div>' +
      '<div id="nobel-sound-slider-wrap">' +
        '<input type="range" id="nobel-sound-slider" min="0" max="100" value="' + Math.round(_volume * 100) + '" aria-label="Volym">' +
      '</div>';
    document.body.appendChild(container);

    // --- Events ---
    var icon = document.getElementById('nobel-sound-icon');
    var slider = document.getElementById('nobel-sound-slider');

    icon.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMute();
    });
    icon.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMute(); }
    });

    slider.addEventListener('input', function () {
      var val = parseInt(slider.value) / 100;
      _muted = false;
      setVolume(val);
    });

    // For mobile: toggle slider open on tap (since hover doesn't exist)
    var isTouchDevice = 'ontouchstart' in window;
    if (isTouchDevice) {
      container.addEventListener('click', function () {
        container.classList.toggle('slider-open');
      });
    }

    _updateVolumeUI();
  }


  // ========================================================================
  // RETURN PUBLIC API
  // ========================================================================

  return {
    init: init,
    playMusic: playMusic,
    stopMusic: stopMusic,
    play: play,
    setVolume: setVolume,
    toggleMute: toggleMute,
    isMuted: isMuted,
    createVolumeUI: createVolumeUI,

    // Expose internal state for advanced usage / debugging
    get _initialized() { return _initialized; },
    get _currentChapter() { return _currentChapter; },
    get _volume() { return _volume; },

    /**
     * List all available sound effect names. Useful for debugging.
     */
    listSFX: function () {
      return Object.keys(sfxFunctions);
    }
  };

})();


// ============================================================================
// AUTO-INIT HELPER
// ============================================================================
// The audio context MUST be created from a user gesture. This helper
// attaches a one-time listener that initializes the sound system on the
// first user interaction (click or tap). Once initialized, the listener
// is removed.
//
// If you prefer manual control, remove this block and call
// NobelSound.init() yourself from a button click handler.
// ============================================================================

(function () {
  function _autoInit() {
    if (!NobelSound._initialized) {
      NobelSound.init();
    }
    document.removeEventListener('click', _autoInit);
    document.removeEventListener('touchstart', _autoInit);
    document.removeEventListener('keydown', _autoInit);
  }
  document.addEventListener('click', _autoInit);
  document.addEventListener('touchstart', _autoInit);
  document.addEventListener('keydown', _autoInit);
})();
