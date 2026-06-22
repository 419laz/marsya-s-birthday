(() => {
  "use strict";

  const CORRECT_PASSWORD = "240609";
  const PASSWORD_LENGTH = 6;
  const REDIRECT_URL = "tiuplilin.html"; 

  let inputBuffer = "";
  let isLocked = false; 

  const screenEl = document.querySelector(".screen");
  const dotsContainer = document.getElementById("dots");
  const dotEls = Array.from(document.querySelectorAll(".dot"));
  const numpadContainer = document.getElementById("numpadContainer");
  const numpadEl = document.getElementById("numpad");
  const keyEls = Array.from(document.querySelectorAll(".key"));
  const toastEl = document.getElementById("toast");
  const petalLayer = document.getElementById("petalLayer");
  const sparkleCanvas = document.getElementById("sparkleCanvas");

  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
    }
    return audioCtx;
  }

  function playClickTone(digitIndex) {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const minFreq = 420;
      const maxFreq = 980;
      const t = Math.min(Math.max(digitIndex, 0), PASSWORD_LENGTH - 1) / (PASSWORD_LENGTH - 1);
      const freq = minFreq + (maxFreq - minFreq) * t;

      osc.type = "sine";
      osc.frequency.value = freq;

      gain.gain.value = 0.0001;
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (err) {
    }
  }

  function playErrorBuzzer() {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.value = 110;
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.4);

      gain.gain.value = 0.0001;
      gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.46);
    } catch (err) {
    }
  }

  function vibrate(pattern) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }

  function updateDots() {
    dotEls.forEach((dot, i) => {
      dot.classList.toggle("is-filled", i < inputBuffer.length);
    });
  }

  function handleDigitInput(digit) {
    if (isLocked) return;
    if (inputBuffer.length >= PASSWORD_LENGTH) return;

    inputBuffer += digit;
    updateDots();
    playClickTone(inputBuffer.length - 1);
    vibrate(15);

    if (inputBuffer.length === PASSWORD_LENGTH) {
      setTimeout(validatePassword, 120);
    }
  }

  function handleDelete() {
    if (isLocked) return;
    if (inputBuffer.length === 0) return;
    inputBuffer = inputBuffer.slice(0, -1);
    updateDots();
    vibrate(10);
  }

  function handleDeleteAll() {
    if (inputBuffer.length === 0) return;
    inputBuffer = "";
    updateDots();
    vibrate([10, 30, 10]);
  }

  function handleEnter() {
    if (isLocked) return;
    if (inputBuffer.length === PASSWORD_LENGTH) {
      validatePassword();
    }
  }

  keyEls.forEach((keyEl, index) => {
    keyEl.style.setProperty("--key-index", index);
    const keyValue = keyEl.dataset.key;

    let pressTimer = null;
    let longPressTriggered = false;

    const triggerPressVisuals = () => {
      keyEl.classList.add("is-pressed");
      keyEl.classList.add("is-glowing");
      
      window.requestAnimationFrame(() => {
        keyEl.addEventListener(
          "animationend",
          () => keyEl.classList.remove("is-glowing"),
          { once: true }
        );
      });
    };

    const releasePressVisuals = () => {
      keyEl.classList.remove("is-pressed");
    };

    const onPressStart = (e) => {
      e.preventDefault();
      triggerPressVisuals();

      if (keyValue === "DEL") {
        longPressTriggered = false;
        pressTimer = setTimeout(() => {
          longPressTriggered = true;
          keyEl.classList.add("is-longpress");
          handleDeleteAll();
        }, 550);
      }
    };

    const onPressEnd = (e) => {
      e.preventDefault();
      releasePressVisuals();
      keyEl.classList.remove("is-longpress");

      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }

      if (keyValue === "DEL") {
        if (!longPressTriggered) {
          handleDelete();
        }
        return;
      }

      if (keyValue === "ENT") {
        handleEnter();
        return;
      }

      handleDigitInput(keyValue);
    };

    const onPressCancel = () => {
      releasePressVisuals();
      keyEl.classList.remove("is-longpress");
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };

    keyEl.addEventListener("pointerdown", onPressStart);
    keyEl.addEventListener("pointerup", onPressEnd);
    keyEl.addEventListener("pointerleave", onPressCancel);
    keyEl.addEventListener("pointercancel", onPressCancel);
  });

  document.addEventListener("keydown", (e) => {
    if (/^[0-9]$/.test(e.key)) {
      const matchingKey = keyEls.find((k) => k.dataset.key === e.key);
      if (matchingKey) {
        matchingKey.classList.add("is-pressed", "is-glowing");
      }
      handleDigitInput(e.key);
    } else if (e.key === "Backspace") {
      const delKey = keyEls.find((k) => k.dataset.key === "DEL");
      if (delKey) delKey.classList.add("is-pressed", "is-glowing");
      handleDelete();
    } else if (e.key === "Enter") {
      const entKey = keyEls.find((k) => k.dataset.key === "ENT");
      if (entKey) entKey.classList.add("is-pressed", "is-glowing");
      handleEnter();
    }
  });

  document.addEventListener("keyup", (e) => {
    let key = null;
    if (/^[0-9]$/.test(e.key)) key = e.key;
    else if (e.key === "Backspace") key = "DEL";
    else if (e.key === "Enter") key = "ENT";

    if (key) {
      const matchingKey = keyEls.find((k) => k.dataset.key === key);
      if (matchingKey) matchingKey.classList.remove("is-pressed");
    }
  });

  function validatePassword() {
    isLocked = true;

    if (inputBuffer === CORRECT_PASSWORD) {
      onCorrectPassword();
    } else {
      onWrongPassword();
    }
  }

  function onCorrectPassword() {
    vibrate([20, 40, 20, 40, 60]);
    document.body.classList.add("is-leaving");
    setTimeout(() => {
      window.location.href = REDIRECT_URL;
    }, 600);
  }

  function onWrongPassword() {
    numpadContainer.classList.remove("is-shaking");
    void numpadContainer.offsetWidth; 
    numpadContainer.classList.add("is-shaking");

    dotsContainer.classList.add("is-error");

    toastEl.classList.remove("is-visible");
    void toastEl.offsetWidth; 
    toastEl.classList.add("is-visible");

    try {
      playErrorBuzzer();
    } catch (err) {
      console.error("playErrorBuzzer failed:", err);
    }

    try {
      vibrate([60, 50, 60, 50, 100]);
    } catch (err) {
      console.error("vibrate failed:", err);
    }

    setTimeout(() => {
      numpadContainer.classList.remove("is-shaking");
    }, 500);

    setTimeout(() => {
      toastEl.classList.remove("is-visible");
      dotsContainer.classList.remove("is-error");
      inputBuffer = "";
      updateDots();
      isLocked = false;
    }, 1400);
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

    setTimeout(() => {
      petal.remove();
    }, fallDuration * 1000 + 200);
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

  function handlePointerMove(x, y) {
    addSparkle(x, y);
  }

  window.addEventListener("pointermove", (e) => {
    handlePointerMove(e.clientX, e.clientY);
  });

  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches && e.touches[0]) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true }
  );

  function handleOrientation(event) {
    const gamma = event.gamma || 0; 
    const beta = event.beta || 0; 

    const moveX = Math.max(-10, Math.min(10, gamma / 3));
    const moveY = Math.max(-10, Math.min(10, (beta - 45) / 5));

    numpadContainer.style.transform = `translate(${moveX}px, ${moveY}px)`;
  }

  function initAccelerometerParallax() {
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
    screenEl.classList.add("is-ready");
    startPetalLoop();
    initAccelerometerParallax();
  });
})();