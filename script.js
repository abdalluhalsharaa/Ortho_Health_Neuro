/* =========================================================
   Checklist - Vanilla JS
   - 3 subjects: Ortho (20) + Neuro (15) + Healthcare (14)
   - Global total = 49
   - LocalStorage persistence
   - Reset per subject with elegant confirmation modal
   ========================================================= */

(() => {
  "use strict";

  /* ---------------------------
     Data
  ---------------------------- */
  const DATA = {
    ortho: {
      nameAr: "اورثو",
      total: 20,
      prefix: "ortho-",
      groups: [
        { mountId: "ortho-waled", lectures: [
          { n: 1, title: "Principles of fractures" },
          { n: 2, title: "Peripheral nerve injuries" },
          { n: 3, title: "X-ray (extra lecture)" }
        ]},
        { mountId: "ortho-osama", lectures: [
          { n: 4, title: "Overview of Spine Anatomy" },
          { n: 5, title: "Scoliosis & kyphosis" },
          { n: 6, title: "Spondylosis & Spondylolisthesis" },
          { n: 7, title: "Spina bifida and torticollis" },
          { n: 8, title: "Spine disorders" },
          { n: 9, title: "Intervertebral disc prolapse" },
          { n: 10, title: "Principles in spine fractures" },
          { n: 11, title: "Bone tumor x ray" }
        ]},
        { mountId: "ortho-jamal", lectures: [
          { n: 12, title: "Upper limb" }
        ]},
        { mountId: "ortho-samir", lectures: [
          { n: 13, title: "Musculoskeletal infections" },
          { n: 14, title: "Arthritis in hip & knee" }
        ]},
        { mountId: "ortho-ananzeh", lectures: [
          { n: 15, title: "Pediatric foot" },
          { n: 16, title: "SCFE" },
          { n: 17, title: "Legg Calve Perthes disease" },
          { n: 18, title: "DDH" },
          { n: 19, title: "Genu varus and valgus" }
        ]},
        { mountId: "ortho-khreisat", lectures: [
          { n: 20, title: "Lower limb" }
        ]}
      ]
    },

    neuro: {
      nameAr: "نيورو",
      total: 15,
      prefix: "neuro-",
      groups: [
        { mountId: "neuro-medicine", lectures: [
          { n: 1, title: "Medical neurology" },
          { n: 2, title: "CVA" },
          { n: 3, title: "Peripheral nervous" },
          { n: 4, title: "Movement disorders" },
          { n: 5, title: "Multiple sclerosis" },
          { n: 6, title: "Dementia" },
          { n: 7, title: "Epilepsy" },
          { n: 8, title: "Infective neurological diseases" },
          { n: 9, title: "Headache" }
        ]},
        { mountId: "neuro-surgery", lectures: [
          { n: 10, title: "Back pain" },
          { n: 11, title: "CNS tumors" },
          { n: 12, title: "Spinal injuries" },
          { n: 13, title: "Congenital anomalies" },
          { n: 14, title: "Head injuries" },
          { n: 15, title: "Introduction to SAH" }
        ]}
      ]
    },

    health: {
      nameAr: "الرعاية الصحية",
      total: 14,
      prefix: "health-",
      groups: [
        // Med 1-6
        { mountId: "health-med", lectures: [
          { n: 1, title: "Immunization" },
          { n: 2, title: "Primary health care" },
          { n: 3, title: "Smoking Cessation" },
          { n: 4, title: "The medical interview" },
          { n: 5, title: "Preventive Medicine" },
          { n: 6, title: "Obesity" }
        ]},
        // Final 7-14
        { mountId: "health-final", lectures: [
          { n: 7, title: "Evidence based medicine" },
          { n: 8, title: "Communication skills" },
          { n: 9, title: "Dr.Pt relationship" },
          { n: 10, title: "The Diagnostic process" },
          { n: 11, title: "Breaking bad news" },
          { n: 12, title: "Counselling" },
          { n: 13, title: "Laboratory interpretation" },
          { n: 14, title: "Difficult patient" }
        ]}
      ]
    }
  };

  const TOTAL_LECTURES = DATA.ortho.total + DATA.neuro.total + DATA.health.total; // 49

  /* ---------------------------
     Local Storage
  ---------------------------- */
  const STORAGE_KEY = "checklist-progress-v2"; // bumped key due to new subject added
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
  const topbar = document.getElementById("topbar");

  const totalLecturesText = document.getElementById("totalLecturesText");

  const views = {
    home: document.getElementById("home"),
    ortho: document.getElementById("ortho"),
    neuro: document.getElementById("neuro"),
    health: document.getElementById("health")
  };

  // Global header elements
  const globalCompletedText = document.getElementById("globalCompletedText");
  const globalRemainingText = document.getElementById("globalRemainingText");
  const globalPercentText = document.getElementById("globalPercentText");
  const globalBar = document.getElementById("globalBar");
  const globalGlow = document.getElementById("globalGlow");

  // Ortho section header
  const orthoCountText = document.getElementById("orthoCountText");
  const orthoPercentText = document.getElementById("orthoPercentText");
  const orthoBar = document.getElementById("orthoBar");
  const orthoGlow = document.getElementById("orthoGlow");
  const orthoComplete = document.getElementById("orthoComplete");

  // Neuro section header
  const neuroCountText = document.getElementById("neuroCountText");
  const neuroPercentText = document.getElementById("neuroPercentText");
  const neuroBar = document.getElementById("neuroBar");
  const neuroGlow = document.getElementById("neuroGlow");
  const neuroComplete = document.getElementById("neuroComplete");

  // Health section header
  const healthCountText = document.getElementById("healthCountText");
  const healthPercentText = document.getElementById("healthPercentText");
  const healthBar = document.getElementById("healthBar");
  const healthGlow = document.getElementById("healthGlow");
  const healthComplete = document.getElementById("healthComplete");

  // Modal
  const confirmModal = document.getElementById("confirmModal");
  const confirmText = document.getElementById("confirmText");
  const confirmCancel = document.getElementById("confirmCancel");
  const confirmYes = document.getElementById("confirmYes");

  /* ---------------------------
     Header height sync
  ---------------------------- */
  function syncHeaderHeight() {
    if (!topbar) return;
    const h = Math.ceil(topbar.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--topbar-h", `${h}px`);
  }

  /* ---------------------------
     Render all lectures
  ---------------------------- */
  function renderAll() {
    // Update global total text
    if (totalLecturesText) totalLecturesText.textContent = `Total Lectures : ${TOTAL_LECTURES}`;

    Object.keys(DATA).forEach(sectionKey => {
      const section = DATA[sectionKey];
      section.groups.forEach(group => {
        const mount = document.getElementById(group.mountId);
        if (!mount) return;
        mount.innerHTML = "";

        group.lectures.forEach(lec => {
          const id = `${section.prefix}${lec.n}`;
          mount.appendChild(createLectureItem({ id, number: lec.n, title: lec.title, section: sectionKey }));
        });
      });
    });

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

    // No meta line under lecture (as requested)
    text.appendChild(t);

    li.appendChild(ck);
    li.appendChild(text);

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
    li.classList.toggle("completed", checked);

    if (checked) {
      playTick();
      glowPulse(section);
      showToast(`✅ تم إنجاز المحاضرة ${id.split("-")[1]}`);
    } else {
      showToast(`↩️ تم إلغاء تحديد المحاضرة ${id.split("-")[1]}`);
    }

    updateAllProgress();
    checkSectionCompletion(section);
  }

  /* ---------------------------
     Progress calculations
  ---------------------------- */
  function countCompleted(prefix) {
    let c = 0;
    for (const k in progressState) {
      if (k.startsWith(prefix) && progressState[k]) c++;
    }
    return c;
  }

  function getGlobalCompleted() {
    // Count only valid lecture IDs from DATA (safe against leftovers)
    const valid = new Set();
    Object.keys(DATA).forEach(sectionKey => {
      const section = DATA[sectionKey];
      section.groups.forEach(g => g.lectures.forEach(l => valid.add(`${section.prefix}${l.n}`)));
    });

    let c = 0;
    for (const id of valid) if (progressState[id]) c++;
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
    const orthoDone = countCompleted(DATA.ortho.prefix);
    const orthoPct = Math.round((orthoDone / DATA.ortho.total) * 100);
    orthoCountText.textContent = `${orthoDone} / ${DATA.ortho.total} completed`;
    orthoPercentText.textContent = `${orthoPct}%`;
    setBar(orthoBar, orthoGlow, orthoPct);
    orthoComplete.hidden = !(orthoDone === DATA.ortho.total);

    // Neuro
    const neuroDone = countCompleted(DATA.neuro.prefix);
    const neuroPct = Math.round((neuroDone / DATA.neuro.total) * 100);
    neuroCountText.textContent = `${neuroDone} / ${DATA.neuro.total} completed`;
    neuroPercentText.textContent = `${neuroPct}%`;
    setBar(neuroBar, neuroGlow, neuroPct);
    neuroComplete.hidden = !(neuroDone === DATA.neuro.total);

    // Health
    const healthDone = countCompleted(DATA.health.prefix);
    const healthPct = Math.round((healthDone / DATA.health.total) * 100);
    healthCountText.textContent = `${healthDone} / ${DATA.health.total} completed`;
    healthPercentText.textContent = `${healthPct}%`;
    setBar(healthBar, healthGlow, healthPct);
    healthComplete.hidden = !(healthDone === DATA.health.total);

    syncHeaderHeight();
  }

  function setBar(fillEl, glowEl, pct) {
    const clamped = Math.max(0, Math.min(100, pct));
    fillEl.style.width = `${clamped}%`;
    glowEl.style.opacity = clamped > 0 ? "1" : "0";
  }

  /* ---------------------------
     Completion celebration
  ---------------------------- */
  function checkSectionCompletion(sectionKey) {
    const section = DATA[sectionKey];
    if (!section) return;

    const done = countCompleted(section.prefix);
    if (done === section.total) {
      showToast(`🎉 ${sectionKey === "health" ? "Healthcare" : sectionKey.charAt(0).toUpperCase()+sectionKey.slice(1)} Completed ✅`);
      microConfetti();
    }
  }

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
      ], { duration: dur, easing: "cubic-bezier(.2,.9,.2,1)" });

      document.body.appendChild(p);
      setTimeout(() => p.remove(), dur + 50);
    }
  }

  /* ---------------------------
     Toast
  ---------------------------- */
  let toastTimer = null;
  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    toast.classList.remove("toast--show");
    void toast.offsetWidth;
    toast.classList.add("toast--show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2200);
  }

  /* ---------------------------
     Navigation
  ---------------------------- */
  function showView(name) {
    Object.keys(views).forEach(v => views[v].classList.toggle("view--active", v === name));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function initNav() {
    document.querySelectorAll("[data-nav]").forEach(btn => {
      btn.addEventListener("click", () => showView(btn.dataset.nav));
    });
    document.querySelectorAll("[data-back]").forEach(btn => {
      btn.addEventListener("click", () => showView("home"));
    });
  }

  /* ---------------------------
     Reset confirmation modal
  ---------------------------- */
  let pendingResetSection = null;

  function openConfirm(sectionKey) {
    pendingResetSection = sectionKey;
    const name = DATA[sectionKey]?.nameAr || "هذه المادة";
    confirmText.textContent = `هل أنت متأكد من إعادة تعيين تقدمك في مادة "${name}" ؟`;
    confirmModal.setAttribute("aria-hidden", "false");
  }

  function closeConfirm() {
    pendingResetSection = null;
    confirmModal.setAttribute("aria-hidden", "true");
  }

  function resetSection(sectionKey) {
    const section = DATA[sectionKey];
    if (!section) return;

    // Remove all keys for this prefix
    Object.keys(progressState).forEach(k => {
      if (k.startsWith(section.prefix)) delete progressState[k];
    });
    saveState();

    // Update UI checkboxes for that section
    document.querySelectorAll(`.lectureItem[data-section="${sectionKey}"]`).forEach(item => {
      item.classList.remove("completed");
      const input = item.querySelector("input[type='checkbox']");
      if (input) input.checked = false;
    });

    updateAllProgress();
    showToast(`↺ تم إعادة التعيين لمادة "${section.nameAr}"`);
  }

  function initResetButtons() {
    document.querySelectorAll("[data-reset]").forEach(btn => {
      btn.addEventListener("click", () => openConfirm(btn.dataset.reset));
    });

    // Modal buttons
    confirmCancel.addEventListener("click", closeConfirm);
    confirmYes.addEventListener("click", () => {
      if (pendingResetSection) resetSection(pendingResetSection);
      closeConfirm();
    });

    // Close when clicking backdrop
    confirmModal.querySelectorAll("[data-close]").forEach(el => {
      el.addEventListener("click", closeConfirm);
    });

    // ESC closes
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && confirmModal.getAttribute("aria-hidden") === "false") {
        closeConfirm();
      }
    });
  }

  /* ---------------------------
     Optional sound
  ---------------------------- */
  let audioCtx = null;
  function playTick() {
    try {
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
    } catch { /* ignore */ }
  }

  function glowPulse(sectionKey) {
    const map = {
      ortho: orthoGlow,
      neuro: neuroGlow,
      health: healthGlow
    };
    const el = map[sectionKey] || globalGlow;
    if (!el) return;

    el.animate([{ opacity: 0.35 }, { opacity: 1 }, { opacity: 0.35 }], {
      duration: 520,
      easing: "ease-in-out"
    });
  }

  /* ---------------------------
     Init
  ---------------------------- */
  function init() {
    renderAll();
    initNav();
    initResetButtons();

    syncHeaderHeight();
    window.addEventListener("resize", syncHeaderHeight);

    setTimeout(() => loader.setAttribute("aria-hidden", "true"), 450);

    checkSectionCompletion("ortho");
    checkSectionCompletion("neuro");
    checkSectionCompletion("health");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
