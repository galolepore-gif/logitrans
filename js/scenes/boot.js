/* Secuencia de arranque tipo IOS. Se salta con cualquier tecla o clic. */
(function () {
  var LT = window.LT;
  var L = [
    '<span class="w">LogiTrans NETWORK OS</span> · ROM: Bootstrap, Version 17.9.4',
    'Copyright (c) 2026 por ASIX2C 0379 · Institut F. Vidal i Barraquer',
    '',
    'POST: CPU, memoria, interfaces ........................ <span class="ok">OK</span>',
    'Cargando planos P0 · P1 · P2 · P3 · Zaragoza ........... <span class="ok">OK</span>',
    'Cableado Cat 6A U/FTP LSZH · backbone OM4 ............... <span class="ok">OK</span>',
    'VLAN database: 10 20 30 40 50 99 · nativa 999 ........... <span class="ok">OK</span>',
    'Port-channel1 (LACP) Gi1/0/23 Gi1/0/24 .................. <span class="ok">UP</span>',
    'Spanning tree rapid-pvst · root BCN-CORE1 24576 ......... <span class="ok">OK</span>',
    'HSRP Vlan10..Vlan99 · Active ............................ <span class="ok">OK</span>',
    'crypto ikev1 sa 85.100.1.2 → 85.100.2.2 · AES-256 ...... <span class="ok">QM_IDLE</span>',
    'OSPF-10 neighbor 10.255.2.1 on Tunnel0 · MD5 ............ <span class="ok">FULL</span>',
    'ip nat inside source static 10.1.50.12 85.100.1.18 ...... <span class="ok">OK</span>',
    'logitrans.local · AD DS · DNS · DHCP · NPS .............. <span class="ok">RUNNING</span>',
    'docker compose: nginx wordpress db clients jellyfin ..... <span class="ok">HEALTHY</span>',
    '',
    '<span class="s">500 equipos · 2 sedes · 1 red.</span> <span class="o">Sistema listo.</span>'
  ];
  var done = false, timers = [];
  function finish() {
    if (done) return; done = true;
    timers.forEach(clearTimeout);
    var b = LT.$('#boot'); b.classList.add('out');
    setTimeout(function () { b.remove(); }, 900);
    LT.emit('booted');
  }
  LT.boot = function () {
    var log = LT.$('#boot-log'), bar = LT.$('#boot-bar'), logo = LT.$('#boot-logo');
    var skip = location.hash && location.hash !== '#inicio';
    try { if (sessionStorage.getItem('lt-booted')) skip = true; sessionStorage.setItem('lt-booted', '1'); } catch (e) {}
    if (skip || LT.reduce) { finish(); return; }
    LT.audio && LT.audio.boot();
    var t = 120;
    L.forEach(function (l, i) {
      timers.push(setTimeout(function () { log.innerHTML += l + '\n'; bar.style.width = ((i + 1) / L.length * 100) + '%'; LT.audio && LT.audio.key(); }, t));
      t += i < 3 ? 140 : 105;
    });
    timers.push(setTimeout(function () { logo.classList.add('on'); }, t));
    timers.push(setTimeout(finish, t + 1100));
    var b = LT.$('#boot');
    b.addEventListener('click', finish);
    addEventListener('keydown', function k() { finish(); removeEventListener('keydown', k); });
  };
})();
