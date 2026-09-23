(() => {
  const root = document.documentElement;
  const world = document.querySelector('.world');
  const stage = document.querySelector('.stage');
  const footageImg = document.querySelector('.footage img');
  const heroMark = document.querySelector('.hero .wordmark');
  const replayBtn = document.querySelector('.replay');
  const chrome = '.ed-bar, .ed-bin, .ed-thumbs, .ed-transport, .timeline, .playhead';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Timeline drawn in code (so it stays sharp at any zoom) ---------- */

  function rng(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function drawTimeline(canvas) {
    const ctx = canvas.getContext('2d');
    const rand = rng(4);
    ctx.scale(2, 2); // canvas is 2x the 1600x650 world box
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, 1600, 650);

    // Ruler
    ctx.fillStyle = '#2b2b2b';
    for (let x = 120; x < 1600; x += 20) ctx.fillRect(x, x % 100 === 20 ? 14 : 20, 1, x % 100 === 20 ? 14 : 8);
    ctx.fillStyle = '#5c5c5c';
    ctx.font = '300 10px Inter, Arial, sans-serif';
    for (let x = 120, s = 12; x < 1600; x += 200, s += 2) ctx.fillText(`00:00:${String(s).padStart(2, '0')}:00`, x + 4, 11);

    const tracks = [
      { name: 'V4', h: 40, colors: ['#8c352c', '#7a2e27'] },
      { name: 'V3', h: 40, colors: ['#963a30', '#6d2923', '#a3433a'] },
      { name: 'V2', h: 40, colors: ['#3f6d63', '#4a7c70', '#8c352c'] },
      { name: 'V1', h: 40, colors: ['#3a4850', '#4b5c66', '#34605a'] },
      { name: 'A1', h: 78, audio: true },
      { name: 'A2', h: 78, audio: true },
      { name: 'A3', h: 78, audio: true, quiet: true },
    ];

    let y = 44;
    for (const tr of tracks) {
      ctx.fillStyle = '#6a6a6a';
      ctx.font = '300 11px Inter, Arial, sans-serif';
      ctx.fillText(tr.name, 22, y + tr.h / 2 + 4);
      ctx.fillStyle = '#0c0c0c';
      ctx.fillRect(120, y, 1480, tr.h);

      if (tr.audio) {
        ctx.fillStyle = '#10231e';
        ctx.fillRect(120, y + 2, 1480, tr.h - 4);
        ctx.fillStyle = 'rgba(226, 232, 229, 0.88)';
        const mid = y + tr.h / 2;
        let env = 0.3;
        for (let x = 124; x < 1596; x += 2) {
          env += (rand() - 0.5) * 0.18;
          env = Math.min(1, Math.max(tr.quiet ? 0.05 : 0.15, env));
          const a = env * (0.35 + rand() * 0.65) * (tr.h / 2 - 6) * (tr.quiet ? 0.5 : 1);
          ctx.fillRect(x, mid - a, 1.4, a * 2);
        }
      } else {
        let x = 120 + rand() * 60;
        while (x < 1600) {
          const w = 40 + rand() * 150;
          if (rand() > 0.22) {
            const c = tr.colors[Math.floor(rand() * tr.colors.length)];
            ctx.fillStyle = c;
            ctx.fillRect(x, y + 3, w, tr.h - 6);
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            ctx.fillRect(x, y + 3, w, 1);
            if (w > 70 && rand() > 0.4) {
              ctx.fillStyle = 'rgba(210,210,210,0.55)';
              ctx.fillRect(x + 6, y + 8, 26, tr.h - 16);
            }
          }
          x += w + 2 + (rand() > 0.6 ? rand() * 60 : 0);
        }
      }
      y += tr.h + 6;
    }
  }

  /* ---------- Camera over the editor world ---------- */

  const cam = { cx: 800, cy: 420, s: 1, rx: 0, push: 1 };
  const shots = {
    // Logo fills the frame: the viewer is the whole screen.
    viewer: () => ({ cx: 800, cy: 420, s: Math.min(innerWidth / 1280, innerHeight / 720), rx: 0 }),
    // Pulled back: we are inside an edit.
    editor: () => ({ cx: 800, cy: 700, s: Math.min(innerWidth / 1680, innerHeight / 1440), rx: 0 }),
    // Camera drops and tilts onto the timeline.
    timeline: () => ({ cx: 700, cy: 1130, s: Math.max(innerWidth / 1150, innerHeight / 700), rx: 46 }),
  };

  function applyCam() {
    world.style.transform =
      `translate(${innerWidth / 2}px, ${innerHeight / 2}px) rotateX(${cam.rx}deg) ` +
      `scale(${cam.s * cam.push}) translate(${-cam.cx}px, ${-cam.cy}px)`;
  }

  /* ---------- Sequence ---------- */

  let tl;
  let introDone = false;

  function finish() {
    introDone = true;
    root.classList.remove('locked');
    replayBtn.classList.add('show');
  }

  function build() {
    Object.assign(cam, shots.viewer(), { push: 1 });
    applyCam();
    gsap.set('.shot', { opacity: 0 });
    gsap.set(chrome, { opacity: 0 });
    gsap.set('.viewer', { '--frame': 0 });
    gsap.set('.playhead', { '--x': '560px' });
    gsap.set('.footage', { opacity: 0 });
    gsap.set(footageImg, { scale: 1.18, yPercent: -4 });
    gsap.set(world, { opacity: 1 });
    gsap.set('.hero .wordmark, .hero-line, .scroll-cue', { opacity: 0 });
    gsap.set('.hero .wordmark', { letterSpacing: '0.45em', scale: 1 });

    tl = gsap.timeline({ onUpdate: applyCam, onComplete: finish });

    // Act 1: the logo, then the angle change.
    tl.to('.logo-front', { opacity: 1, duration: 1.2, ease: 'power1.out' }, 0.3)
      .to(cam, { push: 1.05, duration: 2.8, ease: 'none' }, 0.3)
      .to('.logo-angle', { opacity: 1, duration: 0.9, ease: 'power2.inOut' }, 1.7)
      .set('.logo-front', { opacity: 0 }, 2.6)

    // Act 2: zoom out, the logo is a frame inside an edit.
      .to(cam, { ...shots.editor(), push: 1, duration: 2.1, ease: 'power3.inOut' }, 3.1)
      .to(chrome, { opacity: 1, duration: 1.2, ease: 'power1.out', stagger: 0.06 }, 3.4)
      .to('.viewer', { '--frame': 1, duration: 1 }, 3.6)
      .to('.playhead', { '--x': '1500px', duration: 5.5, ease: 'none' }, 4.2)

    // Act 3: camera drops down onto the timeline, then the real footage takes over.
      .to(cam, { ...shots.timeline(), duration: 2.3, ease: 'power2.inOut' }, 5.4)
      .to('.footage', { opacity: 1, duration: 1.3, ease: 'power1.inOut' }, 6.8)
      .to(footageImg, { scale: 1, yPercent: 0, duration: 5, ease: 'power2.out' }, 6.8)
      .set(world, { opacity: 0 }, 8.2)

    // Hero lands over the footage.
      .to('.hero .wordmark', { opacity: 1, letterSpacing: '0.15em', duration: 2.2, ease: 'power3.out' }, 8.0)
      .to('.hero-line', { opacity: 1, duration: 1.4, ease: 'power1.out' }, 9.2)
      .to('.scroll-cue', { opacity: 0.6, duration: 1 }, 10.2);
  }

  function play() {
    introDone = false;
    scrollTo(0, 0);
    root.classList.add('locked');
    replayBtn.classList.remove('show');
    if (tl) tl.kill();
    build();
    if (reduceMotion) tl.progress(1);
  }

  addEventListener('resize', () => {
    if (!introDone) return;
    Object.assign(cam, shots.timeline());
    applyCam();
  });

  /* ---------- Scroll: wordmark grows, footage drifts, statement reveals ---------- */

  addEventListener('scroll', () => {
    if (!introDone) return;
    const p = Math.min(1, scrollY / innerHeight);
    heroMark.style.transform = `scale(${1 + p * 0.9})`;
    heroMark.style.opacity = String(1 - p * 0.9);
    stage.style.opacity = String(1 - p * 0.85);
    footageImg.style.transform = `translateY(${p * 6}%) scale(${1 + p * 0.08})`;
  }, { passive: true });

  root.classList.add('js-reveal');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.line').forEach((el) => io.observe(el));

  replayBtn.addEventListener('click', play);

  drawTimeline(document.querySelector('.timeline'));
  play();
})();
