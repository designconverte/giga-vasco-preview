/* ============================================================
   GIGA — EDIÇÃO VASCO DA GAMA · CRVG × MOTOCHEFE
   Motion: GSAP 3 + ScrollTrigger + Lenis + SplitType
   Progressive enhancement: o conteúdo nasce visível; o JS só
   adiciona o deslocamento. prefers-reduced-motion desliga tudo.
   ============================================================ */
(function () {
  'use strict';

  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TOUCH = window.matchMedia('(pointer: coarse)').matches;

  /* ---------- MANIFESTO: monta palavras (sempre, mesmo sem motion) ---------- */
  var manifestoUnits = [];
  (function buildManifesto() {
    var box = document.getElementById('manifestoText');
    if (!box) return;
    var lines = [];
    try { lines = JSON.parse(box.getAttribute('data-lines') || '[]'); } catch (e) { lines = []; }
    // sem aria-hidden nem aria-label: as palavras são texto real e legível por leitor de tela
    var html = lines.map(function (line) {
      var words = line.split(' ').filter(Boolean).map(function (w) {
        var hl = w.indexOf('*') === 0;
        var clean = w.replace(/\*/g, '');
        return '<span class="u' + (hl ? ' u--hl' : '') + '">' + clean + ' </span>';
      }).join('');
      return '<span class="m-line">' + words + '</span>';
    }).join('');
    box.innerHTML = html;
    manifestoUnits = Array.prototype.slice.call(box.querySelectorAll('.u'));
  })();

  /* ---------- FAQ (funciona com e sem motion) ---------- */
  (function faq() {
    var items = document.querySelectorAll('.faq__item');
    function hide(a) { a.style.visibility = 'hidden'; } // tira da árvore de acessibilidade
    function show(a) { a.style.visibility = 'visible'; }
    function closeItem(q, a, animate) {
      q.setAttribute('aria-expanded', 'false');
      if (animate && window.gsap && !RM) {
        gsap.to(a, { height: 0, duration: 0.45, ease: 'power3.inOut', onComplete: function () { hide(a); } });
      } else { a.style.height = '0px'; hide(a); }
    }
    items.forEach(function (item, i) {
      var q = item.querySelector('.faq__q');
      var a = item.querySelector('.faq__a');
      if (!q || !a) return;
      // nomeia a region pelo próprio botão da pergunta
      if (!q.id) q.id = 'faq-q-' + (i + 1);
      a.setAttribute('aria-labelledby', q.id);
      a.style.height = '0px'; hide(a); // só o JS esconde; sem JS o FAQ nasce aberto e acessível
      q.addEventListener('click', function () {
        var open = q.getAttribute('aria-expanded') === 'true';
        items.forEach(function (other) {
          if (other === item) return;
          var oq = other.querySelector('.faq__q');
          var oa = other.querySelector('.faq__a');
          if (oq && oq.getAttribute('aria-expanded') === 'true') closeItem(oq, oa, true);
        });
        if (open) { closeItem(q, a, true); return; }
        q.setAttribute('aria-expanded', 'true');
        show(a);
        if (window.gsap && !RM) {
          gsap.set(a, { height: 'auto' }); gsap.from(a, { height: 0, duration: 0.5, ease: 'power3.out' });
        } else { a.style.height = 'auto'; }
      });
    });
  })();

  /* ---------- LIGHTBOX ---------- */
  (function lightbox() {
    var lb = document.getElementById('lightbox');
    if (!lb) return;
    var img = document.getElementById('lbImg');
    var count = document.getElementById('lbCount');
    var btnClose = document.getElementById('lbClose');
    var btnPrev = document.getElementById('lbPrev');
    var btnNext = document.getElementById('lbNext');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.gal__btn'));
    var photos = buttons.map(function (b) {
      var i = b.querySelector('img');
      return { src: i.getAttribute('src'), alt: i.getAttribute('alt') || '' };
    });
    var idx = 0, lastFocus = null;

    function render() {
      img.src = photos[idx].src;
      img.alt = photos[idx].alt;
      count.textContent = (idx + 1) + ' / ' + photos.length;
      // pré-carrega vizinhos
      [idx + 1, idx - 1].forEach(function (n) {
        var p = photos[(n + photos.length) % photos.length];
        var pre = new Image(); pre.src = p.src;
      });
    }
    function open(n) {
      idx = n; lastFocus = document.activeElement;
      render();
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      if (window.lenis) window.lenis.stop();
      btnClose.focus();
      if (window.gsap && !RM) {
        gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        gsap.fromTo(img, { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'power3.out' });
      }
    }
    function close() {
      lb.hidden = true;
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
      if (lastFocus) lastFocus.focus();
    }
    function nav(dir) {
      idx = (idx + dir + photos.length) % photos.length;
      render();
      if (window.gsap && !RM) {
        gsap.fromTo(img, { opacity: 0, x: dir * 26 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power3.out' });
      }
    }
    buttons.forEach(function (b, n) { b.addEventListener('click', function () { open(n); }); });
    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', function () { nav(-1); });
    btnNext.addEventListener('click', function () { nav(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') nav(-1);
      if (e.key === 'ArrowRight') nav(1);
      if (e.key === 'Tab') { // trap simples entre os 3 botões
        var f = [btnClose, btnPrev, btnNext];
        var i = f.indexOf(document.activeElement);
        e.preventDefault();
        var next = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i >= f.length - 1 ? 0 : i + 1);
        f[next].focus();
      }
    });
  })();

  /* ---------- FORM ---------- */
  (function form() {
    var f = document.getElementById('form');
    if (!f) return;
    var ok = document.getElementById('formOk');
    var errBox = document.getElementById('formErr');
    /* PRODUÇÃO: apontar para o endpoint/CRM da MotoChefe.
       Vazio = modo preview (não envia; grava localmente e mostra sucesso). */
    var ENDPOINT = f.getAttribute('data-endpoint') || '';
    function setErr(input, errId, bad) {
      var err = document.getElementById(errId);
      if (err) err.hidden = !bad;
      if (input) input.setAttribute('aria-invalid', bad ? 'true' : 'false');
      return !bad;
    }
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (f.querySelector('.form__hp').value) return; // honeypot
      var nome = document.getElementById('f-nome');
      var email = document.getElementById('f-email');
      var zap = document.getElementById('f-zap');
      var cidade = document.getElementById('f-cidade');
      var uf = document.getElementById('f-uf');
      var lgpd = document.getElementById('f-lgpd');
      var okAll = true;
      okAll = setErr(nome, 'e-nome', nome.value.trim().split(/\s+/).length < 2) && okAll;
      okAll = setErr(email, 'e-email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) && okAll;
      okAll = setErr(zap, 'e-zap', zap.value.replace(/\D/g, '').length < 10) && okAll;
      okAll = setErr(cidade, 'e-cidade', cidade.value.trim().length < 2) && okAll;
      okAll = setErr(uf, 'e-uf', !uf.value) && okAll;
      okAll = setErr(null, 'e-lgpd', !lgpd.checked) && okAll;
      if (!okAll) {
        var firstBad = f.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
        return;
      }
      var lead = {
        nome: nome.value.trim(), email: email.value.trim(), whatsapp: zap.value.trim(),
        cidade: cidade.value.trim(), uf: uf.value,
        socio: (document.getElementById('f-socio') || {}).value || '',
        origem: 'lp-giga-vasco', em: new Date().toISOString()
      };
      function success() {
        f.hidden = true;
        if (errBox) errBox.hidden = true;
        ok.hidden = false;
        if (window.gsap && !RM) {
          gsap.fromTo(ok, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        }
        ok.setAttribute('tabindex', '-1');
        ok.focus();
      }
      function failure() {
        if (errBox) { errBox.hidden = false; errBox.setAttribute('tabindex', '-1'); errBox.focus(); }
        submit.disabled = false; submit.textContent = submitLabel;
      }
      var submit = f.querySelector('.form__submit');
      var submitLabel = submit.textContent;
      submit.disabled = true; submit.textContent = 'Enviando…';
      if (ENDPOINT) {
        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead)
        }).then(function (res) { res.ok ? success() : failure(); }).catch(failure);
      } else {
        // SEM ENDPOINT CONFIGURADO: falha de propósito, alto e claro.
        // Um preview que finge sucesso vai parar em produção sem ninguém notar.
        console.warn('[GIGA] form: data-endpoint não configurado no <form id="form"> — o lead NÃO foi enviado. Ver README (pendência de integração).');
        try { localStorage.setItem('giga-vasco-lead-nao-enviado', JSON.stringify(lead)); } catch (err) {}
        failure();
      }
    });
  })();

  /* ---------- BURGER / MENU MOBILE ---------- */
  (function menu() {
    var burger = document.getElementById('burger');
    var mm = document.getElementById('mobileMenu');
    if (!burger || !mm) return;
    function toggle(force) {
      var open = typeof force === 'boolean' ? force : burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      mm.classList.toggle('is-open', open);
      mm.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
      if (window.lenis) { open ? window.lenis.stop() : window.lenis.start(); }
      if (open) {
        var first = mm.querySelector('a'); if (first) first.focus();
        if (window.gsap && !RM) {
          gsap.fromTo(mm.querySelectorAll('a'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out', delay: 0.1 });
        }
      } else { burger.focus(); }
    }
    burger.addEventListener('click', function () { toggle(); });
    mm.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { toggle(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mm.classList.contains('is-open')) toggle(false); });
  })();

  /* ============================================================
     A PARTIR DAQUI: só com GSAP e sem reduced-motion
     ============================================================ */
  if (RM || !window.gsap) {
    document.getElementById('loader') && (document.getElementById('loader').style.display = 'none');
    manifestoUnits.forEach(function (u) { u.style.opacity = 1; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- LENIS ---------- */
  var lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  window.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);
  lenis.stop(); // libera no fim do loader

  /* âncoras suaves */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -90, duration: 1.4 });
    });
  });

  /* ---------- CURSOR ---------- */
  (function cursor() {
    if (TOUCH) return;
    var c = document.getElementById('cursor');
    if (!c) return;
    var xTo = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3.out' });
    var yTo = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3.out' });
    window.addEventListener('mousemove', function (e) { c.classList.add('is-on'); xTo(e.clientX); yTo(e.clientY); });
    document.addEventListener('mousedown', function () { c.classList.add('is-down'); });
    document.addEventListener('mouseup', function () { c.classList.remove('is-down'); });
    var linkSel = 'a, button, [data-magnetic], select, input, label.form__consent';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('.gal__btn')) { c.classList.add('is-media'); c.classList.remove('is-link'); }
      else if (e.target.closest(linkSel)) { c.classList.add('is-link'); c.classList.remove('is-media'); }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(linkSel) || e.target.closest('.gal__btn')) { c.classList.remove('is-link', 'is-media'); }
    });
  })();

  /* ---------- MAGNETIC ---------- */
  (function magnetic() {
    if (TOUCH) return;
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.28, y: (e.clientY - r.top - r.height / 2) * 0.28, duration: 0.4, ease: 'expo.out' });
      });
      btn.addEventListener('mouseleave', function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
      });
    });
  })();

  /* ---------- NAV ---------- */
  (function navbar() {
    var nav = document.getElementById('nav');
    ScrollTrigger.create({
      start: 80, end: 'max',
      onUpdate: function (self) {
        nav.classList.toggle('is-solid', self.scroll() > 80);
        if (self.direction === 1 && self.scroll() > 300) nav.classList.add('is-hidden');
        else nav.classList.remove('is-hidden');
      }
    });
  })();

  /* ---------- SPLITS (helper) ---------- */
  function splitLines(el) {
    var s = new SplitType(el, { types: 'lines,words' });
    el.querySelectorAll('.line').forEach(function (line) {
      var wrap = document.createElement('span');
      // padding-top compensado preserva acentos (Ã, É) dentro do overflow:hidden
      wrap.style.cssText = 'display:block;overflow:hidden;padding-top:0.18em;margin-top:-0.18em;';
      line.parentNode.insertBefore(wrap, line);
      wrap.appendChild(line);
    });
    return s;
  }

  /* ---------- PRELOADER + INTRO ---------- */
  (function loader() {
    var el = document.getElementById('loader');
    var bar = document.getElementById('loaderBar');
    var countEl = document.getElementById('loaderCount');
    var video = document.getElementById('heroVideo');
    // (a troca do vídeo mobile acontece em script inline no HTML, durante o parse)
    var progress = { v: 0 };
    var realLoaded = false;
    function assetsReady() {
      realLoaded = true;
      // acelera o loader assim que os assets reais chegam — LCP primeiro
      if (counting && counting.isActive()) counting.timeScale(2.6);
    }
    window.addEventListener('load', assetsReady);
    if (video) video.addEventListener('canplay', assetsReady, { once: true });

    var counting = gsap.to(progress, {
      v: 100, duration: 1.6, ease: 'power1.inOut',
      onUpdate: function () {
        var v = Math.round(progress.v);
        // segura em 88% se os assets reais ainda não chegaram
        if (v > 88 && !realLoaded) { v = 88; progress.v = 88; }
        countEl.textContent = v;
        gsap.set(bar, { scaleX: v / 100 });
      },
      onComplete: reveal
    });
    // trava de segurança: nunca passar de 3.2s
    gsap.delayedCall(3.2, function () { if (progress.v < 100) { counting.kill(); progress.v = 100; countEl.textContent = 100; gsap.set(bar, { scaleX: 1 }); reveal(); } });

    var revealed = false;
    function reveal() {
      if (revealed) return; revealed = true;
      if (video) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      var tl = gsap.timeline({
        onComplete: function () {
          el.style.display = 'none';
          lenis.start();
          ScrollTrigger.refresh();
        }
      });
      tl.to('.loader__inner', { opacity: 0, y: -30, duration: 0.45, ease: 'power2.in' })
        .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'power4.inOut' }, '-=0.1')
        // INTRO DO HERO
        .fromTo('#heroMedia', { scale: 1.12 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, '-=0.55')
        .fromTo('.hero__line', { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out' }, '-=1.35')
        .fromTo('#heroEyebrow', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.7')
        .fromTo('#heroSub', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.55')
        .fromTo('#heroSelos li', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out' }, '-=0.45')
        .fromTo('#heroActions', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.35')
        .fromTo('#scrollCue', { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.2');
    }
    gsap.set(el, { clipPath: 'inset(0 0 0% 0)' });
  })();

  /* ---------- HERO SCRUB ---------- */
  (function heroScrub() {
    var mm = gsap.matchMedia();
    mm.add('(min-width: 769px)', function () {
      gsap.timeline({
        scrollTrigger: { trigger: '#topo', start: 'top top', end: '+=70%', pin: true, scrub: 1 }
      })
        .to('#heroMedia', { yPercent: -10, scale: 1.06, ease: 'none' }, 0)
        .to('.hero__content', { yPercent: -28, opacity: 0, ease: 'none' }, 0)
        .to('#scrollCue', { opacity: 0, ease: 'none' }, 0);
    });
    mm.add('(max-width: 768px)', function () {
      gsap.to('#heroMedia', {
        yPercent: -8, ease: 'none',
        scrollTrigger: { trigger: '#topo', start: 'top top', end: 'bottom top', scrub: 1 }
      });
    });
    // economia: pausa o vídeo fora da viewport
    var video = document.getElementById('heroVideo');
    if (video) {
      ScrollTrigger.create({
        trigger: '#topo', start: 'top bottom', end: 'bottom top',
        onLeave: function () { video.pause(); },
        onEnterBack: function () { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      });
    }
  })();

  /* ---------- MANIFESTO SCRUB ---------- */
  (function manifesto() {
    if (!manifestoUnits.length) return;
    gsap.set(manifestoUnits, { opacity: 0.24 });
    gsap.to(manifestoUnits, {
      opacity: 1, ease: 'none', stagger: { each: 1 },
      scrollTrigger: {
        trigger: '#gigante', start: 'top top', end: '+=170%',
        scrub: true, pin: '#manifestoStage', anticipatePin: 1, invalidateOnRefresh: true
      }
    });
  })();

  /* ---------- CRUZ (watermark + parallax) ---------- */
  (function cruz() {
    gsap.to('#gigaWatermark', {
      xPercent: 16, ease: 'none',
      scrollTrigger: { trigger: '#cruz', start: 'top bottom', end: 'bottom top', scrub: 1.4 }
    });
    gsap.fromTo('#cruzMedia img', { yPercent: -8, scale: 1.08 }, {
      yPercent: 6, scale: 1, ease: 'none',
      scrollTrigger: { trigger: '#cruz', start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  })();

  /* ---------- REVEALS GENÉRICOS ---------- */
  (function reveals() {
    document.querySelectorAll('[data-split]').forEach(function (el) {
      splitLines(el);
      gsap.fromTo(el.querySelectorAll('.line'),
        { yPercent: 110 },
        {
          yPercent: 0, duration: 1, stagger: 0.09, ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 84%', once: true }
        });
    });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%', once: true,
      onEnter: function (batch) {
        gsap.fromTo(batch, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.85, stagger: 0.09, ease: 'power3.out' });
      }
    });
    document.querySelectorAll('.label').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, x: -16 }, {
        opacity: 1, x: 0, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });
  })();

  /* ---------- COUNTERS ---------- */
  (function counters() {
    document.querySelectorAll('[data-counter]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-counter'), 10);
      var obj = { v: target > 1000 ? target - 160 : 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 86%', once: true,
        onEnter: function () {
          gsap.to(obj, {
            v: target, duration: 1.6, ease: 'power2.out',
            snap: { v: 1 },
            onUpdate: function () { el.textContent = Math.round(obj.v); }
          });
        }
      });
    });
  })();

  /* ---------- DETALHES: GALERIA HORIZONTAL PINADA ---------- */
  (function horizontal() {
    var viewport = document.getElementById('detViewport');
    var track = document.getElementById('detTrack');
    if (!viewport || !track) return;
    var mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', function () {
      var distance = function () { return track.scrollWidth - window.innerWidth; };
      var tween = gsap.to(track, {
        x: function () { return -distance(); },
        ease: 'none',
        scrollTrigger: {
          trigger: viewport, start: 'top top',
          end: function () { return '+=' + distance(); },
          scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: function (self) { gsap.set('#detProgress', { scaleX: self.progress }); }
        }
      });
      gsap.utils.toArray('.det__panel').forEach(function (panel) {
        gsap.fromTo(panel.querySelector('.det__info'),
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left 78%', toggleActions: 'play none none reverse' }
          });
        gsap.fromTo(panel.querySelector('.det__frame img'),
          { xPercent: -6 },
          {
            xPercent: 6, ease: 'none',
            scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true }
          });
      });
    });
    mm.add('(max-width: 767px)', function () {
      gsap.utils.toArray('.det__panel').forEach(function (panel) {
        gsap.fromTo(panel, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: panel, start: 'top 85%', once: true }
        });
      });
    });
  })();

  /* ---------- BENEFÍCIOS: crossfade da imagem pinada ---------- */
  (function beneficios() {
    var imgs = gsap.utils.toArray('.ben__img');
    if (!imgs.length) return;
    function activate(n) {
      imgs.forEach(function (im, i) { im.classList.toggle('is-active', i === n); });
    }
    gsap.utils.toArray('.ben__item').forEach(function (item) {
      var n = parseInt(item.getAttribute('data-img'), 10) || 0;
      ScrollTrigger.create({
        trigger: item, start: 'top 55%', end: 'bottom 55%',
        onEnter: function () { activate(n); },
        onEnterBack: function () { activate(n); }
      });
      gsap.fromTo(item, { opacity: 0.25 }, {
        opacity: 1, duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: item, start: 'top 70%', end: 'bottom 45%', toggleActions: 'play reverse play reverse' }
      });
    });
  })();

  /* ---------- PROVA: parallax ---------- */
  (function prova() {
    gsap.fromTo('#provaMedia img', { yPercent: -10 }, {
      yPercent: 4, ease: 'none',
      scrollTrigger: { trigger: '.prova', start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  })();

  /* ---------- CTA FINAL: grito ---------- */
  (function final() {
    var grito = document.getElementById('finalGrito');
    if (!grito) return;
    gsap.fromTo(grito, { scale: 0.92, opacity: 0, y: 40 }, {
      scale: 1, opacity: 1, y: 0, duration: 1.1, ease: 'power4.out',
      scrollTrigger: { trigger: grito, start: 'top 82%', once: true }
    });
    gsap.to('.final__glow', {
      opacity: 0.65, scale: 1.15, duration: 2.6, ease: 'sine.inOut', repeat: -1, yoyo: true
    });
  })();

})();
