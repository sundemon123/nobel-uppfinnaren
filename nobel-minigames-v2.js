/* ============================================================
   NOBEL: UPPFINNARENS VAG - UPGRADED MINIGAMES v2
   ============================================================

   Four Canvas-based minigames that replace the simpler originals.
   Each follows the interface:
     NobelMinigames.chN.init(containerId)
     NobelMinigames.chN.start()
     NobelMinigames.chN.getScore()   // returns 0, 1, or 2
     NobelMinigames.chN.destroy()

   Color palette (matches main game):
     brown:     #5a3a28
     copper:    #b87333
     gold:      #c49b2a
     parchment: #faf2e8
     dark:      #2a1f14

   All graphics are Canvas-drawn. Touch-friendly.
   ============================================================ */

var NobelMinigames = (function () {
  'use strict';

  // ── Shared constants ──────────────────────────────────────
  var COLORS = {
    brown:       '#5a3a28',
    brownLight:  '#8b7a62',
    copper:      '#b87333',
    copperLight: '#d4935e',
    gold:        '#c49b2a',
    goldLight:   '#e0be5a',
    parchment:   '#faf2e8',
    parchDark:   '#e8dcc8',
    dark:        '#2a1f14',
    moss:        '#2d5016',
    mossLight:   '#4a7a2e',
    red:         '#c44',
    redLight:    '#e85a5a',
    white:       '#ffffff',
    beakerEmpty: '#d4e8ec',
    glycerin:    '#e2d4a0',
    acid:        '#6abf5e',
    cooling:     '#8ec8e8',
    mixture:     '#c96f3c'
  };

  var FONT_HEADLINE = "'Playfair Display', Georgia, serif";
  var FONT_BODY     = "'Source Sans 3', 'Segoe UI', sans-serif";

  // ── Shared helpers ────────────────────────────────────────

  /** Create a high-DPI Canvas inside the given container. */
  function createCanvas(container, width, height) {
    var canvas = document.createElement('canvas');
    var dpr = window.devicePixelRatio || 1;
    canvas.width  = width  * dpr;
    canvas.height = height * dpr;
    canvas.style.width  = width  + 'px';
    canvas.style.height = height + 'px';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.touchAction = 'none';
    canvas.style.maxWidth = '100%';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    container.appendChild(canvas);
    return { canvas: canvas, ctx: ctx, w: width, h: height, dpr: dpr };
  }

  /** Get pointer position relative to canvas, works for touch and mouse. */
  function getPointerPos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    var clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    var scaleX = canvas.offsetWidth  ? (parseFloat(canvas.style.width)  / canvas.offsetWidth) : 1;
    var scaleY = canvas.offsetHeight ? (parseFloat(canvas.style.height) / canvas.offsetHeight) : 1;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top)  * scaleY
    };
  }

  /** Draw rounded rectangle. */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /** Simple easing. */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOutQuad(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2; }

  /** Fisher-Yates shuffle (returns new array). */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  /** Create a styled HTML element inside container. */
  function createDiv(container, cls, tag) {
    var el = document.createElement(tag || 'div');
    if (cls) el.className = cls;
    container.appendChild(el);
    return el;
  }

  /** Inject scoped CSS if not already present. */
  function injectCSS(id, css) {
    if (document.getElementById(id)) return;
    var style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Inject shared minigame-v2 styles
  injectCSS('nobel-mg-v2-css', [
    '.nmg-wrapper { font-family: ' + FONT_BODY + '; color: ' + COLORS.dark + '; text-align: center; }',
    '.nmg-title { font-family: ' + FONT_HEADLINE + '; font-size: 1.3rem; font-weight: 700; color: ' + COLORS.dark + '; margin-bottom: 4px; }',
    '.nmg-subtitle { font-size: 0.9rem; color: ' + COLORS.brownLight + '; margin-bottom: 12px; }',
    '.nmg-instructions { background: ' + COLORS.parchment + '; border: 1px solid ' + COLORS.parchDark + '; border-radius: 8px; padding: 16px; margin-bottom: 16px; font-size: 0.92rem; line-height: 1.5; color: ' + COLORS.brown + '; }',
    '.nmg-btn { display: inline-block; padding: 12px 28px; border: none; border-radius: 8px; font-family: ' + FONT_BODY + '; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }',
    '.nmg-btn:active { transform: scale(0.96); }',
    '.nmg-btn-primary { background: linear-gradient(135deg, ' + COLORS.moss + ', ' + COLORS.mossLight + '); color: #fff; box-shadow: 0 2px 8px rgba(45,80,22,0.3); }',
    '.nmg-btn-gold { background: linear-gradient(135deg, ' + COLORS.gold + ', ' + COLORS.goldLight + '); color: #fff; box-shadow: 0 2px 8px rgba(196,155,42,0.3); }',
    '.nmg-status { font-size: 0.88rem; color: ' + COLORS.brownLight + '; margin: 8px 0; min-height: 1.4em; }',
    '.nmg-score-display { font-family: ' + FONT_HEADLINE + '; font-size: 2.4rem; font-weight: 700; color: ' + COLORS.gold + '; margin: 12px 0 4px; }',
    '.nmg-result-text { font-size: 1rem; color: ' + COLORS.brown + '; line-height: 1.6; margin-bottom: 12px; }',
    '.nmg-progress-bar { width: 100%; height: 8px; background: ' + COLORS.parchDark + '; border-radius: 4px; overflow: hidden; margin-bottom: 10px; }',
    '.nmg-progress-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }',
    '.nmg-hidden { display: none !important; }'
  ].join('\n'));


  /* ============================================================
     CH2: CHEMISTRY LAB  --  Drag ingredients to beaker
     ============================================================ */
  var ch2 = (function () {
    var state, container, canvasObj, animFrame;
    var W = 360, H = 420;

    // Ingredients
    var INGREDIENTS = [
      { id: 'glycerin',  label: 'Glycerin',  color: '#e2d4a0', pourColor: '#e8dca8' },
      { id: 'syra',      label: 'Syra',      color: '#6abf5e', pourColor: '#7ed974' },
      { id: 'kylning',   label: 'Kylning',   color: '#8ec8e8', pourColor: '#a4d8f2' },
      { id: 'blandning', label: 'Blandning', color: '#c96f3c', pourColor: '#d98850' }
    ];
    var CORRECT_ORDER = ['glycerin', 'syra', 'kylning', 'blandning'];

    function init(containerId) {
      container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';

      var wrapper = createDiv(container, 'nmg-wrapper');

      var titleEl = createDiv(wrapper, 'nmg-title');
      titleEl.textContent = 'Kemilaboratoriet';
      var subEl = createDiv(wrapper, 'nmg-subtitle');
      subEl.textContent = 'Dra ingredienserna till b\u00e4garen i r\u00e4tt ordning!';

      var instrEl = createDiv(wrapper, 'nmg-instructions');
      instrEl.innerHTML = 'Alfred ska blanda nitroglycerin. Dra flaskorna fr\u00e5n hyllan ner till b\u00e4garen \u2014 men i <strong>r\u00e4tt ordning</strong>! Fel ordning g\u00f6r en puff och du f\u00e5r f\u00f6rs\u00f6ka igen.';

      state = {
        phase: 'ready',  // ready | playing | pouring | done
        bottles: [],      // { x, y, w, h, ingredient, dragging, homeX, homeY, used }
        currentStep: 0,
        attempts: 0,
        errors: 0,
        beakerFills: [],  // colors added to beaker
        pourAnim: null,   // { t, ingredient, color }
        shakeAnim: null,  // { t }
        poofParticles: [],
        resultShown: false,
        score: 0,
        wrapper: wrapper,
        instrEl: instrEl,
        statusEl: null,
        resultEl: null,
        dragging: null,
        dragOffsetX: 0,
        dragOffsetY: 0
      };

      var statusEl = createDiv(wrapper, 'nmg-status');
      statusEl.textContent = 'Steg 1 av 4';
      state.statusEl = statusEl;

      canvasObj = createCanvas(wrapper, W, H);

      var resultEl = createDiv(wrapper, 'nmg-hidden');
      state.resultEl = resultEl;

      // Build bottles in shuffled order
      var shuffled = shuffle(INGREDIENTS);
      var bottleW = 64, bottleH = 80;
      var shelfY = 18;
      var spacing = (W - shuffled.length * bottleW) / (shuffled.length + 1);
      for (var i = 0; i < shuffled.length; i++) {
        var bx = spacing + i * (bottleW + spacing);
        state.bottles.push({
          x: bx, y: shelfY, w: bottleW, h: bottleH,
          homeX: bx, homeY: shelfY,
          ingredient: shuffled[i],
          dragging: false, used: false
        });
      }

      // Events
      var cv = canvasObj.canvas;
      cv.addEventListener('mousedown',  onDown, false);
      cv.addEventListener('mousemove',  onMove, false);
      cv.addEventListener('mouseup',    onUp,   false);
      cv.addEventListener('touchstart', onDown, { passive: false });
      cv.addEventListener('touchmove',  onMove, { passive: false });
      cv.addEventListener('touchend',   onUp,   false);
    }

    function start() {
      if (!state) return;
      state.phase = 'playing';
      state.currentStep = 0;
      state.attempts = 1;
      state.errors = 0;
      state.beakerFills = [];
      state.resultShown = false;
      state.score = 0;
      state.statusEl.textContent = 'Steg 1 av 4';
      state.instrEl.classList.remove('nmg-hidden');
      state.resultEl.classList.add('nmg-hidden');
      // Reset bottles
      for (var i = 0; i < state.bottles.length; i++) {
        state.bottles[i].x = state.bottles[i].homeX;
        state.bottles[i].y = state.bottles[i].homeY;
        state.bottles[i].used = false;
        state.bottles[i].dragging = false;
      }
      loop();
    }

    function getScore() {
      return state ? state.score : 0;
    }

    function destroy() {
      if (animFrame) cancelAnimationFrame(animFrame);
      animFrame = null;
      if (container) container.innerHTML = '';
      state = null;
    }

    // ── Pointer events ──
    function onDown(e) {
      if (!state || state.phase !== 'playing') return;
      e.preventDefault();
      var pos = getPointerPos(canvasObj.canvas, e);
      // Check if touching a bottle (reverse order so topmost first)
      for (var i = state.bottles.length - 1; i >= 0; i--) {
        var b = state.bottles[i];
        if (b.used) continue;
        if (pos.x >= b.x && pos.x <= b.x + b.w && pos.y >= b.y && pos.y <= b.y + b.h) {
          b.dragging = true;
          state.dragging = b;
          state.dragOffsetX = pos.x - b.x;
          state.dragOffsetY = pos.y - b.y;
          break;
        }
      }
    }

    function onMove(e) {
      if (!state || !state.dragging) return;
      e.preventDefault();
      var pos = getPointerPos(canvasObj.canvas, e);
      state.dragging.x = pos.x - state.dragOffsetX;
      state.dragging.y = pos.y - state.dragOffsetY;
    }

    function onUp(e) {
      if (!state || !state.dragging) return;
      e.preventDefault();
      var b = state.dragging;
      b.dragging = false;
      state.dragging = null;

      // Check if dropped on beaker zone
      var beakerX = W / 2 - 50, beakerY = 200, beakerW = 100, beakerH = 160;
      var bCenterX = b.x + b.w / 2;
      var bCenterY = b.y + b.h / 2;

      if (bCenterX > beakerX && bCenterX < beakerX + beakerW &&
          bCenterY > beakerY && bCenterY < beakerY + beakerH + 40) {
        // Dropped on beaker - check if correct
        var expected = CORRECT_ORDER[state.currentStep];
        if (b.ingredient.id === expected) {
          // Correct!
          b.used = true;
          state.beakerFills.push(b.ingredient.color);
          state.pourAnim = { t: 0, color: b.ingredient.pourColor };
          state.currentStep++;
          if (state.currentStep >= CORRECT_ORDER.length) {
            state.statusEl.textContent = 'Klart!';
            setTimeout(finishGame, 800);
          } else {
            state.statusEl.textContent = 'Steg ' + (state.currentStep + 1) + ' av 4';
          }
          // Move bottle off screen
          b.x = -200;
          b.y = -200;
        } else {
          // Wrong!
          state.errors++;
          state.shakeAnim = { t: 0 };
          spawnPoof(W / 2, beakerY + 40);
          state.statusEl.textContent = 'Fel! F\u00f6rs\u00f6k igen \u2014 steg ' + (state.currentStep + 1) + ' av 4';
          // Snap back
          b.x = b.homeX;
          b.y = b.homeY;
        }
      } else {
        // Dropped elsewhere - snap back
        b.x = b.homeX;
        b.y = b.homeY;
      }
    }

    function spawnPoof(cx, cy) {
      state.poofParticles = [];
      for (var i = 0; i < 20; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = 1 + Math.random() * 3;
        state.poofParticles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          life: 1,
          size: 3 + Math.random() * 5,
          color: Math.random() > 0.5 ? COLORS.copperLight : COLORS.goldLight
        });
      }
    }

    function finishGame() {
      if (!state) return;
      state.phase = 'done';
      // Score: 0 errors = 2, 1-2 errors = 1, 3+ errors = 0
      if (state.errors === 0) state.score = 2;
      else if (state.errors <= 2) state.score = 1;
      else state.score = 0;

      state.instrEl.classList.add('nmg-hidden');
      state.resultEl.classList.remove('nmg-hidden');
      state.resultEl.innerHTML = '';
      var scoreDisp = createDiv(state.resultEl, 'nmg-score-display');
      scoreDisp.textContent = (4 - Math.min(state.errors, 4)) + ' / 4';
      var txt = createDiv(state.resultEl, 'nmg-result-text');
      if (state.errors === 0) {
        txt.innerHTML = 'Perfekt! Alfred blandar nitroglycerinet felfritt.<br><strong>+2 Kunskap</strong>';
      } else if (state.errors <= 2) {
        txt.innerHTML = 'Bra jobbat! N\u00e5gra misstag, men Alfred l\u00e4r sig.<br><strong>+1 Kunskap</strong>';
      } else {
        txt.innerHTML = 'Det kr\u00e4vde m\u00e5nga f\u00f6rs\u00f6k, men Alfred ger inte upp.';
      }
    }

    // ── Render loop ──
    function loop() {
      if (!state) return;
      draw();
      if (state.phase !== 'done' || state.poofParticles.length > 0 || state.pourAnim) {
        animFrame = requestAnimationFrame(loop);
      }
    }

    function draw() {
      var ctx = canvasObj.ctx;
      var shakeX = 0;

      // Shake animation
      if (state.shakeAnim) {
        state.shakeAnim.t += 0.12;
        if (state.shakeAnim.t >= 1) {
          state.shakeAnim = null;
        } else {
          shakeX = Math.sin(state.shakeAnim.t * 20) * 6 * (1 - state.shakeAnim.t);
        }
      }

      ctx.save();
      ctx.translate(shakeX, 0);

      // Background
      ctx.fillStyle = COLORS.parchment;
      ctx.fillRect(0, 0, W, H);

      // Shelf
      drawShelf(ctx);

      // Beaker
      drawBeaker(ctx);

      // Pour animation
      if (state.pourAnim) {
        state.pourAnim.t += 0.03;
        if (state.pourAnim.t >= 1) {
          state.pourAnim = null;
        } else {
          drawPourStream(ctx, state.pourAnim);
        }
      }

      // Bottles
      for (var i = 0; i < state.bottles.length; i++) {
        var b = state.bottles[i];
        if (!b.used) drawBottle(ctx, b);
      }

      // Poof particles
      for (var i = state.poofParticles.length - 1; i >= 0; i--) {
        var p = state.poofParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= 0.025;
        if (p.life <= 0) {
          state.poofParticles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Drop zone hint
      if (state.phase === 'playing' && !state.dragging) {
        ctx.fillStyle = COLORS.brownLight;
        ctx.font = '0.75rem ' + FONT_BODY;
        ctx.textAlign = 'center';
        ctx.fillText('Dra en flaska hit \u2193', W / 2, 195);
      }

      // Completion sparkle
      if (state.phase === 'done') {
        drawCompletionSparkle(ctx);
      }

      ctx.restore();
    }

    function drawShelf(ctx) {
      // Wooden shelf
      ctx.fillStyle = COLORS.brown;
      roundRect(ctx, 10, 102, W - 20, 10, 3);
      ctx.fill();
      // Shelf shadow
      ctx.fillStyle = 'rgba(42,31,20,0.1)';
      ctx.fillRect(10, 112, W - 20, 4);
    }

    function drawBeaker(ctx) {
      var bx = W / 2 - 50, by = 220, bw = 100, bh = 140;

      // Beaker body (glass look)
      ctx.strokeStyle = COLORS.brownLight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx + 5, by);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx + bw, by + bh);
      ctx.lineTo(bx + bw - 5, by);
      ctx.stroke();

      // Beaker fill
      var fillCount = state.beakerFills.length;
      if (fillCount > 0) {
        var segH = (bh - 10) / 4;
        for (var i = 0; i < fillCount; i++) {
          var fy = by + bh - (i + 1) * segH;
          var fw = bw - 10 + (5 * (bh - (fy - by)) / bh);
          var fx = bx + (bw - fw) / 2;
          ctx.fillStyle = state.beakerFills[i];
          ctx.globalAlpha = 0.7;
          ctx.fillRect(fx + 2, fy, fw - 4, segH);
          ctx.globalAlpha = 1;
        }
      }

      // Beaker rim
      ctx.strokeStyle = COLORS.copper;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx - 5, by);
      ctx.lineTo(bx + bw + 5, by);
      ctx.stroke();

      // Beaker lip marks
      ctx.strokeStyle = 'rgba(90,58,40,0.15)';
      ctx.lineWidth = 1;
      for (var i = 1; i <= 3; i++) {
        var my = by + bh * i / 4;
        ctx.beginPath();
        ctx.moveTo(bx + 8, my);
        ctx.lineTo(bx + 22, my);
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = COLORS.brown;
      ctx.font = 'bold 0.8rem ' + FONT_BODY;
      ctx.textAlign = 'center';
      ctx.fillText('B\u00e4gare', W / 2, by + bh + 22);
    }

    function drawPourStream(ctx, anim) {
      var pourX = W / 2;
      var startY = 130;
      var endY = 230 + 100 * anim.t;
      ctx.strokeStyle = anim.color;
      ctx.lineWidth = 4;
      ctx.globalAlpha = 1 - anim.t * 0.5;
      ctx.beginPath();
      ctx.moveTo(pourX, startY);
      ctx.lineTo(pourX + Math.sin(anim.t * 10) * 3, endY);
      ctx.stroke();
      ctx.globalAlpha = 1;
      // Splash at bottom
      if (anim.t > 0.3) {
        var splashR = (anim.t - 0.3) * 15;
        ctx.fillStyle = anim.color;
        ctx.globalAlpha = 0.4 * (1 - anim.t);
        ctx.beginPath();
        ctx.arc(pourX, 340, splashR, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    function drawBottle(ctx, b) {
      var x = b.x, y = b.y, w = b.w, h = b.h;
      var ing = b.ingredient;

      // Shadow when dragging
      if (b.dragging) {
        ctx.fillStyle = 'rgba(42,31,20,0.15)';
        roundRect(ctx, x + 3, y + 3, w, h, 8);
        ctx.fill();
      }

      // Bottle body
      ctx.fillStyle = COLORS.parchDark;
      roundRect(ctx, x, y, w, h, 8);
      ctx.fill();
      ctx.strokeStyle = b.dragging ? COLORS.gold : COLORS.copper;
      ctx.lineWidth = b.dragging ? 2.5 : 1.5;
      roundRect(ctx, x, y, w, h, 8);
      ctx.stroke();

      // Liquid inside
      ctx.fillStyle = ing.color;
      ctx.globalAlpha = 0.6;
      roundRect(ctx, x + 6, y + h * 0.35, w - 12, h * 0.5, 4);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Neck
      ctx.fillStyle = COLORS.brown;
      roundRect(ctx, x + w / 2 - 8, y - 2, 16, 12, 3);
      ctx.fill();

      // Label
      ctx.fillStyle = COLORS.dark;
      ctx.font = 'bold 0.7rem ' + FONT_BODY;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ing.label, x + w / 2, y + h - 14);
      ctx.textBaseline = 'alphabetic';
    }

    var sparkleTime = 0;
    function drawCompletionSparkle(ctx) {
      sparkleTime += 0.05;
      for (var i = 0; i < 8; i++) {
        var angle = sparkleTime + i * Math.PI / 4;
        var r = 40 + Math.sin(sparkleTime * 2 + i) * 10;
        var sx = W / 2 + Math.cos(angle) * r;
        var sy = 300 + Math.sin(angle) * r * 0.5;
        var size = 2 + Math.sin(sparkleTime * 3 + i) * 1.5;
        ctx.fillStyle = i % 2 === 0 ? COLORS.gold : COLORS.copper;
        ctx.globalAlpha = 0.5 + Math.sin(sparkleTime * 4 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    return { init: init, start: start, getScore: getScore, destroy: destroy };
  })();


  /* ============================================================
     CH3: NITROGLYCERIN STABILIZATION  --  Steady-hand path
     ============================================================ */
  var ch3 = (function () {
    var state, container, canvasObj, animFrame;
    var W = 360, H = 460;

    function init(containerId) {
      container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';

      var wrapper = createDiv(container, 'nmg-wrapper');
      var titleEl = createDiv(wrapper, 'nmg-title');
      titleEl.textContent = 'Stabilisera nitroglycerinet!';
      var subEl = createDiv(wrapper, 'nmg-subtitle');
      subEl.textContent = 'F\u00f6r mark\u00f6ren genom den smala banan utan att r\u00f6ra v\u00e4ggarna.';

      var instrEl = createDiv(wrapper, 'nmg-instructions');
      instrEl.innerHTML = 'H\u00e5ll fingret/musen intryckt och f\u00f6r mark\u00f6ren l\u00e4ngs den smala v\u00e4gen. Om du r\u00f6r v\u00e4ggarna minskar stabilitetem. Ju l\u00e4ngre du kommer utan att r\u00f6ra, desto b\u00e4ttre!';

      state = {
        phase: 'ready',
        wrapper: wrapper,
        instrEl: instrEl,
        statusEl: null,
        resultEl: null,
        score: 0,
        // Path: array of { cx, cy, radius } defining the center and width of the corridor
        pathPoints: [],
        pathWidth: 30,    // corridor half-width
        // Player cursor
        cursorX: 0,
        cursorY: 0,
        isDown: false,
        progress: 0,      // 0..1 how far along the path
        stability: 100,   // percentage
        wallTouches: 0,
        touchCooldown: 0,
        // Beaker fill visual
        beakerFill: 0,
        // Timer
        timeLeft: 20,     // seconds
        lastTime: 0,
        // Tremor animation
        tremorT: 0,
        completed: false
      };

      var statusEl = createDiv(wrapper, 'nmg-status');
      state.statusEl = statusEl;

      // Progress bar for stability
      var progWrap = createDiv(wrapper, 'nmg-progress-bar');
      var progFill = createDiv(progWrap, 'nmg-progress-fill');
      progFill.style.width = '100%';
      progFill.style.background = 'linear-gradient(to right, ' + COLORS.moss + ', ' + COLORS.mossLight + ')';
      state.progFill = progFill;

      canvasObj = createCanvas(wrapper, W, H);

      var resultEl = createDiv(wrapper, 'nmg-hidden');
      state.resultEl = resultEl;

      // Build winding path
      buildPath();

      // Events
      var cv = canvasObj.canvas;
      cv.addEventListener('mousedown',  onDown, false);
      cv.addEventListener('mousemove',  onMove, false);
      cv.addEventListener('mouseup',    onUp,   false);
      cv.addEventListener('mouseleave', onUp,   false);
      cv.addEventListener('touchstart', onDown, { passive: false });
      cv.addEventListener('touchmove',  onMove, { passive: false });
      cv.addEventListener('touchend',   onUp,   false);
    }

    function buildPath() {
      // Generate a winding path from top to bottom
      var points = [];
      var segments = 20;
      var startX = W / 2;
      var startY = 40;
      var endY = H - 60;
      var segLen = (endY - startY) / segments;

      for (var i = 0; i <= segments; i++) {
        var t = i / segments;
        var cx = startX + Math.sin(t * Math.PI * 3) * 80 + Math.sin(t * Math.PI * 5) * 30;
        cx = Math.max(50, Math.min(W - 50, cx));
        var cy = startY + i * segLen;
        points.push({ cx: cx, cy: cy });
      }
      state.pathPoints = points;
    }

    function start() {
      if (!state) return;
      state.phase = 'playing';
      state.progress = 0;
      state.stability = 100;
      state.wallTouches = 0;
      state.touchCooldown = 0;
      state.beakerFill = 0;
      state.timeLeft = 20;
      state.lastTime = performance.now();
      state.completed = false;
      state.score = 0;
      state.isDown = false;
      state.cursorX = state.pathPoints[0].cx;
      state.cursorY = state.pathPoints[0].cy;
      state.tremorT = 0;
      state.statusEl.textContent = 'Stabilitet: 100% | Tid: 20s';
      state.instrEl.classList.remove('nmg-hidden');
      state.resultEl.classList.add('nmg-hidden');
      state.progFill.style.width = '100%';
      state.progFill.style.background = 'linear-gradient(to right, ' + COLORS.moss + ', ' + COLORS.mossLight + ')';
      loop();
    }

    function getScore() {
      return state ? state.score : 0;
    }

    function destroy() {
      if (animFrame) cancelAnimationFrame(animFrame);
      animFrame = null;
      if (container) container.innerHTML = '';
      state = null;
    }

    function onDown(e) {
      if (!state || state.phase !== 'playing') return;
      e.preventDefault();
      state.isDown = true;
      var pos = getPointerPos(canvasObj.canvas, e);
      state.cursorX = pos.x;
      state.cursorY = pos.y;
    }

    function onMove(e) {
      if (!state || !state.isDown || state.phase !== 'playing') return;
      e.preventDefault();
      var pos = getPointerPos(canvasObj.canvas, e);
      state.cursorX = pos.x;
      state.cursorY = pos.y;
    }

    function onUp(e) {
      if (!state) return;
      state.isDown = false;
    }

    function getPathPointAt(progress) {
      var idx = progress * (state.pathPoints.length - 1);
      var i0 = Math.floor(idx);
      var i1 = Math.min(i0 + 1, state.pathPoints.length - 1);
      var f = idx - i0;
      return {
        cx: state.pathPoints[i0].cx + (state.pathPoints[i1].cx - state.pathPoints[i0].cx) * f,
        cy: state.pathPoints[i0].cy + (state.pathPoints[i1].cy - state.pathPoints[i0].cy) * f
      };
    }

    function findClosestProgress(px, py) {
      var best = 0, bestDist = Infinity;
      for (var i = 0; i < 200; i++) {
        var t = i / 199;
        var p = getPathPointAt(t);
        var dx = p.cx - px, dy = p.cy - py;
        var d = dx * dx + dy * dy;
        if (d < bestDist) { bestDist = d; best = t; }
      }
      return best;
    }

    function loop() {
      if (!state || state.phase === 'ready') return;

      var now = performance.now();
      var dt = (now - state.lastTime) / 1000;
      state.lastTime = now;

      if (state.phase === 'playing') {
        // Timer
        state.timeLeft -= dt;
        if (state.timeLeft <= 0) {
          state.timeLeft = 0;
          finishGame();
          draw();
          return;
        }

        // Check cursor progress along path
        if (state.isDown) {
          var closestProg = findClosestProgress(state.cursorX, state.cursorY);
          // Only allow forward movement (or small backward for correction)
          if (closestProg > state.progress - 0.02) {
            state.progress = Math.max(state.progress, closestProg);
          }

          // Check wall collision
          var pathPoint = getPathPointAt(state.progress);
          var dx = state.cursorX - pathPoint.cx;
          var dy = state.cursorY - pathPoint.cy;
          var dist = Math.sqrt(dx * dx + dy * dy);

          state.touchCooldown = Math.max(0, state.touchCooldown - dt);

          if (dist > state.pathWidth && state.touchCooldown <= 0) {
            state.wallTouches++;
            state.stability = Math.max(0, state.stability - 5);
            state.touchCooldown = 0.3;
            state.tremorT = 1;
          }
        }

        // Tremor decay
        if (state.tremorT > 0) state.tremorT = Math.max(0, state.tremorT - dt * 3);

        // Beaker fill tracks progress
        state.beakerFill = state.progress;

        // Update status
        state.statusEl.textContent = 'Stabilitet: ' + Math.round(state.stability) + '% | Tid: ' + Math.ceil(state.timeLeft) + 's';
        state.progFill.style.width = state.stability + '%';
        if (state.stability < 40) {
          state.progFill.style.background = 'linear-gradient(to right, ' + COLORS.red + ', ' + COLORS.redLight + ')';
        } else if (state.stability < 70) {
          state.progFill.style.background = 'linear-gradient(to right, ' + COLORS.gold + ', ' + COLORS.goldLight + ')';
        }

        // Check completion
        if (state.progress >= 0.95) {
          finishGame();
        }
      }

      draw();

      if (state.phase === 'playing' || state.tremorT > 0) {
        animFrame = requestAnimationFrame(loop);
      }
    }

    function finishGame() {
      if (!state || state.completed) return;
      state.completed = true;
      state.phase = 'done';

      // Score: stability >= 70 = 2 (equivalent to "Lyckat"), >= 40 = 1, < 40 = 0
      if (state.stability >= 70) state.score = 2;
      else if (state.stability >= 40) state.score = 1;
      else state.score = 0;

      // But if time ran out and progress low, cap score
      if (state.progress < 0.5) state.score = 0;

      state.instrEl.classList.add('nmg-hidden');
      state.resultEl.classList.remove('nmg-hidden');
      state.resultEl.innerHTML = '';

      var scoreDisp = createDiv(state.resultEl, 'nmg-score-display');
      scoreDisp.textContent = Math.round(state.stability) + '%';

      var txt = createDiv(state.resultEl, 'nmg-result-text');
      if (state.score >= 2) {
        txt.innerHTML = 'Utm\u00e4rkt! Alfred stabiliserade nitroglycerinet med stadig hand!<br><strong>+2 Kunskap</strong>';
      } else if (state.score >= 1) {
        txt.innerHTML = 'Bra f\u00f6rs\u00f6k! Det skakade lite, men Alfred klarade det.<br><strong>+1 Kunskap</strong>';
      } else {
        txt.innerHTML = 'Instabilt! Alfred m\u00e5ste vara f\u00f6rsiktigare n\u00e4sta g\u00e5ng.';
      }
    }

    function draw() {
      var ctx = canvasObj.ctx;
      var tremorX = state.tremorT > 0 ? Math.sin(performance.now() * 0.05) * 4 * state.tremorT : 0;

      ctx.save();
      ctx.translate(tremorX, 0);

      // Background
      ctx.fillStyle = COLORS.parchment;
      ctx.fillRect(0, 0, W, H);

      // Draw path corridor
      drawPathCorridor(ctx);

      // Draw beaker on side
      drawSideBeaker(ctx);

      // Draw cursor
      if (state.isDown && state.phase === 'playing') {
        var pp = getPathPointAt(state.progress);
        ctx.fillStyle = COLORS.gold;
        ctx.strokeStyle = COLORS.dark;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(state.cursorX, state.cursorY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner glow
        ctx.fillStyle = COLORS.goldLight;
        ctx.beginPath();
        ctx.arc(state.cursorX, state.cursorY, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Start/end markers
      var startP = state.pathPoints[0];
      var endP = state.pathPoints[state.pathPoints.length - 1];

      ctx.fillStyle = COLORS.mossLight;
      ctx.font = 'bold 0.75rem ' + FONT_BODY;
      ctx.textAlign = 'center';
      ctx.fillText('START', startP.cx, startP.cy - 20);

      ctx.fillStyle = COLORS.gold;
      ctx.fillText('M\u00c5L', endP.cx, endP.cy + 25);

      // Progress indicator along path
      if (state.progress > 0) {
        var progP = getPathPointAt(state.progress);
        ctx.fillStyle = COLORS.mossLight;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(progP.cx, progP.cy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    }

    function drawPathCorridor(ctx) {
      var pts = state.pathPoints;
      var hw = state.pathWidth;

      // Outer (wall) fill
      ctx.fillStyle = COLORS.parchDark;
      ctx.beginPath();
      // Left edge
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var nx = 1, ny = 0; // simplified normal
        if (i < pts.length - 1) {
          var dx = pts[i + 1].cx - p.cx;
          var dy = pts[i + 1].cy - p.cy;
          var len = Math.sqrt(dx * dx + dy * dy);
          nx = -dy / len;
          ny = dx / len;
        }
        if (i === 0) ctx.moveTo(p.cx + nx * hw, p.cy + ny * hw);
        else ctx.lineTo(p.cx + nx * hw, p.cy + ny * hw);
      }
      // Right edge (reverse)
      for (var i = pts.length - 1; i >= 0; i--) {
        var p = pts[i];
        var nx = 1, ny = 0;
        if (i < pts.length - 1) {
          var dx = pts[i + 1].cx - p.cx;
          var dy = pts[i + 1].cy - p.cy;
          var len = Math.sqrt(dx * dx + dy * dy);
          nx = -dy / len;
          ny = dx / len;
        }
        ctx.lineTo(p.cx - nx * hw, p.cy - ny * hw);
      }
      ctx.closePath();
      ctx.fill();

      // Inner path (walkable area) - lighter
      ctx.fillStyle = '#f0e8d0';
      var ihw = hw - 4;
      ctx.beginPath();
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var nx = 1, ny = 0;
        if (i < pts.length - 1) {
          var dx = pts[i + 1].cx - p.cx;
          var dy = pts[i + 1].cy - p.cy;
          var len = Math.sqrt(dx * dx + dy * dy);
          nx = -dy / len;
          ny = dx / len;
        }
        if (i === 0) ctx.moveTo(p.cx + nx * ihw, p.cy + ny * ihw);
        else ctx.lineTo(p.cx + nx * ihw, p.cy + ny * ihw);
      }
      for (var i = pts.length - 1; i >= 0; i--) {
        var p = pts[i];
        var nx = 1, ny = 0;
        if (i < pts.length - 1) {
          var dx = pts[i + 1].cx - p.cx;
          var dy = pts[i + 1].cy - p.cy;
          var len = Math.sqrt(dx * dx + dy * dy);
          nx = -dy / len;
          ny = dx / len;
        }
        ctx.lineTo(p.cx - nx * ihw, p.cy - ny * ihw);
      }
      ctx.closePath();
      ctx.fill();

      // Progress highlight (how far the player has gotten)
      if (state.progress > 0) {
        var upTo = Math.floor(state.progress * (pts.length - 1));
        ctx.strokeStyle = COLORS.mossLight;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(pts[0].cx, pts[0].cy);
        for (var i = 1; i <= upTo; i++) {
          ctx.lineTo(pts[i].cx, pts[i].cy);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    function drawSideBeaker(ctx) {
      // Small beaker on the right showing fill level
      var bx = W - 45, by = 40, bw = 28, bh = 80;

      ctx.strokeStyle = COLORS.brownLight;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx - 2, by + bh);
      ctx.lineTo(bx + bw + 2, by + bh);
      ctx.lineTo(bx + bw, by);
      ctx.stroke();

      // Fill
      var fillH = bh * state.beakerFill * 0.9;
      if (fillH > 0) {
        var grad = ctx.createLinearGradient(bx, by + bh - fillH, bx, by + bh);
        grad.addColorStop(0, COLORS.glycerin);
        grad.addColorStop(0.5, COLORS.acid);
        grad.addColorStop(1, COLORS.mixture);
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(bx + 1, by + bh - fillH, bw, fillH);
        ctx.globalAlpha = 1;
      }

      // Label
      ctx.fillStyle = COLORS.brownLight;
      ctx.font = '0.6rem ' + FONT_BODY;
      ctx.textAlign = 'center';
      ctx.fillText('Fyllnad', bx + bw / 2, by + bh + 14);
      ctx.fillText(Math.round(state.beakerFill * 100) + '%', bx + bw / 2, by + bh + 26);
    }

    return { init: init, start: start, getScore: getScore, destroy: destroy };
  })();


  /* ============================================================
     CH4: DYNAMITE MIXING  --  Drop-based mixing simulation
     ============================================================ */
  var ch4 = (function () {
    var state, container, canvasObj, animFrame;
    var W = 360, H = 460;

    function init(containerId) {
      container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';

      var wrapper = createDiv(container, 'nmg-wrapper');
      var titleEl = createDiv(wrapper, 'nmg-title');
      titleEl.textContent = 'Blanda dynamit!';
      var subEl = createDiv(wrapper, 'nmg-subtitle');
      subEl.textContent = 'Tryck p\u00e5 flaskorna f\u00f6r att l\u00e4gga till droppar. Hitta r\u00e4tt blandning!';

      var instrEl = createDiv(wrapper, 'nmg-instructions');
      instrEl.innerHTML = 'Nitroglycerin (m\u00f6rk) och kiselgur (sand) m\u00e5ste blandas i r\u00e4tt proportion: <strong>75% nitro, 25% kiselgur</strong>. Tryck p\u00e5 flaskorna f\u00f6r att l\u00e4gga till droppar i sk\u00e5len. N\u00e4r du \u00e4r n\u00f6jd, tryck p\u00e5 <strong>"Testa!"</strong>.';

      state = {
        phase: 'ready',
        wrapper: wrapper,
        instrEl: instrEl,
        statusEl: null,
        resultEl: null,
        testBtn: null,
        score: 0,
        // Bowl contents
        nitroDrops: 0,
        kiselDrops: 0,
        maxDrops: 20,
        // Drop animations in bowl
        drops: [],      // { x, y, color, splashT, radius }
        // Splash particles
        splashes: [],
        // Explosion animation
        explosionAnim: null, // { t, stable }
        explosionParticles: [],
        // Button areas
        nitroBtn: { x: 30,  y: 30, w: 100, h: 60 },
        kiselBtn: { x: 230, y: 30, w: 100, h: 60 },
        // Stability meter position
        meterX: 30, meterY: 110, meterW: 300, meterH: 20
      };

      var statusEl = createDiv(wrapper, 'nmg-status');
      statusEl.textContent = 'Droppar: 0 | Nitro: 0% | Kiselgur: 0%';
      state.statusEl = statusEl;

      canvasObj = createCanvas(wrapper, W, H);

      // Test button
      var btnWrap = createDiv(wrapper, '');
      btnWrap.style.marginTop = '8px';
      var testBtn = document.createElement('button');
      testBtn.className = 'nmg-btn nmg-btn-gold';
      testBtn.textContent = 'Testa!';
      testBtn.addEventListener('click', testMix);
      btnWrap.appendChild(testBtn);
      state.testBtn = testBtn;

      var resultEl = createDiv(wrapper, 'nmg-hidden');
      state.resultEl = resultEl;

      // Events
      var cv = canvasObj.canvas;
      cv.addEventListener('mousedown', onClick, false);
      cv.addEventListener('touchstart', onClick, { passive: false });
    }

    function start() {
      if (!state) return;
      state.phase = 'playing';
      state.nitroDrops = 0;
      state.kiselDrops = 0;
      state.drops = [];
      state.splashes = [];
      state.explosionAnim = null;
      state.explosionParticles = [];
      state.score = 0;
      state.testBtn.style.display = '';
      state.instrEl.classList.remove('nmg-hidden');
      state.resultEl.classList.add('nmg-hidden');
      updateStatus();
      loop();
    }

    function getScore() {
      return state ? state.score : 0;
    }

    function destroy() {
      if (animFrame) cancelAnimationFrame(animFrame);
      animFrame = null;
      if (container) container.innerHTML = '';
      state = null;
    }

    function onClick(e) {
      if (!state || state.phase !== 'playing') return;
      e.preventDefault();
      var pos = getPointerPos(canvasObj.canvas, e);
      var totalDrops = state.nitroDrops + state.kiselDrops;

      if (totalDrops >= state.maxDrops) return;

      var nb = state.nitroBtn;
      var kb = state.kiselBtn;

      if (pos.x >= nb.x && pos.x <= nb.x + nb.w && pos.y >= nb.y && pos.y <= nb.y + nb.h) {
        state.nitroDrops++;
        addDrop('#8B5E3C');
      } else if (pos.x >= kb.x && pos.x <= kb.x + kb.w && pos.y >= kb.y && pos.y <= kb.y + kb.h) {
        state.kiselDrops++;
        addDrop('#D4B878');
      }
      updateStatus();
    }

    function addDrop(color) {
      // Bowl center area
      var bowlCX = W / 2;
      var bowlCY = 310;
      var bowlR = 80;
      var angle = Math.random() * Math.PI * 2;
      var dist = Math.random() * (bowlR - 15);
      var dx = bowlCX + Math.cos(angle) * dist;
      var dy = bowlCY + Math.sin(angle) * dist * 0.5; // flatten for top-down view

      state.drops.push({
        x: dx, y: dy,
        color: color,
        splashT: 1,
        radius: 6 + Math.random() * 4
      });

      // Splash particles
      for (var i = 0; i < 6; i++) {
        var a = Math.random() * Math.PI * 2;
        var sp = 1 + Math.random() * 2;
        state.splashes.push({
          x: dx, y: dy,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 1,
          life: 1,
          size: 2 + Math.random() * 2,
          color: color
        });
      }
    }

    function updateStatus() {
      var total = state.nitroDrops + state.kiselDrops;
      var nitroPct = total > 0 ? Math.round(state.nitroDrops / total * 100) : 0;
      var kiselPct = total > 0 ? Math.round(state.kiselDrops / total * 100) : 0;
      state.statusEl.textContent = 'Droppar: ' + total + '/' + state.maxDrops + ' | Nitro: ' + nitroPct + '% | Kiselgur: ' + kiselPct + '%';
    }

    function testMix() {
      if (!state || state.phase !== 'playing') return;
      var total = state.nitroDrops + state.kiselDrops;
      if (total === 0) {
        state.statusEl.textContent = 'L\u00e4gg till \u00e5tminstone n\u00e5gra droppar f\u00f6rst!';
        return;
      }

      state.phase = 'exploding';
      state.testBtn.style.display = 'none';

      var nitroPct = state.nitroDrops / total * 100;
      var quality = Math.max(0, 100 - Math.abs(75 - nitroPct) * 3);
      var stable = quality >= 60;

      state.explosionAnim = { t: 0, stable: stable, quality: quality };

      // Create explosion particles
      state.explosionParticles = [];
      var count = stable ? 30 : 60;
      for (var i = 0; i < count; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = stable ? (2 + Math.random() * 3) : (3 + Math.random() * 8);
        state.explosionParticles.push({
          x: W / 2,
          y: 310,
          vx: Math.cos(angle) * speed * (stable ? 0.5 : 1),
          vy: Math.sin(angle) * speed - (stable ? 1 : 3),
          life: 1,
          size: stable ? (3 + Math.random() * 4) : (2 + Math.random() * 8),
          color: stable
            ? (Math.random() > 0.5 ? COLORS.gold : COLORS.copper)
            : (Math.random() > 0.3 ? COLORS.red : '#ff6600')
        });
      }
    }

    function finishGame() {
      if (!state) return;
      state.phase = 'done';

      var total = state.nitroDrops + state.kiselDrops;
      var nitroPct = total > 0 ? state.nitroDrops / total * 100 : 0;
      var quality = Math.max(0, 100 - Math.abs(75 - nitroPct) * 3);

      if (quality >= 70) state.score = 2;
      else if (quality >= 40) state.score = 1;
      else state.score = 0;

      state.instrEl.classList.add('nmg-hidden');
      state.resultEl.classList.remove('nmg-hidden');
      state.resultEl.innerHTML = '';

      var scoreDisp = createDiv(state.resultEl, 'nmg-score-display');
      scoreDisp.textContent = Math.round(quality) + '%';

      var txt = createDiv(state.resultEl, 'nmg-result-text');
      if (state.score >= 2) {
        txt.innerHTML = 'Utm\u00e4rkt blandning! Dynamiten \u00e4r stabil och kraftfull.<br><strong>+2 Kunskap</strong>';
      } else if (state.score >= 1) {
        txt.innerHTML = 'Godtagbar blandning. Fungerar, men kan f\u00f6rb\u00e4ttras.<br><strong>+1 Kunskap</strong>';
      } else {
        txt.innerHTML = 'Instabil blandning! Alfred m\u00e5ste f\u00f6rs\u00f6ka igen.';
      }
    }

    function loop() {
      if (!state) return;
      draw();

      // Animate splashes
      for (var i = state.splashes.length - 1; i >= 0; i--) {
        var s = state.splashes[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.08;
        s.life -= 0.04;
        if (s.life <= 0) state.splashes.splice(i, 1);
      }

      // Drop splash animation
      for (var i = 0; i < state.drops.length; i++) {
        if (state.drops[i].splashT > 0) {
          state.drops[i].splashT -= 0.05;
        }
      }

      // Explosion animation
      if (state.explosionAnim) {
        state.explosionAnim.t += 0.015;
        for (var i = state.explosionParticles.length - 1; i >= 0; i--) {
          var p = state.explosionParticles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.1;
          p.life -= 0.015;
          if (p.life <= 0) state.explosionParticles.splice(i, 1);
        }
        if (state.explosionAnim.t >= 1) {
          finishGame();
        }
      }

      if (state.phase !== 'done') {
        animFrame = requestAnimationFrame(loop);
      }
    }

    function draw() {
      var ctx = canvasObj.ctx;

      // Background
      ctx.fillStyle = COLORS.parchment;
      ctx.fillRect(0, 0, W, H);

      // Ingredient buttons
      drawIngredientBtn(ctx, state.nitroBtn, '#8B5E3C', 'Nitroglycerin', state.nitroDrops);
      drawIngredientBtn(ctx, state.kiselBtn, '#D4B878', 'Kiselgur', state.kiselDrops);

      // Stability meter
      drawStabilityMeter(ctx);

      // Bowl (top-down view)
      drawBowl(ctx);

      // Drops in bowl
      for (var i = 0; i < state.drops.length; i++) {
        var d = state.drops[i];
        var r = d.radius;
        if (d.splashT > 0) {
          r *= 1 + d.splashT * 0.5;
        }
        ctx.fillStyle = d.color;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Splash particles
      for (var i = 0; i < state.splashes.length; i++) {
        var s = state.splashes[i];
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.life;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Explosion particles
      if (state.explosionAnim) {
        // Flash
        if (state.explosionAnim.t < 0.15) {
          ctx.fillStyle = state.explosionAnim.stable ? 'rgba(255,200,60,0.3)' : 'rgba(255,60,20,0.4)';
          ctx.fillRect(0, 0, W, H);
        }

        for (var i = 0; i < state.explosionParticles.length; i++) {
          var p = state.explosionParticles[i];
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Ideal ratio hint
      ctx.fillStyle = COLORS.brownLight;
      ctx.font = '0.7rem ' + FONT_BODY;
      ctx.textAlign = 'center';
      ctx.fillText('Idealt: 75% nitro / 25% kiselgur', W / 2, H - 10);
    }

    function drawIngredientBtn(ctx, btn, color, label, count) {
      // Button background
      ctx.fillStyle = COLORS.parchDark;
      roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 8);
      ctx.fill();
      ctx.strokeStyle = COLORS.copper;
      ctx.lineWidth = 2;
      roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 8);
      ctx.stroke();

      // Color swatch
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(btn.x + 25, btn.y + btn.h / 2, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COLORS.brown;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = COLORS.dark;
      ctx.font = 'bold 0.7rem ' + FONT_BODY;
      ctx.textAlign = 'left';
      ctx.fillText(label, btn.x + 42, btn.y + btn.h / 2 - 4);

      // Count
      ctx.fillStyle = COLORS.brownLight;
      ctx.font = '0.65rem ' + FONT_BODY;
      ctx.fillText(count + ' droppar', btn.x + 42, btn.y + btn.h / 2 + 12);
    }

    function drawStabilityMeter(ctx) {
      var mx = state.meterX, my = state.meterY, mw = state.meterW, mh = state.meterH;

      // Background
      ctx.fillStyle = COLORS.parchDark;
      roundRect(ctx, mx, my, mw, mh, 4);
      ctx.fill();

      // Calculate quality
      var total = state.nitroDrops + state.kiselDrops;
      var nitroPct = total > 0 ? state.nitroDrops / total * 100 : 0;
      var quality = total > 0 ? Math.max(0, 100 - Math.abs(75 - nitroPct) * 3) : 0;

      // Fill
      var fillW = mw * quality / 100;
      var fillColor = quality >= 70 ? COLORS.moss : quality >= 40 ? COLORS.gold : COLORS.red;
      ctx.fillStyle = fillColor;
      roundRect(ctx, mx, my, fillW, mh, 4);
      ctx.fill();

      // Ideal marker at 75%
      var idealX = mx + mw * 0.75;
      ctx.strokeStyle = COLORS.dark;
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(idealX, my - 4);
      ctx.lineTo(idealX, my + mh + 4);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = COLORS.brown;
      ctx.font = '0.7rem ' + FONT_BODY;
      ctx.textAlign = 'center';
      ctx.fillText('Stabilitet: ' + Math.round(quality) + '%', mx + mw / 2, my - 6);
    }

    function drawBowl(ctx) {
      var cx = W / 2, cy = 310, rx = 95, ry = 55;

      // Bowl shadow
      ctx.fillStyle = 'rgba(42,31,20,0.1)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 8, rx + 5, ry + 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bowl body
      ctx.fillStyle = '#d4c4a8';
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bowl rim
      ctx.strokeStyle = COLORS.copper;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Inner bowl texture
      ctx.strokeStyle = 'rgba(90,58,40,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx - 15, ry - 10, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Bowl label
      ctx.fillStyle = COLORS.brownLight;
      ctx.font = '0.75rem ' + FONT_BODY;
      ctx.textAlign = 'center';
      ctx.fillText('Blandningssk\u00e5l', cx, cy + ry + 20);
    }

    return { init: init, start: start, getScore: getScore, destroy: destroy };
  })();


  /* ============================================================
     CH5: FACTORY LOGISTICS  --  Map-based delivery game
     ============================================================ */
  var ch5 = (function () {
    var state, container, canvasObj, animFrame;
    var W = 360, H = 480;

    // City data with approximate positions on a simplified Europe map
    var CITIES = [
      { id: 'stockholm', name: 'Stockholm',  x: 245, y: 95,  country: 'Sverige' },
      { id: 'hamburg',   name: 'Hamburg',     x: 190, y: 160, country: 'Tyskland', isHQ: true },
      { id: 'paris',     name: 'Paris',       x: 130, y: 210, country: 'Frankrike' },
      { id: 'glasgow',   name: 'Glasgow',     x: 100, y: 100, country: 'Skottland' },
      { id: 'milano',    name: 'Milano',      x: 185, y: 250, country: 'Italien' }
    ];

    // Orders (same 5 as original, mapped to city IDs)
    var ORDERS = [
      { text: 'Stockholms gruvor beh\u00f6ver spr\u00e4ng\u00e4mnen f\u00f6r j\u00e4rnmalm.', icon: '\u26CF',  correctCity: 'stockholm' },
      { text: 'Hamburg bygger en tunnel under Elbe!',                                          icon: '\uD83D\uDE87', correctCity: 'hamburg' },
      { text: 'Frankrike bygger j\u00e4rnv\u00e4g genom Alperna.',                             icon: '\uD83D\uDE82', correctCity: 'paris' },
      { text: 'Skottlands kolgruvor i Glasgow beh\u00f6ver spr\u00e4ng\u00e4mnen.',            icon: '\u26CF',  correctCity: 'glasgow' },
      { text: 'Milano bygger underjordisk vattenledning.',                                     icon: '\uD83D\uDE87', correctCity: 'milano' }
    ];

    function init(containerId) {
      container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';

      var wrapper = createDiv(container, 'nmg-wrapper');
      var titleEl = createDiv(wrapper, 'nmg-title');
      titleEl.textContent = 'Fabriksimperiet';
      var subEl = createDiv(wrapper, 'nmg-subtitle');
      subEl.textContent = 'Dra l\u00e5dorna till r\u00e4tt stad p\u00e5 kartan!';

      var instrEl = createDiv(wrapper, 'nmg-instructions');
      instrEl.innerHTML = 'Ordrar fr\u00e5n Alfreds fabriker! L\u00e4s varje best\u00e4llning och <strong>dra l\u00e5dan</strong> fr\u00e5n Hamburgs lager till r\u00e4tt stad. Leverera alla 5 ordrar innan tiden rinner ut!';

      state = {
        phase: 'ready',
        wrapper: wrapper,
        instrEl: instrEl,
        statusEl: null,
        resultEl: null,
        score: 0,
        // Game state
        orders: [],
        currentOrder: 0,
        totalOrders: 5,
        correctDeliveries: 0,
        // Timer
        timeLeft: 45,
        lastTime: 0,
        // Crate drag
        crateX: 0,
        crateY: 0,
        crateHomeX: 0,
        crateHomeY: 0,
        isDragging: false,
        dragOffsetX: 0,
        dragOffsetY: 0,
        // Animations
        feedback: null,     // { type: 'correct'|'wrong', t: 0, cityId, text }
        routeAnim: null,    // { t, fromX, fromY, toX, toY }
        deliveredCities: [], // city IDs that are done
        sparkles: []
      };

      var statusEl = createDiv(wrapper, 'nmg-status');
      state.statusEl = statusEl;

      // Timer bar
      var timerWrap = createDiv(wrapper, 'nmg-progress-bar');
      var timerFill = createDiv(timerWrap, 'nmg-progress-fill');
      timerFill.style.width = '100%';
      timerFill.style.background = 'linear-gradient(to right, ' + COLORS.moss + ', ' + COLORS.gold + ')';
      state.timerFill = timerFill;

      canvasObj = createCanvas(wrapper, W, H);

      // Order text below canvas
      var orderEl = createDiv(wrapper, '');
      orderEl.style.cssText = 'background:' + COLORS.parchDark + '; border-radius:8px; padding:12px; margin-top:8px; min-height:60px;';
      state.orderEl = orderEl;

      var resultEl = createDiv(wrapper, 'nmg-hidden');
      state.resultEl = resultEl;

      // Events
      var cv = canvasObj.canvas;
      cv.addEventListener('mousedown',  onDown, false);
      cv.addEventListener('mousemove',  onMove, false);
      cv.addEventListener('mouseup',    onUp,   false);
      cv.addEventListener('touchstart', onDown, { passive: false });
      cv.addEventListener('touchmove',  onMove, { passive: false });
      cv.addEventListener('touchend',   onUp,   false);
    }

    function start() {
      if (!state) return;
      state.phase = 'playing';
      state.orders = shuffle(ORDERS);
      state.currentOrder = 0;
      state.correctDeliveries = 0;
      state.timeLeft = 45;
      state.lastTime = performance.now();
      state.score = 0;
      state.isDragging = false;
      state.feedback = null;
      state.routeAnim = null;
      state.deliveredCities = [];
      state.sparkles = [];
      state.instrEl.classList.remove('nmg-hidden');
      state.resultEl.classList.add('nmg-hidden');
      state.orderEl.style.display = '';

      // Place crate at Hamburg
      var hq = getCityById('hamburg');
      state.crateHomeX = hq.x - 12;
      state.crateHomeY = hq.y + 20;
      state.crateX = state.crateHomeX;
      state.crateY = state.crateHomeY;

      showCurrentOrder();
      loop();
    }

    function getScore() {
      return state ? state.score : 0;
    }

    function destroy() {
      if (animFrame) cancelAnimationFrame(animFrame);
      animFrame = null;
      if (container) container.innerHTML = '';
      state = null;
    }

    function getCityById(id) {
      for (var i = 0; i < CITIES.length; i++) {
        if (CITIES[i].id === id) return CITIES[i];
      }
      return null;
    }

    function showCurrentOrder() {
      if (!state || state.currentOrder >= state.totalOrders) return;
      var order = state.orders[state.currentOrder];
      state.statusEl.textContent = 'Order ' + (state.currentOrder + 1) + ' av ' + state.totalOrders + ' | R\u00e4tt: ' + state.correctDeliveries;
      state.orderEl.innerHTML = '<div style="font-size:1.4rem; margin-bottom:4px;">' + order.icon + '</div><div style="font-size:0.9rem; color:' + COLORS.brown + ';">' + order.text + '</div>';

      // Reset crate
      var hq = getCityById('hamburg');
      state.crateHomeX = hq.x - 12;
      state.crateHomeY = hq.y + 20;
      state.crateX = state.crateHomeX;
      state.crateY = state.crateHomeY;
    }

    function onDown(e) {
      if (!state || state.phase !== 'playing' || state.feedback) return;
      e.preventDefault();
      var pos = getPointerPos(canvasObj.canvas, e);

      // Check if touching crate
      var crateW = 24, crateH = 20;
      if (pos.x >= state.crateX && pos.x <= state.crateX + crateW &&
          pos.y >= state.crateY && pos.y <= state.crateY + crateH) {
        state.isDragging = true;
        state.dragOffsetX = pos.x - state.crateX;
        state.dragOffsetY = pos.y - state.crateY;
      }
    }

    function onMove(e) {
      if (!state || !state.isDragging) return;
      e.preventDefault();
      var pos = getPointerPos(canvasObj.canvas, e);
      state.crateX = pos.x - state.dragOffsetX;
      state.crateY = pos.y - state.dragOffsetY;
    }

    function onUp(e) {
      if (!state || !state.isDragging) return;
      e.preventDefault();
      state.isDragging = false;

      // Check if dropped on a city
      var order = state.orders[state.currentOrder];
      var crateCenter = { x: state.crateX + 12, y: state.crateY + 10 };
      var hitCity = null;
      var hitDist = 30; // detection radius

      for (var i = 0; i < CITIES.length; i++) {
        var c = CITIES[i];
        if (c.isHQ) continue; // Can't deliver to HQ itself (unless it's the target)
        var dx = crateCenter.x - c.x;
        var dy = crateCenter.y - c.y;
        if (Math.sqrt(dx * dx + dy * dy) < hitDist) {
          hitCity = c;
          break;
        }
      }

      // Also check Hamburg as a valid target
      if (!hitCity) {
        var hq = getCityById('hamburg');
        var dx = crateCenter.x - hq.x;
        var dy = crateCenter.y - hq.y;
        if (Math.sqrt(dx * dx + dy * dy) < hitDist) {
          hitCity = hq;
        }
      }

      if (hitCity && hitCity.id === order.correctCity) {
        // Correct!
        state.correctDeliveries++;
        state.feedback = { type: 'correct', t: 0, cityId: hitCity.id, text: 'R\u00e4tt!' };
        state.deliveredCities.push(hitCity.id);

        // Route animation from Hamburg
        var hq = getCityById('hamburg');
        state.routeAnim = {
          t: 0,
          fromX: hq.x, fromY: hq.y,
          toX: hitCity.x, toY: hitCity.y
        };

        // Sparkles
        for (var s = 0; s < 10; s++) {
          state.sparkles.push({
            x: hitCity.x, y: hitCity.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4 - 1,
            life: 1,
            size: 2 + Math.random() * 3,
            color: Math.random() > 0.5 ? COLORS.gold : COLORS.mossLight
          });
        }
      } else if (hitCity) {
        // Wrong city
        state.feedback = { type: 'wrong', t: 0, cityId: hitCity.id, text: 'Fel stad!' };
      }

      // Snap crate back
      state.crateX = state.crateHomeX;
      state.crateY = state.crateHomeY;

      // After feedback, advance
      if (state.feedback) {
        setTimeout(function () {
          if (!state) return;
          state.feedback = null;
          state.routeAnim = null;
          state.currentOrder++;
          if (state.currentOrder >= state.totalOrders) {
            finishGame();
          } else {
            showCurrentOrder();
          }
        }, 1200);
      }
    }

    function finishGame() {
      if (!state) return;
      state.phase = 'done';

      // Score: 5/5 = 2, 3-4/5 = 1, < 3 = 0
      var bonus = 0;
      if (state.correctDeliveries >= 5) { state.score = 2; bonus = 2; }
      else if (state.correctDeliveries >= 3) { state.score = 1; bonus = 1; }
      else { state.score = 0; }

      state.instrEl.classList.add('nmg-hidden');
      state.orderEl.style.display = 'none';
      state.resultEl.classList.remove('nmg-hidden');
      state.resultEl.innerHTML = '';

      var scoreDisp = createDiv(state.resultEl, 'nmg-score-display');
      scoreDisp.textContent = state.correctDeliveries + ' / ' + state.totalOrders;

      var txt = createDiv(state.resultEl, 'nmg-result-text');
      if (state.score >= 2) {
        txt.innerHTML = 'Perfekt! Alla leveranser n\u00e5dde r\u00e4tt stad!<br><strong>+2 Kapital</strong>';
      } else if (state.score >= 1) {
        txt.innerHTML = 'Bra jobbat! De flesta leveranserna kom r\u00e4tt.<br><strong>+1 Kapital</strong>';
      } else {
        txt.innerHTML = 'Det blev lite r\u00f6rigt, men Alfred l\u00e4r sig!';
      }
    }

    function loop() {
      if (!state) return;

      var now = performance.now();
      var dt = (now - state.lastTime) / 1000;
      state.lastTime = now;

      if (state.phase === 'playing') {
        // Timer
        state.timeLeft -= dt;
        if (state.timeLeft <= 0) {
          state.timeLeft = 0;
          finishGame();
        }
        state.timerFill.style.width = (state.timeLeft / 45 * 100) + '%';
        if (state.timeLeft < 10) {
          state.timerFill.style.background = 'linear-gradient(to right, ' + COLORS.red + ', ' + COLORS.redLight + ')';
        }
      }

      // Feedback timer
      if (state.feedback) {
        state.feedback.t += dt;
      }

      // Route animation
      if (state.routeAnim) {
        state.routeAnim.t += dt * 2;
      }

      // Sparkles
      for (var i = state.sparkles.length - 1; i >= 0; i--) {
        var s = state.sparkles[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.05;
        s.life -= 0.025;
        if (s.life <= 0) state.sparkles.splice(i, 1);
      }

      draw();

      if (state.phase !== 'done') {
        animFrame = requestAnimationFrame(loop);
      }
    }

    function draw() {
      var ctx = canvasObj.ctx;

      // Background - map area
      ctx.fillStyle = '#dde8d0'; // light green for land
      ctx.fillRect(0, 0, W, H);

      // Sea areas (simplified)
      drawMap(ctx);

      // City markers
      for (var i = 0; i < CITIES.length; i++) {
        drawCity(ctx, CITIES[i]);
      }

      // Route animation
      if (state.routeAnim && state.routeAnim.t < 1) {
        var ra = state.routeAnim;
        var progress = Math.min(1, ra.t);
        var curX = ra.fromX + (ra.toX - ra.fromX) * easeInOutQuad(progress);
        var curY = ra.fromY + (ra.toY - ra.fromY) * easeInOutQuad(progress);

        // Route line
        ctx.strokeStyle = COLORS.gold;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(ra.fromX, ra.fromY);
        ctx.lineTo(curX, curY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Truck/crate on route
        ctx.fillStyle = COLORS.copper;
        roundRect(ctx, curX - 8, curY - 6, 16, 12, 3);
        ctx.fill();
      }

      // Feedback overlay
      if (state.feedback) {
        var city = getCityById(state.feedback.cityId);
        if (city) {
          var isCorrect = state.feedback.type === 'correct';
          ctx.fillStyle = isCorrect ? 'rgba(45,80,22,0.8)' : 'rgba(204,68,68,0.8)';
          roundRect(ctx, city.x - 30, city.y - 35, 60, 22, 6);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 0.75rem ' + FONT_BODY;
          ctx.textAlign = 'center';
          ctx.fillText(state.feedback.text, city.x, city.y - 19);
        }
      }

      // Crate (draggable)
      if (state.phase === 'playing' && !state.feedback) {
        drawCrate(ctx, state.crateX, state.crateY, state.isDragging);
      }

      // Sparkles
      for (var i = 0; i < state.sparkles.length; i++) {
        var s = state.sparkles[i];
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.life;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function drawMap(ctx) {
      // Simplified Europe coastline (very rough shapes)
      // Sea
      ctx.fillStyle = '#b8cfe0';

      // North Sea / Atlantic (left)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(80, 0);
      ctx.lineTo(70, 50);
      ctx.lineTo(85, 80);
      ctx.lineTo(60, 130);
      ctx.lineTo(50, 160);
      ctx.lineTo(20, 200);
      ctx.lineTo(0, 200);
      ctx.closePath();
      ctx.fill();

      // Baltic Sea (around Stockholm)
      ctx.beginPath();
      ctx.moveTo(210, 0);
      ctx.lineTo(280, 0);
      ctx.lineTo(275, 40);
      ctx.lineTo(260, 70);
      ctx.lineTo(230, 80);
      ctx.lineTo(220, 60);
      ctx.lineTo(215, 30);
      ctx.closePath();
      ctx.fill();

      // North Atlantic top
      ctx.fillRect(0, 0, W, 15);

      // Mediterranean hints
      ctx.beginPath();
      ctx.moveTo(80, 280);
      ctx.lineTo(130, 270);
      ctx.lineTo(200, 280);
      ctx.lineTo(260, 290);
      ctx.lineTo(W, 310);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.lineTo(0, 320);
      ctx.closePath();
      ctx.fill();

      // British Isles shape
      ctx.fillStyle = '#d4dfc8';
      ctx.beginPath();
      ctx.moveTo(80, 60);
      ctx.lineTo(115, 55);
      ctx.lineTo(120, 80);
      ctx.lineTo(125, 120);
      ctx.lineTo(115, 150);
      ctx.lineTo(100, 155);
      ctx.lineTo(85, 135);
      ctx.lineTo(75, 100);
      ctx.closePath();
      ctx.fill();

      // Scandinavia shape
      ctx.fillStyle = '#c8d8b8';
      ctx.beginPath();
      ctx.moveTo(200, 0);
      ctx.lineTo(235, 0);
      ctx.lineTo(260, 30);
      ctx.lineTo(270, 80);
      ctx.lineTo(255, 100);
      ctx.lineTo(240, 115);
      ctx.lineTo(225, 120);
      ctx.lineTo(210, 100);
      ctx.lineTo(200, 60);
      ctx.closePath();
      ctx.fill();

      // Italy boot hint
      ctx.fillStyle = '#d4dfc8';
      ctx.beginPath();
      ctx.moveTo(175, 220);
      ctx.lineTo(195, 230);
      ctx.lineTo(205, 270);
      ctx.lineTo(210, 290);
      ctx.lineTo(195, 295);
      ctx.lineTo(180, 280);
      ctx.lineTo(170, 260);
      ctx.closePath();
      ctx.fill();

      // Country borders (very simplified dashed lines)
      ctx.strokeStyle = 'rgba(90,58,40,0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      // France-Germany border
      ctx.beginPath();
      ctx.moveTo(160, 150);
      ctx.lineTo(155, 200);
      ctx.lineTo(150, 240);
      ctx.stroke();
      // Germany-Italy-ish
      ctx.beginPath();
      ctx.moveTo(155, 210);
      ctx.lineTo(210, 220);
      ctx.stroke();
      ctx.setLineDash([]);

      // Map title
      ctx.fillStyle = COLORS.brownLight;
      ctx.font = 'italic 0.65rem ' + FONT_BODY;
      ctx.textAlign = 'left';
      ctx.fillText('Europa', 8, H - 8);
    }

    function drawCity(ctx, city) {
      var isDelivered = state.deliveredCities.indexOf(city.id) >= 0;
      var isHQ = city.isHQ;

      // City dot
      var dotR = isHQ ? 8 : 6;
      ctx.fillStyle = isHQ ? COLORS.copper : (isDelivered ? COLORS.mossLight : COLORS.brown);
      ctx.beginPath();
      ctx.arc(city.x, city.y, dotR, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring
      ctx.strokeStyle = isHQ ? COLORS.gold : COLORS.brownLight;
      ctx.lineWidth = isHQ ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.arc(city.x, city.y, dotR + 3, 0, Math.PI * 2);
      ctx.stroke();

      // Delivered checkmark
      if (isDelivered) {
        ctx.fillStyle = COLORS.mossLight;
        ctx.font = 'bold 0.85rem ' + FONT_BODY;
        ctx.textAlign = 'center';
        ctx.fillText('\u2713', city.x, city.y + 4);
      }

      // City label
      ctx.fillStyle = COLORS.dark;
      ctx.font = (isHQ ? 'bold ' : '') + '0.7rem ' + FONT_BODY;
      ctx.textAlign = 'center';
      ctx.fillText(city.name, city.x, city.y - dotR - 8);

      if (isHQ) {
        ctx.fillStyle = COLORS.copper;
        ctx.font = '0.6rem ' + FONT_BODY;
        ctx.fillText('(HQ)', city.x, city.y - dotR - 18);
      }
    }

    function drawCrate(ctx, x, y, dragging) {
      var cw = 24, ch = 20;

      if (dragging) {
        // Shadow
        ctx.fillStyle = 'rgba(42,31,20,0.2)';
        roundRect(ctx, x + 2, y + 2, cw, ch, 3);
        ctx.fill();
      }

      // Crate body
      ctx.fillStyle = '#c4975a';
      roundRect(ctx, x, y, cw, ch, 3);
      ctx.fill();
      ctx.strokeStyle = COLORS.brown;
      ctx.lineWidth = 1.5;
      roundRect(ctx, x, y, cw, ch, 3);
      ctx.stroke();

      // Cross on crate
      ctx.strokeStyle = COLORS.dark;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 4);
      ctx.lineTo(x + cw - 4, y + ch - 4);
      ctx.moveTo(x + cw - 4, y + 4);
      ctx.lineTo(x + 4, y + ch - 4);
      ctx.stroke();

      if (dragging) {
        // Glow
        ctx.strokeStyle = COLORS.gold;
        ctx.lineWidth = 2;
        roundRect(ctx, x - 2, y - 2, cw + 4, ch + 4, 5);
        ctx.stroke();
      }
    }

    return { init: init, start: start, getScore: getScore, destroy: destroy };
  })();


  // ── Public API ──────────────────────────────────────────
  return {
    ch2: ch2,
    ch3: ch3,
    ch4: ch4,
    ch5: ch5
  };

})();


/* ============================================================
   INTEGRATION NOTES
   ============================================================

   To integrate with the existing Nobel game HTML file:

   1. Include this script:
      <script src="nobel-minigames-v2.js"></script>

   2. Add a container div in each minigame screen. For example,
      in the ch2-minigame screen, add:
        <div id="ch2-minigame-v2-container"></div>

   3. Replace the current goToScreen hooks. In the existing code,
      where it says:
        if (screenId === 'ch2-minigame') setTimeout(ch2StartMiniGame, 500);

      Change to:
        if (screenId === 'ch2-minigame') {
          NobelMinigames.ch2.init('ch2-minigame-v2-container');
          setTimeout(function() { NobelMinigames.ch2.start(); }, 500);
        }

   4. To read the score (for gameState.miniGameScores):
        gameState.miniGameScores.ch2_chemistry = NobelMinigames.ch2.getScore();

      Call this from a "Continue" button, or hook into the result
      screen's continue action.

   5. Clean up when leaving the screen:
        NobelMinigames.ch2.destroy();

   6. Repeat for ch3, ch4, ch5 with their respective containers:
        - ch3-minigame-v2-container
        - ch4-minigame-v2-container
        - ch5-minigame-v2-container

   SCORING:
     ch2: 0 errors = 2, 1-2 errors = 1, 3+ errors = 0
     ch3: stability >= 70% = 2, >= 40% = 1, < 40% = 0
     ch4: quality  >= 70% = 2, >= 40% = 1, < 40% = 0
     ch5: 5/5 correct = 2, 3-4/5 = 1, < 3 = 0

   All scores return 0-2, matching the existing bonus system.
   ============================================================ */
