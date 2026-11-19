/* El encargo: ticket del cliente y tablero de la rúbrica (Sprint 1 → ahora) */
(function () {
  var LT = window.LT;
  function rubricCells() {
    var g = LT.$('#rubric-grid');
    LT.RUBRIC.forEach(function (r, i) {
      var c = LT.h('button.rb.s' + r[2], { title: r[0] + ' · ' + r[1] + (r[3] ? ' · Profe: ' + r[3] : ''), style: { transitionDelay: (i * 25) + 'ms' } }, [LT.h('b', { text: r[0] }), LT.h('span', { text: r[1] }), LT.h('i', { text: 'S1: ' + r[2] + '/3' })]);
      c.onclick = function () { LT.goto(r[4]); };
      g.appendChild(c);
    });
    var s1 = LT.RUBRIC.reduce(function (a, r) { return a + r[2]; }, 0);
    LT.$('#rub-sum').textContent = 'S1: ' + s1 + ' / 90 · 30 / 30 resueltos';
    var tb = LT.$('#rubric-table tbody');
    LT.RUBRIC.forEach(function (r) {
      var tr = LT.h('tr', null, [LT.h('td.mono', { text: r[0] }), LT.h('td', { text: r[1] }), LT.h('td', {}, [LT.h('span.tag.s' + r[2], { text: r[2] + ' / 3' })]), LT.h('td.muted', { text: r[3] || '—' }), LT.h('td', {}, [LT.h('button.btn.small.sig', { text: 'Ver', onclick: function () { LT.$('#rubric').classList.remove('open'); LT.goto(r[4]); } })])]);
      tb.appendChild(tr);
    });
  }
  LT.scene('encargo', {
    init: function () {
      rubricCells();
      LT.$$('#req-list li').forEach(function (li, i) { li.style.transitionDelay = (300 + i * 140) + 'ms'; });
    },
    enter: function () { LT.$('#encargo').classList.add('go'); }
  });
  /* La tabla de la rúbrica también se usa en el overlay, así que se arma al cargar */
  LT.on('ready', function () { LT.initScene('encargo'); });
})();
