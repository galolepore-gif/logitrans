/* Portada: las dos sedes como constelaciones de equipos unidas por el túnel */
(function () {
  var LT = window.LT;
  var cv, cx, W, H, DPR, nodes = [], links = [], packets = [], running = false, mouse = { x: -1e4, y: -1e4 };
  var VC = ['--v10', '--v20', '--v40', '--v50', '--v99'];

  function build() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = cv.width = cv.clientWidth * DPR; H = cv.height = cv.clientHeight * DPR;
    nodes = []; links = []; packets = [];
    var R = Math.min(W, H), narrow = W < H;
    var sites = narrow
      ? [{ x: W * .5, y: H * .3, n: 90, r: R * .3, name: 'BCN · 10.1.0.0/16 · 350' }, { x: W * .5, y: H * .78, n: 40, r: R * .2, name: 'ZGZ · 10.2.0.0/16 · 150', z: 1 }]
      : [{ x: W * .2, y: H * .55, n: 110, r: R * .3, name: 'BCN · 10.1.0.0/16 · 350' }, { x: W * .82, y: H * .56, n: 46, r: R * .2, name: 'ZGZ · 10.2.0.0/16 · 150', z: 1 }];
    sites.forEach(function (s, si) {
      var core = nodes.push({ x: s.x, y: s.y, core: true, site: si, name: s.name, r: s.r }) - 1, acc = [], na = si ? 3 : 4;
      for (var a = 0; a < na; a++) {
        var ang = a / na * Math.PI * 2 + .4;
        acc.push(nodes.push({ x: s.x + Math.cos(ang) * s.r * .42, y: s.y + Math.sin(ang) * s.r * .42, acc: true }) - 1);
        links.push([core, acc[a], 1]);
      }
      for (var i = 0; i < s.n; i++) {
        var an = Math.random() * Math.PI * 2, d = s.r * (.58 + Math.random() * .5);
        var v = si && Math.random() < .55 ? '--v30' : VC[i % VC.length];
        var k = nodes.push({ x: s.x + Math.cos(an) * d, y: s.y + Math.sin(an) * d, v: v, ph: Math.random() * 6 }) - 1;
        var best = acc[0], bd = 1e12;
        acc.forEach(function (aa) { var dd = Math.pow(nodes[aa].x - nodes[k].x, 2) + Math.pow(nodes[aa].y - nodes[k].y, 2); if (dd < bd) { bd = dd; best = aa; } });
        links.push([best, k, 0]);
      }
    });
    links.push([0, nodes.findIndex(function (n) { return n.core && n.site === 1; }), 2]);
  }
  function bez(A, B, u) {
    var dx = (B.x - A.x), lift = Math.max(W, H) * .2;
    var c1 = { x: A.x + dx * .3, y: A.y - lift }, c2 = { x: B.x - dx * .3, y: B.y - lift };
    var m = 1 - u;
    return { x: m * m * m * A.x + 3 * m * m * u * c1.x + 3 * m * u * u * c2.x + u * u * u * B.x, y: m * m * m * A.y + 3 * m * m * u * c1.y + 3 * m * u * u * c2.y + u * u * u * B.y, c1: c1, c2: c2 };
  }
  function frame(t) {
    if (!running) return;
    var col = { line: LT.css('--line-2'), muted: LT.css('--muted'), brand: LT.css('--brand'), sig: LT.css('--signal'), text: LT.css('--text') };
    var vc = {}; VC.concat(['--v30']).forEach(function (v) { vc[v] = LT.css(v); });
    cx.clearRect(0, 0, W, H);
    links.forEach(function (l) {
      var A = nodes[l[0]], B = nodes[l[1]];
      cx.beginPath();
      if (l[2] === 2) {
        var b = bez(A, B, 0);
        cx.strokeStyle = col.sig; cx.globalAlpha = .55; cx.lineWidth = 2 * DPR; cx.setLineDash([7 * DPR, 7 * DPR]); cx.lineDashOffset = -t / 28;
        cx.moveTo(A.x, A.y); cx.bezierCurveTo(b.c1.x, b.c1.y, b.c2.x, b.c2.y, B.x, B.y); cx.stroke(); cx.setLineDash([]); cx.globalAlpha = 1; return;
      }
      cx.strokeStyle = col.line; cx.globalAlpha = l[2] ? .7 : .28; cx.lineWidth = (l[2] ? 1.2 : .7) * DPR;
      cx.moveTo(A.x, A.y); cx.lineTo(B.x, B.y); cx.stroke(); cx.globalAlpha = 1;
    });
    nodes.forEach(function (n) {
      if (n.core) {
        cx.fillStyle = col.brand; cx.shadowColor = col.brand; cx.shadowBlur = 30 * DPR;
        cx.beginPath(); cx.arc(n.x, n.y, 7 * DPR, 0, 7); cx.fill(); cx.shadowBlur = 0;
        cx.strokeStyle = col.brand; cx.globalAlpha = .35; cx.lineWidth = DPR;
        cx.beginPath(); cx.arc(n.x, n.y, (18 + Math.sin(t / 400) * 4) * DPR, 0, 7); cx.stroke(); cx.globalAlpha = 1;
        cx.font = '600 ' + (11 * DPR) + 'px "JetBrains Mono", monospace'; cx.fillStyle = col.muted; cx.textAlign = 'center';
        cx.fillText(n.name, n.x, n.y + n.r * 1.18);
      } else if (n.acc) { cx.fillStyle = col.text; cx.fillRect(n.x - 3 * DPR, n.y - 3 * DPR, 6 * DPR, 6 * DPR); }
      else {
        var dm = Math.hypot(n.x - mouse.x, n.y - mouse.y), near = dm < 90 * DPR;
        cx.globalAlpha = near ? 1 : .4 + .35 * Math.sin(t / 700 + n.ph);
        cx.fillStyle = vc[n.v]; cx.beginPath(); cx.arc(n.x, n.y, (near ? 3.2 : 1.9) * DPR, 0, 7); cx.fill(); cx.globalAlpha = 1;
      }
    });
    if (Math.random() < .4) { var l = links[(Math.random() * links.length) | 0]; packets.push({ l: l, t: 0, s: l[2] === 2 ? .0045 : .012 + Math.random() * .012, rev: Math.random() < .5 }); }
    packets = packets.filter(function (p) {
      p.t += p.s; if (p.t > 1) return false;
      var A = nodes[p.l[0]], B = nodes[p.l[1]]; if (p.rev) { var tmp = A; A = B; B = tmp; }
      var pt = p.l[2] === 2 ? bez(A, B, p.t) : { x: A.x + (B.x - A.x) * p.t, y: A.y + (B.y - A.y) * p.t };
      cx.fillStyle = p.l[2] === 2 ? col.sig : col.brand; cx.shadowColor = cx.fillStyle; cx.shadowBlur = 12 * DPR;
      cx.beginPath(); cx.arc(pt.x, pt.y, (p.l[2] === 2 ? 3 : 1.8) * DPR, 0, 7); cx.fill(); cx.shadowBlur = 0;
      return true;
    });
    requestAnimationFrame(frame);
  }
  LT.scene('inicio', {
    init: function (el) {
      cv = LT.$('#hero-net'); cx = cv.getContext('2d'); build();
      addEventListener('resize', function () { build(); });
      el.addEventListener('mousemove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = (e.clientX - r.left) * DPR; mouse.y = (e.clientY - r.top) * DPR; });
      LT.$$('[data-count]', el).forEach(function (n) { LT.countUp(n, +n.dataset.count, { suffix: n.dataset.suffix || '', delay: 700 }); });
    },
    enter: function () { if (!running) { running = true; requestAnimationFrame(frame); } },
    leave: function () { running = false; }
  });
})();
