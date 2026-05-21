/* =========================================================
   Checklist - Vanilla JS
   - Renders lecture lists
   - Handles navigation (Home / Ortho / Neuro)
   - Saves progress to localStorage
   - Updates global + section progress bars and counters
   - Elegant feedback (toast + optional sound)
   ========================================================= */

(() => {
  "use strict";

  /* ---------------------------
     Data (exact lecture counts)
     Total = 35
     Ortho = 20
     Neuro = 15
  ---------------------------- */
  const DATA = {
    ortho: {
      total: 20,
      groups: [
        {
          key: "waled",
          mountId: "ortho-waled",
          lecturer: "د. وليد حداد",
          lectures: [
            { n: 1, title: "Principles of fractures" },
            { n: 2, title: "Peripheral nerve injuries" },
            { n: 3, title: "X-ray (extra lecture)" }
          ]
        },
        {
          key: "osama",
          mountId: "ortho-osama",
          lecturer: "د. أسامة الدهامشة",
          lectures: [
            { n: 4, title: "Overview of Spine Anatomy" },
            { n: 5, title: "Scoliosis & kyphosis" },
            { n: 6, title: "Spondylosis & Spondylolisthesis" },
            { n: 7, title: "Spina bifida and torticollis" },
            { n: 8, title: "Spine disorders" },
            { n: 9, title: "Intervertebral disc prolapse" },
            { n: 10, title: "Principles in spine fractures" },
            { n: 11, title: "Bone tumor x ray" }
          ]
        },
        {
          key: "jamal",
          mountId: "ortho-jamal",
          lecturer: "د. جمال العمري",
          lectures: [
            { n: 12, title: "Upper limb" }
          ]
        },
        {
          key: "samir",
          mountId: "ortho-samir",
          lecturer: "د. سمير السقا",
          lectures: [
            { n: 13, title: "Musculoskeletal infections" },
            { n: 14, title: "Arthritis in hip & knee" }
          ]
        },
        {
          key: "ananzeh",
          mountId: "ortho-ananzeh",
          lecturer: "د. محمد عنانزة",
          lectures: [
            { n: 15, title: "Pediatric foot" },
            { n: 16, title: "SCFE" },
            { n: 17, title: "Legg Calve Perthes disease" },
            { n: 18, title: "DDH" },
            { n: 19, title: "Genu varus and valgus" }
          ]
        },
        {
          key: "khreisat",
          mountId: "ortho-khreisat",
          lecturer: "د. محمد الخريسات",
          lectures: [
            { n: 20, title: "Lower limb" }
          ]
        }
      ]
    },

    neuro: {
      total: 15,
      groups: [
        {
          key: "medicine",
          mountId: "neuro-medicine",
          title: "💉🧠 Neuromedicine",
          lectures: [
            { n: 1, title: "Medical neurology" },
            { n: 2, title: "CVA" },
            { n: 3, title: "Peripheral nervous" },
            { n: 4, title: "Movement disorders" },
            { n: 5, title: "Multiple sclerosis" },
            { n: 6, title: "Dementia" },
            { n: 7, title: "Epilepsy" },
            { n: 8, title: "Infective neurological diseases" },
            { n: 9, title: "Headache" }
          ]
        },
        {
          key: "surgery",
          mountId: "neuro-surgery",
          title: "🪚🧠 Neurosurgery (Online lectures)",
          lectures: [
            { n: 10, title: "Back pain" },
            { n: 11, title: "CNS tumors" },
            { n: 12, title: "Spinal injuries" },
            { n: 13, title: "Congenital anomalies" },
            { n: 14, title: "Head injuries" },
            { n: 15, title: "Introduction to SAH" }
          ]
        }
      ]
    }
  };

  const TOTAL_LECTURES = 35;

  /* ---------------------------
     Local Storage
  ---------------------------- */
  const STORAGE_KEY = "checklist-progress-v1";

  /** progressState shape:
   *  {
   *    "ortho-1": true,
   *    "neuro-10": false,
   *    ...
   *  }
   */
  let progressState = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return (parsed && typeof parsed === "object") ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressState));
  }

  /* ---------------------------
     DOM refs
  ---------------------------- */
  const loader = document.getElementById("loader");
  const toast = document.getElementById("toast");

  // Views
  const views = {
    home: document.getElementById("home"),
    ortho: document.getElementById("ortho"),
    neuro: document.getElementById("neuro")
  };

  // Global header elements
  const globalCompletedText = document.getElementById("globalCompletedText");
  const globalRemainingText = document.getElementById("globalRemainingText");
  const globalPercentText = document.getElementById("globalPercentText");
  const globalBar = document.getElementById("globalBar");
  const globalGlow = document.getElementById("globalGlow");

  // Ortho section header elements
  const orthoCountText = document.getElementById("orthoCountText");
  const orthoPercentText = document.getElementById("orthoPercentText");
  const orthoBar = document.getElementById("orthoBar");
  const orthoGlow = document.getElementById("orthoGlow");
  const orthoComplete = document.getElementById("orthoComplete");

  // Neuro section header elements
  const neuroCountText = document.getElementById("neuroCountText");
  const neuroPercentText = document.getElementById("neuroPercentText");
  const neuroBar = document.getElementById("neuroBar");
  const neuroGlow = document.getElementById("neuroGlow");
  const neuroComplete = document.getElementById("neuroComplete");

  /* ---------------------------
     Render lecture lists
  ---------------------------- */
  function renderAll() {
    // Ortho
    DATA.ortho.groups.forEach(group => {
      const mount = document.getElementById(group.mountId);
      mount.innerHTML = "";
      group.lectures.forEach(lec => {
        const id = `ortho-${lec.n}`;
        mount.appendChild(createLectureItem({ id, number: lec.n, title: lec.title, section: "ortho" }));
      });
    });

    // Neuro
    DATA.neuro.groups.forEach(group => {
      const mount = document.getElementById(group.mountId);
      mount.innerHTML = "";
      group.lectures.forEach(lec => {
        const id = `neuro-${lec.n}`;
        mount.appendChild(createLectureItem({ id, number: lec.n, title: lec.title, section: "neuro" }));
      });
    });

    // After render, apply existing state to UI
    applyStateToUI();
    updateAllProgress();
  }

  function createLectureItem({ id, number, title, section }) {
    const li = document.createElement("li");
    li.className = "lectureItem";
    li.dataset.id = id;
    li.dataset.section = section;

    const ck = document.createElement("label");
    ck.className = "ck";
    ck.setAttribute("aria-label", `Lecture ${number}: ${title}`);

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = !!progressState[id];
    input.addEventListener("change", () => onToggleLecture(id, input.checked, li, section));

    ck.appendChild(input);

    const text = document.createElement("div");
    text.className = "lectureText";

    const t = document.createElement("div");
    t.className = "lectureTitle";
    t.textContent = `${number}. ${title}`;

    const meta = document.createElement("div");
    meta.className = "lectureMeta";
    meta.textContent = section === "ortho" ? "Orthopedics" : "Neurology";

    text.appendChild(t);
    text.appendChild(meta);

    li.appendChild(ck);
    li.appendChild(text);

    // Set completed class initially
    if (input.checked) li.classList.add("completed");

    return li;
  }

  function applyStateToUI() {
    document.querySelectorAll(".lectureItem").forEach(item => {
      const id = item.dataset.id;
      const isDone = !!progressState[id];
      item.classList.toggle("completed", isDone);

      const input = item.querySelector("input[type='checkbox']");
      if (input) input.checked = isDone;
    });
  }

  /* ---------------------------
     Toggle lecture
  ---------------------------- */
  function onToggleLecture(id, checked, li, section) {
    progressState[id] = checked;
    saveState();

    // Visual class update (no reordering => item stays in place)
    li.classList.toggle("completed", checked);

    // Elegant feedback
    if (checked) {
      playTick(); // optional sound
      glowPulse(section);
      showToast(`✅ تم إنجاز المحاضرة ${id.split("-")[1]}`);
    } else {
      showToast(`↩️ تم إلغاء تحديد المحاضرة ${id.split("-")[1]}`);
    }

    // Update progress everywhere
    updateAllProgress();

    // If section complete, celebrate
    checkSectionCompletion(section);
  }

  /* ---------------------------
     Progress calculations
  ---------------------------- */
  function countCompleted(prefix) {
    // prefix "ortho-" or "neuro-"
    let c = 0;
    for (const k in progressState) {
      if (k.startsWith(prefix) && progressState[k]) c++;
    }
    return c;
  }

  function getGlobalCompleted() {
    // Only count ids that actually exist (safe)
    const valid = new Set();

    DATA.ortho.groups.forEach(g => g.lectures.forEach(l => valid.add(`ortho-${l.n}`)));
    DATA.neuro.groups.forEach(g => g.lectures.forEach(l => valid.add(`neuro-${l.n}`)));

    let c = 0;
    for (const id of valid) {
      if (progressState[id]) c++;
    }
    return c;
  }

  function updateAllProgress() {
    // Global
    const globalDone = getGlobalCompleted();
    const globalRemain = TOTAL_LECTURES - globalDone;
    const globalPct = Math.round((globalDone / TOTAL_LECTURES) * 100);

    globalCompletedText.textContent = `${globalDone} / ${TOTAL_LECTURES}`;
    globalRemainingText.textContent = `${globalRemain}`;
    globalPercentText.textContent = `${globalPct}%`;

    setBar(globalBar, globalGlow, globalPct);

    // Ortho
    const orthoDone = countCompleted("ortho-");
    const orthoPct = Math.round((orthoDone / DATA.ortho.total) * 100);
    orthoCountText.textContent = `${orthoDone} / ${DATA.ortho.total} completed`;
    orthoPercentText.textContent = `${orthoPct}%`;
    setBar(orthoBar, orthoGlow, orthoPct);

    // Neuro
    const neuroDone = countCompleted("neuro-");
    const neuroPct = Math.round((neuroDone / DATA.neuro.total) * 100);
    neuroCountText.textContent = `${neuroDone} / ${DATA.neuro.total} completed`;
    neuroPercentText.textContent = `${neuroPct}%`;
    setBar(neuroBar, neuroGlow, neuroPct);

    // Completion banners
    orthoComplete.hidden = !(orthoDone === DATA.ortho.total);
    neuroComplete.hidden = !(neuroDone === DATA.neuro.total);
  }

  function setBar(fillEl, glowEl, pct) {
    const clamped = Math.max(0, Math.min(100, pct));
    fillEl.style.width = `${clamped}%`;
    // Show glow more when progress increases
    glowEl.style.opacity = clamped > 0 ? "1" : "0";
  }

  /* ---------------------------
     Completion celebration
  ---------------------------- */
  function checkSectionCompletion(section) {
    if (section === "ortho") {
      const done = countCompleted("ortho-");
      if (done === DATA.ortho.total) {
        showToast("🎉 Orthopedics Completed ✅");
        microConfetti();
      }
    } else if (section === "neuro") {
      const done = countCompleted("neuro-");
      if (done === DATA.neuro.total) {
        showToast("🎉 Neurology Completed ✅");
        microConfetti();
      }
    }
  }

  // Small, elegant confetti (DOM-based, short-lived)
  function microConfetti() {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.style.position = "fixed";
      p.style.zIndex = "90";
      p.style.left = `${Math.random() * 100}vw`;
      p.style.top = `-12px`;
      p.style.width = "8px";
      p.style.height = "10px";
      p.style.borderRadius = "3px";
      p.style.opacity = "0.9";
      p.style.background = (Math.random() > 0.5)
        ? "rgba(39,255,133,.95)"
        : "rgba(61,220,255,.95)";
      p.style.boxShadow = "0 0 14px rgba(255,255,255,.14)";
      p.style.transform = `rotate(${Math.random() * 180}deg)`;

      const dur = 900 + Math.random() * 700;
      const drift = (Math.random() - 0.5) * 120;

      p.animate([
        { transform: `translate3d(0,0,0) rotate(0deg)`, opacity: 0.95 },
        { transform: `translate3d(${drift}px, 105vh, 0) rotate(${360 + Math.random()*360}deg)`, opacity: 0.0 }
      ], {
        duration: dur,
        easing: "cubic-bezier(.2,.9,.2,1)"
      });

      document.body.appendChild(p);
      setTimeout(() => p.remove(), dur + 50);
    }
  }

  /* ---------------------------
     Toast message
  ---------------------------- */
  let toastTimer = null;

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    toast.classList.remove("toast--show");
    // force reflow to restart animation
    void toast.offsetWidth;
    toast.classList.add("toast--show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 2200);
  }

  /* ---------------------------
     Navigation (home / ortho / neuro)
  ---------------------------- */
  function showView(name) {
    Object.keys(views).forEach(v => {
      views[v].classList.toggle("view--active", v === name);
    });

    // scroll top nicely, but keep header visible
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function initNav() {
    // Category cards
    document.querySelectorAll("[data-nav]").forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.nav;
        showView(target);
      });
    });

    // Back buttons
    document.querySelectorAll("[data-back]").forEach(btn => {
      btn.addEventListener("click", () => showView("home"));
    });
  }

  /* ---------------------------
     Optional sound (Web Audio)
     No external files needed.
  ---------------------------- */
  let audioCtx = null;

  function playTick() {
    try {
      // Create on first interaction (browser policy friendly)
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(740, t);
      osc.frequency.exponentialRampToValueAtTime(980, t + 0.06);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.06, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.10);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.11);
    } catch {
      // If audio fails, silently ignore (optional feature)
    }
  }

  /* Glow pulse on progress bars */
  function glowPulse(section) {
    const el = section === "ortho" ? orthoGlow : section === "neuro" ? neuroGlow : globalGlow;
    if (!el) return;
    el.animate(
      [{ opacity: 0.35 }, { opacity: 1 }, { opacity: 0.35 }],
      { duration: 520, easing: "ease-in-out" }
    );
  }

  /* ---------------------------
     Init + Loader
  ---------------------------- */
  function init() {
    // Render everything
    renderAll();
    initNav();

    // Nice loading experience
    setTimeout(() => {
      loader.setAttribute("aria-hidden", "true");
    }, 450);

    // First check: show completion banners if already done
    checkSectionCompletion("ortho");
    checkSectionCompletion("neuro");
  }

  // Start
  document.addEventListener("DOMContentLoaded", init);

})();
