/* Motor de escenas: traceroute lateral, apariciones, ciclo de vida de cada capítulo */
(function () {
  var LT = window.LT;
  LT.slides = [];
  LT.current = -1;
  var inited = {};

  function initScene(id) {
    if (inited[id]) return; inited[id] = true;
    var s = LT.scenes[id];
    if (s && s.init) { try { s.init(LT.$('#' + id)); } catch (e) { console.error('init ' + id, e); } }
  }
  LT.initScene = initScene;

  LT.setCurrent = function (i) {
    if (i === LT.current || i < 0 || i >= LT.slides.length) return;
    var prev = LT.slides[LT.current];
    if (prev) { var ps = LT.scenes[prev.id]; if (ps && ps.leave) try { ps.leave(); } catch (e) { console.error(e); } }
    LT.current = i;
    var el = LT.slides[i];
    initScene(el.id);
    if (LT.slides[i + 1]) initScene(LT.slides[i + 1].id);
    var s = LT.scenes[el.id];
    if (s && s.enter) try { s.enter(); } catch (e) { console.error(e); }
    LT.$$('#trace a').forEach(function (a, k) { a.classList.toggle('on', k === i); if (k < i) a.classList.add('seen'); });
    LT.emit('slide', i);
    LT.emit('presenter-sync');
    if (!LT.pres || !LT.pres.active) { try { history.replaceState(null, '', '#' + el.id); } catch (e) {} }
  };

  LT.goto = function (target, smooth) {
    var i = typeof target === 'number' ? target : LT.slides.findIndex(function (s) { return s.id === target; });
    if (i < 0) return false;
    if (LT.pres && LT.pres.active) { LT.pres.go(i, 0); return true; }
    LT.slides[i].scrollIntoView({ behavior: smooth === false || LT.reduce ? 'auto' : 'smooth' });
    return true;
  };

  LT.engineStart = function () {
    LT.slides = LT.$$('.slide');
    var trace = LT.$('#trace');
    LT.slides.forEach(function (s, i) {
      var n = String(i + 1).padStart(2, '0');
      s.dataset.n = n;
      var a = LT.h('a', { href: '#' + s.id, title: s.dataset.title }, [LT.h('span', { text: n + ' · ' + s.dataset.title.toUpperCase() }), LT.h('i')]);
      a.addEventListener('click', function (e) { e.preventDefault(); LT.goto(i); });
      trace.appendChild(a);
    });

    /* Apariciones */
    var rvObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rvObs.unobserve(e.target); } });
    }, { threshold: .12 });
    LT.$$('.rv').forEach(function (el) { rvObs.observe(el); });

    /* Carga perezosa de escenas al acercarse */
    var nearObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) initScene(e.target.id); });
    }, { rootMargin: '60% 0px 60% 0px' });
    LT.slides.forEach(function (s) { nearObs.observe(s); });

    /* Capítulo activo según el scroll */
    function onScroll() {
      var h = document.documentElement;
      LT.$('#progress').style.width = (h.scrollTop / Math.max(1, h.scrollHeight - innerHeight) * 100) + '%';
      if (LT.pres && LT.pres.active) return;
      var mid = innerHeight * .45, cur = 0;
      for (var i = 0; i < LT.slides.length; i++) { if (LT.slides[i].getBoundingClientRect().top <= mid) cur = i; }
      LT.setCurrent(cur);
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };
})();
