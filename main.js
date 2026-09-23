(() => {
  const root = document.documentElement;
  const stage = document.querySelector('.stage');
  const world = document.querySelector('.world');
  const canvas = document.querySelector('.footage');
  const mark = document.querySelector('.hero-mark');
  const cue = document.querySelector('.scroll-cue');
  const track = document.querySelector('.scroll-track');
  const replayBtn = document.querySelector('.replay');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sound ----------
     Placeholder ethereal pad built with Web Audio until the real sound file arrives.
     Browsers only allow sound after a tap or key press, so it unlocks on the first one. */

  const sound = (() => {
    let ctx, master, filter, lfo, lfoDepth, noiseGain, noiseFilter;
    const voices = [];
    let want = 0;

    function init() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 900;

      const trem = ctx.createGain();
      trem.gain.value = 0.8;
      filter.connect(trem);
      lfo = ctx.createOscillator();
      lfo.frequency.value = 0.18;
      lfoDepth = ctx.createGain();
      lfoDepth.gain.value = 0.18;
      lfo.connect(lfoDepth).connect(trem.gain);
      lfo.start();

      // Long feedback echo for space.
      const delay = ctx.createDelay(1);
      delay.delayTime.value = 0.38;
      const fb = ctx.createGain();
      fb.gain.value = 0.5;
      const wet = ctx.createGain();
      wet.gain.value = 0.55;
      trem.connect(master);
      trem.connect(delay);
      delay.connect(fb).connect(delay);
      delay.connect(wet).connect(master);

      [[110, 0.2, 'sine'], [164.81, 0.14, 'triangle'], [246.94, 0.09, 'sine'], [329.63, 0.07, 'triangle'], [493.88, 0.035, 'sine']]
        .forEach(([f, g, type], i) => {
          const o = ctx.createOscillator();
          o.type = type;
          o.frequency.value = f;
          o.detune.value = (i - 2) * 5;
          const v = ctx.createGain();
          v.gain.value = g;
          o.connect(v).connect(filter);
          o.start();
          voices.push({ o, f });
        });

      // Air that rises with the scroll.
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      noise.loop = true;
      noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 500;
      noiseFilter.Q.value = 1.4;
      noiseGain = ctx.createGain();
      noiseGain.gain.value = 0;
      noise.connect(noiseFilter).connect(noiseGain).connect(master);
      noise.start();
    }

    function ramp(secs) {
      if (!ctx) return;
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(want, t + secs);
    }

    return {
      unlock() {
        if (!ctx) init();
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();
        ramp(1.5);
      },
      level(v, secs) { want = v; ramp(secs); },
      intensity(p) {
        if (!ctx) return;
        const t = ctx.currentTime;
        const q = p * p;
        voices.forEach(({ o, f }) => o.frequency.setTargetAtTime(f * (1 + q * 0.5), t, 0.08));
        filter.frequency.setTargetAtTime(900 + q * 7000, t, 0.08);
        lfo.frequency.setTargetAtTime(0.18 + q * 12, t, 0.1);
        lfoDepth.gain.setTargetAtTime(0.18 + p * 0.4, t, 0.1);
        noiseGain.gain.setTargetAtTime(q * 0.22, t, 0.08);
        noiseFilter.frequency.setTargetAtTime(500 + q * 5500, t, 0.08);
      },
      cut() {
        want = 0;
        if (!ctx) return;
        const t = ctx.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(0, t);
      },
    };
  })();

  ['pointerdown', 'keydown', 'touchend'].forEach((type) =>
    addEventListener(type, () => sound.unlock(), { passive: true }));

  /* ---------- Timeline footage ----------
     Drawn to canvas so it can drift along the tracks and smear into motion blur.
     The source is the still for now; a <video> (slow / fast timeline) can replace it. */

  const src = new Image();
  src.src = 'assets/img/timeline.jpg';
  const ctx2d = canvas.getContext('2d');
  const DIR = { x: 0.98, y: 0.2 }; // direction the tracks run in the footage
  const ZOOM = 1.3;                // headroom for the drift
  const footage = { on: false, t0: 0, p: 0 };

  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
  }

  function drawFootage(now) {
    if (!footage.on) return;
    requestAnimationFrame(drawFootage);
    const iw = src.naturalWidth || src.videoWidth;
    const ih = src.naturalHeight || src.videoHeight;
    if (!iw) return;
    const W = canvas.width, H = canvas.height;
    const s = Math.max(W / iw, H / ih) * ZOOM;
    const dw = iw * s, dh = ih * s;
    // How far it can travel along the tracks before an edge shows.
    const room = Math.min((dw - W) / 2 / DIR.x, (dh - H) / 2 / DIR.y) * 0.85;

    // Slow breathing drift, then the scroll pushes it forward and smears it.
    const t = (now - footage.t0) / 1000;
    const p = footage.p;
    const drift = room * (0.28 * Math.sin((t / 60) * Math.PI * 2) + 0.5 * Math.pow(p, 1.5));
    const blur = reduceMotion ? 0 : W * 0.1 * p * p;
    const x0 = (W - dw) / 2 - drift * DIR.x;
    const y0 = (H - dh) / 2 - drift * DIR.y;

    ctx2d.globalAlpha = 1;
    ctx2d.fillStyle = '#000';
    ctx2d.fillRect(0, 0, W, H);
    const n = blur > 2 ? Math.min(14, Math.ceil(blur / 5)) : 1;
    for (let i = 0; i < n; i++) {
      const k = n === 1 ? 0 : i / (n - 1) - 0.5;
      ctx2d.globalAlpha = 1 / (i + 1); // running average of all copies
      ctx2d.drawImage(src, x0 - k * blur * DIR.x, y0 - k * blur * DIR.y, dw, dh);
    }
    ctx2d.globalAlpha = 1;
    ctx2d.fillStyle = 'rgba(0,0,0,0.28)'; // keeps the white wordmark readable
    ctx2d.fillRect(0, 0, W, H);
  }

  function startFootage() {
    if (footage.on) return;
    footage.on = true;
    footage.t0 = performance.now();
    requestAnimationFrame(drawFootage);
  }

  /* ---------- Camera over the editor ---------- */

  const cam = { cx: 800, cy: 404, s: 1, rx: 0 };
  const shots = {
    viewer: () => ({ cx: 800, cy: 404, s: Math.min(innerWidth / 1280, innerHeight / 720), rx: 0 }),
    editor: () => ({ cx: 863, cy: 382, s: Math.min(innerWidth / 1480, innerHeight / 860) * 0.94, rx: 0 }),
    below: () => ({ cx: 863, cy: 382 + 900, s: Math.min(innerWidth / 1480, innerHeight / 860) * 0.94, rx: 14 }),
  };
  function applyCam() {
    world.style.transform =
      `translate(${innerWidth / 2}px, ${innerHeight / 2}px) rotateX(${cam.rx}deg) ` +
      `scale(${cam.s}) translate(${-cam.cx}px, ${-cam.cy}px)`;
  }

  /* ---------- Acts 1-4 (timed) ---------- */

  let tl;
  let scrollOpen = false;
  let dropped = false;
  let maxScale = 6;

  function measureMark() {
    const w = mark.offsetWidth, h = mark.offsetHeight;
    if (w) maxScale = Math.min((innerWidth * 0.88) / w, (innerHeight * 0.6) / h);
  }

  function reset() {
    Object.assign(cam, shots.viewer());
    applyCam();
    footage.on = false;
    footage.p = 0;
    dropped = false;
    stage.style.visibility = '';
    gsap.set(world, { opacity: 1 });
    gsap.set('.shot', { opacity: 0, clearProps: 'transform,filter' });
    gsap.set('.logo-front', { filter: 'brightness(0.05)' });
    gsap.set('.logo-light', { '--sweep': '100%' });
    gsap.set('.ed-bar, .ed-thumbs', { opacity: 0 });
    gsap.set('.viewer', { '--frame': 0 });
    gsap.set(canvas, { opacity: 0, y: 0, yPercent: 60, rotationX: 28, filter: 'blur(8px)' });
    gsap.set(mark, { opacity: 0, xPercent: -50, yPercent: -50, y: 0, scale: 1 });
    gsap.set(cue, { opacity: 0 });
    gsap.set('.about-line', { opacity: 0 });
  }

  function openScroll() {
    scrollOpen = true;
    root.classList.remove('locked');
    replayBtn.classList.add('show');
    gsap.to(cue, { opacity: 0.5, duration: 1.2 });
    measureMark();
  }

  function build() {
    tl = gsap.timeline({ onUpdate: applyCam });

    // 1. Pure black, silence. The logo appears only where light catches it.
    tl.to('.logo-front', { opacity: 1, filter: 'brightness(0.8)', duration: 4.6, ease: 'sine.inOut' }, 0.6)
      .to('.logo-light', { opacity: 0.9, duration: 0.8 }, 1.0)
      .to('.logo-light', { '--sweep': '0%', duration: 2.2, ease: 'sine.inOut' }, 1.0)
      .set('.logo-light', { '--sweep': '100%' }, 3.3)
      .to('.logo-light', { '--sweep': '0%', duration: 2.0, ease: 'sine.inOut' }, 3.3)
      .to('.logo-light', { opacity: 0, duration: 0.6 }, 4.9)

    // 2. The logo turns to its diagonal and settles inside the editor.
      .to('.logo-front', { rotationX: 14, rotationY: -40, rotationZ: -22, scale: 0.9, duration: 2.4, ease: 'power2.inOut' }, 5.2)
      .to('.logo-front', { opacity: 0, duration: 1.0, ease: 'power1.inOut' }, 6.0)
      .fromTo('.logo-angle',
        { opacity: 0, rotationX: -8, rotationY: 26, rotationZ: 12, scale: 1.08 },
        { opacity: 1, rotationX: 0, rotationY: 0, rotationZ: 0, scale: 1, duration: 2.4, ease: 'power2.out' }, 6.0)
      .to(cam, { ...shots.editor(), duration: 3.2, ease: 'power3.inOut' }, 5.4)
      .to('.ed-bar, .ed-thumbs', { opacity: 1, duration: 1.4, stagger: 0.2 }, 6.8)
      .to('.viewer', { '--frame': 1, duration: 1.2 }, 7.0)

    // 3. Camera descends. The logo falls away above, the timeline rises from below.
      .to(cam, { ...shots.below(), duration: 3.4, ease: 'power2.in' }, 8.8)
      .to(world, { opacity: 0, duration: 1.8, ease: 'power1.in' }, 9.8)
      .call(startFootage, null, 9.4)
      .to(canvas, { opacity: 1, yPercent: 0, rotationX: 0, filter: 'blur(0px)', duration: 3.0, ease: 'power3.out' }, 9.4)
      .set(canvas, { filter: 'none' }, 12.4)
      .call(() => sound.level(0.25, 2.5), null, 10.6)

    // 4. The timeline breathes. Sound at full presence. The wordmark arrives quietly.
      .call(() => sound.level(0.55, 2), null, 12.4)
      .to(mark, { opacity: 1, duration: 1.8, ease: 'power1.out' }, 12.9)
      .call(openScroll, null, 14.4);
  }

  function play() {
    if (tl) tl.kill();
    gsap.killTweensOf([canvas, mark, '.about-line']);
    scrollOpen = false;
    root.classList.add('locked');
    replayBtn.classList.remove('show');
    scrollTo(0, 0);
    sound.cut();
    sound.intensity(0);
    reset();
    build();
    if (reduceMotion) tl.progress(1);
  }

  /* ---------- Acts 5-6 (scroll) ---------- */

  function drop() {
    dropped = true;
    gsap.killTweensOf([canvas, mark]);
    gsap.to([canvas, mark], {
      y: innerHeight * 1.2,
      duration: 0.42,
      ease: 'power4.in',
      onComplete: () => {
        sound.cut();
        stage.style.visibility = 'hidden';
      },
    });
    // 7. Silence. The about lines, half a second apart.
    gsap.to('.about-line', { opacity: 1, duration: 1.4, ease: 'power1.out', stagger: 0.5, delay: 0.7 });
  }

  function undrop() {
    dropped = false;
    stage.style.visibility = '';
    gsap.killTweensOf([canvas, mark]);
    gsap.to([canvas, mark], { y: 0, duration: 0.6, ease: 'power3.out' });
    sound.level(0.55, 0.6);
  }

  function onScroll() {
    if (!scrollOpen) return;
    const dist = Math.max(1, track.offsetHeight - innerHeight);
    const p = Math.min(1, Math.max(0, scrollY / dist));
    footage.p = p;
    sound.intensity(p);
    if (!dropped) gsap.set(mark, { scale: 1 + p * (maxScale - 1) });
    gsap.set(cue, { opacity: Math.max(0, 0.5 - p * 10) });
    if (!dropped && p >= 0.995) drop();
    else if (dropped && p < 0.9) undrop();
  }
  addEventListener('scroll', onScroll, { passive: true });

  // No skipping the intro: block wheel and touch scrolling until act 4 ends.
  const hold = (e) => { if (!scrollOpen) e.preventDefault(); };
  addEventListener('wheel', hold, { passive: false });
  addEventListener('touchmove', hold, { passive: false });

  addEventListener('resize', () => {
    sizeCanvas();
    if (scrollOpen) { measureMark(); onScroll(); }
  });

  /* ---------- Statement reveals ---------- */

  root.classList.add('js-reveal');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.line').forEach((el) => io.observe(el));

  replayBtn.addEventListener('click', play);

  sizeCanvas();
  if (document.fonts) document.fonts.ready.then(() => { if (scrollOpen) measureMark(); });
  play();
})();
