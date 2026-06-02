/*
 * Hero background: a one-shot "software meets hardware" sketch.
 * Code keywords drift in from the left, computer-architecture components drift in
 * from the right, and they meet at a central connection line. It plays once,
 * settles, then dims into a faint static backdrop (no loop). Drawn light-on-dark.
 */
(function () {
  'use strict';

  var CODE = ['int', 'for', 'if', 'class', 'template<>', 'void', 'struct', '&&',
              'return', 'auto', 'const', 'nullptr', 'T*', '->', 'using', 'enum', '#include'];
  var ARCH = ['CPU', 'ALU', 'Cache', 'L1$', 'L2$', 'Register', 'Core', 'DRAM',
              'MMU', 'TLB', 'Bus', 'Pipeline', 'ROB', 'SRAM', 'NVM', 'Decoder'];

  function initHeroAnim(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d');

    var INTRO = opts.intro != null ? opts.intro : 3.4;  // seconds of motion
    var FADE  = opts.fade  != null ? opts.fade  : 1.5;  // seconds to dim to rest
    var REST  = opts.rest  != null ? opts.rest  : 0.14; // resting opacity multiplier
    var MOVE  = Math.max(0.6, INTRO - 1.0);

    var rand  = function (a, b) { return a + Math.random() * (b - a); };
    var pick  = function (a) { return a[(Math.random() * a.length) | 0]; };
    var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
    var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

    var w = 1, h = 1, lanes = [], raf = null, startT = 0, done = false;

    function layout() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function build() {
      var n = clamp(Math.floor(h / 44), 4, 12);
      lanes = [];
      for (var i = 0; i < n; i++) {
        var y = (i + 0.5) * (h / n);
        var codeRest = rand(0.10, 0.36) * w;
        var archRest = rand(0.64, 0.90) * w;
        lanes.push({
          y: y,
          code: { text: pick(CODE), restX: codeRest, startX: codeRest - rand(w * 0.55, w * 0.95), op: rand(0.24, 0.46), delay: rand(0, 0.7) },
          arch: { text: pick(ARCH), restX: archRest, startX: archRest + rand(w * 0.55, w * 0.95), op: rand(0.24, 0.46), delay: rand(0, 0.7) }
        });
      }
    }

    function draw(elapsed) {
      ctx.clearRect(0, 0, w, h);
      var master = elapsed > INTRO ? 1 - (1 - REST) * clamp((elapsed - INTRO) / FADE, 0, 1) : 1;
      var cx = w * 0.5, yTop = h * 0.10, yBot = h * 0.90;

      // Central connection line — draws downward over the first ~1.1s, then dims.
      var lineProg = clamp(elapsed / 1.1, 0, 1);
      ctx.strokeStyle = 'rgba(150,185,255,' + (0.16 * master) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, yTop);
      ctx.lineTo(cx, yTop + (yBot - yTop) * lineProg);
      ctx.stroke();

      ctx.font = '13px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textBaseline = 'middle';

      for (var i = 0; i < lanes.length; i++) {
        var L = lanes[i];
        var cl = clamp((elapsed - L.code.delay) / MOVE, 0, 1);
        var al = clamp((elapsed - L.arch.delay) / MOVE, 0, 1);
        var codeX = L.code.startX + (L.code.restX - L.code.startX) * easeOut(cl);
        var archX = L.arch.startX + (L.arch.restX - L.arch.startX) * easeOut(al);
        var codeA = L.code.op * Math.min(1, cl * 4) * master;
        var archA = L.arch.op * Math.min(1, al * 4) * master;
        var settle = Math.min(cl, al);

        // Faint connectors from each side into the central line, plus a node.
        if (settle > 0.15) {
          ctx.textAlign = 'left';
          var codeRight = codeX + ctx.measureText(L.code.text).width;
          ctx.textAlign = 'right';
          var archLeft = archX - ctx.measureText(L.arch.text).width;
          ctx.strokeStyle = 'rgba(150,185,255,' + (0.06 * master * settle) + ')';
          ctx.beginPath();
          ctx.moveTo(codeRight + 6, L.y); ctx.lineTo(cx - 3, L.y);
          ctx.moveTo(cx + 3, L.y); ctx.lineTo(archLeft - 6, L.y);
          ctx.stroke();
          ctx.fillStyle = 'rgba(150,185,255,' + (0.5 * master * settle) + ')';
          ctx.beginPath(); ctx.arc(cx, L.y, 1.6, 0, Math.PI * 2); ctx.fill();
        }

        if (codeA > 0.01) {
          ctx.textAlign = 'left';
          ctx.fillStyle = 'rgba(196,216,255,' + codeA + ')';
          ctx.fillText(L.code.text, codeX, L.y);
        }
        if (archA > 0.01) {
          ctx.textAlign = 'right';
          ctx.fillStyle = 'rgba(170,224,236,' + archA + ')';
          ctx.fillText(L.arch.text, archX, L.y);
        }
      }
      ctx.textAlign = 'left';
    }

    function frame(now) {
      if (!startT) startT = now;
      var elapsed = (now - startT) / 1000;
      draw(elapsed);
      if (elapsed < INTRO + FADE) raf = requestAnimationFrame(frame);
      else { draw(INTRO + FADE); done = true; }
    }

    function onResize() { layout(); build(); if (done) draw(INTRO + FADE); }

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    layout();
    build();
    window.addEventListener('resize', onResize);
    if (reduce) { draw(INTRO + FADE); done = true; }
    else { raf = requestAnimationFrame(frame); }
  }

  function start() {
    var canvas = document.getElementById('hero-bg');
    if (canvas) requestAnimationFrame(function () { initHeroAnim(canvas); });
  }
  if (document.readyState !== 'loading') start();
  else document.addEventListener('DOMContentLoaded', start);
})();
