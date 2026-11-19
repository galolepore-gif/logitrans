/* Auditoría: Nmap con decisión puerto a puerto, regla de firewall y WPScan con y sin token */
(function () {
  var LT = window.LT, tokN = null, tokW = null, fwOn = false;

  function nmap() {
    if (tokN) tokN.cancel = true; tokN = { cancel: false };
    var pre = LT.$('#nmap-term');
    var lines = [
      { t: 'auditor@logitrans:~$ nmap -sV 10.1.50.12', c: 't-cmd', type: true, wait: 400 },
      { t: 'Starting Nmap 7.95 ( https://nmap.org )', c: 't-dim', wait: 600 },
      { t: 'Nmap scan report for srv-hv03.logitrans.local (10.1.50.12)', wait: 200 },
      { t: 'Host is up (0.00041s latency).' },
      { t: 'Not shown: 994 closed tcp ports (reset)', c: 't-dim', wait: 300 },
      { t: 'PORT      STATE SERVICE       VERSION', c: 't-sig' }
    ];
    LT.NMAP.forEach(function (p) {
      var blocked = fwOn && p.keep === false;
      lines.push({ t: (p.port + '          ').slice(0, 10) + (blocked ? 'filtered ' : 'open     ') + (p.svc + '              ').slice(0, 14) + p.ver, c: blocked ? 't-dim' : p.keep === true ? 't-ok' : p.keep === 'asa' ? 't-warn' : 't-bad', wait: 160 });
    });
    lines.push({ t: '', wait: 100 }, { t: 'Nmap done: 1 IP address (1 host up) scanned in 13.42 seconds', c: 't-dim' });
    LT.typeLines(pre, lines, { token: tokN, speed: 16 });
    ports();
  }
  function ports() {
    var box = LT.$('#ports'); box.innerHTML = '';
    LT.NMAP.forEach(function (p, i) {
      var blocked = fwOn && p.keep === false;
      var cls = p.keep === true ? 'keep' : p.keep === 'asa' ? 'asa' : (blocked ? 'closed' : 'kill');
      var tag = p.keep === true ? 'SE MANTIENE' : p.keep === 'asa' ? 'CERRADO EN EL ASA' : (blocked ? 'BLOQUEADO' : 'SOBRA');
      box.appendChild(LT.h('div.port.' + cls, { style: { '--d': (i * 90) + 'ms' } }, [LT.h('b.mono', { text: p.port }), LT.h('span.mono', { text: p.ver }), LT.h('em.mono', { text: tag }), LT.h('small', { text: p.why })]));
    });
  }
  function firewall() {
    if (fwOn) { fwOn = false; LT.$('#fw-go').textContent = 'Aplicar firewall'; nmap(); return; }
    fwOn = true;
    LT.$('#fw-go').textContent = 'Quitar la regla';
    var pre = LT.$('#nmap-term');
    if (tokN) tokN.cancel = true; tokN = { cancel: false };
    LT.typeLines(pre, [
      { t: 'PS C:\\> Get-NetTCPConnection -LocalPort 1042,7778 -State Listen | % { Get-Process -Id $_.OwningProcess }', c: 't-cmd', type: true, wait: 300 },
      { t: '  1042  asus_framework' , c: 't-warn' },
      { t: '  7778  ArmouryCrateControlInterface', c: 't-warn', wait: 400 },
      { t: 'PS C:\\> New-NetFirewallRule -DisplayName "LogiTrans-bloqueo-ASUS" -Direction Inbound -Protocol TCP -LocalPort 1042,7778 -Action Block', c: 't-cmd', type: true, wait: 300 },
      { t: 'DisplayName : LogiTrans-bloqueo-ASUS' },
      { t: 'Enabled     : True', c: 't-ok' },
      { t: 'Direction   : Inbound' },
      { t: 'Action      : Block', c: 't-ok', wait: 700 }
    ], { token: tokN, speed: 10 }).then(function (ok) { if (ok) { ports(); LT.audio && LT.audio.ok(); LT.toast('1042 y 7778 bloqueados · solo quedan 80 y 443 hacia fuera'); } });
  }

  function wpscan() {
    if (tokW) tokW.cancel = true; tokW = { cancel: false };
    var pre = LT.$('#wp-term'), res = LT.$('#wpres');
    res.innerHTML = '';
    LT.typeLines(pre, [
      { t: '$ wpscan --url https://logitrans.com', c: 't-cmd', type: true, wait: 400 },
      { t: '[+] WordPress theme in use: logitrans  | Version: 2.0', c: 't-sig' },
      { t: '[i] No Users Found.', c: 't-ok' },
      { t: '[!] No WPScan API Token given, as a result vulnerability data has not been output.', c: 't-warn' },
      { t: '[+] Requests Done: 1725 · Elapsed time: 00:00:11', c: 't-dim', wait: 700 },
      { t: '', wait: 50 },
      { t: '$ wpscan --url https://logitrans.com --disable-tls-checks --enumerate vp,vt,u --api-token ************', c: 't-cmd', type: true, wait: 400 },
      { t: '[i] No plugins Found.', c: 't-ok', wait: 200 },
      { t: '[i] No themes Found.', c: 't-ok', wait: 200 },
      { t: '[i] No Users Found.', c: 't-ok', wait: 200 },
      { t: '[+] WPScan DB API OK · plan gratuito', c: 't-sig' },
      { t: '[+] Requests Done: 1980 · Elapsed time: 00:00:14', c: 't-dim' }
    ], { token: tokW, speed: 10 }).then(function (ok) {
      if (!ok) return;
      res.innerHTML = [
        ['0', 'plugins vulnerables'], ['0', 'temas vulnerables'], ['0', 'usuarios enumerables'], ['1.980', 'peticiones en 14 s']
      ].map(function (r, i) { return '<div class="wr" style="--d:' + (i * 120) + 'ms"><b>' + r[0] + '</b><span>' + r[1] + '</span></div>'; }).join('') +
        '<p class="muted small">Sin usuarios, un atacante no sabe a quién atacar; y la fuerza bruta la corta Wordfence. El certificado autosignado (de ahí --disable-tls-checks) pasa a Let\'s Encrypt en producción.</p>';
      LT.audio && LT.audio.ok();
    });
  }

  LT.scene('auditoria', {
    steps: 3,
    init: function () {
      ports();
      LT.typeLines(LT.$('#nmap-term'), [{ t: '# Escaneo con detección de servicios contra el servidor web', c: 't-dim' }]);
      LT.typeLines(LT.$('#wp-term'), [{ t: '# WPScan: el escáner específico de WordPress', c: 't-dim' }]);
      LT.$('#nmap-go').onclick = nmap;
      LT.$('#fw-go').onclick = firewall;
    },
    enter: function () {
      if (LT.pres && LT.pres.active) return;
      if (!LT.$('#nmap-term').dataset.ran) { LT.$('#nmap-term').dataset.ran = 1; nmap(); setTimeout(wpscan, LT.reduce ? 0 : 1500); }
    },
    step: function (n) {
      if (n === 1) { fwOn = false; nmap(); }
      if (n === 2 && !fwOn) firewall();
      if (n === 3) wpscan();
    }
  });
})();
