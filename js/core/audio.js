/* Sonido opcional (silenciado por defecto). Sintetizado con WebAudio: no hay archivos de audio. */
(function () {
  var LT = window.LT, ctx = null, on = false;
  try { on = localStorage.getItem('lt-sound') === '1'; } catch (e) {}
  function ac() { if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (C) ctx = new C(); } return ctx; }
  function tone(f, d, type, vol, slide) {
    if (!on) return; var c = ac(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
    g.gain.setValueAtTime(vol || .05, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + .02);
  }
  var lastKey = 0;
  LT.audio = {
    get on() { return on; },
    toggle: function () {
      on = !on; try { localStorage.setItem('lt-sound', on ? '1' : '0'); } catch (e) {}
      if (on) { ac(); if (ctx && ctx.state === 'suspended') ctx.resume(); tone(880, .08, 'square', .03); }
      LT.emit('sound', on); return on;
    },
    key: function () { var n = performance.now(); if (n - lastKey < 35) return; lastKey = n; tone(1800 + Math.random() * 400, .015, 'square', .012); },
    click: function () { tone(1200, .04, 'square', .025); },
    ok: function () { tone(660, .08, 'sine', .05); setTimeout(function () { tone(990, .12, 'sine', .05); }, 80); },
    bad: function () { tone(220, .25, 'sawtooth', .04, 110); },
    whoosh: function () { tone(300, .35, 'sine', .03, 1200); },
    blip: function () { tone(1500, .03, 'sine', .03); },
    boot: function () { tone(110, .6, 'sine', .06, 440); }
  };
})();
