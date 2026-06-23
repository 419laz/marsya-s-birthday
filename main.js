(() => {
  "use strict";
  if (window.lucide) {
    window.lucide.createIcons();
  }

  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    document.querySelectorAll("a[href^='#']").forEach((a) => {
      a.addEventListener("click", (e) => {
        const target = document.querySelector(a.getAttribute("href"));
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target);
        }
      });
    });
  }

  window.smoothScrollTo = function (el) {
    if (lenis) {
      lenis.scrollTo(el);
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const revealEls = document.querySelectorAll(".reveal");
  revealEls.forEach((el, i) => {
    const delay = el.classList.contains("gallery-item")
      ? Number(el.dataset.index || 0) * 90
      : i * 60;

    setTimeout(() => {
      el.classList.add("is-visible");
    }, delay);
  });

  revealEls.forEach((el) => revealObserver.observe(el));

  const heroPhotoWrap = document.querySelector(".hero__photo-wrap");

  function handleOrientation(event) {
    const gamma = event.gamma || 0; 
    const beta = event.beta || 0; 

    const moveX = Math.max(-10, Math.min(10, gamma / 3));
    const moveY = Math.max(-10, Math.min(10, (beta - 45) / 5));

    if (heroPhotoWrap) {
      heroPhotoWrap.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
    document.body.style.backgroundPosition = `${50 + moveX / 2}% ${50 + moveY / 2}%`;
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

  const leaveStyle = document.createElement("style");
  leaveStyle.textContent = `
    body.is-leaving { animation: page3-fade-out 0.3s ease forwards; }
    @keyframes page3-fade-out { to { opacity: 0; } }
  `;
  document.head.appendChild(leaveStyle);
  window.addEventListener("load", () => {
    initGyroParallax();
  });
})();