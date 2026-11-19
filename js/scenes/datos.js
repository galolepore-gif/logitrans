/* RAID 5 (Storage Spaces Parity) que se puede romper con un clic, y robo de un disco cifrado con BitLocker */
(function () {
  var LT = window.LT, failed = [], blTok = null;
  var LAYOUT = [['A1', 'A2', 'Ap'], ['B1', 'Bp', 'B2'], ['Cp', 'C1', 'C2'], ['D1', 'D2', 'Dp'], ['E1', 'Ep', 'E2']];

  function disks() {
    var box = LT.$('#disks'); box.innerHTML = '';
    for (var d = 0; d < 3; d++) (function (d) {
      var col = LT.h('button.disk' + (failed.indexOf(d) >= 0 ? '.dead' : ''), { 'aria-label': 'Disco ' + (d + 1), title: failed.indexOf(d) >= 0 ? 'Volver a conectar' : 'Quitar este disco' });
      col.appendChild(LT.h('div.dk-h.mono', { html: '<b>PhysicalDisk' + (d + 1) + '</b><span>VBOX 5 GB</span>' }));
      LAYOUT.forEach(function (row, r) {
        var b = row[d], par = b.slice(-1) === 'p';
        col.appendChild(LT.h('i.blk' + (par ? '.par' : '') + '.r' + r, { text: par ? 'P(' + b[0] + ')' : b, style: { '--d': (r * 60 + d * 30) + 'ms' } }));
      });
      col.onclick = function () { toggle(d); };
      box.appendChild(col);
    })(d);
    state();
  }
  function toggle(d) {
    var k = failed.indexOf(d);
    if (k >= 0) failed.splice(k, 1); else failed.push(d);
    disks();
    if (failed.length === 1 && k < 0) rebuild();
    LT.audio && (failed.length ? LT.audio.bad() : LT.audio.ok());
  }
  function state() {
    var lbl = LT.$('#raid-lbl'), st = LT.$('#raid-st');
    var n = failed.length;
    lbl.textContent = n === 0 ? 'HEALTHY' : n === 1 ? 'DEGRADED' : 'DETACHED';
    lbl.className = n === 0 ? 'ok' : n === 1 ? 'warn' : 'bad';
    LT.$('#disks').className = 'disks f' + n;
    st.innerHTML = n === 0
      ? '<span class="ok">Get-PhysicalDisk</span> · 3 discos OK · Healthy<br>Volumen <b>R: Datos-RAID</b> en línea, cifrado con BitLocker.'
      : n === 1
        ? '<span class="warn">Aviso amarillo en Pool-RAID.</span> El volumen R: <b>sigue en línea</b>: cada bloque perdido se recalcula con los otros dos (XOR).<br><span class="muted">Solución: disco nuevo al pool y Repair-VirtualDisk. Clic en el disco para reconectarlo.</span>'
        : '<span class="bad">Dos discos fuera.</span> RAID 5 solo aguanta uno. Por eso existe la copia de seguridad. Volvé a conectar los discos.';
  }
  function rebuild() {
    var d = failed[0], col = LT.$$('#disks .disk')[d]; if (!col) return;
    LT.$$('.blk', col).forEach(function (b, r) {
      setTimeout(function () { if (b.isConnected) b.classList.add('ghost'); }, LT.reduce ? 0 : 300 + r * 180);
    });
  }

  function bitlocker() {
    var pre = LT.$('#bl-term');
    if (blTok) blTok.cancel = true;
    blTok = { cancel: false };
    LT.typeLines(pre, [
      { t: 'ubuntu@ladron:~$ lsblk -f /dev/sdb', c: 't-cmd', type: true, wait: 300 },
      { t: 'NAME   FSTYPE    LABEL  SIZE' },
      { t: 'sdb1   BitLocker        50G', c: 't-warn' },
      { t: 'ubuntu@ladron:~$ sudo mount /dev/sdb1 /mnt/robado', c: 't-cmd', type: true, wait: 600 },
      { t: 'mount: /mnt/robado: wrong fs type, bad option, bad superblock on /dev/sdb1, missing codepage or helper program, or other error.', c: 't-bad', wait: 500 },
      { t: 'ubuntu@ladron:~$ sudo xxd -l 64 -s 0x10000 /dev/sdb1', c: 't-cmd', type: true, wait: 300 },
      { t: '00010000: 8f3a 1c22 e19b 77d0 4c2e a0f1 9b33 07de', c: 't-dim' },
      { t: '00010010: 5d61 c8a4 0e7f 22b9 f0d3 6a18 c5e2 914b', c: 't-dim' },
      { t: '00010020: a7c0 3e55 18bd 4f92 61e0 dd2c 8b07 3fa9', c: 't-dim' },
      { t: '', wait: 100 },
      { t: '>> XTS-AES 128. Sin la contraseña ni la clave de recuperación de 48 dígitos, el disco es ruido.', c: 't-ok' },
      { t: '>> La clave de recuperación está guardada fuera del volumen cifrado.', c: 't-ok' }
    ], { token: blTok, speed: 14 });
    LT.audio && LT.audio.whoosh();
  }

  LT.scene('datos', {
    steps: 3,
    init: function () {
      disks();
      LT.typeLines(LT.$('#bl-term'), [{ t: '# El disco del PC de admin.rrhh acaba de ser robado.', c: 't-dim' }, { t: '# Lo conectamos a una máquina Ubuntu...', c: 't-dim' }]);
      LT.$('#bl-go').onclick = bitlocker;
    },
    step: function (n) {
      if (n === 0 && failed.length) { failed = []; disks(); }
      if (n === 1 && !failed.length) setTimeout(function () { toggle(1); }, LT.reduce ? 0 : 700);
      if (n === 2) bitlocker();
    }
  });
})();
