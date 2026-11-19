/* Arranque: HUD, atajos de teclado, tema, reloj */
(function () {
  var LT = window.LT;

  LT.toggleTheme = function (force) {
    var root = document.documentElement, plano = force != null ? force : root.dataset.theme !== 'plano';
    if (plano) root.dataset.theme = 'plano'; else delete root.dataset.theme;
    try { localStorage.setItem('lt-theme', plano ? 'plano' : 'noc'); } catch (e) {}
    LT.emit('theme', plano ? 'plano' : 'noc');
    return plano;
  };
  try { if (localStorage.getItem('lt-theme') === 'plano') document.documentElement.dataset.theme = 'plano'; } catch (e) {}

  function overlay(id, on) { var o = LT.$('#' + id); o.classList.toggle('open', on != null ? on : !o.classList.contains('open')); }
  function anyOverlay() { return LT.$$('.overlay.open'); }
  function soundIcon() { var x = LT.$('#snd-x'); if (x) x.style.display = LT.audio.on ? 'none' : ''; LT.$('#btn-sound').classList.toggle('on', LT.audio.on); }

  function wire() {
    LT.$('#btn-console').onclick = function () { LT.console.toggle(); };
    LT.$('#btn-pres').onclick = function () { LT.pres.toggle(); };
    LT.$('#btn-rubric').onclick = function () { overlay('rubric'); };
    LT.$('#btn-theme').onclick = function () { LT.toggleTheme(); };
    LT.$('#btn-sound').onclick = function () { LT.audio.toggle(); };
    LT.$('#btn-help').onclick = function () { overlay('help'); };
    LT.$('#pb-presenter').onclick = function (e) { e.stopPropagation(); LT.pres.openPresenter(); };
    LT.$('#pb-exit').onclick = function (e) { e.stopPropagation(); LT.pres.stop(); };
    LT.$$('[data-act]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        if (b.dataset.act === 'pres') LT.pres.start();
        if (b.dataset.act === 'console') LT.console.open();
      });
    });
    LT.$$('a[href^="#"]').forEach(function (a) {
      if (a.closest('#trace')) return;
      a.addEventListener('click', function (e) { var id = a.getAttribute('href').slice(1); if (id && LT.goto(id)) e.preventDefault(); });
    });
    LT.$$('.overlay').forEach(function (o) { o.addEventListener('click', function (e) { if (e.target === o) o.classList.remove('open'); }); });
    LT.on('sound', soundIcon); soundIcon();
  }

  function onKey(e) {
    var bt = LT.$('#boot'); if (bt && !bt.classList.contains('out')) return;
    var k = e.key, typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === 'k') { e.preventDefault(); LT.console.toggle(); return; }
    if (k === 'Escape') {
      if (LT.lightbox.isOpen) return LT.lightbox.close();
      if (LT.console.isOpen) return LT.console.close();
      var ov = anyOverlay(); if (ov.length) return ov.forEach(function (o) { o.classList.remove('open'); });
      if (LT.$('#blackout').classList.contains('on')) return LT.pres.blackout();
      if (LT.pres.active) return LT.pres.stop();
      return;
    }
    if (LT.lightbox.isOpen) {
      if (k === 'ArrowRight' || k === ' ') { e.preventDefault(); LT.lightbox.next(); }
      if (k === 'ArrowLeft') { e.preventDefault(); LT.lightbox.prev(); }
      return;
    }
    if (typing || LT.console.isOpen || e.ctrlKey || e.metaKey || e.altKey) return;
    var P = LT.pres;
    if (P.active && (k === 'ArrowRight' || k === 'ArrowDown' || k === ' ' || k === 'PageDown' || k === 'Enter')) { e.preventDefault(); P.next(); return; }
    if (P.active && (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || k === 'Backspace')) { e.preventDefault(); P.prev(); return; }
    if (P.active && k === 'Home') { P.go(0, 0); return; }
    if (P.active && k === 'End') { P.go(LT.slides.length - 1, 0); return; }
    if (!P.active && (k === 'PageDown' || k === 'PageUp')) { e.preventDefault(); LT.goto(Math.max(0, Math.min(LT.slides.length - 1, LT.current + (k === 'PageDown' ? 1 : -1)))); return; }
    switch (k.toLowerCase()) {
      case 'p': P.toggle(); break;
      case 's': P.openPresenter(); break;
      case 'f':
        if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
        else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {});
        break;
      case 'b': P.blackout(); break;
      case 'r': overlay('rubric'); break;
      case 't': LT.toggleTheme(); break;
      case 'm': LT.audio.toggle(); break;
      case '?': overlay('help'); break;
      default:
        if (/^[0-9]$/.test(k)) { var i = k === '0' ? 9 : +k - 1; LT.goto(i); }
    }
  }

  function clock() {
    var d = new Date(), c = LT.$('#clock');
    c.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()].map(function (x) { return String(x).padStart(2, '0'); }).join(':');
  }

  function start() {
    var h0 = location.hash;
    wire();
    LT.engineStart();
    if (h0) try { history.replaceState(null, '', h0); } catch (e) {}
    LT.emit('ready');
    addEventListener('keydown', onKey);
    clock(); setInterval(clock, 1000);
    if (h0) { var id = h0.slice(1); setTimeout(function () { LT.goto(id, false); }, 60); }
    LT.boot();
    if (/[?&]pres\b/.test(location.search)) LT.on('booted', function () { setTimeout(LT.pres.start, 300); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
