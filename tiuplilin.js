(() => {
  "use strict";

  const NEXT_PAGE_URL = "halamanakhir.html"; // ganti sesuai halaman tujuan setelah amplop ditap

  const bodyEl = document.body;
  const cakeStage = document.getElementById("cakeStage");
  const cakeWrap = document.getElementById("cakeWrap");
  const tapText = document.getElementById("tapText");
  const dynamicText = document.getElementById("dynamicText");
  const flameEl = document.getElementById("flame");

  const wishBox = document.getElementById("wishBox");
  const wishTextarea = document.getElementById("wishTextarea");
  const wishSend = document.getElementById("wishSend");

  const envelopeStage = document.getElementById("envelopeStage");
  const envelopeEl = document.getElementById("envelope");

  const petalLayer = document.getElementById("petalLayer");
  const sparkleCanvas = document.getElementById("sparkleCanvas");

  let candleBlownOut = false;
  let envelopeOpened = false;
  let wishSubmitted = false;

  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
    }
    return audioCtx;
  }

  function playChimeNote(freq, startTime, duration, volume) {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  function playCelebrationSfx() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        playChimeNote(freq, now + i * 0.09, 0.35, 0.22);
      });

      const sparkleNotes = [1568, 1760, 1976];
      sparkleNotes.forEach((freq, i) => {
        playChimeNote(freq, now + 0.36 + i * 0.06, 0.2, 0.12);
      });
    } catch (err) {
      console.error("playCelebrationSfx failed:", err);
    }
  }

 function playClickSfx() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Efek Pop Klik Digital
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.04);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);

      // Nada Pemanis Transisi
      playChimeNote(1318.51, now + 0.03, 0.18, 0.15);
      playChimeNote(1567.98, now + 0.08, 0.25, 0.12);
    } catch (err) {
      console.error("playClickSfx failed:", err);
    }
  }

  function playErrorSfx() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.22);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch (err) {
      console.error("playErrorSfx failed:", err);
    }
  }

  function spawnPetal() {
    const petal = document.createElement("div");
    petal.className = "petal";

    const startX = Math.random() * window.innerWidth;
    const size = 10 + Math.random() * 14;
    const fallDuration = 7 + Math.random() * 6;
    const swayDuration = 3 + Math.random() * 2;
    const rotateStart = Math.random() * 360;

    petal.style.left = `${startX}px`;
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;
    petal.style.animationDuration = `${fallDuration}s, ${swayDuration}s`;
    petal.style.transform = `rotate(${rotateStart}deg)`;
    petal.style.opacity = (0.6 + Math.random() * 0.3).toFixed(2);

    petalLayer.appendChild(petal);

    setTimeout(() => petal.remove(), fallDuration * 1000 + 200);
  }

  function startPetalLoop() {
    spawnPetal();
    const nextDelay = 350 + Math.random() * 500;
    setTimeout(startPetalLoop, nextDelay);
  }

  const ctx2d = sparkleCanvas.getContext("2d");
  let sparkles = [];

  function resizeCanvas() {
    sparkleCanvas.width = window.innerWidth;
    sparkleCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function addSparkle(x, y) {
    sparkles.push({
      x,
      y,
      radius: 2 + Math.random() * 2.5,
      life: 1,
    });
    if (sparkles.length > 80) sparkles.shift();
  }

  function renderSparkles() {
    ctx2d.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);

    sparkles.forEach((s) => {
      ctx2d.beginPath();
      ctx2d.arc(s.x, s.y, s.radius * s.life, 0, Math.PI * 2);
      ctx2d.fillStyle = `rgba(255, 200, 222, ${s.life})`;
      ctx2d.shadowColor = "rgba(255, 255, 255, 0.9)";
      ctx2d.shadowBlur = 8;
      ctx2d.fill();
      s.life -= 0.035;
    });

    sparkles = sparkles.filter((s) => s.life > 0);
    requestAnimationFrame(renderSparkles);
  }
  renderSparkles();

  window.addEventListener("pointermove", (e) => addSparkle(e.clientX, e.clientY));
  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches && e.touches[0]) {
        addSparkle(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true }
  );

  function vibrate(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  function handleScreenTap(e) {
    if (candleBlownOut) return;
    
    if (e.target.closest("#wishBox") || e.target.closest("#envelopeStage")) return;
    
    if (!wishSubmitted) {
      promptWishReminder();
      return;
    }

    candleBlownOut = true;
    blowOutCandle();
  }

  document.addEventListener("click", handleScreenTap);
  document.addEventListener(
    "touchstart",
    (e) => {
      handleScreenTap(e);
    },
    { passive: true }
  );

  function promptWishReminder() {
    wishBox.classList.add("is-shaking");
    vibrate(15);
    playErrorSfx();
    setTimeout(() => {
      wishBox.classList.remove("is-shaking");
    }, 400);
  }

  cakeWrap.addEventListener("click", (e) => {
    e.stopPropagation();
    handleScreenTap(e);
  });

  function blowOutCandle() {
    flameEl.classList.add("is-blown-out");
    vibrate(20);
    playCelebrationSfx();

    tapText.classList.add("is-hidden");

    onCandleExtinguished();
  }

  function onCandleExtinguished() {

    dynamicText.textContent = "HAPPY BIRTHDAY SAYANG";
    dynamicText.classList.add("is-celebration");

    setTimeout(() => {
      transitionToEnvelope();
    }, 3000);
  }

  function transitionToEnvelope() {

    cakeStage.classList.add("is-leaving");

    setTimeout(() => {
      cakeStage.remove();
    }, 700);

    wishBox.classList.remove("is-active");

    setTimeout(() => {
      envelopeStage.classList.add("is-active");
    }, 350);
  }

  wishBox.addEventListener("pointerdown", () => {
  
    wishTextarea.focus();
  });

  wishTextarea.addEventListener("input", () => {
    const hasText = wishTextarea.value.trim().length > 0;
    wishSend.disabled = !hasText;
    wishSend.classList.toggle("is-active", hasText);
  });

  wishSend.addEventListener("click", () => {
    if (wishSend.disabled) return;

    wishTextarea.disabled = true;
    wishBox.classList.add("is-locked");
    wishSend.disabled = true;
    wishSubmitted = true;
    vibrate(15);
  });

  function handleEnvelopeTap() {
    if (envelopeOpened) return;
    if (!envelopeStage.classList.contains("is-active")) return;

    envelopeOpened = true;
    envelopeEl.classList.add("is-tapped");
    vibrate();
    
    playClickSfx(); 

    setTimeout(() => {
      window.location.href = NEXT_PAGE_URL;
    }, 350);
  }

  envelopeEl.addEventListener("click", (e) => {
    e.stopPropagation();
    handleEnvelopeTap();
  });

  function handleOrientation(event) {
    const gamma = event.gamma || 0; 
    const beta = event.beta || 0; 

    const moveX = Math.max(-12, Math.min(12, gamma / 3));
    const moveY = Math.max(-12, Math.min(12, (beta - 45) / 5));

    cakeWrap.style.transform = `translate(${moveX}px, ${moveY}px)`;
    bodyEl.style.backgroundPosition = `${50 + moveX / 2}% ${50 + moveY / 2}%`;
  }

  function initGyroParallax() {
    if (typeof DeviceOrientationEvent === "undefined") return;

    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      const requestOnce = () => {
        DeviceOrientationEvent.requestPermission()
          .then((state) => {
            if (state === "granted") {
              window.addEventListener("deviceorientation", handleOrientation);
            }
          })
          .catch(() => {
        
          });
        document.removeEventListener("click", requestOnce);
        document.removeEventListener("touchstart", requestOnce);
      };
      document.addEventListener("click", requestOnce, { once: true });
      document.addEventListener("touchstart", requestOnce, { once: true });
    } else {
      window.addEventListener("deviceorientation", handleOrientation);
    }
  }

  window.addEventListener("load", () => {
    startPetalLoop();
    initGyroParallax();

    setTimeout(() => {
      wishBox.classList.add("is-active");
    }, 300);
  });
})();
