(() => {
  "use strict";
  const PREVIOUS_PAGE_URL = "../tiuplilin.html"; 
  const navbar = document.getElementById("navbar");
  const navHome = document.getElementById("navHome");
  const navGallery = document.getElementById("navGallery");
  const navMusic = document.getElementById("navMusic");
  const galleryEl = document.getElementById("gallery");
  const musicEl = document.getElementById("music");
  let lastScrollY = window.scrollY;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      navbar.classList.add("navbar--hidden");
    } else {

      navbar.classList.remove("navbar--hidden");
    }
    
    lastScrollY = currentScrollY;
  });

 
  navHome.addEventListener("click", () => {
    document.body.classList.add("is-leaving");
    setTimeout(() => {
      window.location.href = PREVIOUS_PAGE_URL;
    }, 300);
  });

  navGallery.addEventListener("click", () => {
    if (window.smoothScrollTo) {
      window.smoothScrollTo(galleryEl);
    } else {
      galleryEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  navMusic.addEventListener("click", () => {
    if (window.smoothScrollTo) {
      window.smoothScrollTo(musicEl);
    } else {
      musicEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  const magneticEls = document.querySelectorAll("[data-magnetic]");
  const MAGNETIC_RADIUS = 60; // px
  const MAGNETIC_STRENGTH = 0.35;

  function handleMagneticMove(e) {
    magneticEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < MAGNETIC_RADIUS) {
        const pull = (1 - distance / MAGNETIC_RADIUS) * MAGNETIC_STRENGTH;
        el.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
      } else {
        el.style.transform = "translate(0, 0)";
      }
    });
  }

  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", handleMagneticMove);
  }

  magneticEls.forEach((el) => {
    el.addEventListener("pointerleave", () => {
      el.style.transform = "translate(0, 0)";
    });
  });
})();