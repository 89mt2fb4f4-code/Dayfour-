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

  /* ---------- Footage ----------
     Logo: logo.mp4 plays once in the viewer (act 1).
     Slow timeline: timeline-slow.mp4 (forward then reversed, so the loop has no jump).
     Fast timeline: 96 frames drawn to canvas, frame chosen by scroll position (acts 5-6). */

  const logoVideo = document.querySelector('.logo-video');
  const footageEl = document.querySelector('.footage');
  const slow = document.querySelector('.footage .slow');
  const fastCanvas = document.querySelector('.footage .fast');
  const fastCtx = fastCanvas.getContext('2d');
  const FAST_COUNT = 96;
  const fastFrames = [];
  let lastFast = -1;

  function loadFastFrames() {
    if (fastFrames.length) return;
    for (let i = 0; i < FAST_COUNT; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = `assets/frames/fast/${String(i).padStart(3, '0')}.jpg`;
      fastFrames.push(img);
    }
  }

  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    fastCanvas.width = Math.round(innerWidth * dpr);
    fastCanvas.height = Math.round(innerHeight * dpr);
    lastFast = -1;
  }

  function drawFast(p) {
    // Nearest frame that has loaded, so a slow connection never shows a gap.
    let i = Math.round(p * (FAST_COUNT - 1));
    while (i > 0 && !(fastFrames[i] && fastFrames[i].complete && fastFrames[i].naturalWidth)) i--;
    const img = fastFrames[i];
    if (!img || !img.naturalWidth || i === lastFast) return;
    lastFast = i;
    const W = fastCanvas.width, H = fastCanvas.height;
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight) * 1.06;
    const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    fastCtx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    fastCtx.fillStyle = 'rgba(0,0,0,0.28)'; // matches the slow video's dimming
    fastCtx.fillRect(0, 0, W, H);
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
  let run = 0;           // bumps on replay so stale callbacks do nothing
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
    dropped = false;
    lastFast = -1;
    stage.style.visibility = '';
    logoVideo.pause();
    logoVideo.currentTime = 0;
    slow.pause();
    slow.currentTime = 0;
    gsap.set(world, { opacity: 1 });
    gsap.set('.shot', { opacity: 0, clearProps: 'transform' });
    gsap.set('.ed-bar, .ed-thumbs', { opacity: 0 });
    gsap.set('.viewer', { '--frame': 0 });
    gsap.set(footageEl, { opacity: 0, y: 0, yPercent: 60, rotationX: 28, filter: 'blur(8px)' });
    gsap.set(fastCanvas, { opacity: 0 });
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

  // Acts 2-4, started when the logo video ends.
  function build() {
    tl = gsap.timeline({ paused: true, onUpdate: applyCam });

    // 2. Swap to the logo's last frame as a still, turn it to the diagonal, settle in the editor.
    tl.set('.logo-end', { opacity: 1 }, 0)
      .set(logoVideo, { opacity: 0 }, 0.05)
      .to('.logo-end', { rotationX: 14, rotationY: -40, rotationZ: -22, scale: 0.9, duration: 2.4, ease: 'power2.inOut' }, 0)
      .to('.logo-end', { opacity: 0, duration: 1.0, ease: 'power1.inOut' }, 0.8)
      .fromTo('.logo-angle',
        { opacity: 0, rotationX: -8, rotationY: 26, rotationZ: 12, scale: 1.08 },
        { opacity: 1, rotationX: 0, rotationY: 0, rotationZ: 0, scale: 1, duration: 2.4, ease: 'power2.out' }, 0.8)
      .to(cam, { ...shots.editor(), duration: 3.2, ease: 'power3.inOut' }, 0.2)
      .to('.ed-bar, .ed-thumbs', { opacity: 1, duration: 1.4, stagger: 0.2 }, 1.6)
      .to('.viewer', { '--frame': 1, duration: 1.2 }, 1.8)

    // 3. Camera descends. The logo falls away above, the timeline rises from below.
      .to(cam, { ...shots.below(), duration: 3.4, ease: 'power2.in' }, 3.6)
      .to(world, { opacity: 0, duration: 1.8, ease: 'power1.in' }, 4.6)
      .call(() => { slow.play().catch(() => {}); }, null, 4.2)
      .to(footageEl, { opacity: 1, yPercent: 0, rotationX: 0, filter: 'blur(0px)', duration: 3.0, ease: 'power3.out' }, 4.2)
      .set(footageEl, { filter: 'none' }, 7.2)
      .call(() => sound.level(0.25, 2.5), null, 5.4)

    // 4. The timeline breathes. Sound at full presence. The wordmark arrives quietly.
      .call(() => sound.level(0.55, 2), null, 7.2)
      .to(mark, { opacity: 1, duration: 1.8, ease: 'power1.out' }, 7.7)
      .call(openScroll, null, 9.2);
  }

  function whenReady(el, timeoutMs) {
    return new Promise((resolve) => {
      if (el.readyState >= 3) return resolve();
      const done = () => { el.removeEventListener('canplaythrough', done); resolve(); };
      el.addEventListener('canplaythrough', done);
      setTimeout(done, timeoutMs);
    });
  }

  async function play() {
    const me = ++run;
    if (tl) tl.kill();
    gsap.killTweensOf([footageEl, mark, '.about-line']);
    scrollOpen = false;
    root.classList.add('locked');
    replayBtn.classList.remove('show');
    scrollTo(0, 0);
    sound.cut();
    sound.intensity(0);
    reset();
    build();
    loadFastFrames();

    if (reduceMotion) { tl.progress(1); return; }

    // 1. Pure black and silence while the logo loads, then the logo video plays once.
    await whenReady(logoVideo, 5000);
    if (me !== run) return;
    await new Promise((r) => setTimeout(r, 400));
    if (me !== run) return;
    gsap.set(logoVideo, { opacity: 1 });
    let started = false;
    const next = () => { if (!started && me === run) { started = true; tl.play(); } };
    logoVideo.addEventListener('ended', next, { once: true });
    logoVideo.play().catch(() => {
      // Autoplay refused (e.g. iOS low power mode): show the final frame and move on.
      gsap.set(logoVideo, { opacity: 0 });
      gsap.fromTo('.logo-end', { opacity: 0 }, { opacity: 1, duration: 2.5, onComplete: next });
    });
    setTimeout(next, 9000); // never hang on a stalled video
  }

  /* ---------- Acts 5-6 (scroll) ---------- */

  function drop() {
    dropped = true;
    gsap.killTweensOf([footageEl, mark]);
    gsap.to([footageEl, mark], {
      y: innerHeight * 1.2,
      duration: 0.42,
      ease: 'power4.in',
      onComplete: () => {
        sound.cut();
        slow.pause();
        stage.style.visibility = 'hidden';
      },
    });
    // 7. Silence. The about lines, half a second apart.
    gsap.to('.about-line', { opacity: 1, duration: 1.4, ease: 'power1.out', stagger: 0.5, delay: 0.7 });
  }

  function undrop() {
    dropped = false;
    stage.style.visibility = '';
    slow.play().catch(() => {});
    gsap.killTweensOf([footageEl, mark]);
    gsap.to([footageEl, mark], { y: 0, duration: 0.6, ease: 'power3.out' });
    sound.level(0.55, 0.6);
  }

  function onScroll() {
    if (!scrollOpen) return;
    const dist = Math.max(1, track.offsetHeight - innerHeight);
    const p = Math.min(1, Math.max(0, scrollY / dist));
    sound.intensity(p);
    // The fast timeline takes over from the slow one in the first stretch of scroll.
    drawFast(p);
    fastCanvas.style.opacity = String(Math.min(1, p / 0.08));
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
