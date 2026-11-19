/* Utilidades comunes. JS clásico (sin módulos) para que funcione con doble clic desde un USB. */
(function () {
  var LT = window.LT;
  LT.$ = function (s, r) { return (r || document).querySelector(s); };
  LT.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  /* h('div.clase#id', {attr}, [hijos | texto]) */
  LT.h = function (tag, attrs, kids) {
    var m = tag.match(/^([a-z0-9]+)?(.*)$/i), el = document.createElement(m[1] || 'div');
    (m[2].match(/[.#][^.#]+/g) || []).forEach(function (p) { if (p[0] === '.') el.classList.add(p.slice(1)); else el.id = p.slice(1); });
    if (attrs) for (var k in attrs) {
      if (k === 'html') el.innerHTML = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), attrs[k]);
      else if (k === 'style' && typeof attrs[k] === 'object') { for (var sk in attrs[k]) { if (sk.slice(0, 2) === '--') el.style.setProperty(sk, attrs[k][sk]); else el.style[sk] = attrs[k][sk]; } }
      else if (attrs[k] !== false && attrs[k] != null) el.setAttribute(k, attrs[k]);
    }
    if (kids != null) [].concat(kids).forEach(function (c) { if (c == null) return; el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  };
  LT.css = function (name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); };
  LT.esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  LT.fmt = function (n, d) {
    var p = Math.abs(Number(n)).toFixed(d || 0).split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (n < 0 ? '-' : '') + p[0] + (p[1] ? ',' + p[1] : '');
  };
  LT.reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  LT.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, LT.reduce ? 0 : ms); }); };
  LT.vlanColor = function (id) { return LT.css('--v' + id) || LT.css('--muted'); };

  /* Bus de eventos mínimo */
  var bus = {};
  LT.on = function (ev, fn) { (bus[ev] = bus[ev] || []).push(fn); };
  LT.emit = function (ev, data) { (bus[ev] || []).forEach(function (fn) { try { fn(data); } catch (e) { console.error(e); } }); };

  /* Registro de escenas: init (una vez, al acercarse), enter, leave, step(n) */
  LT.scenes = {};
  LT.scene = function (id, def) { LT.scenes[id] = def; };

  /* Escribe líneas en un <pre> como si fuese una terminal.
     lines: [{t:'texto', c:'t-cmd', type:true, wait:ms}] o strings. Devuelve una promesa.
     Se puede cancelar con el token devuelto en opts.token.cancel = true */
  LT.typeLines = function (pre, lines, opts) {
    opts = opts || {};
    var token = opts.token || { cancel: false };
    if (!opts.append) pre.innerHTML = '';
    var cur = LT.h('span.cursor');
    pre.appendChild(cur);
    var i = 0;
    return new Promise(function (resolve) {
      function next() {
        if (token.cancel) { cur.remove(); return resolve(false); }
        if (i >= lines.length) { if (!opts.keepCursor) cur.remove(); return resolve(true); }
        var L = lines[i++]; if (typeof L === 'string') L = { t: L };
        var span = LT.h('span' + (L.c ? '.' + L.c.split(' ').join('.') : ''));
        pre.insertBefore(span, cur);
        if (L.type && !LT.reduce) {
          var k = 0;
          (function ch() {
            if (token.cancel) { cur.remove(); return resolve(false); }
            span.textContent = L.t.slice(0, ++k);
            if (LT.audio) LT.audio.key();
            if (k < L.t.length) setTimeout(ch, (opts.speed || 22) + Math.random() * 30);
            else { pre.insertBefore(document.createTextNode('\n'), cur); pre.scrollTop = 1e9; setTimeout(next, L.wait != null ? L.wait : 260); }
          })();
        } else {
          if (L.html) span.innerHTML = L.t; else span.textContent = L.t;
          pre.insertBefore(document.createTextNode('\n'), cur);
          pre.scrollTop = 1e9;
          setTimeout(next, LT.reduce ? 0 : (L.wait != null ? L.wait : (opts.gap || 45)));
        }
      }
      next();
    });
  };

  /* Contador animado */
  LT.countUp = function (el, end, opts) {
    opts = opts || {};
    var dur = opts.dur || 1600, suf = opts.suffix || '', dec = opts.dec || 0, t0 = performance.now() + (opts.delay || 0);
    if (LT.reduce) { el.textContent = LT.fmt(end, dec) + suf; return; }
    (function f(now) {
      var k = Math.min(1, Math.max(0, (now - t0) / dur)), e = 1 - Math.pow(1 - k, 4);
      el.textContent = LT.fmt(end * e, dec) + suf;
      if (k < 1) requestAnimationFrame(f);
    })(performance.now());
  };

  LT.toast = function (msg, ms) {
    var t = LT.$('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, ms || 1800);
  };

  /* IP helpers */
  LT.ip2n = function (ip) { return ip.split('.').reduce(function (a, b) { return a * 256 + (+b); }, 0); };
  LT.inNet = function (ip, net, cidr) { var m = cidr === 0 ? 0 : Math.pow(2, 32) - Math.pow(2, 32 - cidr); return Math.floor(LT.ip2n(ip) / Math.pow(2, 32 - cidr)) === Math.floor(LT.ip2n(net) / Math.pow(2, 32 - cidr)) && m >= 0; };
})();
