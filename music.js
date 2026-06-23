(() => {
  "use strict";

  const ambientAudio = document.getElementById("ambientAudio");
  const trackCards = document.querySelectorAll(".track-card");
  const playerHint = document.getElementById("playerHint");

  let isAmbientPlaying = false;

  if (ambientAudio) {
    ambientAudio.volume = 0.4; 
  }

  function playAmbientOnFirstGesture() {
    if (ambientAudio && !isAmbientPlaying) {
      const anyCardPlaying = Array.from(trackCards).some(card => card.classList.contains("is-playing"));
      if (anyCardPlaying) {
        removeGestureListeners();
        return;
      }

      ambientAudio.play()
        .then(() => {
          isAmbientPlaying = true;
          removeGestureListeners();
        })
        .catch(() => {
        });
    }
  }

  function removeGestureListeners() {
    window.removeEventListener("click", playAmbientOnFirstGesture);
    window.removeEventListener("scroll", playAmbientOnFirstGesture);
    window.removeEventListener("touchstart", playAmbientOnFirstGesture);
  }

  window.addEventListener("click", playAmbientOnFirstGesture);
  window.addEventListener("scroll", playAmbientOnFirstGesture);
  window.addEventListener("touchstart", playAmbientOnFirstGesture, { passive: true });

  function setCardState(card, isPlaying) {
    card.classList.toggle("is-playing", isPlaying);
    const icon = card.querySelector(".track-card__toggle i");
    if (icon) {
      icon.setAttribute("data-lucide", isPlaying ? "pause" : "play");
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function pauseAllTracks() {
    trackCards.forEach((card) => {
      const audio = card.querySelector(".track-card__audio");
      if (audio && !audio.paused) {
        audio.pause();
      }
      setCardState(card, false);
    });
  }

  trackCards.forEach((card) => {
    const audio = card.querySelector(".track-card__audio");
    const toggleBtn = card.querySelector(".track-card__toggle");
    const togglePlayback = (e) => {
      e.stopPropagation();
      if (!audio) return;
      const isCurrentlyPlaying = card.classList.contains("is-playing");
      if (isCurrentlyPlaying) {
        audio.pause();
        setCardState(card, false);
      } else {
        if (ambientAudio && !ambientAudio.paused) {
          ambientAudio.pause();
          isAmbientPlaying = false;
        }
        removeGestureListeners();
        pauseAllTracks();
        audio.play()
          .then(() => {
            setCardState(card, true);
            if (playerHint) {
              const title = card.querySelector(".track-card__title").textContent;
              const artist = card.querySelector(".track-card__artist").textContent;
              playerHint.innerHTML = `<span style="color:#e85d96; font-weight:500;">now playing: ${title} - ${artist}</span>`;
            }
          })
          .catch((err) => console.error("Gagal memutar audio lokal:", err));
      }
    };

    card.addEventListener("click", togglePlayback);
    if (toggleBtn) {
      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
      });
    }

    if (audio) {
      audio.addEventListener("ended", () => {
        setCardState(card, false);
        if (playerHint) {
          playerHint.textContent = "tap a track to start the music";
        }
      });
    }
  });
})();