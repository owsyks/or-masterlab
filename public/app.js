// ============================================================================
// OR MASTERLAB 2.0 — INTERACTIVE EDTECH & AI WORKBENCH CONTROLLER (ENGLISH)
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // --------------------------------------------------------------------------
  // APPLICATION STATE
  // --------------------------------------------------------------------------
  let currentView = "dashboard";
  let activeChapterId = window.OR_CHAPTERS[0]?.id || "ch1";
  let activeChapterSubtab = "all"; // 'all' | 'theory' | 'example' | 'practice' | 'recipe'
  let masteredChapters = JSON.parse(localStorage.getItem("or_mastered_chapters") || '["ch1", "ch2"]');

  // Visual Simplex Builder State
  let simplexState = {
    type: "max",
    c: [3, 2],
    constraints: [
      { a: [1, 0], op: "<=", b: 4 },
      { a: [0, 2], op: "<=", b: 12 },
      { a: [3, 2], op: "<=", b: 18 },
    ],
  };
  let lastSimplexResult = null;
  let activeTableauStep = 0;
  let showAllTableaux = false;
  let activeSimplexResultTab = "tableaux"; // 'tableaux' | 'sensitivity' | 'dual'

  // Visual 2D Graph Builder State
  let graphState = {
    type: "max",
    c: [10, 16],
    constraints: [
      { a1: 1, a2: 2, op: "<=", b: 4 },
      { a1: 1, a2: 1, op: "<=", b: 3 },
    ],
  };
  let activeGraphResult = null;

  // Visual Knapsack Builder State
  let knapsackState = {
    capacity: 20,
    items: [
      { name: "x_1", profit: 45, weight: 9 },
      { name: "x_2", profit: 21, weight: 7 },
      { name: "x_3", profit: 23, weight: 8 },
      { name: "x_4", profit: 11, weight: 7 },
    ],
  };

  // Master-Detail Exercises State
  let activeExoSheet = "ALL";
  let activeExerciseId = "exam-ex1";

  // OCR & Chat State
  let uploadedImageDataUrl = null;
  let activeOcrMode = "upload";
  let chatHistory = [];
  let customRenewedExo = null;

  // --------------------------------------------------------------------------
  // MATH & MARKDOWN RENDERING ENGINE
  // --------------------------------------------------------------------------
  function renderMdMath(mdText) {
    if (!mdText) return "";
    const mathBlocks = [];
    let protectedText = String(mdText)
      .replace(/\$\$([\s\S]+?)\$\$/g, (_, expr) => {
        const id = mathBlocks.length;
        mathBlocks.push({ display: true, expr });
        return `@@MATH_BLOCK_${id}@@`;
      })
      .replace(/\$([^\$\n]+?)\$/g, (_, expr) => {
        const id = mathBlocks.length;
        mathBlocks.push({ display: false, expr });
        return `@@MATH_BLOCK_${id}@@`;
      });

    let html = window.marked ? window.marked.parse(protectedText) : protectedText;

    html = html.replace(/@@MATH_BLOCK_(\d+)@@/g, (_, idxStr) => {
      const item = mathBlocks[Number(idxStr)];
      if (!item) return "";
      if (window.katex) {
        try {
          return window.katex.renderToString(item.expr, {
            displayMode: item.display,
            throwOnError: false,
          });
        } catch (e) {
          return `<code>${item.expr}</code>`;
        }
      }
      return item.display ? `$$${item.expr}$$` : `$${item.expr}$`;
    });

    return html;
  }

  function typesetMath(el = document.body) {
    if (window.renderMathInElement && el) {
      try {
        window.renderMathInElement(el, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
          ],
          throwOnError: false,
        });
      } catch (e) {
        // Ignore minor parse errors
      }
    }
  }

  // --------------------------------------------------------------------------
  // THEME SWITCHER (DARK / LIGHT MODE)
  // --------------------------------------------------------------------------
  const btnThemeToggle = document.getElementById("btnThemeToggle");
  const savedTheme = localStorage.getItem("or_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  btnThemeToggle.textContent = savedTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";

  btnThemeToggle.addEventListener("click", () => {
    const curr = document.documentElement.getAttribute("data-theme") || "dark";
    const next = curr === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("or_theme", next);
    btnThemeToggle.textContent = next === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
    if (activeGraphResult) drawGraphicalCanvas();
  });

  // --------------------------------------------------------------------------
  // PROGRESS BAR & CHAPTER MASTERY
  // --------------------------------------------------------------------------
  function updateProgressUI() {
    const total = window.OR_CHAPTERS.length;
    const count = masteredChapters.length;
    const pct = Math.round((count / total) * 100);
    document.getElementById("progressPercentText").textContent = `${pct}%`;
    document.getElementById("progressBarFill").style.width = `${pct}%`;
    document.getElementById("progressSubText").textContent = `${count} / ${total} chapters mastered`;
  }
  updateProgressUI();

  function toggleChapterMastery(chId) {
    if (masteredChapters.includes(chId)) {
      masteredChapters = masteredChapters.filter((id) => id !== chId);
    } else {
      masteredChapters.push(chId);
    }
    localStorage.setItem("or_mastered_chapters", JSON.stringify(masteredChapters));
    updateProgressUI();
    renderChapterStrip();
    renderActiveChapter();
    renderDashboardRoadmap();
  }

  // --------------------------------------------------------------------------
  // VIEW NAVIGATION (SIDEBAR & QUICK LINKS)
  // --------------------------------------------------------------------------
  const VIEW_TITLES = {
    dashboard: "🏠 Dashboard & Exam Study Roadmap",
    chapters: "📖 Complete Course & Exam Recipes (Chapters 1 to 7)",
    solvers: "🧮 Visual Interactive Solvers Lab (Simplex, 2D Grapher, B&B)",
    exercises: "📚 Official TD Worksheets (1–4) & Final Exam Bank",
    renew: "🎲 AI Renew Exos — Infinite Exercise Generator",
    corrector: "📸 AI Corrector + Vision OCR Studio (Photo Scanner & Whiteboard)",
    teacher: "👨‍🏫 Prof. OR — Your 24/7 Operations Research AI Tutor",
  };

  function navigateToView(viewId) {
    currentView = viewId;
    document.querySelectorAll(".side-link").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === viewId);
    });
    document.querySelectorAll(".view-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `view-${viewId}`);
    });
    document.getElementById("stageBreadcrumb").textContent = VIEW_TITLES[viewId] || "OR MasterLab";
    document.getElementById("appSidebar").classList.remove("open");

    if (viewId === "solvers") {
      setTimeout(() => drawGraphicalCanvas(), 60);
    }
    typesetMath();
  }

  document.querySelectorAll(".side-link").forEach((btn) => {
    btn.addEventListener("click", () => navigateToView(btn.dataset.view));
  });

  document.querySelectorAll("[data-goto]").forEach((el) => {
    el.addEventListener("click", () => navigateToView(el.dataset.goto));
  });

  document.getElementById("btnMobileMenu").addEventListener("click", () => {
    document.getElementById("appSidebar").classList.toggle("open");
  });

  document.getElementById("btnQuickJumpExam").addEventListener("click", () => {
    activeExoSheet = "EXAM";
    activeExerciseId = "exam-ex1";
    navigateToView("exercises");
    renderExercisesListNav();
    renderExerciseDetailStage();
  });

  // --------------------------------------------------------------------------
  // SLIDE-OVER AI TUTOR DRAWER (RESIZABLE & EXPANDABLE)
  // --------------------------------------------------------------------------
  const aiSlideDrawer = document.getElementById("aiSlideDrawer");
  const drawerResizer = document.getElementById("drawerResizer");
  const drawerSizePills = document.querySelectorAll("#drawerSizePills .btn-drawer-size");

  const DRAWER_MIN_WIDTH = 320;
  const DRAWER_DEFAULT_WIDTH = 500;

  function getMaxDrawerWidth() {
    const screenW = typeof window !== "undefined" && window.innerWidth ? window.innerWidth : 1280;
    return Math.max(DRAWER_MIN_WIDTH, Math.min(Math.round(screenW * 0.88), 1100));
  }

  function setDrawerWidth(widthPx, updateActivePill = true) {
    if (!aiSlideDrawer) return;
    const maxW = getMaxDrawerWidth();
    const clampedW = Math.max(DRAWER_MIN_WIDTH, Math.min(widthPx, maxW));
    aiSlideDrawer.style.width = `${clampedW}px`;
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("or_drawer_width", clampedW);
      }
    } catch (_) {}

    if (updateActivePill && drawerSizePills && drawerSizePills.length > 0) {
      drawerSizePills.forEach((btn) => {
        const sz = btn.dataset?.size;
        if (sz === "max") {
          btn.classList.toggle("active", clampedW >= maxW - 35);
        } else {
          const targetW = Number(sz);
          btn.classList.toggle("active", Math.abs(clampedW - targetW) < 45);
        }
      });
    }
  }

  // Restore saved width or default to 500px
  let initialDrawerWidth = DRAWER_DEFAULT_WIDTH;
  try {
    if (typeof localStorage !== "undefined") {
      const saved = Number(localStorage.getItem("or_drawer_width"));
      if (saved && saved >= DRAWER_MIN_WIDTH && saved <= 1200) {
        initialDrawerWidth = saved;
      }
    }
  } catch (_) {}
  setDrawerWidth(initialDrawerWidth);

  document.getElementById("btnToggleAiDrawer")?.addEventListener("click", () => {
    aiSlideDrawer.classList.toggle("hidden");
  });
  document.getElementById("btnCloseAiDrawer")?.addEventListener("click", () => {
    aiSlideDrawer.classList.add("hidden");
  });

  // Size Preset Buttons (S = 360px, M = 520px, L = 760px, Max = 88vw)
  let preMaximizedWidth = initialDrawerWidth;
  drawerSizePills.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const sz = btn.dataset.size;
      const curW = aiSlideDrawer.getBoundingClientRect ? aiSlideDrawer.getBoundingClientRect().width : 500;
      const maxW = getMaxDrawerWidth();

      if (sz === "max") {
        if (curW >= maxW - 40) {
          setDrawerWidth(preMaximizedWidth && preMaximizedWidth < maxW - 60 ? preMaximizedWidth : 520);
        } else {
          preMaximizedWidth = curW;
          setDrawerWidth(maxW);
        }
      } else {
        const targetW = Number(sz);
        preMaximizedWidth = targetW;
        setDrawerWidth(targetW);
      }
    });
  });

  // Drag-to-Resize Handle on Left Border
  if (drawerResizer && aiSlideDrawer) {
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    const startResize = (clientX) => {
      isResizing = true;
      startX = clientX;
      startWidth = aiSlideDrawer.getBoundingClientRect ? aiSlideDrawer.getBoundingClientRect().width : 500;
      aiSlideDrawer.classList.add("is-resizing");
      document.body?.classList.add("drawer-resizing-active");
    };

    const doResize = (clientX) => {
      if (!isResizing) return;
      const deltaX = startX - clientX; // dragging left increases drawer width
      const newWidth = startWidth + deltaX;
      setDrawerWidth(newWidth);
    };

    const stopResize = () => {
      if (!isResizing) return;
      isResizing = false;
      aiSlideDrawer.classList.remove("is-resizing");
      document.body?.classList.remove("drawer-resizing-active");
    };

    drawerResizer.addEventListener("mousedown", (e) => {
      e.preventDefault();
      startResize(e.clientX);
    });

    window.addEventListener("mousemove", (e) => {
      if (isResizing) {
        e.preventDefault();
        doResize(e.clientX);
      }
    });

    window.addEventListener("mouseup", stopResize);

    // Touch support for tablets / touch screens
    drawerResizer.addEventListener("touchstart", (e) => {
      if (e.touches?.[0]) {
        startResize(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener("touchmove", (e) => {
      if (isResizing && e.touches?.[0]) {
        doResize(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener("touchend", stopResize);

    // Double-click resizer to toggle Compact (360) and Wide (760)
    drawerResizer.addEventListener("dblclick", () => {
      const curW = aiSlideDrawer.getBoundingClientRect ? aiSlideDrawer.getBoundingClientRect().width : 500;
      if (curW > 540) {
        setDrawerWidth(360);
      } else {
        setDrawerWidth(760);
      }
    });
  }

  // --------------------------------------------------------------------------
  // VIEW 0: DASHBOARD ROADMAP
  // --------------------------------------------------------------------------
  function renderDashboardRoadmap() {
    const grid = document.getElementById("dashboardRoadmapGrid");
    if (!grid) return;
    grid.innerHTML = window.OR_CHAPTERS.map((ch) => {
      const isMastered = masteredChapters.includes(ch.id);
      return `
        <div class="roadmap-card" data-chjump="${ch.id}">
          <div class="flex-between">
            <span class="badge ${isMastered ? "badge-emerald" : "badge-blue"}">
              ${isMastered ? "✅ Mastered" : ch.number}
            </span>
            <span class="small muted">${ch.examPriority.split("(")[0]}</span>
          </div>
          <h3>${ch.title}</h3>
          <p class="small muted">${ch.subtitle}</p>
          <div class="fc-cta">Study Chapter →</div>
        </div>
      `;
    }).join("");

    grid.querySelectorAll("[data-chjump]").forEach((card) => {
      card.addEventListener("click", () => {
        activeChapterId = card.dataset.chjump;
        navigateToView("chapters");
        renderChapterStrip();
        renderActiveChapter();
      });
    });
  }
  renderDashboardRoadmap();

  // --------------------------------------------------------------------------
  // VIEW 1: CHAPTERS & SUB-TABS
  // --------------------------------------------------------------------------
  const chapterStrip = document.getElementById("chapterStrip");
  const chapterStageContainer = document.getElementById("chapterStageContainer");

  function renderChapterStrip() {
    chapterStrip.innerHTML = window.OR_CHAPTERS.map((ch) => {
      const isMastered = masteredChapters.includes(ch.id);
      const isActive = ch.id === activeChapterId;
      return `
        <button class="ch-pill-btn ${isActive ? "active" : ""} ${isMastered ? "mastered" : ""}" data-chid="${ch.id}">
          <span class="ch-check">${isMastered ? "✅" : "📖"}</span>
          <span>${ch.number}: ${ch.title.split("&")[0]}</span>
        </button>
      `;
    }).join("");

    chapterStrip.querySelectorAll(".ch-pill-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeChapterId = btn.dataset.chid;
        renderChapterStrip();
        renderActiveChapter();
      });
    });
  }

  function renderActiveChapter() {
    const chIdx = window.OR_CHAPTERS.findIndex((c) => c.id === activeChapterId);
    const ch = window.OR_CHAPTERS[chIdx >= 0 ? chIdx : 0];
    if (!ch) return;
    const prevCh = chIdx > 0 ? window.OR_CHAPTERS[chIdx - 1] : null;
    const nextCh = chIdx < window.OR_CHAPTERS.length - 1 ? window.OR_CHAPTERS[chIdx + 1] : null;
    const isMastered = masteredChapters.includes(ch.id);
    const badgeClass = ch.examBadgeColor === "amber" ? "badge-amber" : "badge-emerald";

    const lessonsList = ch.lessons || [];
    const examplesList = ch.workedExamples || (ch.workedExample ? [ch.workedExample] : []);
    const practiceList = ch.practiceProblems || [];

    const showTheory = activeChapterSubtab === "all" || activeChapterSubtab === "theory";
    const showExamples = activeChapterSubtab === "all" || activeChapterSubtab === "example";
    const showPractice = activeChapterSubtab === "all" || activeChapterSubtab === "practice";
    const showRecipe = activeChapterSubtab === "all" || activeChapterSubtab === "recipe";

    chapterStageContainer.innerHTML = `
      <div class="chapter-header-card">
        <div class="flex-between">
          <div class="action-bar">
            <span class="badge ${badgeClass}">🎯 ${ch.examPriority}</span>
            <button class="btn ${isMastered ? "btn-emerald" : "btn-ghost"} btn-sm" id="btnToggleMastery">
              ${isMastered ? "✅ Chapter Mastered (Click to undo)" : "☐ Mark Chapter as Mastered"}
            </button>
          </div>
          <div class="action-bar">
            ${
              ch.interactivePreset
                ? `<button class="btn btn-primary btn-sm" id="btnOpenChapterSolver">
                     🧮 ${ch.interactivePreset.label}
                   </button>`
                : ""
            }
            <button class="btn btn-secondary btn-sm" id="btnAskChapterAi">
              👨‍🏫 Ask Prof. OR About This Chapter
            </button>
          </div>
        </div>

        <h1 class="mt-05">${ch.number} — ${ch.title}</h1>
        <p class="muted">${ch.subtitle}</p>

        <div class="chapter-subtabs">
          <button class="ch-subtab ${activeChapterSubtab === "all" ? "active" : ""}" data-subtab="all">
            📖 Full Interactive Textbook (All-in-One)
          </button>
          <button class="ch-subtab ${activeChapterSubtab === "theory" ? "active" : ""}" data-subtab="theory">
            💡 1. Step-by-Step Course Lessons (${lessonsList.length})
          </button>
          <button class="ch-subtab ${activeChapterSubtab === "example" ? "active" : ""}" data-subtab="example">
            ✏️ 2. Worked Examples (${examplesList.length} Full Walkthroughs)
          </button>
          <button class="ch-subtab ${activeChapterSubtab === "practice" ? "active" : ""}" data-subtab="practice">
            🎯 3. "Your Turn" Practice (${practiceList.length})
          </button>
          <button class="ch-subtab ${activeChapterSubtab === "recipe" ? "active" : ""}" data-subtab="recipe">
            🛠️ 4. Exam Recipe &amp; Traps
          </button>
        </div>
      </div>

      <!-- SUB-VIEW 1: ANALOGY & STEP-BY-STEP LESSONS -->
      <div class="ch-subview ${showTheory ? "active" : ""}" id="chsub-theory">
        <div class="analogy-box">
          <h3>${renderMdMath(ch.analogy.title)}</h3>
          <div class="markdown-body mt-05">${renderMdMath(ch.analogy.text)}</div>
        </div>

        ${
          lessonsList.length > 0
            ? `
          <div class="card mt-1">
            <div class="flex-between">
              <h2>📚 Step-by-Step Course Lessons (Zero to Hero)</h2>
              <span class="badge badge-blue">${lessonsList.length} Progressive Lessons</span>
            </div>
            <p class="small muted mt-025">Read each lesson slowly in order. Every symbol, formula, and rule is explained from scratch with concrete numbers.</p>
            <div class="lesson-toc-bar mt-05">
              ${lessonsList
                .map(
                  (les, idx) => `
                <a href="#lesson-card-${idx}" class="lesson-toc-pill">
                  📌 ${les.title.split("—")[0].trim()}
                </a>
              `
                )
                .join("")}
            </div>
          </div>

          ${lessonsList
            .map(
              (les, idx) => `
            <div class="card lesson-detail-card mt-1" id="lesson-card-${idx}">
              <div class="flex-between">
                <span class="badge badge-emerald">Lesson ${idx + 1} of ${lessonsList.length}</span>
                <button class="btn btn-ghost btn-sm btn-ask-lesson" data-lessontitle="${les.title.replace(/"/g, "&quot;")}">
                  👨‍🏫 Ask Prof. OR to Explain This Lesson Simpler
                </button>
              </div>
              <h2 class="mt-05">${renderMdMath(les.title)}</h2>
              <div class="markdown-body mt-05">${renderMdMath(les.content)}</div>
            </div>
          `
            )
            .join("")}
        `
            : ""
        }

        <div class="card mt-1">
          <h2>📌 Quick Reference Formulas &amp; Cheat-Sheet Summary</h2>
          <div class="markdown-body mt-05">${renderMdMath(ch.theory)}</div>
        </div>
      </div>

      <!-- SUB-VIEW 2: MULTIPLE FULL STEP-BY-STEP WORKED EXAMPLES -->
      <div class="ch-subview ${showExamples ? "active" : ""}" id="chsub-example">
        <div class="card mt-1">
          <div class="flex-between">
            <div>
              <h2>✏️ Complete Step-by-Step Worked Examples (${examplesList.length} Progressive Levels)</h2>
              <p class="small muted mt-025">Every single calculation, equation system, intermediate Simplex tableau, and row operation is written out line by line without skipping steps.</p>
            </div>
            ${
              ch.interactivePreset
                ? `<button class="btn btn-emerald btn-sm" id="btnOpenChapterSolver2">
                     🚀 Simulate Live in Interactive Solver
                   </button>`
                : ""
            }
          </div>
          <div class="lesson-toc-bar mt-05">
            ${examplesList
              .map(
                (ex, idx) => `
              <a href="#worked-ex-card-${idx}" class="lesson-toc-pill">
                ✏️ Example ${idx + 1}: ${ex.badge || ex.title.split(":")[0]}
              </a>
            `
              )
              .join("")}
          </div>
        </div>

        ${examplesList
          .map(
            (ex, idx) => `
          <div class="card worked-example-card mt-1" id="worked-ex-card-${idx}">
            <div class="flex-between">
              <span class="badge ${idx === 0 ? "badge-emerald" : idx === 1 ? "badge-blue" : "badge-amber"}">
                ${ex.badge || `Worked Example ${idx + 1}`}
              </span>
              <div class="action-bar">
                <button class="btn btn-ghost btn-sm btn-ask-example" data-extitle="${ex.title.replace(/"/g, "&quot;")}">
                  👨‍🏫 Ask Prof. OR About a Step Here
                </button>
              </div>
            </div>
            <h2 class="mt-05">${renderMdMath(ex.title)}</h2>

            <div class="step-card mt-05">
              <h4>📋 Problem Statement:</h4>
              <div class="markdown-body mt-025">${renderMdMath(ex.problem)}</div>
            </div>

            <div class="exo-solution-drawer mt-075">
              <h4>✅ Complete Step-by-Step Walkthrough (Zero Skipped Steps):</h4>
              <div class="markdown-body mt-05">${renderMdMath(ex.solution)}</div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>

      <!-- SUB-VIEW 3: "YOUR TURN" INTERACTIVE PRACTICE CHECKPOINTS -->
      <div class="ch-subview ${showPractice ? "active" : ""}" id="chsub-practice">
        <div class="card mt-1">
          <div class="flex-between">
            <div>
              <h2>🎯 "Your Turn" — Self-Check Practice Problems</h2>
              <p class="small muted mt-025">Grab a sheet of paper and try solving these checkpoints yourself before clicking to reveal the step-by-step solution!</p>
            </div>
            <span class="badge badge-amber">${practiceList.length} Practice Checkpoints</span>
          </div>

          <div class="mt-075">
            ${practiceList
              .map(
                (p, idx) => `
              <div class="step-card mt-075">
                <div class="flex-between">
                  <h4>📝 ${renderMdMath(p.title)}</h4>
                  <div class="action-bar">
                    <button class="btn btn-primary btn-sm btn-toggle-practice-sol" data-pidx="${idx}">
                      👁️ Show Step-by-Step Solution
                    </button>
                    <button class="btn btn-ghost btn-sm btn-ask-practice" data-ptitle="${p.title.replace(/"/g, "&quot;")}">
                      👨‍🏫 Ask Prof. OR for a Hint
                    </button>
                  </div>
                </div>
                <div class="markdown-body mt-05">${renderMdMath(p.question)}</div>
                <div class="exo-solution-drawer mt-075 hidden" id="practice-sol-${idx}">
                  <h4>✅ Complete Step-by-Step Solution:</h4>
                  <div class="markdown-body mt-05">${renderMdMath(p.solution)}</div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>

      <!-- SUB-VIEW 4: EXAM RECIPE & COMMON TRAPS -->
      <div class="ch-subview ${showRecipe ? "active" : ""}" id="chsub-recipe">
        <div class="card mt-1">
          <h2>🛠️ Step-by-Step "How-To" Recipe for Exam Day</h2>
          <div class="mt-05">
            ${ch.howToSteps
              .map(
                (s) => `
              <div class="step-card">
                <h4>${renderMdMath(s.step)}</h4>
                <div class="markdown-body mt-025">${renderMdMath(s.detail)}</div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="card mt-1">
          <h2>⚠️ Common Exam Traps to Avoid</h2>
          <div class="mt-05">
            ${ch.traps.map((t) => `<div class="trap-item">${renderMdMath(t)}</div>`).join("")}
          </div>
        </div>
      </div>

      <!-- CHAPTER FOOTER: MASTERY & NEXT/PREV CHAPTER NAVIGATION -->
      <div class="card mt-1 chapter-footer-nav">
        <div class="flex-between">
          <div>
            ${
              prevCh
                ? `<button class="btn btn-ghost btn-sm" id="btnPrevChapter">
                     ← Previous: ${prevCh.number} (${prevCh.title.split("&")[0].trim()})
                   </button>`
                : `<span class="small muted">Start of Course</span>`
            }
          </div>
          <div class="action-bar">
            <button class="btn ${isMastered ? "btn-emerald" : "btn-secondary"} btn-sm" id="btnToggleMasteryBottom">
              ${isMastered ? "✅ Chapter Mastered!" : "☑️ Mark Chapter as Mastered"}
            </button>
            ${
              nextCh
                ? `<button class="btn btn-primary btn-sm" id="btnNextChapter">
                     Next Chapter: ${nextCh.number} (${nextCh.title.split("&")[0].trim()}) →
                   </button>`
                : `<button class="btn btn-emerald btn-sm" id="btnGoToExamFromLastCh">
                     🎓 Ready! Practice on Official TDs &amp; Final Exam →
                   </button>`
            }
          </div>
        </div>
      </div>
    `;

    document.getElementById("btnToggleMastery")?.addEventListener("click", () => {
      toggleChapterMastery(ch.id);
    });
    document.getElementById("btnToggleMasteryBottom")?.addEventListener("click", () => {
      toggleChapterMastery(ch.id);
    });

    document.getElementById("btnPrevChapter")?.addEventListener("click", () => {
      if (prevCh) {
        activeChapterId = prevCh.id;
        renderChapterStrip();
        renderActiveChapter();
        document.getElementById("mainStage")?.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    document.getElementById("btnNextChapter")?.addEventListener("click", () => {
      if (nextCh) {
        activeChapterId = nextCh.id;
        renderChapterStrip();
        renderActiveChapter();
        document.getElementById("mainStage")?.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    document.getElementById("btnGoToExamFromLastCh")?.addEventListener("click", () => {
      activeExoSheet = "EXAM";
      activeExerciseId = "exam-ex1";
      navigateToView("exercises");
      renderExercisesListNav();
      renderExerciseDetailStage();
    });

    chapterStageContainer.querySelectorAll(".ch-subtab").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeChapterSubtab = btn.dataset.subtab;
        renderActiveChapter();
      });
    });

    chapterStageContainer.querySelectorAll(".btn-toggle-practice-sol").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = btn.dataset.pidx;
        const drawer = document.getElementById(`practice-sol-${idx}`);
        if (drawer) {
          const isHidden = drawer.classList.toggle("hidden");
          btn.textContent = isHidden ? "👁️ Show Step-by-Step Solution" : "🙈 Hide Solution";
        }
      });
    });

    chapterStageContainer.querySelectorAll(".btn-ask-lesson").forEach((btn) => {
      btn.addEventListener("click", () => {
        aiSlideDrawer.classList.remove("hidden");
        const input = document.getElementById("drawerChatInput");
        input.value = `In ${ch.number}, please explain "${btn.dataset.lessontitle}" even more slowly with a simple concrete example.`;
        input.focus();
      });
    });

    chapterStageContainer.querySelectorAll(".btn-ask-example").forEach((btn) => {
      btn.addEventListener("click", () => {
        aiSlideDrawer.classList.remove("hidden");
        const input = document.getElementById("drawerChatInput");
        input.value = `In ${ch.number} (${btn.dataset.extitle}), can you explain how the calculations and row operations work step by step?`;
        input.focus();
      });
    });

    chapterStageContainer.querySelectorAll(".btn-ask-practice").forEach((btn) => {
      btn.addEventListener("click", () => {
        aiSlideDrawer.classList.remove("hidden");
        const input = document.getElementById("drawerChatInput");
        input.value = `Give me a step-by-step hint to start solving "${btn.dataset.ptitle}" in ${ch.number} without spoiling the final answer.`;
        input.focus();
      });
    });

    const bindSolver = (id) => {
      const b = document.getElementById(id);
      if (b && ch.interactivePreset) {
        b.addEventListener("click", () => {
          loadPresetIntoSolver(ch.interactivePreset.solverType, ch.interactivePreset.data);
        });
      }
    };
    bindSolver("btnOpenChapterSolver");
    bindSolver("btnOpenChapterSolver2");

    document.getElementById("btnAskChapterAi").addEventListener("click", () => {
      aiSlideDrawer.classList.remove("hidden");
      const input = document.getElementById("drawerChatInput");
      input.value = `Summarize the most important exam concepts of ${ch.number} (${ch.title}).`;
      input.focus();
    });

    typesetMath(chapterStageContainer);
  }

  renderChapterStrip();
  renderActiveChapter();

  // --------------------------------------------------------------------------
  // VIEW 2: VISUAL INTERACTIVE SOLVERS
  // --------------------------------------------------------------------------
  const solverSegBtns = document.querySelectorAll("#view-solvers .seg-btn");
  const solverPanes = document.querySelectorAll(".solver-pane");

  function switchSolverPane(solverType) {
    solverSegBtns.forEach((b) => b.classList.toggle("active", b.dataset.solver === solverType));
    solverPanes.forEach((p) => p.classList.toggle("active", p.id === `solver-${solverType}`));
    if (solverType === "graphical") {
      setTimeout(() => runGraphicalSolver(), 50);
    }
    typesetMath();
  }

  solverSegBtns.forEach((btn) => {
    btn.addEventListener("click", () => switchSolverPane(btn.dataset.solver));
  });

  function loadPresetIntoSolver(solverType, data) {
    if (!data) return;
    const normSolver = solverType === "bb" ? "knapsack" : solverType;
    navigateToView("solvers");
    switchSolverPane(normSolver);

    const normalizedConstraints = Array.isArray(data.constraints)
      ? data.constraints.map((con) => ({
          a: Array.isArray(con.a) ? [...con.a] : [Number(con.a1 ?? 0), Number(con.a2 ?? 0)],
          a1: Number(con.a1 ?? con.a?.[0] ?? 0),
          a2: Number(con.a2 ?? con.a?.[1] ?? 0),
          op: con.op || "<=",
          b: Number(con.b),
        }))
      : Array.isArray(data.A) && Array.isArray(data.b)
      ? data.A.map((row, idx) => ({
          a: row.map(Number),
          a1: Number(row[0] ?? 0),
          a2: Number(row[1] ?? 0),
          op: data.signs?.[idx] || "<=",
          b: Number(data.b[idx]),
        }))
      : [];

    if (normSolver === "simplex") {
      simplexState = {
        type: data.type || data.optType || "max",
        c: (data.c || [3, 2]).map(Number),
        constraints: normalizedConstraints.map((con) => ({
          a: [...con.a],
          op: con.op || "<=",
          b: Number(con.b),
        })),
      };
      renderSimplexVisualBuilder();
      runSimplexSolver();
    } else if (normSolver === "graphical") {
      graphState = {
        type: data.type || data.optType || "max",
        c: [Number(data.c?.[0] ?? 3), Number(data.c?.[1] ?? 2)],
        constraints: normalizedConstraints.map((con) => ({
          a1: Number(con.a1),
          a2: Number(con.a2),
          op: con.op || "<=",
          b: Number(con.b),
        })),
      };
      renderGraphVisualBuilder();
      runGraphicalSolver();
    } else if (normSolver === "knapsack") {
      const cap = Number(data.capacity ?? data.W ?? 15);
      const items = Array.isArray(data.items)
        ? data.items.map((it) => ({ ...it }))
        : Array.isArray(data.c) && Array.isArray(data.w)
        ? data.c.map((p, idx) => ({
            name: `x_${idx + 1}`,
            profit: Number(p),
            weight: Number(data.w[idx]),
          }))
        : [];
      knapsackState = {
        capacity: cap,
        items,
      };
      renderKnapsackVisualBuilder();
      runKnapsackSolver();
    }
  }

  // --- 2A: VISUAL SIMPLEX BUILDER & STEP-BY-STEP PLAYER ---
  function renderSimplexVisualBuilder() {
    document.getElementById("simplexObjType").value = simplexState.type;
    const nVars = simplexState.c.length;
    document.getElementById("varCountDisplay").textContent = `${nVars} variables`;

    const objWrap = document.getElementById("visualObjInputs");
    objWrap.innerHTML = simplexState.c
      .map(
        (coeff, j) => `
      <input type="number" class="coeff-input obj-coeff-box" data-j="${j}" value="${coeff}" step="any" />
      <span class="math-var">x<sub>${j + 1}</sub>${j < nVars - 1 ? " +" : ""}</span>
    `
      )
      .join("");

    objWrap.querySelectorAll(".obj-coeff-box").forEach((inp) => {
      inp.addEventListener("input", () => {
        simplexState.c[Number(inp.dataset.j)] = Number(inp.value) || 0;
      });
    });

    const conList = document.getElementById("visualConstraintsList");
    conList.innerHTML = simplexState.constraints
      .map((con, i) => {
        const terms = simplexState.c
          .map(
            (_, j) => `
          <input type="number" class="coeff-input con-coeff-box" data-i="${i}" data-j="${j}" value="${
              con.a[j] ?? 0
            }" step="any" />
          <span class="math-var">x<sub>${j + 1}</sub>${j < nVars - 1 ? " +" : ""}</span>
        `
          )
          .join("");

        return `
        <div class="constraint-row-item">
          <span class="badge badge-blue">C${i + 1}</span>
          ${terms}
          <select class="select-modern w-auto con-op-box" data-i="${i}">
            <option value="<=" ${con.op === "<=" ? "selected" : ""}>≤</option>
            <option value=">=" ${con.op === ">=" ? "selected" : ""}>≥</option>
            <option value="=" ${con.op === "=" ? "selected" : ""}>=</option>
          </select>
          <input type="number" class="coeff-input con-rhs-box" data-i="${i}" value="${con.b}" step="any" />
          <button class="btn-remove-row" data-remove="${i}" title="Remove constraint">✖</button>
        </div>
      `;
      })
      .join("");

    conList.querySelectorAll(".con-coeff-box").forEach((inp) => {
      inp.addEventListener("input", () => {
        const i = Number(inp.dataset.i);
        const j = Number(inp.dataset.j);
        simplexState.constraints[i].a[j] = Number(inp.value) || 0;
      });
    });
    conList.querySelectorAll(".con-op-box").forEach((sel) => {
      sel.addEventListener("change", () => {
        simplexState.constraints[Number(sel.dataset.i)].op = sel.value;
      });
    });
    conList.querySelectorAll(".con-rhs-box").forEach((inp) => {
      inp.addEventListener("input", () => {
        simplexState.constraints[Number(inp.dataset.i)].b = Number(inp.value) || 0;
      });
    });
    conList.querySelectorAll(".btn-remove-row").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (simplexState.constraints.length <= 1) return;
        simplexState.constraints.splice(Number(btn.dataset.remove), 1);
        renderSimplexVisualBuilder();
      });
    });
  }

  document.getElementById("simplexObjType").addEventListener("change", (e) => {
    simplexState.type = e.target.value;
  });

  document.getElementById("btnAddVar").addEventListener("click", () => {
    if (simplexState.c.length >= 6) return;
    simplexState.c.push(1);
    simplexState.constraints.forEach((con) => con.a.push(0));
    renderSimplexVisualBuilder();
  });

  document.getElementById("btnRemoveVar").addEventListener("click", () => {
    if (simplexState.c.length <= 2) return;
    simplexState.c.pop();
    simplexState.constraints.forEach((con) => con.a.pop());
    renderSimplexVisualBuilder();
  });

  document.getElementById("btnAddConstraint").addEventListener("click", () => {
    simplexState.constraints.push({
      a: new Array(simplexState.c.length).fill(1),
      op: "<=",
      b: 10,
    });
    renderSimplexVisualBuilder();
  });

  const SIMPLEX_PRESETS = {
    exam1: {
      type: "max",
      c: [3, 2],
      constraints: [
        { a: [1, 0], op: "<=", b: 4 },
        { a: [0, 2], op: "<=", b: 12 },
        { a: [3, 2], op: "<=", b: 18 },
      ],
    },
    td2ex5: {
      type: "max",
      c: [1000, 1200],
      constraints: [
        { a: [10, 5], op: "<=", b: 200 },
        { a: [2, 3], op: "<=", b: 60 },
        { a: [1, 0], op: "<=", b: 18 },
        { a: [0, 1], op: "<=", b: 20 },
      ],
    },
    td2ex6: {
      type: "max",
      c: [2, 5],
      constraints: [
        { a: [2, 1], op: ">=", b: 6 },
        { a: [1, 1], op: "<=", b: 8 },
        { a: [0, 1], op: "<=", b: 2 },
      ],
    },
    td2ex4: {
      type: "max",
      c: [2, 1, 1, 3],
      constraints: [
        { a: [1, 1, 2, 3], op: "<=", b: 6 },
        { a: [0, 2, 3, 2], op: "<=", b: 4 },
        { a: [2, 1, 2, 1], op: "<=", b: 6 },
      ],
    },
    td3ex3: {
      type: "max",
      c: [7, 9],
      constraints: [
        { a: [1, 1], op: "<=", b: 8 },
        { a: [1, 0], op: "<=", b: 4 },
        { a: [2, 3], op: "<=", b: 19 },
      ],
    },
    td2ex8: {
      type: "max",
      c: [18, 36, 16],
      constraints: [
        { a: [3, 9, 2], op: "<=", b: 5100 },
        { a: [4, 3, 5], op: "<=", b: 5700 },
        { a: [3, 6, 3], op: "<=", b: 4500 },
      ],
    },
  };

  document.getElementById("simplexPresetSelect").addEventListener("change", (e) => {
    const p = SIMPLEX_PRESETS[e.target.value];
    if (p) loadPresetIntoSolver("simplex", p);
  });

  function runSimplexSolver() {
    lastSimplexResult = window.ORSolvers.solveSimplex(simplexState);
    activeTableauStep = 0;
    renderSimplexResultsView();
  }

  function buildSingleTableauCard(res, tab, idx) {
    const toFrac = res.toFrac;
    const isLast = idx === res.tableaux.length - 1;
    const enterName = tab.enterCol !== -1 ? `$${res.varNames[tab.enterCol]}$` : "None";
    const leaveName = tab.leaveRow !== -1 ? `$${res.varNames[tab.basis[tab.leaveRow]]}$` : "None";

    const headerCols = res.varNames.map((v) => `<th>$${v}$</th>`).join("");

    const bodyRows = tab.A.map((row, rIdx) => {
      const isPivotRow = rIdx === tab.leaveRow;
      const bVarName = res.varNames[tab.basis[rIdx]];
      const cells = row
        .map((val, cIdx) => {
          const isPivotCol = cIdx === tab.enterCol;
          const isPivotCell = isPivotRow && isPivotCol;
          const cls = isPivotCell ? "pivot-cell" : isPivotCol ? "pivot-col" : "";
          return `<td class="${cls}">${toFrac(val)}</td>`;
        })
        .join("");

      const ratioStr =
        tab.enterCol !== -1
          ? tab.ratios[rIdx] !== null
            ? `${toFrac(tab.b[rIdx])} / ${toFrac(row[tab.enterCol])} = <strong>${toFrac(tab.ratios[rIdx])}</strong>`
            : "<span class='muted'>— (≤ 0)</span>"
          : "—";

      return `
        <tr class="${isPivotRow ? "pivot-row" : ""}">
          <td><strong>$${bVarName}$</strong> ${isPivotRow ? "⬅️" : ""}</td>
          ${cells}
          <td><strong>${toFrac(tab.b[rIdx])}</strong></td>
          <td>${ratioStr}</td>
        </tr>
      `;
    }).join("");

    const rcCells = tab.cj_zj_num
      .map((val, cIdx) => {
        const mCoeff = tab.cj_zj_M[cIdx];
        let label = toFrac(val);
        if (Math.abs(mCoeff) > 1e-7) {
          const mStr =
            Math.abs(mCoeff - 1) < 1e-6
              ? "+ M"
              : Math.abs(mCoeff + 1) < 1e-6
              ? "- M"
              : `${mCoeff > 0 ? "+" : ""}${toFrac(mCoeff)}M`;
          label = Math.abs(val) < 1e-7 ? mStr.replace(/^\+\s*/, "") : `${toFrac(val)} ${mStr}`;
        }
        const isEnter = cIdx === tab.enterCol;
        return `<td class="${isEnter ? "pivot-col" : ""}">${label} ${isEnter ? "⬆️" : ""}</td>`;
      })
      .join("");

    let zDisplay = toFrac(tab.zVal_num);
    if (Math.abs(tab.zVal_M) > 1e-7) {
      zDisplay += ` ${tab.zVal_M > 0 ? "+" : "-"} ${toFrac(Math.abs(tab.zVal_M))}M`;
    }

    return `
      <div class="card mt-1">
        <div class="flex-between">
          <h3>📋 Tableau ${idx} ${idx === 0 ? "(Initial)" : isLast ? "(Final Optimal Tableau)" : ""}</h3>
          <div class="action-bar">
            ${
              !isLast && tab.enterCol !== -1 && tab.leaveRow !== -1
                ? `<span class="badge badge-blue">⬆️ Entering: ${enterName}</span>
                   <span class="badge badge-amber">⬅️ Leaving: ${leaveName}</span>
                   <span class="badge badge-emerald">🎯 Pivot = ${toFrac(tab.pivotElem)}</span>`
                : `<span class="badge badge-emerald">🏆 Optimal: all $(c_j - z_j) \\le 0$</span>`
            }
          </div>
        </div>

        <div class="tableau-wrapper mt-05">
          <table class="simplex-table">
            <thead>
              <tr>
                <th>Basis (BV)</th>
                ${headerCols}
                <th>$b_i$ (RHS)</th>
                <th>Ratio ($b_i / a_{ie}$)</th>
              </tr>
            </thead>
            <tbody>
              ${bodyRows}
              <tr class="z-row">
                <td><strong>$c_j - z_j$</strong></td>
                ${rcCells}
                <td><strong>$Z = ${zDisplay}$</strong></td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>

        ${
          tab.rowOps.length > 0
            ? `<div class="step-card mt-05">
                 <h4>🔄 Gauss-Jordan Row Operations to Reach Tableau ${idx + 1}:</h4>
                 <div class="mono small mt-025">${tab.rowOps.join(" &nbsp; • &nbsp; ")}</div>
               </div>`
            : ""
        }
      </div>
    `;
  }

  function renderSimplexResultsView() {
    const res = lastSimplexResult;
    if (!res) return;
    const container = document.getElementById("simplexOutputArea");
    const toFrac = res.toFrac;
    const totalSteps = res.tableaux.length;

    const statusBadge =
      res.status === "optimal"
        ? `<span class="badge badge-emerald">✅ Optimal Reached (${totalSteps - 1} pivots)</span>`
        : res.status === "unbounded"
        ? `<span class="badge badge-amber">🚀 Unbounded (Z → ∞)</span>`
        : `<span class="badge badge-rose">❌ Infeasible (Empty Feasible Region)</span>`;

    const decisionSolStr = Object.entries(res.solution)
      .map(([k, v]) => `$${k}^* = \\mathbf{${toFrac(v)}}$`)
      .join(", &nbsp; ");

    let subContentHtml = "";

    if (activeSimplexResultTab === "tableaux") {
      const playerHtml = `
        <div class="player-bar mt-1">
          <div class="player-controls">
            <button class="btn btn-ghost btn-sm" id="btnStepFirst" ${activeTableauStep === 0 ? "disabled" : ""}>⏮ Start</button>
            <button class="btn btn-secondary btn-sm" id="btnStepPrev" ${activeTableauStep === 0 ? "disabled" : ""}>◀ Prev</button>
            <span class="player-step-indicator">Tableau ${activeTableauStep} / ${totalSteps - 1}</span>
            <button class="btn btn-secondary btn-sm" id="btnStepNext" ${
              activeTableauStep >= totalSteps - 1 ? "disabled" : ""
            }>Next ▶</button>
            <button class="btn btn-ghost btn-sm" id="btnStepLast" ${
              activeTableauStep >= totalSteps - 1 ? "disabled" : ""
            }>⏭ Final</button>
          </div>
          <button class="btn btn-ghost btn-sm" id="btnToggleShowAll">
            ${showAllTableaux ? "🎯 Step-by-Step Mode (1 Tableau)" : "📜 Show All Tableaux at Once"}
          </button>
        </div>
      `;

      const cardsHtml = showAllTableaux
        ? res.tableaux.map((t, idx) => buildSingleTableauCard(res, t, idx)).join("")
        : buildSingleTableauCard(res, res.tableaux[activeTableauStep], activeTableauStep);

      subContentHtml = playerHtml + cardsHtml;
    } else if (activeSimplexResultTab === "sensitivity") {
      const cRows = res.sensitivity.cRanges
        .map(
          (cr) => `
        <tr>
          <td><strong>$${cr.varName}$</strong> (${cr.isBasic ? "Basic" : "Non-Basic"})</td>
          <td>$${cr.origC}$</td>
          <td>$[\\; ${cr.minDelta}, \\; ${cr.maxDelta} \\;]$</td>
          <td><strong>$[\\; ${cr.minC}, \\; ${cr.maxC} \\;]$</strong></td>
        </tr>
      `
        )
        .join("");

      const bRows = res.sensitivity.bRanges
        .map(
          (br) => `
        <tr>
          <td>Constraint $C_${br.constraintIdx}$ ($${br.slackVar}$)</td>
          <td>$${br.origB}$</td>
          <td><span class="badge badge-emerald">$y_${br.constraintIdx}^* = ${br.shadowPrice}$</span></td>
          <td>$[\\; ${br.minDelta}, \\; ${br.maxDelta} \\;]$</td>
          <td><strong>$[\\; ${br.minB}, \\; ${br.maxB} \\;]$</strong></td>
        </tr>
      `
        )
        .join("");

      subContentHtml = `
        <div class="card mt-1">
          <h3>🎛️ 1. Stability Ranges for Objective Coefficients ($c_k$)</h3>
          <p class="small muted">The current optimal basis remains unchanged as long as $c_k$ stays within this interval:</p>
          <div class="tableau-wrapper mt-05">
            <table class="simplex-table">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Initial Value $c_k$</th>
                  <th>Allowed Variation $\\delta$</th>
                  <th>Stability Interval $[c_{\\min}, c_{\\max}]$</th>
                </tr>
              </thead>
              <tbody>${cRows}</tbody>
            </table>
          </div>

          <h3 class="mt-1">💰 2. Feasibility Ranges for RHS Resources ($b_i$) &amp; Shadow Prices ($y_i^*$)</h3>
          <p class="small muted">Each $+1$ unit of resource $i$ within this interval changes $Z^*$ by $+y_i^*$:</p>
          <div class="tableau-wrapper mt-05">
            <table class="simplex-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Initial Stock $b_i$</th>
                  <th>Shadow Price $y_i^*$</th>
                  <th>Allowed Variation $\\Delta$</th>
                  <th>Feasibility Interval $[b_{\\min}, b_{\\max}]$</th>
                </tr>
              </thead>
              <tbody>${bRows}</tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activeSimplexResultTab === "dual") {
      const dualObjStr = res.dual.dualObjTerms
        .map((t, i) => `${i > 0 && t.coeff >= 0 ? "+ " : ""}${t.coeff} ${t.varName}`)
        .join(" ");
      const dualConStr = res.dual.dualConstraints
        .map((dc) => {
          const lhs = dc.coeffs
            .map((cVal, idx) => `${idx > 0 && cVal >= 0 ? "+ " : ""}${cVal} y_${idx + 1}`)
            .join(" ");
          return `${lhs} ${dc.op} ${dc.rhs} \\quad (\\text{linked to } ${dc.primalVar})`;
        })
        .join(" \\\\ ");

      const dualPricesStr = res.sensitivity.bRanges
        .map((br) => `$y_${br.constraintIdx}^* = \\mathbf{${br.shadowPrice}}$`)
        .join(", &nbsp; ");

      subContentHtml = `
        <div class="card mt-1">
          <h3>🔄 Associated Dual Linear Program $(D)$</h3>
          <div class="markdown-body mt-05">
            ${renderMdMath(`$$\\begin{aligned}
\\${res.dual.dualType} \\; W &= ${dualObjStr} \\\\
\\text{s.t.} \\quad & \\begin{cases}
${dualConStr} \\\\
${res.dual.dualSignRules.join(", \\quad ")}
\\end{cases}
\\end{aligned}$$`)}
          </div>
          <div class="step-card mt-1">
            <h4>🤝 Optimal Dual Solution (by Strong Duality &amp; Complementary Slackness):</h4>
            <p class="mt-025">${dualPricesStr || "Read under slack columns in final tableau"} &nbsp; with &nbsp; <strong>$W^* = Z^* = ${res.optimalZFrac}$</strong>.</p>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="card">
        <div class="flex-between">
          <div>
            <h3>🏆 Optimal Value: $Z^* = ${res.optimalZFrac}$</h3>
            <p class="small muted mt-025">Optimal Point: ${decisionSolStr}</p>
          </div>
          ${statusBadge}
        </div>

        <div class="chapter-subtabs">
          <button class="ch-subtab ${activeSimplexResultTab === "tableaux" ? "active" : ""}" data-simtab="tableaux">
            📋 Simplex Tableaux (${totalSteps})
          </button>
          <button class="ch-subtab ${activeSimplexResultTab === "sensitivity" ? "active" : ""}" data-simtab="sensitivity">
            🎛️ Sensitivity ($c_k, b_i$) &amp; Shadow Prices
          </button>
          <button class="ch-subtab ${activeSimplexResultTab === "dual" ? "active" : ""}" data-simtab="dual">
            🔄 Dual Program $(D)$
          </button>
        </div>
      </div>
      ${subContentHtml}
    `;

    container.querySelectorAll("[data-simtab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeSimplexResultTab = btn.dataset.simtab;
        renderSimplexResultsView();
      });
    });

    const bindStep = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", fn);
    };
    bindStep("btnStepFirst", () => {
      activeTableauStep = 0;
      renderSimplexResultsView();
    });
    bindStep("btnStepPrev", () => {
      if (activeTableauStep > 0) activeTableauStep--;
      renderSimplexResultsView();
    });
    bindStep("btnStepNext", () => {
      if (activeTableauStep < totalSteps - 1) activeTableauStep++;
      renderSimplexResultsView();
    });
    bindStep("btnStepLast", () => {
      activeTableauStep = totalSteps - 1;
      renderSimplexResultsView();
    });
    bindStep("btnToggleShowAll", () => {
      showAllTableaux = !showAllTableaux;
      renderSimplexResultsView();
    });

    typesetMath(container);
  }

  document.getElementById("btnRunSimplex").addEventListener("click", runSimplexSolver);
  document.getElementById("btnAskTeacherSimplex").addEventListener("click", () => {
    aiSlideDrawer.classList.remove("hidden");
    const input = document.getElementById("drawerChatInput");
    input.value = `Explain how to pivot on this LP: ${simplexState.type} Z = (${simplexState.c.join(",")})`;
    input.focus();
  });

  // --- 2B: 2D GRAPHICAL VISUAL BUILDER & PLOTTER ---
  const GRAPH_PRESETS = {
    td1ex2: {
      type: "max",
      c: [10, 16],
      constraints: [
        { a1: 1, a2: 2, op: "<=", b: 4 },
        { a1: 1, a2: 1, op: "<=", b: 3 },
      ],
    },
    exam1: {
      type: "max",
      c: [3, 2],
      constraints: [
        { a1: 1, a2: 0, op: "<=", b: 4 },
        { a1: 0, a2: 2, op: "<=", b: 12 },
        { a1: 3, a2: 2, op: "<=", b: 18 },
      ],
    },
    td1z1: {
      type: "max",
      c: [3, 2],
      constraints: [
        { a1: 2, a2: 1, op: "<=", b: 5 },
        { a1: 1, a2: 2, op: "<=", b: 4 },
      ],
    },
    td1z2: {
      type: "max",
      c: [1, 2],
      constraints: [
        { a1: 1, a2: 2, op: "<=", b: 10 },
        { a1: 1, a2: 1, op: "<=", b: 6 },
        { a1: 2, a2: 1, op: "<=", b: 10 },
      ],
    },
    td1z3: {
      type: "max",
      c: [2, 3],
      constraints: [
        { a1: 1, a2: 1, op: ">=", b: 1 },
        { a1: 1, a2: -1, op: ">=", b: 0 },
        { a1: 1, a2: 3, op: "<=", b: 6 },
      ],
    },
    td1z5: {
      type: "max",
      c: [2, -1],
      constraints: [
        { a1: 1, a2: -1, op: "<=", b: 1 },
        { a1: -1, a2: 2, op: "<=", b: 4 },
      ],
    },
  };

  function renderGraphVisualBuilder() {
    document.getElementById("graphObjType").value = graphState.type;
    document.getElementById("graphC1").value = graphState.c[0];
    document.getElementById("graphC2").value = graphState.c[1];

    const list = document.getElementById("visualGraphConstraints");
    list.innerHTML = graphState.constraints
      .map(
        (con, i) => `
      <div class="constraint-row-item">
        <span class="badge badge-blue">C${i + 1}</span>
        <input type="number" class="coeff-input g-a1" data-i="${i}" value="${con.a1}" step="any" />
        <span class="math-var">x<sub>1</sub> +</span>
        <input type="number" class="coeff-input g-a2" data-i="${i}" value="${con.a2}" step="any" />
        <span class="math-var">x<sub>2</sub></span>
        <select class="select-modern w-auto g-op" data-i="${i}">
          <option value="<=" ${con.op === "<=" ? "selected" : ""}>≤</option>
          <option value=">=" ${con.op === ">=" ? "selected" : ""}>≥</option>
          <option value="=" ${con.op === "=" ? "selected" : ""}>=</option>
        </select>
        <input type="number" class="coeff-input g-b" data-i="${i}" value="${con.b}" step="any" />
        <button class="btn-remove-row" data-grem="${i}">✖</button>
      </div>
    `
      )
      .join("");

    list.querySelectorAll(".g-a1").forEach((inp) => {
      inp.addEventListener("input", () => (graphState.constraints[Number(inp.dataset.i)].a1 = Number(inp.value) || 0));
    });
    list.querySelectorAll(".g-a2").forEach((inp) => {
      inp.addEventListener("input", () => (graphState.constraints[Number(inp.dataset.i)].a2 = Number(inp.value) || 0));
    });
    list.querySelectorAll(".g-op").forEach((sel) => {
      sel.addEventListener("change", () => (graphState.constraints[Number(sel.dataset.i)].op = sel.value));
    });
    list.querySelectorAll(".g-b").forEach((inp) => {
      inp.addEventListener("input", () => (graphState.constraints[Number(inp.dataset.i)].b = Number(inp.value) || 0));
    });
    list.querySelectorAll("[data-grem]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (graphState.constraints.length <= 1) return;
        graphState.constraints.splice(Number(btn.dataset.grem), 1);
        renderGraphVisualBuilder();
        runGraphicalSolver();
      });
    });
  }

  document.getElementById("graphPresetSelect").addEventListener("change", (e) => {
    const p = GRAPH_PRESETS[e.target.value];
    if (p) loadPresetIntoSolver("graphical", p);
  });

  document.getElementById("btnAddGraphCon").addEventListener("click", () => {
    graphState.constraints.push({ a1: 1, a2: 1, op: "<=", b: 5 });
    renderGraphVisualBuilder();
    runGraphicalSolver();
  });

  function runGraphicalSolver() {
    graphState.type = document.getElementById("graphObjType").value;
    graphState.c = [
      Number(document.getElementById("graphC1").value) || 0,
      Number(document.getElementById("graphC2").value) || 0,
    ];
    activeGraphResult = window.ORSolvers.solveGraphical2D(graphState);
    document.getElementById("isoProfitSlider").value = 100;
    drawGraphicalCanvas();
    renderGraphicalSummary();
  }

  function drawGraphicalCanvas() {
    const canvas = document.getElementById("lpGraphCanvas");
    if (!canvas || !activeGraphResult) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const pad = 50;
    const isLight = document.documentElement.getAttribute("data-theme") === "light";

    ctx.clearRect(0, 0, W, H);

    const maxC = activeGraphResult.maxCoord;
    const toX = (x1) => pad + (x1 / maxC) * (W - 2 * pad);
    const toY = (x2) => H - pad - (x2 / maxC) * (H - 2 * pad);

    // Grid
    ctx.strokeStyle = isLight ? "#e2e8f0" : "#1e293b";
    ctx.lineWidth = 1;
    const step = maxC <= 10 ? 1 : maxC <= 25 ? 2 : 5;
    ctx.fillStyle = isLight ? "#475569" : "#94a3b8";
    ctx.font = "11px Plus Jakarta Sans, sans-serif";

    for (let v = 0; v <= maxC; v += step) {
      const px = toX(v);
      const py = toY(v);
      ctx.beginPath();
      ctx.moveTo(px, pad);
      ctx.lineTo(px, H - pad);
      ctx.stroke();
      ctx.fillText(v.toString(), px - 4, H - pad + 18);

      ctx.beginPath();
      ctx.moveTo(pad, py);
      ctx.lineTo(W - pad, py);
      ctx.stroke();
      ctx.fillText(v.toString(), pad - 26, py + 4);
    }

    // Axes
    ctx.strokeStyle = isLight ? "#334155" : "#64748b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, pad / 2);
    ctx.lineTo(pad, H - pad);
    ctx.lineTo(W - pad / 2, H - pad);
    ctx.stroke();

    // Shaded Feasible Polygon
    const poly = activeGraphResult.feasiblePolygonPts;
    if (poly.length >= 3) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(toX(poly[0].x1), toY(poly[0].x2));
      for (let i = 1; i < poly.length; i++) {
        ctx.lineTo(toX(poly[i].x1), toY(poly[i].x2));
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(16, 185, 129, 0.24)";
      ctx.fill();
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.restore();
    }

    // Constraint Lines
    const lineColors = ["#3b82f6", "#ec4899", "#f59e0b", "#8b5cf6", "#06b6d4"];
    graphState.constraints.forEach((con, idx) => {
      ctx.strokeStyle = lineColors[idx % lineColors.length];
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      if (Math.abs(con.a2) > 1e-8) {
        ctx.moveTo(toX(0), toY(con.b / con.a2));
        ctx.lineTo(toX(maxC), toY((con.b - con.a1 * maxC) / con.a2));
      } else if (Math.abs(con.a1) > 1e-8) {
        const xVal = con.b / con.a1;
        ctx.moveTo(toX(xVal), toY(0));
        ctx.lineTo(toX(xVal), toY(maxC));
      }
      ctx.stroke();
    });

    // Iso-profit line Delta_Z
    const sliderVal = Number(document.getElementById("isoProfitSlider").value);
    const [c1, c2] = graphState.c;
    const optZ = activeGraphResult.optimalZ ?? 10;
    const targetZ = (sliderVal / 100) * (optZ !== 0 ? optZ : 10);
    document.getElementById("isoProfitLabel").textContent = `Z = ${window.ORSolvers.roundClean(targetZ, 2)}`;

    if (Math.abs(c1) > 1e-8 || Math.abs(c2) > 1e-8) {
      ctx.save();
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 2.8;
      ctx.setLineDash([8, 5]);
      ctx.beginPath();
      if (Math.abs(c2) > 1e-8) {
        ctx.moveTo(toX(0), toY(targetZ / c2));
        ctx.lineTo(toX(maxC), toY((targetZ - c1 * maxC) / c2));
      } else {
        const xVal = targetZ / c1;
        ctx.moveTo(toX(xVal), toY(0));
        ctx.lineTo(toX(xVal), toY(maxC));
      }
      ctx.stroke();
      ctx.restore();
    }

    // Vertices
    activeGraphResult.trueVertices.forEach((v) => {
      const isOpt = activeGraphResult.optimalVertices.some(
        (ov) => Math.abs(ov.x1 - v.x1) < 1e-3 && Math.abs(ov.x2 - v.x2) < 1e-3
      );
      const px = toX(v.x1);
      const py = toY(v.x2);

      ctx.beginPath();
      ctx.arc(px, py, isOpt ? 7.5 : 5.5, 0, Math.PI * 2);
      ctx.fillStyle = isOpt ? "#10b981" : "#3b82f6";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      ctx.fillStyle = isOpt ? "#10b981" : isLight ? "#0f172a" : "#f8fafc";
      ctx.font = "bold 12px Plus Jakarta Sans, sans-serif";
      ctx.fillText(`${v.name}(${v.x1}, ${v.x2})`, px + 9, py - 7);
    });
  }

  function renderGraphicalSummary() {
    const card = document.getElementById("graphSummaryCard");
    if (!activeGraphResult) return;

    const rows = activeGraphResult.trueVertices
      .map((v) => {
        const isOpt = activeGraphResult.optimalVertices.some(
          (ov) => Math.abs(ov.x1 - v.x1) < 1e-3 && Math.abs(ov.x2 - v.x2) < 1e-3
        );
        return `
        <tr class="${isOpt ? "pivot-row" : ""}">
          <td><strong>${v.name}</strong></td>
          <td>$(${v.x1}, \\; ${v.x2})$</td>
          <td><strong>${v.z}</strong> ${isOpt ? "🏆" : ""}</td>
        </tr>
      `;
      })
      .join("");

    card.innerHTML = `
      <div class="tableau-wrapper">
        <table class="simplex-table">
          <thead>
            <tr>
              <th>Vertex</th>
              <th>$(x_1, x_2)$</th>
              <th>$Z$</th>
            </tr>
          </thead>
          <tbody>
            ${rows || "<tr><td colspan='3'>No feasible vertices</td></tr>"}
          </tbody>
        </table>
      </div>
    `;
    typesetMath(card);
  }

  document.getElementById("btnRunGraph").addEventListener("click", runGraphicalSolver);
  document.getElementById("isoProfitSlider").addEventListener("input", drawGraphicalCanvas);

  // --- 2C: KNAPSACK BRANCH & BOUND VISUAL BUILDER & SVG TREE ---
  const KNAPSACK_PRESETS = {
    exam2: {
      capacity: 20,
      items: [
        { name: "x_1", profit: 45, weight: 9 },
        { name: "x_2", profit: 21, weight: 7 },
        { name: "x_3", profit: 23, weight: 8 },
        { name: "x_4", profit: 11, weight: 7 },
      ],
    },
    td4ex2: {
      capacity: 14,
      items: [
        { name: "x_1", profit: 8, weight: 5 },
        { name: "x_2", profit: 11, weight: 7 },
        { name: "x_3", profit: 6, weight: 4 },
        { name: "x_4", profit: 4, weight: 3 },
      ],
    },
  };

  function renderKnapsackVisualBuilder() {
    document.getElementById("knapsackCapacity").value = knapsackState.capacity;
    const list = document.getElementById("visualKnapsackItems");
    list.innerHTML = knapsackState.items
      .map(
        (it, idx) => `
      <div class="constraint-row-item">
        <span class="badge badge-blue">${it.name}</span>
        <span class="small muted">Profit $c_i$:</span>
        <input type="number" class="coeff-input k-prof" data-i="${idx}" value="${it.profit}" step="any" />
        <span class="small muted">Weight $a_i$:</span>
        <input type="number" class="coeff-input k-wt" data-i="${idx}" value="${it.weight}" step="any" />
        <button class="btn-remove-row" data-krem="${idx}">✖</button>
      </div>
    `
      )
      .join("");

    list.querySelectorAll(".k-prof").forEach((inp) => {
      inp.addEventListener("input", () => (knapsackState.items[Number(inp.dataset.i)].profit = Number(inp.value) || 0));
    });
    list.querySelectorAll(".k-wt").forEach((inp) => {
      inp.addEventListener("input", () => (knapsackState.items[Number(inp.dataset.i)].weight = Number(inp.value) || 1));
    });
    list.querySelectorAll("[data-krem]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (knapsackState.items.length <= 2) return;
        knapsackState.items.splice(Number(btn.dataset.krem), 1);
        renderKnapsackVisualBuilder();
        runKnapsackSolver();
      });
    });
  }

  document.getElementById("knapsackPresetSelect").addEventListener("change", (e) => {
    const p = KNAPSACK_PRESETS[e.target.value];
    if (p) loadPresetIntoSolver("knapsack", p);
  });

  document.getElementById("btnAddKnapsackItem").addEventListener("click", () => {
    const nextIdx = knapsackState.items.length + 1;
    knapsackState.items.push({ name: `x_${nextIdx}`, profit: 15, weight: 5 });
    renderKnapsackVisualBuilder();
    runKnapsackSolver();
  });

  function buildKnapsackSvgTree(res) {
    const maxDepth = Math.max(...res.nodes.map((n) => n.depth), 1);
    const depthBuckets = {};
    res.nodes.forEach((n) => {
      if (!depthBuckets[n.depth]) depthBuckets[n.depth] = [];
      depthBuckets[n.depth].push(n);
    });

    const svgW = Math.max(760, Object.values(depthBuckets).reduce((m, arr) => Math.max(m, arr.length), 1) * 175);
    const svgH = (maxDepth + 1) * 115 + 40;
    const coords = {};

    Object.entries(depthBuckets).forEach(([dStr, arr]) => {
      const d = Number(dStr);
      const y = 48 + d * 110;
      arr.forEach((nd, i) => {
        const x = ((i + 1) / (arr.length + 1)) * svgW;
        coords[nd.id] = { x, y };
      });
    });

    let edgesSvg = "";
    res.nodes.forEach((nd) => {
      if (nd.parentId !== null && coords[nd.parentId] && coords[nd.id]) {
        const p = coords[nd.parentId];
        const c = coords[nd.id];
        const midX = (p.x + c.x) / 2;
        const midY = (p.y + c.y) / 2;
        edgesSvg += `
          <line x1="${p.x}" y1="${p.y + 22}" x2="${c.x}" y2="${c.y - 24}" stroke="#64748b" stroke-width="2" />
          <rect x="${midX - 28}" y="${midY - 10}" width="56" height="18" rx="5" fill="#1e293b" />
          <text x="${midX}" y="${midY + 3}" text-anchor="middle" fill="#93c5fd" font-size="10" font-family="JetBrains Mono">${nd.branchLabel}</text>
        `;
      }
    });

    let nodesSvg = "";
    res.nodes.forEach((nd) => {
      const { x, y } = coords[nd.id];
      const isOpt = nd.id === res.bestNodeId;
      const fill = isOpt
        ? "#065f46"
        : nd.status === "integer_incumbent"
        ? "#064e3b"
        : nd.status.startsWith("pruned")
        ? "#4c0519"
        : "#1e293b";
      const stroke = isOpt
        ? "#10b981"
        : nd.status.startsWith("pruned")
        ? "#f43f5e"
        : "#3b82f6";
      const ubLabel = nd.feasible ? `UB=${nd.ub}` : "Infeas.";
      const subLabel = isOpt
        ? `🏆 Z*=${nd.ub}`
        : nd.status === "pruned_infeasible"
        ? `Weight>${res.capacity}`
        : nd.status === "pruned_bound"
        ? "Pruned"
        : `W=${nd.usedWeight}/${res.capacity}`;

      nodesSvg += `
        <g transform="translate(${x}, ${y})">
          <rect x="-64" y="-24" width="128" height="48" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="${
        isOpt ? 3 : 1.8
      }" />
          <text x="0" y="-4" text-anchor="middle" fill="#ffffff" font-weight="bold" font-size="11" font-family="Plus Jakarta Sans">N${
        nd.id
      }: ${ubLabel}</text>
          <text x="0" y="13" text-anchor="middle" fill="#cbd5e1" font-size="10" font-family="JetBrains Mono">${subLabel}</text>
        </g>
      `;
    });

    return `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">${edgesSvg}${nodesSvg}</svg>`;
  }

  function runKnapsackSolver() {
    knapsackState.capacity = Number(document.getElementById("knapsackCapacity").value) || 20;
    const res = window.ORSolvers.solveKnapsackBB(knapsackState);
    const container = document.getElementById("knapsackOutputArea");

    const ratioRows = res.sortedItems
      .map(
        (it, idx) => `
      <tr>
        <td><strong>#${idx + 1}</strong></td>
        <td><strong>$${it.name}$</strong></td>
        <td>$${it.profit}$</td>
        <td>$${it.weight}$</td>
        <td><span class="badge badge-blue">${window.ORSolvers.roundClean(it.ratio, 3)}</span></td>
      </tr>
    `
      )
      .join("");

    const optVecStr = Object.entries(res.origSolution)
      .map(([k, v]) => `$${k}^* = \\mathbf{${v}}$`)
      .join(", &nbsp; ");

    container.innerHTML = `
      <div class="card">
        <div class="flex-between">
          <div>
            <h3>🏆 Optimal Integer Solution: $Z^* = ${res.bestIncumbent}$</h3>
            <p class="small muted mt-025">Optimal Decision: ${optVecStr}</p>
          </div>
          <span class="badge badge-emerald">${res.nodes.length} Nodes Explored</span>
        </div>

        <h4 class="mt-1">🌳 1. Visual Branch-and-Bound Tree</h4>
        <div class="svg-tree-container">
          ${buildKnapsackSvgTree(res)}
        </div>

        <h4 class="mt-1">📊 2. Preliminary Sorting by Efficiency Ratio ($c_i / a_i$ Descending)</h4>
        <div class="tableau-wrapper mt-05">
          <table class="simplex-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Item</th>
                <th>Profit $c_i$</th>
                <th>Weight $a_i$</th>
                <th>Ratio $c_i / a_i$</th>
              </tr>
            </thead>
            <tbody>${ratioRows}</tbody>
          </table>
        </div>
      </div>
    `;
    typesetMath(container);
  }

  document.getElementById("btnRunKnapsack").addEventListener("click", runKnapsackSolver);

  // Initialize Solvers
  renderSimplexVisualBuilder();
  runSimplexSolver();
  renderGraphVisualBuilder();
  runGraphicalSolver();
  renderKnapsackVisualBuilder();
  runKnapsackSolver();

  // --------------------------------------------------------------------------
  // VIEW 3: MASTER-DETAIL EXERCISE WORKSPACE
  // --------------------------------------------------------------------------
  const exerciseListNav = document.getElementById("exerciseListNav");
  const exerciseDetailStage = document.getElementById("exerciseDetailStage");
  const exoSearchInput = document.getElementById("exoSearchInput");

  function renderExercisesListNav() {
    const query = (exoSearchInput.value || "").toLowerCase().trim();
    const filtered = window.OR_EXERCISES.filter((ex) => {
      const matchSheet = activeExoSheet === "ALL" || ex.sheet === activeExoSheet;
      const matchSearch =
        !query ||
        ex.title.toLowerCase().includes(query) ||
        ex.topic.toLowerCase().includes(query) ||
        ex.badge.toLowerCase().includes(query) ||
        ex.statement.toLowerCase().includes(query);
      return matchSheet && matchSearch;
    });

    if (filtered.length > 0 && !filtered.some((e) => e.id === activeExerciseId)) {
      activeExerciseId = filtered[0].id;
    }

    exerciseListNav.innerHTML = filtered
      .map(
        (ex) => `
      <div class="exo-nav-card ${ex.id === activeExerciseId ? "active" : ""}" data-exid="${ex.id}">
        <div class="flex-between">
          <span class="badge ${ex.sheet === "EXAM" ? "badge-rose" : "badge-blue"}">${ex.badge}</span>
          <span class="small muted">${ex.difficulty.split("(")[0]}</span>
        </div>
        <div class="exo-nav-title">${ex.title}</div>
      </div>
    `
      )
      .join("");

    exerciseListNav.querySelectorAll(".exo-nav-card").forEach((card) => {
      card.addEventListener("click", () => {
        activeExerciseId = card.dataset.exid;
        renderExercisesListNav();
        renderExerciseDetailStage();
      });
    });
  }

  // Universal Inline SVG 2D Graphical Plot & 0/1 Knapsack B&B Tree Generator
  // Can be embedded directly inside AI Exos, TD Solutions, OCR Reports, and Prof. OR Chat!
  function buildInlineVisualSolutionHtml(solverType, data) {
    if (!solverType || !data) return "";
    const normSolver = solverType === "bb" ? "knapsack" : solverType;

    if (normSolver === "knapsack") {
      const cap = Number(data.capacity ?? data.W ?? 15);
      const items = Array.isArray(data.items)
        ? data.items.map((it) => ({ ...it }))
        : Array.isArray(data.c) && Array.isArray(data.w)
        ? data.c.map((p, idx) => ({
            name: `x_${idx + 1}`,
            profit: Number(p),
            weight: Number(data.w[idx]),
          }))
        : [];
      if (items.length === 0) return "";
      const res = window.ORSolvers.solveKnapsackBB({ capacity: cap, items });
      return `
        <div class="step-card mt-075">
          <div class="flex-between">
            <h4>🌳 Visual Branch-and-Bound Decision Tree ($W = ${cap}$, Optimal $Z^* = ${res.bestIncumbent}$)</h4>
            <span class="badge badge-emerald">${res.nodes.length} B&amp;B Nodes</span>
          </div>
          <div class="svg-tree-container mt-05">
            ${buildKnapsackSvgTree(res)}
          </div>
        </div>
      `;
    }

    // 2D Graphical SVG Plot (works for any 2-variable 'graphical' or 'simplex' LP!)
    const cArr = (data.c || []).map(Number);
    if (cArr.length !== 2) return "";

    const constraints = Array.isArray(data.constraints)
      ? data.constraints.map((con, idx) => ({
          a1: Number(con.a1 ?? con.a?.[0] ?? 0),
          a2: Number(con.a2 ?? con.a?.[1] ?? 0),
          op: con.op || "<=",
          b: Number(con.b),
          label: `C${idx + 1}`,
        }))
      : Array.isArray(data.A) && Array.isArray(data.b)
      ? data.A.map((row, idx) => ({
          a1: Number(row[0] ?? 0),
          a2: Number(row[1] ?? 0),
          op: data.signs?.[idx] || "<=",
          b: Number(data.b[idx]),
          label: `C${idx + 1}`,
        }))
      : [];

    if (constraints.length === 0) return "";

    const gRes = window.ORSolvers.solveGraphical2D({
      type: data.type || data.optType || "max",
      c: [cArr[0], cArr[1]],
      constraints,
    });

    const W = 540;
    const H = 340;
    const pad = 44;
    const maxC = gRes.maxCoord || 10;
    const toX = (x1) => pad + (x1 / maxC) * (W - 2 * pad);
    const toY = (x2) => H - pad - (x2 / maxC) * (H - 2 * pad);
    const step = maxC <= 10 ? 1 : maxC <= 25 ? 2 : 5;

    let gridSvg = "";
    for (let v = 0; v <= maxC; v += step) {
      const px = toX(v);
      const py = toY(v);
      gridSvg += `<line x1="${px}" y1="${pad / 2}" x2="${px}" y2="${H - pad}" stroke="#334155" stroke-opacity="0.35" stroke-width="1" />`;
      gridSvg += `<text x="${px}" y="${H - pad + 16}" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="JetBrains Mono">${v}</text>`;
      gridSvg += `<line x1="${pad}" y1="${py}" x2="${W - pad / 2}" y2="${py}" stroke="#334155" stroke-opacity="0.35" stroke-width="1" />`;
      gridSvg += `<text x="${pad - 10}" y="${py + 3}" text-anchor="end" fill="#94a3b8" font-size="10" font-family="JetBrains Mono">${v}</text>`;
    }

    const axesSvg = `
      <line x1="${pad}" y1="${pad / 2}" x2="${pad}" y2="${H - pad}" stroke="#64748b" stroke-width="2" />
      <line x1="${pad}" y1="${H - pad}" x2="${W - pad / 2}" y2="${H - pad}" stroke="#64748b" stroke-width="2" />
      <text x="${W - pad / 2}" y="${H - pad - 6}" text-anchor="end" fill="#cbd5e1" font-weight="bold" font-size="11">x₁</text>
      <text x="${pad + 8}" y="${pad / 2 + 10}" text-anchor="start" fill="#cbd5e1" font-weight="bold" font-size="11">x₂</text>
    `;

    let polySvg = "";
    if (gRes.feasiblePolygonPts && gRes.feasiblePolygonPts.length >= 3) {
      const ptsStr = gRes.feasiblePolygonPts.map((p) => `${toX(p.x1)},${toY(p.x2)}`).join(" ");
      polySvg = `<polygon points="${ptsStr}" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" stroke-width="2.2" />`;
    }

    const colors = ["#3b82f6", "#ec4899", "#f59e0b", "#8b5cf6", "#06b6d4"];
    let linesSvg = "";
    let legendHtml = "";
    constraints.forEach((con, idx) => {
      const col = colors[idx % colors.length];
      let xStart = 0,
        yStart = 0,
        xEnd = 0,
        yEnd = 0;
      if (Math.abs(con.a2) > 1e-8) {
        xStart = 0;
        yStart = con.b / con.a2;
        xEnd = maxC;
        yEnd = (con.b - con.a1 * maxC) / con.a2;
      } else if (Math.abs(con.a1) > 1e-8) {
        xStart = con.b / con.a1;
        yStart = 0;
        xEnd = con.b / con.a1;
        yEnd = maxC;
      }
      linesSvg += `<line x1="${toX(xStart)}" y1="${toY(yStart)}" x2="${toX(xEnd)}" y2="${toY(
        yEnd
      )}" stroke="${col}" stroke-width="2.2" />`;
      legendHtml += `<span class="badge" style="background:${col}22; color:${col}; border:1px solid ${col}55;">(C${
        idx + 1
      }): ${con.a1}x₁ + ${con.a2}x₂ ${con.op} ${con.b}</span>`;
    });

    // Iso-profit line Delta_Z*
    let isoSvg = "";
    const optZ = gRes.optimalZ;
    if (optZ !== null && optZ !== undefined && (Math.abs(cArr[0]) > 1e-8 || Math.abs(cArr[1]) > 1e-8)) {
      let ix1 = 0,
        iy1 = 0,
        ix2 = 0,
        iy2 = 0;
      if (Math.abs(cArr[1]) > 1e-8) {
        ix1 = 0;
        iy1 = optZ / cArr[1];
        ix2 = maxC;
        iy2 = (optZ - cArr[0] * maxC) / cArr[1];
      } else {
        ix1 = optZ / cArr[0];
        iy1 = 0;
        ix2 = optZ / cArr[0];
        iy2 = maxC;
      }
      isoSvg = `<line x1="${toX(ix1)}" y1="${toY(iy1)}" x2="${toX(ix2)}" y2="${toY(
        iy2
      )}" stroke="#f43f5e" stroke-width="2.6" stroke-dasharray="7,5" />`;
      legendHtml += `<span class="badge badge-rose">Iso-Profit Δ (Z* = ${window.ORSolvers.roundClean(optZ, 2)})</span>`;
    }

    let verticesSvg = "";
    let vertexRowsHtml = "";
    (gRes.trueVertices || []).forEach((v) => {
      const isOpt = (gRes.optimalVertices || []).some(
        (ov) => Math.abs(ov.x1 - v.x1) < 1e-3 && Math.abs(ov.x2 - v.x2) < 1e-3
      );
      const px = toX(v.x1);
      const py = toY(v.x2);
      const cFill = isOpt ? "#10b981" : "#3b82f6";
      const r = isOpt ? 6.5 : 4.8;
      const x1Str = window.ORSolvers.toFrac(v.x1);
      const x2Str = window.ORSolvers.toFrac(v.x2);
      const zStr = window.ORSolvers.toFrac(v.z);

      verticesSvg += `
        <circle cx="${px}" cy="${py}" r="${r}" fill="${cFill}" stroke="#ffffff" stroke-width="2" />
        <text x="${px + 8}" y="${py - 6}" fill="${isOpt ? "#10b981" : "#f8fafc"}" font-weight="bold" font-size="11" font-family="Plus Jakarta Sans">${
        v.name
      }(${x1Str}, ${x2Str})</text>
      `;
      vertexRowsHtml += `
        <tr class="${isOpt ? "pivot-row" : ""}">
          <td><strong>${v.name}</strong></td>
          <td>$(${x1Str},\\; ${x2Str})$</td>
          <td><strong>$${zStr}$</strong> ${isOpt ? "🏆" : ""}</td>
        </tr>
      `;
    });

    const clipId = "plotClip_" + Math.random().toString(36).substring(2, 9);

    return `
      <div class="step-card mt-075">
        <div class="flex-between">
          <h4>📈 2D Graphical Solution Plot (Shaded Feasible Region $\\mathcal{D}$, Corner Vertices &amp; Iso-Profit Line $\\Delta_{Z^*}$)</h4>
          <span class="badge badge-emerald">Optimal $Z^* = ${window.ORSolvers.toFrac(gRes.optimalZ ?? 0)}$</span>
        </div>
        <div class="action-bar mt-05" style="flex-wrap:wrap; gap:0.4rem;">
          ${legendHtml}
        </div>
        <div class="solver-split-2col mt-05" style="align-items:center;">
          <div class="svg-tree-container" style="padding:0.5rem; text-align:center;">
            <svg viewBox="0 0 ${W} ${H}" style="width:100%; max-width:${W}px; height:auto; background:#0f172a; border-radius:10px; border:1px solid #334155;">
              <defs>
                <clipPath id="${clipId}">
                  <rect x="${pad}" y="${pad / 2}" width="${W - 1.5 * pad}" height="${H - 1.5 * pad}" />
                </clipPath>
              </defs>
              ${gridSvg}
              <g clip-path="url(#${clipId})">
                ${polySvg}
                ${linesSvg}
                ${isoSvg}
              </g>
              ${axesSvg}
              ${verticesSvg}
            </svg>
          </div>
          <div>
            <h5>📋 Corner-Point Evaluation Table:</h5>
            <div class="tableau-wrapper mt-025">
              <table class="simplex-table">
                <thead>
                  <tr>
                    <th>Vertex</th>
                    <th>Coordinates $(x_1, x_2)$</th>
                    <th>Objective $Z$</th>
                  </tr>
                </thead>
                <tbody>
                  ${vertexRowsHtml || "<tr><td colspan='3'>No feasible corner points</td></tr>"}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderExerciseDetailStage() {
    const ex = window.OR_EXERCISES.find((e) => e.id === activeExerciseId) || window.OR_EXERCISES[0];
    if (!ex) return;

    const inlineVisualHtml = ex.solverPreset
      ? buildInlineVisualSolutionHtml(ex.solverPreset.solverType, ex.solverPreset.data)
      : "";

    exerciseDetailStage.innerHTML = `
      <div class="card">
        <div class="flex-between">
          <div class="action-bar">
            <span class="badge ${ex.sheet === "EXAM" ? "badge-rose" : "badge-blue"}">${ex.badge}</span>
            <span class="badge badge-emerald">${ex.topic}</span>
          </div>
          <div class="action-bar">
            ${
              ex.solverPreset
                ? `<button class="btn btn-emerald btn-sm" id="btnExoOpenSolver">
                     🧮 Simulate in Solver
                   </button>`
                : ""
            }
            <button class="btn btn-secondary btn-sm" id="btnExoSendOcr">
              📸 Scan My Solution (OCR)
            </button>
          </div>
        </div>

        <h2 class="mt-05">${ex.title}</h2>
        <div class="step-card mt-1">
          <h4>📋 Problem Statement:</h4>
          <div class="markdown-body mt-05">${renderMdMath(ex.statement)}</div>
        </div>

        <div class="action-bar mt-1">
          <button class="btn btn-ghost" id="btnToggleExoHint">
            💡 Show / Hide Method Hint ("How-To")
          </button>
          <button class="btn btn-primary" id="btnToggleExoSolution">
            ✅ Show / Hide Complete Step-by-Step Solution &amp; Graph
          </button>
        </div>

        <div class="analogy-box mt-1 hidden" id="exoHintBox">
          <h4>💡 Method Hint &amp; Exam Recipe:</h4>
          <div class="markdown-body mt-025">${renderMdMath(ex.hint)}</div>
        </div>

        <div class="exo-solution-drawer mt-1" id="exoSolutionBox">
          ${inlineVisualHtml}
          <div class="markdown-body mt-075">${renderMdMath(ex.solution)}</div>
        </div>
      </div>
    `;

    document.getElementById("btnToggleExoHint").addEventListener("click", () => {
      document.getElementById("exoHintBox").classList.toggle("hidden");
    });
    document.getElementById("btnToggleExoSolution").addEventListener("click", () => {
      document.getElementById("exoSolutionBox").classList.toggle("hidden");
    });

    const solverBtn = document.getElementById("btnExoOpenSolver");
    if (solverBtn && ex.solverPreset) {
      solverBtn.addEventListener("click", () => {
        loadPresetIntoSolver(ex.solverPreset.solverType, ex.solverPreset.data);
      });
    }

    document.getElementById("btnExoSendOcr").addEventListener("click", () => {
      document.getElementById("ocrExerciseSelect").value = ex.id;
      navigateToView("corrector");
    });

    typesetMath(exerciseDetailStage);
  }

  document.querySelectorAll("#exoSheetFilters .filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#exoSheetFilters .filter-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      activeExoSheet = chip.dataset.sheet;
      renderExercisesListNav();
      renderExerciseDetailStage();
    });
  });

  exoSearchInput.addEventListener("input", () => {
    renderExercisesListNav();
    renderExerciseDetailStage();
  });

  renderExercisesListNav();
  renderExerciseDetailStage();

  // Populate OCR Exercise Select
  const ocrExerciseSelect = document.getElementById("ocrExerciseSelect");
  window.OR_EXERCISES.forEach((ex) => {
    const opt = document.createElement("option");
    opt.value = ex.id;
    opt.textContent = `[${ex.badge}] ${ex.title}`;
    ocrExerciseSelect.appendChild(opt);
  });

  // --------------------------------------------------------------------------
  // VIEW 4 & 5: CHAPTER & DIFFICULTY EXERCISE GENERATOR + AI OCR CORRECTOR
  // --------------------------------------------------------------------------
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function formatAllTableauxMd(solved) {
    if (!solved || !solved.tableaux) return "";
    const tf = solved.toFrac;
    const vNames = solved.varNames;

    return solved.tableaux
      .map((tab, tIdx) => {
        const headerCols = ["Basis", ...vNames.map((v) => `$${v}$`), "RHS ($b_i$)", "Ratio"];
        const sepCols = headerCols.map(() => ":---:");

        const bodyRows = tab.A.map((row, rIdx) => {
          const bName = `$${vNames[tab.basis[rIdx]]}$`;
          const isLeave = tab.leaveRow === rIdx;
          const cells = row.map((val, cIdx) => {
            const str = tf(val);
            if (rIdx === tab.leaveRow && cIdx === tab.enterCol) {
              return `**[${str}]**`;
            }
            return str;
          });
          const ratioStr =
            tab.ratios && tab.ratios[rIdx] !== null
              ? `${tf(tab.ratios[rIdx])}${isLeave ? " *(Min!)*" : ""}`
              : "—";
          return `| ${isLeave ? `**${bName}** $\\leftarrow$` : bName} | ${cells.join(" | ")} | **${tf(
            tab.b[rIdx]
          )}** | ${ratioStr} |`;
        });

        const rcCells = vNames.map((_, cIdx) => {
          const num = tab.cj_zj_num[cIdx];
          const mCoef = tab.cj_zj_M ? tab.cj_zj_M[cIdx] : 0;
          let s = "";
          if (Math.abs(mCoef) > 1e-6) {
            const mStr = `${mCoef > 0 ? "+" : "-"}${Math.abs(mCoef) === 1 ? "" : tf(Math.abs(mCoef))}M`;
            s = Math.abs(num) > 1e-6 ? `${tf(num)} ${mStr}` : mStr;
          } else {
            s = tf(num);
          }
          return cIdx === tab.enterCol ? `**${s}** $\\uparrow$` : s;
        });

        const zRow = `| **$c_j - z_j$** | ${rcCells.join(" | ")} | **$Z = ${tf(tab.zVal_num)}$** | — |`;
        const opsText =
          tab.rowOps && tab.rowOps.length > 0
            ? `\n- **Pivot ${tIdx + 1} Row Operations:** ${tab.rowOps.map((op) => `\`${op}\``).join(" , ")}`
            : `\n- **Optimality Reached:** All $c_j - z_j \\le 0$!`;

        return `#### Tableau ${tIdx} ${tIdx === solved.tableaux.length - 1 ? "(Final Optimal Tableau)" : ""}\n| ${headerCols.join(
          " | "
        )} |\n| ${sepCols.join(" | ")} |\n${bodyRows.join("\n")}\n${zRow}${opsText}`;
      })
      .join("\n\n");
  }

  let renewChallengeCounter = 0;

  function buildExactRenewMath(topic, difficulty = "medium") {
    renewChallengeCounter += 1;
    const genId = renewChallengeCounter;
    const diffNorm = difficulty === "standard" ? "medium" : difficulty;
    const diffBadge =
      diffNorm === "easy"
        ? "🟢 Easy Mode (Warm-Up)"
        : diffNorm === "hard"
        ? "🔴 Hard Mode (Exam Challenge)"
        : "🟡 Medium Mode (Standard TD Level)";

    const topicMap = {
      graphical: "ch1",
      bigm: "ch4",
      duality: "ch5",
      knapsack: "ch7_knapsack",
      linearisation: "ch7_linear",
      simplex_full: "exam_full",
    };
    const chKey = topicMap[topic] || topic;

    // ------------------------------------------------------------------------
    // CASE A: CHAPTER 7A — 0/1 KNAPSACK BRANCH-AND-BOUND
    // ------------------------------------------------------------------------
    if (chKey === "ch7_knapsack") {
      const numItems = diffNorm === "easy" ? 3 : 4;
      const cap = diffNorm === "easy" ? randInt(11, 16) : diffNorm === "hard" ? randInt(22, 30) : randInt(16, 23);
      const items = [];
      for (let i = 1; i <= numItems; i++) {
        const w = randInt(3 + i, 6 + i);
        const ratioTarget = 2.4 - i * 0.25 + (Math.random() * 0.2 - 0.1);
        const p = Math.max(w + 2, Math.round(w * ratioTarget));
        items.push({ name: `x_${i}`, profit: p, weight: w });
      }

      const solved = window.ORSolvers.solveKnapsackBB({ capacity: cap, items });
      const objStr = items.map((it) => `${it.profit}${it.name}`).join(" + ");
      const conStr = items.map((it) => `${it.weight}${it.name}`).join(" + ");

      const statusLabelMap = {
        root: "🌳 Root (Branch)",
        branched: "🌿 Branched",
        integer_incumbent: "✅ Integer Solution (Incumbent)",
        pruned_infeasible: "❌ Pruned (Overweight)",
        pruned_bound: "✂️ Pruned by Bound",
      };

      const nodesTableRows = solved.nodes
        .map((nd) => {
          const vecStr =
            nd.feasible && Array.isArray(nd.values)
              ? `(${nd.values.map((v) => solved.toFrac(v)).join(", ")})`
              : "—";
          const zLpStr = nd.feasible ? window.ORSolvers.roundClean(nd.ub, 2) : "\\text{Infeasible}";
          const ubFloorStr = nd.feasible ? nd.ubFloor : "—";
          const sLabel = statusLabelMap[nd.status] || nd.status;
          return `| **Node ${nd.id}** | ${nd.branchLabel} | $${vecStr}$ | $${zLpStr}$ | $${ubFloorStr}$ | ${sLabel} |`;
        })
        .join("\n");

      const problemMarkdown = `Consider the **0/1 Knapsack Integer Linear Program (Indivisible Items)** with total knapsack capacity **$W = ${cap}$**:
$$\\max Z = ${objStr}$$
$$\\text{subject to:} \\quad ${conStr} \\le ${cap}, \\quad x_j \\in \\{0, 1\\} \\quad (\\forall j \\in \\{1, \\dots, ${numItems}\\})$$

**Questions to Solve on Your Paper:**
1. Compute the **efficiency ratios $r_j = c_j / w_j$** for each project and sort them in descending priority order.
2. Solve the **Root Node (Node 0)** continuous LP relaxation ($0 \\le x_j \\le 1$) using the greedy fractional fill and state the initial Upper Bound $UB_0 = \\lfloor Z_{\\text{LP}} \\rfloor$.
3. Construct the complete **Branch-and-Bound Tree** step-by-step until you prove the optimal integer solution $x^*$ and $Z^*$.`;

      const hintMarkdown = `- **Step 1:** Divide each profit $c_j$ by weight $w_j$: ${items
        .map((it) => `$r_{${it.name}} = ${it.profit}/${it.weight}$`)
        .join(", ")}.
- **Step 2:** At every node, first subtract the weights of items fixed at $x_j = 1$, skip items fixed at $x_j = 0$, and fill the remaining capacity greedily in your sorted priority order!`;

      const fullSolutionMarkdown = `### Certified Step-by-Step Solution (0/1 Knapsack Branch-and-Bound)
#### 1. Efficiency Ratios ($c_j / w_j$) & Priority Order
${solved.sortedItems
  .map(
    (it, idx) =>
      `- **Rank #${idx + 1}: $${it.name}$** $\\rightarrow r = \\frac{${it.profit}}{${it.weight}} = \\mathbf{${window.ORSolvers.roundClean(
        it.ratio,
        3
      )}}$`
  )
  .join("\n")}

#### 2. Complete Branch-and-Bound Node Evaluation Table (in Sorted Priority Order)
| Node | Branch Condition | Relaxed Solution | $Z_{\\text{LP}}$ | $UB = \\lfloor Z_{\\text{LP}} \\rfloor$ | Node Status |
| :---: | :--- | :---: | :---: | :---: | :--- |
${nodesTableRows}

#### 3. Final Optimal Integer Decision
- **Optimal Integer Solution:** **$(${Object.entries(solved.origSolution)
        .map(([k, v]) => `${k}^* = ${v}`)
        .join(",\\; ")})$**
- **Maximum Profit:** **$Z^* = ${solved.bestIncumbent}\\text{ MDA}$**`;

      const presetObj = {
        capacity: cap,
        items,
        W: cap,
        c: items.map((i) => i.profit),
        w: items.map((i) => i.weight),
      };

      return {
        genId,
        title: `Chapter 7A Practice Challenge #${genId} — 0/1 Knapsack B&B (${diffBadge})`,
        chapterLabel: "Chapter 7A: Integer LP & Branch-and-Bound",
        difficultyBadge: diffBadge,
        solverType: "knapsack",
        presetData: presetObj,
        visualSolutionHtml: buildInlineVisualSolutionHtml("knapsack", presetObj),
        problemMarkdown,
        hintMarkdown,
        summary: {
          chapter: "Chapter 7 (0/1 Knapsack Branch-and-Bound)",
          difficulty: diffNorm,
          problemFormula: `Max Z = ${objStr} s.t. ${conStr} <= ${cap}`,
          optimalZ: solved.bestIncumbent,
          optimalSolution: solved.origSolution,
        },
        fullSolutionMarkdown,
      };
    }

    // ------------------------------------------------------------------------
    // CASE B: CHAPTER 7B — LINEARISATION (MINIMAX & ABSOLUTE VALUES)
    // ------------------------------------------------------------------------
    if (chKey === "ch7_linear") {
      const a1 = randInt(2, 6),
        a2 = randInt(2, 5);
      const b1 = randInt(1, 4),
        b2 = randInt(3, 7);
      const k1 = randInt(5, 12),
        k2 = randInt(2, 6);
      const rhs1 = randInt(10, 18),
        rhs2 = randInt(6, 12);

      const problemMarkdown =
        diffNorm === "easy"
          ? `Transform (linearise) the following Absolute Value optimization problem into an equivalent **Linear Program (LP)**:
$$\\min F = ${a1}x_1 + ${a2}|x_2 - ${k1}|$$
$$\\text{subject to:} \\quad |x_1 + ${k2}| \\le ${rhs2}, \\quad x_1, x_2 \\in \\mathbb{R}$$`
          : `Transform (linearise) the following two non-linear mathematical programs into equivalent **Linear Programs (LP)**:

**Part A (Minimax Objective):**
$$\\min Z = \\max(${a1}x_1 - ${a2}x_2 + ${k2},\\;\\; -${b1}x_1 + ${b2}x_2 - ${k1}) \\quad \\text{s.t.} \\quad x_1 + x_2 \\le ${rhs1},\\;\\; x_1, x_2 \\ge 0$$

**Part B (Absolute Values in Objective & Constraint):**
$$\\min F = ${a1}x_1 + ${a2}|x_2 - ${k1}| \\quad \\text{s.t.} \\quad |x_1 + ${k2}| + |x_2| \\le ${rhs2}, \\quad x_1, x_2 \\in \\mathbb{R}$$`;

      const hintMarkdown = `- **For Minimax $\\min Z = \\max(A_1, A_2)$:** Introduce a continuous ceiling variable $v \\in \\mathbb{R}$ and require $v \\ge A_1$ and $v \\ge A_2$.
- **For Absolute Value $|X|$:** Either introduce a bounding variable $t \\ge 0$ with $X \\le t$ and $-X \\le t$, OR split $X = u^+ - u^-$ and $|X| = u^+ + u^-$ with $u^+, u^- \\ge 0$.`;

      const fullSolutionMarkdown = `### Certified Step-by-Step Solution (Linearisation)
${
  diffNorm !== "easy"
    ? `#### Part A: Linearising the Minimax Objective
1. Introduce a scalar variable $v \\in \\mathbb{R}$ such that $v = \\max(${a1}x_1 - ${a2}x_2 + ${k2},\\; -${b1}x_1 + ${b2}x_2 - ${k1})$.
2. Impose the two linear bounding constraints $v \\ge A_1$ and $v \\ge A_2$:
$$\\min Z = v \\quad \\text{subject to:} \\quad \\begin{cases} ${a1}x_1 - ${a2}x_2 - v \\le -${k2} \\\\ -${b1}x_1 + ${b2}x_2 - v \\le ${k1} \\\\ x_1 + x_2 \\le ${rhs1} \\\\ x_1, x_2 \\ge 0,\\; v \\in \\mathbb{R} \\end{cases}$$`
    : ""
}
#### ${diffNorm === "easy" ? "1." : "Part B:"} Linearising the Absolute Values
1. Define non-negative bounding variables:
   - Let $t_1 = |x_2 - ${k1}| \\ge 0 \\iff x_2 - t_1 \\le ${k1}$ and $-x_2 - t_1 \\le -${k1}$.
   - Let $t_2 = |x_1 + ${k2}| \\ge 0 \\iff x_1 - t_2 \\le -${k2}$ and $-x_1 - t_2 \\le ${k2}$.
   ${diffNorm !== "easy" ? `- Let $t_3 = |x_2| \\ge 0 \\iff x_2 - t_3 \\le 0$ and $-x_2 - t_3 \\le 0$.` : ""}
2. **Equivalent Linear Program:**
$$\\min F = ${a1}x_1 + ${a2}t_1 \\quad \\text{s.t.} \\quad \\begin{cases} ${
        diffNorm === "easy" ? `t_2 \\le ${rhs2}` : `t_2 + t_3 \\le ${rhs2}`
      } \\\\ x_2 - t_1 \\le ${k1},\\;\\; -x_2 - t_1 \\le -${k1} \\\\ x_1 - t_2 \\le -${k2},\\;\\; -x_1 - t_2 \\le ${k2} ${
        diffNorm !== "easy" ? `\\\\ x_2 - t_3 \\le 0,\\;\\; -x_2 - t_3 \\le 0` : ""
      } \\\\ t_i \\ge 0,\\; x_1, x_2 \\in \\mathbb{R} \\end{cases}$$`;

      return {
        genId,
        title: `Chapter 7B Practice Challenge #${genId} — Linearisation (${diffBadge})`,
        chapterLabel: "Chapter 7B: Linearisation Tricks",
        difficultyBadge: diffBadge,
        solverType: null,
        presetData: null,
        problemMarkdown,
        hintMarkdown,
        summary: {
          chapter: "Chapter 7B (Linearisation)",
          difficulty: diffNorm,
          problemMarkdown,
        },
        fullSolutionMarkdown,
      };
    }

    // ------------------------------------------------------------------------
    // CASES C1–C6: LP / SIMPLEX / BIG-M / DUALITY / SENSITIVITY (CHAPTERS 1 TO 6)
    // ------------------------------------------------------------------------
    const scale = diffNorm === "hard" ? 10 : 1;
    let c1 = randInt(3, 8) * scale;
    let c2 = randInt(2, 7) * scale;
    if (chKey === "ch1" && Math.random() > 0.5) {
      // Alternate steep vs gentle iso-profit slopes
      const tmp = c1;
      c1 = c2;
      c2 = tmp;
    }
    const x1T = randInt(2, 6);
    const x2T = randInt(2, 6);

    let a11 = randInt(1, 3),
      a12 = randInt(1, 2);
    let a21 = randInt(1, 2),
      a22 = randInt(2, 4);
    if (a11 * a22 === a12 * a21) a22 += 1;

    const b1 = a11 * x1T + a12 * x2T;
    const b2 = a21 * x1T + a22 * x2T;
    const b3 = x1T + randInt(2, 4);

    let constraints = [];
    if (chKey === "ch1") {
      // 2D Graphical Method: Generate diverse polygon geometries every time!
      const archetype = randInt(0, 3);
      if (archetype === 0 || diffNorm === "easy") {
        // Classic 2 intersecting diagonal lines with distinct slopes
        const slope1_a = randInt(1, 3);
        const slope1_b = randInt(1, 2);
        let slope2_a = randInt(1, 2);
        let slope2_b = randInt(2, 4);
        if (slope1_a * slope2_b === slope1_b * slope2_a) slope2_b += 1;
        const rhs1 = slope1_a * x1T + slope1_b * x2T;
        const rhs2 = slope2_a * x1T + slope2_b * x2T;
        constraints = [
          { a: [slope1_a, slope1_b], op: "<=", b: rhs1 },
          { a: [slope2_a, slope2_b], op: "<=", b: rhs2 },
        ];
      } else if (archetype === 1) {
        // Box limits (x1 <= M1, x2 <= M2) + assembly diagonal (a1 x1 + a2 x2 <= B)
        const capX1 = x1T + randInt(1, 3);
        const capX2 = x2T + randInt(2, 4);
        const diagA = randInt(1, 2);
        const diagB = randInt(1, 2);
        const diagRhs = diagA * x1T + diagB * x2T;
        constraints = [
          { a: [1, 0], op: "<=", b: capX1 },
          { a: [0, 1], op: "<=", b: capX2 },
          { a: [diagA, diagB], op: "<=", b: diagRhs },
        ];
      } else if (archetype === 2) {
        // 3 intersecting diagonals producing a 5-vertex polygon (Pentagon)
        const s1_a = randInt(1, 3), s1_b = randInt(1, 2);
        let s2_a = randInt(1, 2), s2_b = randInt(2, 4);
        if (s1_a * s2_b === s1_b * s2_a) s2_b += 1;
        const r1 = s1_a * x1T + s1_b * x2T;
        const r2 = s2_a * x1T + s2_b * x2T;
        const r3 = x1T + x2T + randInt(2, 5);
        constraints = [
          { a: [s1_a, s1_b], op: "<=", b: r1 },
          { a: [s2_a, s2_b], op: "<=", b: r2 },
          { a: [1, 1], op: "<=", b: r3 },
        ];
      } else {
        // Asymmetric cuts with a vertical machine capacity limit
        const capX1 = x1T + randInt(2, 4);
        const s1_a = randInt(2, 4), s1_b = 1;
        const s2_a = 1, s2_b = randInt(2, 4);
        const r1 = s1_a * x1T + s1_b * x2T;
        const r2 = s2_a * x1T + s2_b * x2T;
        constraints = [
          { a: [s1_a, s1_b], op: "<=", b: r1 },
          { a: [s2_a, s2_b], op: "<=", b: r2 },
          { a: [1, 0], op: "<=", b: capX1 },
        ];
      }
    } else if (chKey === "ch4") {
      const rhsGe = Math.max(3, Math.floor(b1 / 2));
      constraints = [
        { a: [a11, a12], op: ">=", b: rhsGe },
        { a: [a21, a22], op: diffNorm === "hard" ? "=" : "<=", b: b2 },
      ];
      if (diffNorm !== "easy") {
        constraints.push({ a: [1, 1], op: "<=", b: x1T + x2T + 2 });
      }
    } else if (diffNorm === "easy") {
      constraints = [
        { a: [a11, a12], op: "<=", b: b1 },
        { a: [a21, a22], op: "<=", b: b2 },
      ];
    } else {
      constraints = [
        { a: [a11, a12], op: "<=", b: b1 },
        { a: [a21, a22], op: "<=", b: b2 },
        { a: [1, 0], op: "<=", b: b3 },
      ];
    }

    const lpData = { type: "max", c: [c1, c2], constraints };
    const solved = window.ORSolvers.solveSimplex(lpData);
    const tf = solved.toFrac;

    const sysLines = constraints
      .map((con, idx) => {
        const lhs = `${con.a[0] === 1 ? "" : con.a[0]}x_1 ${
          con.a[1] === 0 ? "" : `+ ${con.a[1] === 1 ? "" : con.a[1]}x_2`
        }`.trim();
        return `${lhs} ${con.op} ${con.b} & \\text{(Constraint ${idx + 1})}`;
      })
      .join(" \\\\ ");

    const chapterTitles = {
      ch1: "Chapter 1: 2D Graphical Method & Corner Points",
      ch2: "Chapter 2: Standard Form, Slack Variables & Algebraic Simplex",
      ch3: "Chapter 3: Simplex Method in Tableaux",
      ch4: "Chapter 4: Big-M Method & Artificial Variables",
      ch5: "Chapter 5: Duality Theory & Complementary Slackness",
      ch6: "Chapter 6: Post-Optimal / Sensitivity Analysis",
      exam_full: "Full Exam Master Problem (Simplex + Duality + Sensitivity)",
    };

    let questionsBlock = "";
    let hintBlock = "";

    if (chKey === "ch1") {
      questionsBlock = `1. Find the **axis intercepts** $(0, x_2)$ and $(x_1, 0)$ for each constraint line and sketch the **Feasible Region**.
2. Solve the $2\\times 2$ equation system to find the exact coordinates of every corner point (vertex) of the feasible polygon.
3. Build the **Corner-Point Evaluation Table** (and show the direction of the Parallel Iso-Profit line) to determine the optimal solution $(x_1^*, x_2^*)$ and maximum profit $Z^*$.`;
      hintBlock = `- For each line $a_1 x_1 + a_2 x_2 = b$, set $x_1 = 0 \\implies x_2 = b/a_2$ and $x_2 = 0 \\implies x_1 = b/a_1$.
- Solve the intersection of Constraint 1 and Constraint 2 algebraically, then evaluate $Z = ${c1}x_1 + ${c2}x_2$ at every feasible corner!`;
    } else if (chKey === "ch2") {
      questionsBlock = `1. Convert the Linear Program into **Standard Form** by introducing slack variables $e_i \\ge 0$, and state the initial Basic Variables (v.b.) and Non-Basic Variables (v.h.b.).
2. Using the **Algebraic / Dictionary Simplex Method**, determine the first **entering variable ($x_e$)** and **leaving variable ($x_s$)** via the Minimum Ratio Test.
3. Perform the algebraic substitutions step-by-step until all coefficients in $Z$ are $\\le 0$, and state $(x_1^*, x_2^*)$ and $Z^*$.`;
      hintBlock = `- Isolate each slack variable: $e_i = b_i - a_{i1}x_1 - a_{i2}x_2$.
- Pick the variable with the largest positive coefficient in $Z$ to enter, and the row with the smallest positive ratio $b_i / a_{ie}$ to leave!`;
    } else if (chKey === "ch3") {
      questionsBlock = `1. Put the problem in Standard Form and construct the **Initial Simplex Tableau (Tableau 0)**.
2. Solve the problem completely using **Simplex Tableaux**: at each iteration, clearly indicate the **entering variable ($x_e$)**, the **minimum ratio test ($b_i / a_{ie}$)**, the **leaving variable ($x_s$)**, the **pivot element**, and the **Gauss-Jordan row operations** ($R_p' = R_p / p$ and $R_i' = R_i - a_{ie} R_p'$).
3. Read the optimal primal solution $(x_1^*, x_2^*, e_i^*)$ and optimal objective value $Z^*$ from the final tableau.`;
      hintBlock = `- In each tableau, pick the column with the largest positive $c_j - z_j > 0$ to enter.
- Divide the pivot row by the pivot $p$ first, then eliminate the pivot column in all other rows using $R_i' \\leftarrow R_i - a_{ie} R_p'$!`;
    } else if (chKey === "ch4") {
      questionsBlock = `1. Convert the problem into **Big-M Standard Form** by adding slack ($+e_i$), surplus ($-e_i$), and artificial ($+a_i$) variables, and write the penalized objective function $Z_M$ with $-M a_i$.
2. Compute the initial **$z_j$ and $c_j - z_j$ row in terms of $M$** in Tableau 0.
3. Execute the **Big-M Simplex Tableaux** step-by-step until all artificial variables leave the basis and optimality is reached. State $(x_1^*, x_2^*)$ and $Z^*$.`;
      hintBlock = `- Remember: for a $\\ge$ constraint, subtract surplus $-e_i$ AND add artificial $+a_i$ with objective coefficient $-M$.
- In Tableau 0, compute $z_j = \\sum c_{B_i} a_{ij}$ first so the $+M$ multiples appear in $c_j - z_j$, and pick the largest positive $+M$ coefficient to enter!`;
    } else if (chKey === "ch5") {
      questionsBlock = `1. Write the **Dual Problem $(D)$** associated with this Primal LP (specify the dual objective $W$, dual constraints, and signs of $y_i$).
2. Given (or after finding via Simplex) that the optimal Primal solution is **$x^* = (${tf(
        solved.solution.x_1
      )},\\; ${tf(solved.solution.x_2)})$** with **$Z^* = ${solved.optimalZFrac}$**, use **Complementary Slackness (les conditions d'écarts complémentaires)** to deduce the exact optimal Dual solution **$y^* = (${constraints
        .map((_, i) => `y_${i + 1}^*`)
        .join(", ")})** *without solving the Dual by Simplex*!
3. Verify the **Strong Duality Theorem ($Z^* = W^*$)**.`;
      hintBlock = `- **Rule A ($e_i^* \\cdot y_i^* = 0$):** Plug $x^* = (${tf(solved.solution.x_1)}, ${tf(
        solved.solution.x_2
      )})$ into each Primal constraint. Any constraint with slack $e_i^* > 0$ immediately forces $y_i^* = 0$!
- **Rule B ($x_j^* \\cdot \\omega_j^* = 0$):** Since $x_1^* > 0$ and $x_2^* > 0$, the corresponding Dual constraints become strict equalities ($=$)!`;
    } else if (chKey === "ch6") {
      questionsBlock = `1. Solve the Linear Program using **Simplex Tableaux** from Tableau 0 to the Final Optimal Tableau.
2. **Sensitivity of Objective Coefficient $c_1$:** Using the final Simplex tableau, find the exact stability interval **$c_1' = ${c1} + \\delta \\in [c_1^{\\min},\\; c_1^{\\max}]$** for which the current optimal basis remains unchanged.
3. **Sensitivity of Resource Capacity $b_1$ & Shadow Price:** Using the final Simplex tableau, find the feasibility interval **$b_1' = ${
        constraints[0].b
      } + \\Delta \\in [b_1^{\\min},\\; b_1^{\\max}]$** and state the **Shadow Price $y_1^*$** of Resource 1.`;
      hintBlock = `- **For $c_1' = ${c1} + \\delta$:** Look across the row of basic variable $x_1$ at the non-basic columns $j$, and solve $(c_j - z_j)_{\\text{old}} - \\delta \\cdot a_{x_1, j} \\le 0$.
- **For $b_1' = ${constraints[0].b} + \\Delta$:** Look down the Slack Column $e_1$ and solve $\\text{RHS}_{\\text{old}} + \\Delta \\cdot (\\text{Col } e_1) \\ge 0$!`;
    } else {
      questionsBlock = `1. Solve the Primal problem using the **Simplex Tableau Method** (show all intermediate tableaux and row operations).
2. **Sensitivity Analysis:** Determine the optimality range of **$c_1$** and **$c_2$**, and the feasibility range of **$b_1$** along with all **Shadow Prices $y_i^*$**.
3. **Duality & Complementary Slackness:** Write the **Dual Problem $(D)$** and verify the optimal Dual solution $y^*$ using **Complementary Slackness**!`;
      hintBlock = `- Follow the 3-part Université Oran 1 Exam workflow: (1) Simplex Tableaux $\\to$ (2) Sensitivity intervals from the final tableau $\\to$ (3) Dual construction & Complementary Slackness check!`;
    }

    const dualObjStr = (solved.dual?.dualObjTerms || [])
      .map((t) => `${t.coeff}${t.varName}`)
      .join(" + ");
    const dualConLines = (solved.dual?.dualConstraints || [])
      .map((dc, idx) => {
        const lhs = dc.coeffs
          .map((cVal, i) => (cVal === 0 ? null : `${cVal === 1 ? "" : cVal}y_${i + 1}`))
          .filter(Boolean)
          .join(" + ");
        return `  - $(D_${idx + 1}): \\; ${lhs} ${dc.op} ${dc.rhs} \\quad (\\text{for primal } ${dc.primalVar})$`;
      })
      .join("\n");
    const dualSignsStr = (solved.dual?.dualSignRules || []).join(",\\; ");

    const dualBlockMd = `#### Dual Problem $(D)$ & Complementary Slackness Verification
- **Dual Objective:** $\\min W = ${dualObjStr}$
- **Dual Constraints & Variable Signs (${dualSignsStr}):**
${dualConLines}
- **Optimal Dual Shadow Prices ($y^*$):** ${solved.sensitivity.bRanges
      .map((br) => `$y_${br.constraintIdx}^* = \\mathbf{${br.shadowPrice}}$`)
      .join(", ")} (with $W^* = Z^* = \\mathbf{${solved.optimalZFrac}}$).`;

    const sensBlockMd = `#### Post-Optimal Sensitivity Analysis (From Final Tableau)
- **Objective Coefficient Stability Ranges ($c_k' = c_k + \\delta$):**
${solved.sensitivity.cRanges
  .map(
    (cr) =>
      `  - **$${cr.varName}$** (currently $${cr.origC ?? cr.orig}$): stays optimal for **$${cr.varName}' \\in [${cr.minC},\\; ${cr.maxC}]$**`
  )
  .join("\n")}
- **Right-Hand Side Feasibility Ranges ($b_i' = b_i + \\Delta$) & Shadow Prices ($y_i^*$):**
${solved.sensitivity.bRanges
  .map(
    (br) =>
      `  - **Constraint ${br.constraintIdx} ($b_${br.constraintIdx} = ${br.origB}$):** Shadow Price **$y_${br.constraintIdx}^* = ${br.shadowPrice}$**, feasible for **$b_${br.constraintIdx}' \\in [${br.minB},\\; ${br.maxB}]$**`
  )
  .join("\n")}`;

    const problemMarkdown = `Consider the following Linear Program (**${chapterTitles[chKey] || "Operations Research"}** — **${diffBadge}**):
$$\\max Z = ${c1}x_1 + ${c2}x_2$$
$$\\text{subject to:} \\quad \\begin{cases} ${sysLines} \\\\ x_1, x_2 \\ge 0 \\end{cases}$$

**Questions to Solve on Your Paper:**
${questionsBlock}`;

    const fullSolutionMarkdown = `### Certified Step-by-Step Reference Solution (${solved.tableaux.length - 1} Simplex Pivots)
- **Optimal Primal Solution:** **$x_1^* = ${tf(solved.solution.x_1)}, \\quad x_2^* = ${tf(
      solved.solution.x_2
    )}$**
- **Optimal Objective Value:** **$Z^* = ${solved.optimalZFrac}$**

---

### Complete Step-by-Step Simplex Tableaux & Row Operations
${formatAllTableauxMd(solved)}

---

${dualBlockMd}

---

${sensBlockMd}`;

    const presetObj = {
      type: "max",
      optType: "max",
      c: [c1, c2],
      constraints: constraints.map((con) => ({
        a: [con.a[0], con.a[1]],
        a1: con.a[0],
        a2: con.a[1],
        op: con.op,
        b: con.b,
      })),
      A: constraints.map((con) => [con.a[0], con.a[1]]),
      b: constraints.map((con) => con.b),
      signs: constraints.map((con) => con.op),
    };

    return {
      genId,
      title: `${chapterTitles[chKey] || "OR Practice Challenge"} #${genId} (${diffBadge})`,
      chapterLabel: chapterTitles[chKey] || "Operations Research",
      difficultyBadge: diffBadge,
      solverType: chKey === "ch1" ? "graphical" : "simplex",
      presetData: presetObj,
      visualSolutionHtml: buildInlineVisualSolutionHtml("graphical", presetObj),
      problemMarkdown,
      hintMarkdown: hintBlock,
      summary: {
        chapter: chapterTitles[chKey] || chKey,
        difficulty: diffNorm,
        objective: `Max Z = ${c1}x_1 + ${c2}x_2`,
        constraints: constraints.map((con) => `${con.a[0]}x_1 + ${con.a[1]}x_2 ${con.op} ${con.b}`),
        optimalZ: solved.optimalZFrac,
        optimalSolution: solved.solution,
        cRanges: solved.sensitivity.cRanges,
        bRanges: solved.sensitivity.bRanges,
      },
      fullSolutionMarkdown,
    };
  }

  let ocrSelectedDifficulty = "medium";
  let ocrGeneratedChallenge = null;

  function renderOcrActiveChallenge(bundle, showFlash = false) {
    ocrGeneratedChallenge = bundle;
    customRenewedExo = bundle;
    const container = document.getElementById("ocrActiveChallengeContainer");
    if (!container || !bundle) return;

    if (ocrExerciseSelect) {
      ocrExerciseSelect.value = "ocr_generated";
    }

    container.innerHTML = `
      <div class="ocr-challenge-box" id="ocrChallengeBoxCard" style="${
        showFlash ? "box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.45); transition: box-shadow 0.4s ease;" : ""
      }">
        <div class="flex-between">
          <div class="action-bar">
            <span class="badge badge-emerald">🎲 CHALLENGE #${bundle.genId || 1} READY</span>
            <span class="badge badge-blue">${bundle.chapterLabel}</span>
            <span class="badge badge-amber">${bundle.difficultyBadge}</span>
          </div>
          <div class="action-bar">
            <button type="button" class="btn btn-ghost btn-sm" id="btnToggleOcrChalHint">
              💡 Show Method Hint
            </button>
            <button type="button" class="btn btn-ghost btn-sm" id="btnToggleOcrChalSol">
              👁️ Peek at Verified Solution &amp; Graph
            </button>
            ${
              bundle.solverType
                ? `<button type="button" class="btn btn-emerald btn-sm" id="btnOpenOcrChalSolver">
                     🧮 Open in Live Solver
                   </button>`
                : ""
            }
          </div>
        </div>

        <div class="markdown-body mt-075">${renderMdMath(bundle.problemMarkdown)}</div>

        <div class="analogy-box mt-075 hidden" id="ocrChalHintDrawer">
          <h4>💡 Step-by-Step Method Hint:</h4>
          <div class="markdown-body mt-025">${renderMdMath(bundle.hintMarkdown)}</div>
        </div>

        <div class="exo-solution-drawer mt-075 hidden" id="ocrChalSolDrawer">
          ${bundle.visualSolutionHtml || ""}
          <div class="markdown-body mt-075">${renderMdMath(bundle.fullSolutionMarkdown)}</div>
        </div>

        <div class="small muted mt-05">
          👉 <strong>Next Step:</strong> Solve the exercise above on a sheet of paper, then <strong>take/upload a photo of your solution in Step 2 below</strong> and click <strong>"Scan My Photo &amp; Grade My Solution Step-by-Step"</strong>!
        </div>
      </div>
    `;

    if (showFlash) {
      setTimeout(() => {
        const box = document.getElementById("ocrChallengeBoxCard");
        if (box) box.style.boxShadow = "";
      }, 650);
    }

    document.getElementById("btnToggleOcrChalHint")?.addEventListener("click", (e) => {
      const d = document.getElementById("ocrChalHintDrawer");
      if (d) {
        const isHidden = d.classList.toggle("hidden");
        e.currentTarget.textContent = isHidden ? "💡 Show Method Hint" : "🙈 Hide Hint";
      }
    });

    document.getElementById("btnToggleOcrChalSol")?.addEventListener("click", (e) => {
      const d = document.getElementById("ocrChalSolDrawer");
      if (d) {
        const isHidden = d.classList.toggle("hidden");
        e.currentTarget.textContent = isHidden ? "👁️ Peek at Verified Solution & Graph" : "🙈 Hide Solution & Graph";
      }
    });

    document.getElementById("btnOpenOcrChalSolver")?.addEventListener("click", () => {
      if (bundle.solverType && bundle.presetData) {
        loadPresetIntoSolver(bundle.solverType, bundle.presetData);
      }
    });

    typesetMath(container);
  }

  document.querySelectorAll("#ocrDiffPills .diff-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      document.querySelectorAll("#ocrDiffPills .diff-pill").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      ocrSelectedDifficulty = pill.dataset.diff;
      const chVal = document.getElementById("ocrGenChapterSelect")?.value || "ch3";
      renderOcrActiveChallenge(buildExactRenewMath(chVal, ocrSelectedDifficulty), true);
    });
  });

  document.getElementById("ocrGenChapterSelect")?.addEventListener("change", (e) => {
    renderOcrActiveChallenge(buildExactRenewMath(e.target.value, ocrSelectedDifficulty), true);
  });

  document.getElementById("btnOcrGenerateChallenge")?.addEventListener("click", (e) => {
    const btn = e.currentTarget;
    const chVal = document.getElementById("ocrGenChapterSelect")?.value || "ch3";
    const bundle = buildExactRenewMath(chVal, ocrSelectedDifficulty);
    renderOcrActiveChallenge(bundle, true);
    if (btn) {
      const origHtml = btn.innerHTML;
      btn.innerHTML = `✅ Exercise #${bundle.genId} Generated!`;
      setTimeout(() => {
        btn.innerHTML = origHtml;
      }, 900);
    }
  });

  try {
    renderOcrActiveChallenge(buildExactRenewMath("ch3", "medium"), false);
  } catch (initErr) {
    console.error("Initial OCR Challenge error:", initErr);
  }

  document.getElementById("btnGenerateRenewExo")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    const topic = document.getElementById("renewTopicSelect").value;
    const difficulty = document.getElementById("renewDifficultySelect").value;
    const language = document.getElementById("renewLangSelect").value;
    const out = document.getElementById("renewOutputContainer");

    const mathBundle = buildExactRenewMath(topic, difficulty);
    customRenewedExo = mathBundle;
    ocrGeneratedChallenge = mathBundle;

    if (btn) {
      btn.innerHTML = `✅ Exercise #${mathBundle.genId} Ready! Generating Direct Solution...`;
    }

    out.innerHTML = `
      <div class="card" style="box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.35);">
        <div class="flex-between">
          <div class="action-bar">
            <span class="badge badge-emerald">🎲 EXERCISE #${mathBundle.genId} GENERATED INSTANTLY</span>
            <span class="badge badge-purple">${mathBundle.chapterLabel}</span>
            <span class="badge badge-amber">${mathBundle.difficultyBadge}</span>
          </div>
          <div class="action-bar">
            ${
              mathBundle.solverType
                ? `<button class="btn btn-emerald btn-sm" id="btnOpenRenewSolverInit">
                     🧮 Open in Interactive Solver
                   </button>`
                : ""
            }
            <button class="btn btn-primary btn-sm" id="btnSendRenewOcrInit">
              📸 Solve &amp; Send Photo to AI OCR Corrector →
            </button>
          </div>
        </div>
        <div class="step-card mt-075">
          <h4>📋 Exact Mathematical Problem Statement:</h4>
          <div class="markdown-body mt-05">${renderMdMath(mathBundle.problemMarkdown)}</div>
        </div>
        <div class="exo-solution-drawer mt-1" style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.4);">
          <div class="flex-between mb-05">
            <h4 style="color: var(--color-success, #10b981); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
              <span>🎯</span> Direct Complete Mathematical Solution &amp; Steps:
            </h4>
            <span class="badge badge-emerald">100% Mathematically Verified</span>
          </div>
          ${mathBundle.visualSolutionHtml || ""}
          <div class="markdown-body mt-075">${renderMdMath(mathBundle.fullSolutionMarkdown)}</div>
        </div>
        <p class="small muted mt-05" id="renewAiLoadingNotice">⚡ <em>AI Professor is compiling direct method rules &amp; exam traps (~1s)...</em></p>
      </div>
    `;
    typesetMath(out);

    document.getElementById("btnOpenRenewSolverInit")?.addEventListener("click", () => {
      if (mathBundle.solverType) loadPresetIntoSolver(mathBundle.solverType, mathBundle.presetData);
    });
    document.getElementById("btnSendRenewOcrInit")?.addEventListener("click", () => {
      renderOcrActiveChallenge(mathBundle, true);
      ocrExerciseSelect.value = "ocr_generated";
      navigateToView("corrector");
    });

    try {
      const res = await fetch("/api/renew-exo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: mathBundle.chapterLabel,
          difficulty,
          language,
          mathData: mathBundle.summary,
        }),
      });
      const data = await res.json();

      out.innerHTML = `
        <div class="card">
          <div class="flex-between">
            <div class="action-bar">
              <span class="badge badge-emerald">🎲 EXERCISE #${mathBundle.genId}</span>
              <span class="badge badge-purple">${mathBundle.chapterLabel}</span>
              <span class="badge badge-amber">${mathBundle.difficultyBadge}</span>
              <span class="badge badge-blue">${data.model || "NVIDIA NIM"}</span>
            </div>
            <div class="action-bar">
              ${
                mathBundle.solverType
                  ? `<button class="btn btn-emerald btn-sm" id="btnOpenRenewSolver">
                       🧮 Open All Tableaux / Graph in Solver
                     </button>`
                  : ""
              }
              <button class="btn btn-primary btn-sm" id="btnSendRenewOcr">
                📸 Solve &amp; Send Photo to AI OCR Corrector →
              </button>
            </div>
          </div>

          <div class="step-card mt-075">
            <h4>📋 Exact Mathematical Problem Statement:</h4>
            <div class="markdown-body mt-05">${renderMdMath(mathBundle.problemMarkdown)}</div>
          </div>

          <div class="exo-solution-drawer mt-1" style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.4);">
            <div class="flex-between mb-05">
              <h4 style="color: var(--color-success, #10b981); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                <span>🎯</span> Direct Complete Mathematical Solution &amp; Steps:
              </h4>
              <span class="badge badge-emerald">100% Mathematically Verified</span>
            </div>
            ${mathBundle.visualSolutionHtml || ""}
            <div class="markdown-body mt-075">${renderMdMath(mathBundle.fullSolutionMarkdown)}</div>
          </div>

          ${
            data.aiContent
              ? `<div class="card mt-1" style="background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.3);">
                   <h4 style="color: #6366f1; margin: 0 0 0.5rem 0;">⚡ Professor's Direct Key Rules &amp; Exam Traps:</h4>
                   <div class="markdown-body">${renderMdMath(data.aiContent)}</div>
                 </div>`
              : ""
          }
        </div>
      `;

      const sBtn = document.getElementById("btnOpenRenewSolver");
      if (sBtn && mathBundle.solverType) {
        sBtn.addEventListener("click", () => {
          loadPresetIntoSolver(mathBundle.solverType, mathBundle.presetData);
        });
      }

      document.getElementById("btnSendRenewOcr")?.addEventListener("click", () => {
        renderOcrActiveChallenge(mathBundle, true);
        ocrExerciseSelect.value = "ocr_generated";
        navigateToView("corrector");
      });

      typesetMath(out);
    } catch (e) {
      const notice = document.getElementById("renewAiLoadingNotice");
      if (notice) notice.remove();
      console.error(e);
    } finally {
      if (btn) {
        btn.innerHTML = `🎲 Generate New Exercise &amp; Direct Solution`;
      }
    }
  });

  // --------------------------------------------------------------------------
  // VIEW 5: AI OCR CORRECTOR STUDIO
  // --------------------------------------------------------------------------
  const ocrModeBtns = document.querySelectorAll(".ocr-mode-btn");
  const ocrModeViews = document.querySelectorAll(".ocr-mode-view");

  ocrModeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeOcrMode = btn.dataset.ocrmode;
      ocrModeBtns.forEach((b) => b.classList.toggle("active", b === btn));
      ocrModeViews.forEach((v) => v.classList.toggle("active", v.id === `ocrmode-${activeOcrMode}`));
    });
  });

  const ocrDropzone = document.getElementById("ocrDropzone");
  const ocrFileInput = document.getElementById("ocrFileInput");
  const ocrCameraInput = document.getElementById("ocrCameraInput");
  const ocrPreviewWrap = document.getElementById("ocrPreviewWrap");
  const ocrDropzonePrompt = document.getElementById("ocrDropzonePrompt");
  const ocrImagePreview = document.getElementById("ocrImagePreview");

  function handleSelectedImageFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      uploadedImageDataUrl = ev.target.result;
      ocrImagePreview.src = uploadedImageDataUrl;
      ocrDropzonePrompt.classList.add("hidden");
      ocrPreviewWrap.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }

  document.getElementById("btnTriggerCamera")?.addEventListener("click", (e) => {
    e.stopPropagation();
    ocrCameraInput?.click();
  });

  document.getElementById("btnTriggerBrowse")?.addEventListener("click", (e) => {
    e.stopPropagation();
    ocrFileInput?.click();
  });

  document.getElementById("btnRetakeCamera")?.addEventListener("click", (e) => {
    e.stopPropagation();
    ocrFileInput?.click();
  });

  ocrDropzone.addEventListener("click", (e) => {
    if (
      e.target.id === "btnClearOcrImage" ||
      e.target.id === "btnTriggerCamera" ||
      e.target.id === "btnTriggerBrowse" ||
      e.target.id === "btnRetakeCamera"
    ) {
      return;
    }
    ocrFileInput.click();
  });
  ocrFileInput.addEventListener("change", (e) => {
    if (e.target.files?.[0]) handleSelectedImageFile(e.target.files[0]);
  });
  ocrCameraInput?.addEventListener("change", (e) => {
    if (e.target.files?.[0]) handleSelectedImageFile(e.target.files[0]);
  });
  ocrDropzone.addEventListener("dragover", (e) => e.preventDefault());
  ocrDropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleSelectedImageFile(e.dataTransfer.files[0]);
  });
  window.addEventListener("paste", (e) => {
    const items = e.clipboardData?.items || [];
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        handleSelectedImageFile(item.getAsFile());
        navigateToView("corrector");
        break;
      }
    }
  });

  document.getElementById("btnClearOcrImage").addEventListener("click", (e) => {
    e.stopPropagation();
    uploadedImageDataUrl = null;
    ocrFileInput.value = "";
    if (ocrCameraInput) ocrCameraInput.value = "";
    ocrPreviewWrap.classList.add("hidden");
    ocrDropzonePrompt.classList.remove("hidden");
  });

  // Whiteboard Canvas
  const sketchCanvas = document.getElementById("ocrSketchCanvas");
  const sCtx = sketchCanvas.getContext("2d");
  let isDrawing = false;
  let penColor = "#0f172a";
  let hasDrawnOnSketchpad = false;

  function clearSketchCanvas() {
    sCtx.fillStyle = "#ffffff";
    sCtx.fillRect(0, 0, sketchCanvas.width, sketchCanvas.height);
    sCtx.strokeStyle = "#e2e8f0";
    sCtx.lineWidth = 1;
    for (let y = 28; y < sketchCanvas.height; y += 28) {
      sCtx.beginPath();
      sCtx.moveTo(0, y);
      sCtx.lineTo(sketchCanvas.width, y);
      sCtx.stroke();
    }
    hasDrawnOnSketchpad = false;
  }
  clearSketchCanvas();

  function getPos(e) {
    const rect = sketchCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * sketchCanvas.width,
      y: ((clientY - rect.top) / rect.height) * sketchCanvas.height,
    };
  }

  sketchCanvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    hasDrawnOnSketchpad = true;
    const p = getPos(e);
    sCtx.beginPath();
    sCtx.moveTo(p.x, p.y);
  });
  sketchCanvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    const p = getPos(e);
    sCtx.strokeStyle = penColor;
    sCtx.lineWidth = 2.4;
    sCtx.lineCap = "round";
    sCtx.lineTo(p.x, p.y);
    sCtx.stroke();
  });
  window.addEventListener("mouseup", () => (isDrawing = false));

  const setPen = (btnId, col) => {
    document.getElementById(btnId).addEventListener("click", () => {
      penColor = col;
      document.querySelectorAll(".color-dot").forEach((d) => d.classList.remove("active"));
      document.getElementById(btnId).classList.add("active");
    });
  };
  setPen("btnSketchPen", "#0f172a");
  setPen("btnSketchBlue", "#2563eb");
  setPen("btnSketchRed", "#dc2626");
  document.getElementById("btnSketchClear").addEventListener("click", clearSketchCanvas);

  function drawDemoStudentSolution() {
    clearSketchCanvas();
    hasDrawnOnSketchpad = true;

    if (ocrGeneratedChallenge && ocrGeneratedChallenge.summary && ocrGeneratedChallenge.summary.objective) {
      ocrExerciseSelect.value = "ocr_generated";
      const s = ocrGeneratedChallenge.summary;
      sCtx.fillStyle = "#1e3a8a";
      sCtx.font = "bold 14.5px 'JetBrains Mono', monospace";
      sCtx.fillText(`Handwritten Attempt — ${s.chapter} (${s.difficulty.toUpperCase()})`, 16, 26);

      sCtx.font = "13px 'JetBrains Mono', monospace";
      sCtx.fillStyle = "#0f172a";
      sCtx.fillText(`Objective : ${s.objective}`, 16, 54);
      (s.constraints || []).forEach((cStr, idx) => {
        sCtx.fillText(`Constraint (${idx + 1}) : ${cStr}   --> Slack e_${idx + 1} >= 0`, 16, 82 + idx * 26);
      });
      const yNext = 88 + (s.constraints?.length || 2) * 26;
      sCtx.fillStyle = "#2563eb";
      sCtx.fillText(
        `Simplex Pivots -> Found x1* = ${s.optimalSolution?.x_1 ?? 2}, x2* = ${s.optimalSolution?.x_2 ?? 3}`,
        16,
        yNext
      );
      sCtx.fillStyle = "#dc2626";
      sCtx.fillText(`Calculated Z* = ${s.optimalZ} (please check my intermediate tableau & signs!)`, 16, yNext + 28);
      return;
    }

    ocrExerciseSelect.value = "exam-ex1";
    sCtx.fillStyle = "#1e3a8a";
    sCtx.font = "bold 15px 'JetBrains Mono', monospace";
    sCtx.fillText("Student Solution - Final Exam Ex 1 : Max Z = 3x1 + 2x2", 16, 24);

    sCtx.font = "13.5px 'JetBrains Mono', monospace";
    sCtx.fillStyle = "#0f172a";
    sCtx.fillText("1) Standard Form : x1 + e1 = 4 ; 2x2 + e2 = 12 ; 3x1 + 2x2 + e3 = 18", 16, 52);
    sCtx.fillText("2) Tableau 0 : x1 enters (c1=3), e1 leaves (ratio 4/1 = 4).", 16, 80);
    sCtx.fillText("   Tableau 1 : R1' : x1 + e1 = 4", 16, 108);
    sCtx.fillText("               R2' : 2x2 + e2 = 12", 16, 136);
    sCtx.fillStyle = "#dc2626";
    sCtx.fillText("               R3' : 2x2 - 3e1 + e3 = 10   <-- (18 - 3*4 = 10 ?)", 16, 164);
    sCtx.fillStyle = "#0f172a";
    sCtx.fillText("   Then x2 = 5, x1 = 4  =>  Z* = 3(4) + 2(5) = 22", 16, 192);
    sCtx.fillText("4) Dual (D) : Min W = 4y1 + 12y2 + 18y3", 16, 248);
    sCtx.fillText("   s.t.  y1 + 3y3 >= 3  ;  2y2 + 2y3 >= 2  ;  y1, y2, y3 >= 0", 16, 276);
  }

  document.getElementById("btnSketchSample").addEventListener("click", drawDemoStudentSolution);
  document.getElementById("btnFillSampleSolution").addEventListener("click", () => {
    document.querySelector(".ocr-mode-btn[data-ocrmode='draw']").click();
    drawDemoStudentSolution();
    document.getElementById("ocrStudentText").value =
      "Here is my handwritten solution for the active exercise. Please check every step, my pivots, and my final answer!";
  });

  document.getElementById("btnRunOcrCorrector").addEventListener("click", async () => {
    const resultPane = document.getElementById("ocrResultPane");
    const selectedExId = ocrExerciseSelect.value;
    const studentText = document.getElementById("ocrStudentText").value;

    let imageToSend = null;
    if (activeOcrMode === "upload" && uploadedImageDataUrl) {
      imageToSend = uploadedImageDataUrl;
    } else if (activeOcrMode === "draw" && hasDrawnOnSketchpad) {
      imageToSend = sketchCanvas.toDataURL("image/png");
    } else if (uploadedImageDataUrl) {
      imageToSend = uploadedImageDataUrl;
    }

    if (!imageToSend && !studentText.trim()) {
      document.querySelector(".ocr-mode-btn[data-ocrmode='draw']").click();
      drawDemoStudentSolution();
      imageToSend = sketchCanvas.toDataURL("image/png");
    }

    let exerciseTitle = "Operations Research Exercise";
    let exerciseStatement = "";
    let referenceSolution = "";
    let visualComparisonHtml = "";

    if ((selectedExId === "ocr_generated" || selectedExId === "renewed") && (ocrGeneratedChallenge || customRenewedExo)) {
      const activeBundle = ocrGeneratedChallenge || customRenewedExo;
      exerciseTitle = activeBundle.title || "AI Generated Chapter Exercise";
      exerciseStatement = activeBundle.problemMarkdown || JSON.stringify(activeBundle.summary);
      referenceSolution = activeBundle.fullSolutionMarkdown || "";
      visualComparisonHtml = activeBundle.visualSolutionHtml || "";
    } else if (selectedExId !== "auto") {
      const found = window.OR_EXERCISES.find((e) => e.id === selectedExId);
      if (found) {
        exerciseTitle = `${found.badge} — ${found.title}`;
        exerciseStatement = found.statement;
        referenceSolution = found.solution;
        if (found.solverPreset) {
          visualComparisonHtml = buildInlineVisualSolutionHtml(found.solverPreset.solverType, found.solverPreset.data);
        }
      }
    }

    resultPane.innerHTML = `
      <div class="empty-report">
        <div class="empty-report-icon">🔍</div>
        <h3>Scanning Your Photo &amp; Grading Step-by-Step...</h3>
        <p class="muted"><strong>NVIDIA Nemotron 3.5 Super VL 120B</strong> is transcribing your handwritten math and comparing every step against the certified solution...</p>
      </div>
    `;

    try {
      const res = await fetch("/api/ocr-corrector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageToSend,
          studentText,
          exerciseTitle,
          exerciseStatement,
          referenceSolution,
          language: "en",
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        resultPane.innerHTML = `<div class="trap-item">Error: ${data.error}</div>`;
        return;
      }

      resultPane.innerHTML = `
        <div class="flex-between">
          <div class="action-bar">
            <span class="badge badge-emerald">✅ Vision OCR Grading Report</span>
            <span class="badge badge-blue">${data.model}</span>
          </div>
          <button type="button" class="btn btn-primary btn-sm" id="btnNextChallengeAfterGrade">
            🎲 Generate Next Exercise →
          </button>
        </div>
        <div class="markdown-body mt-1">${renderMdMath(data.evaluation)}</div>
        ${
          referenceSolution || visualComparisonHtml
            ? `
          <div class="exo-solution-drawer mt-1">
            <h4>📖 Certified Step-by-Step Reference Solution &amp; Visual Graph (Comparison Key):</h4>
            ${visualComparisonHtml}
            <div class="markdown-body mt-05">${renderMdMath(referenceSolution)}</div>
          </div>
        `
            : ""
        }
      `;

      document.getElementById("btnNextChallengeAfterGrade")?.addEventListener("click", () => {
        const chVal = document.getElementById("ocrGenChapterSelect")?.value || "ch3";
        renderOcrActiveChallenge(buildExactRenewMath(chVal, ocrSelectedDifficulty));
        document.getElementById("mainStage")?.scrollTo({ top: 0, behavior: "smooth" });
      });

      typesetMath(resultPane);
    } catch (err) {
      resultPane.innerHTML = `<div class="trap-item">Network Error: ${err.message}</div>`;
    }
  });

  // --------------------------------------------------------------------------
  // VIEW 6 & SLIDE-OVER DRAWER: AI TEACHER CHAT (WITH INLINE 2D GRAPH / TREE)
  // --------------------------------------------------------------------------
  const teacherChatMessages = document.getElementById("teacherChatMessages");
  const drawerChatMessages = document.getElementById("drawerChatMessages");

  function parse2DLinearProgramFromText(text) {
    if (!text || typeof text !== "string") return null;

    // 1. Normalize LaTeX and math characters
    let clean = text
      .replace(/\\(le|leq)\b/g, "<=")
      .replace(/\\(ge|geq)\b/g, ">=")
      .replace(/\\(max|min)\b/gi, (m) => m.slice(1).toLowerCase())
      .replace(/\\cdot/g, "*")
      .replace(/\\times/g, "*")
      .replace(/[{}]/g, " ")
      .replace(/\\text\s*\{[^}]*\}/g, " ")
      .replace(/\\quad/g, " ")
      .replace(/\\;/g, " ")
      .replace(/\\,/g, " ")
      .replace(/\\\\/g, "\n")
      .replace(/&/g, " ")
      .replace(/\$/g, " ");

    // 2. Parse Objective function (e.g. Max Z = 5x1 + 4x2 or Min F = 3x_1 - 2x_2)
    const objRegex = /(max|min)\s*(?:imize|imiser)?\s*(?:[A-Za-z0-9_()]+)?\s*[:=]\s*([+-]?\s*\d*\.?\d*)\s*\*?\s*x_?1\s*([+-]\s*\d*\.?\d*)\s*\*?\s*x_?2/i;
    const objMatch = clean.match(objRegex);
    if (!objMatch) return null;

    const parseCoeff = (str, defaultVal = 1) => {
      if (!str) return defaultVal;
      const s = str.replace(/\s+/g, "");
      if (s === "" || s === "+") return 1;
      if (s === "-") return -1;
      const n = Number(s);
      return isNaN(n) ? defaultVal : n;
    };

    const optType = objMatch[1].toLowerCase();
    const c1 = parseCoeff(objMatch[2], 1);
    const c2 = parseCoeff(objMatch[3], 1);

    // 3. Constraints must be extracted from the text after the objective statement
    const objIdx = clean.indexOf(objMatch[0]);
    const constraintSection = clean.slice(objIdx + objMatch[0].length);

    const constraints = [];
    const linePattern = /([^\n,;]+?)\s*(<=|>=|<|>|=)\s*([+-]?\s*\d+\.?\d*)/g;
    let match;
    while ((match = linePattern.exec(constraintSection)) !== null) {
      let lhs = match[1].trim();
      lhs = lhs.replace(/\b(subject to|s\.t\.|such that|sous contraintes|contraintes|with)\b/gi, "").trim();
      const op = match[2] === "<" ? "<=" : match[2] === ">" ? ">=" : match[2];
      const b = Number(match[3].replace(/\s+/g, ""));

      if (!/x_?[12]/i.test(lhs)) continue;

      // Skip non-negativity trivial constraints like x1 >= 0 or x2 >= 0
      if (b === 0 && (op === ">=" || op === ">") && !/x_?1.*x_?2|x_?2.*x_?1/i.test(lhs)) {
        continue;
      }

      let a1 = 0;
      const x1Match = lhs.match(/([+-]?\s*\d*\.?\d*)\s*\*?\s*x_?1/i);
      if (x1Match) {
        a1 = parseCoeff(x1Match[1], 1);
      }

      let a2 = 0;
      const x2Match = lhs.match(/([+-]?\s*\d*\.?\d*)\s*\*?\s*x_?2/i);
      if (x2Match) {
        a2 = parseCoeff(x2Match[1], 1);
      }

      if (a1 === 0 && a2 === 0) continue;
      if (isNaN(b)) continue;

      const isDup = constraints.some(
        (c) => Math.abs(c.a1 - a1) < 1e-6 && Math.abs(c.a2 - a2) < 1e-6 && Math.abs(c.b - b) < 1e-6 && c.op === op
      );
      if (!isDup) {
        constraints.push({ a1, a2, op, b, label: `C${constraints.length + 1}` });
      }
    }

    if (constraints.length < 2) return null;

    return {
      type: optType,
      c: [c1, c2],
      constraints,
    };
  }

  function parseLpOrGetActiveVisualForChat(userText = "", aiReply = "") {
    const combined = `${userText}\n${aiReply}`;

    // 1. If user explicitly asks for a NEW / DIFFERENT / ANOTHER / RANDOM example or graph, generate a fresh one!
    const wantsNewExample = /\b(another|different|new|change|random|next|renew)\b/i.test(userText) &&
      /\b(graph|graphical|example|plot|exo|problem)\b/i.test(userText);
    if (wantsNewExample) {
      const freshBundle = buildExactRenewMath("ch1", "medium");
      ocrGeneratedChallenge = freshBundle;
      customRenewedExo = freshBundle;
      return freshBundle.visualSolutionHtml;
    }

    // 2. Try parsing an explicit 2D LP from text (e.g. from user question or AI response)
    const parsedLp = parse2DLinearProgramFromText(combined);
    if (parsedLp) {
      return buildInlineVisualSolutionHtml("graphical", parsedLp);
    }

    // 3. If user/reply mentions graphical method, plotting, corner points, feasible region, or B&B tree
    const wantsVisual = /\b(graph|graphical|plot|corner|vertex|vertices|iso-profit|feasible region|polygon|branch-and-bound|knapsack tree|draw)\b/i.test(
      userText
    );
    if (wantsVisual) {
      if (/\b(knapsack|branch|tree)\b/i.test(userText)) {
        return buildInlineVisualSolutionHtml("knapsack", knapsackState);
      }
      // If we have an active challenge that matches 2D graphical, use it; otherwise generate a fresh distinct 2D LP!
      if (ocrGeneratedChallenge && ocrGeneratedChallenge.visualSolutionHtml && ocrGeneratedChallenge.solverType === "graphical") {
        return ocrGeneratedChallenge.visualSolutionHtml;
      }
      const freshBundle = buildExactRenewMath("ch1", "medium");
      ocrGeneratedChallenge = freshBundle;
      customRenewedExo = freshBundle;
      return freshBundle.visualSolutionHtml;
    }

    return "";
  }

  function appendChatBubble(container, role, content, modelName = "", extraVisualHtml = "") {
    const div = document.createElement("div");
    div.className = `chat-msg ${role}`;
    const sender =
      role === "assistant"
        ? `👨‍🏫 Prof. OR ${modelName ? `<span class="badge badge-blue">${modelName}</span>` : ""}`
        : `🧑‍🎓 You`;

    div.innerHTML = `
      <div class="msg-sender">${sender}</div>
      <div class="msg-bubble markdown-body">
        ${renderMdMath(content)}
        ${extraVisualHtml ? `<div class="mt-075">${extraVisualHtml}</div>` : ""}
      </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    typesetMath(div);
    return div;
  }

  async function sendQuestionToTeacher(text, targetContainer) {
    if (!text.trim()) return;
    appendChatBubble(targetContainer, "user", text);
    const loading = appendChatBubble(targetContainer, "assistant", "⏳ *Prof. OR is writing a detailed explanation...*");
    const language = document.getElementById("teacherLangSelect")?.value || "en";

    try {
      const res = await fetch("/api/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatHistory,
          language,
        }),
      });
      const data = await res.json();
      loading.remove();

      if (data.ok) {
        chatHistory.push({ role: "user", content: text });
        chatHistory.push({ role: "assistant", content: data.reply });
        const inlineGraphHtml = parseLpOrGetActiveVisualForChat(text, data.reply);
        appendChatBubble(targetContainer, "assistant", data.reply, data.model, inlineGraphHtml);
      } else {
        appendChatBubble(targetContainer, "assistant", `⚠️ Error: ${data.error}`);
      }
    } catch (err) {
      loading.remove();
      appendChatBubble(targetContainer, "assistant", `⚠️ Error: ${err.message}`);
    }
  }

  document.getElementById("btnPlotGraphInChat")?.addEventListener("click", () => {
    // Generate a BRAND NEW distinct 2D graphical LP with fresh numbers and polygon every time!
    const freshBundle = buildExactRenewMath("ch1", "medium");
    ocrGeneratedChallenge = freshBundle;
    customRenewedExo = freshBundle;
    appendChatBubble(
      teacherChatMessages,
      "assistant",
      `Here is a **brand-new 2D Graphical Linear Program (${freshBundle.title})** with its complete Feasible Region polygon $\\mathcal{D}$, corner vertices table, and optimal Iso-Profit line $\\Delta_{Z^*}$:\n\n${freshBundle.problemMarkdown}`,
      "Dynamic 2D Graph Engine",
      freshBundle.visualSolutionHtml
    );
  });

  document.getElementById("teacherChatForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const inp = document.getElementById("teacherChatInput");
    const txt = inp.value;
    inp.value = "";
    sendQuestionToTeacher(txt, teacherChatMessages);
  });

  document.getElementById("teacherChatInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      document.getElementById("teacherChatForm").dispatchEvent(new Event("submit"));
    }
  });

  document.getElementById("drawerChatForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const inp = document.getElementById("drawerChatInput");
    const txt = inp.value;
    inp.value = "";
    sendQuestionToTeacher(txt, drawerChatMessages);
  });

  document.querySelectorAll(".prompt-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      sendQuestionToTeacher(chip.dataset.prompt, teacherChatMessages);
    });
  });

  document.getElementById("btnClearChat").addEventListener("click", () => {
    chatHistory = [];
    teacherChatMessages.innerHTML = "";
    appendChatBubble(teacherChatMessages, "assistant", "Chat cleared! Which chapter, TD, or exam question would you like to work on?");
  });

  // --------------------------------------------------------------------------
  // API MODAL
  // --------------------------------------------------------------------------
  const apiModalBackdrop = document.getElementById("apiModalBackdrop");
  document.getElementById("btnOpenApiModal").addEventListener("click", () => {
    apiModalBackdrop.classList.remove("hidden");
  });
  document.getElementById("btnCloseApiModal").addEventListener("click", () => {
    apiModalBackdrop.classList.add("hidden");
  });
  document.getElementById("btnSaveApiKey").addEventListener("click", async () => {
    const keyVal = document.getElementById("apiKeyInput").value.trim();
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: keyVal }),
    }).then((r) => r.json());
    if (res.ok) {
      document.getElementById("nimStatusText").textContent = `Key ${res.maskedKey}`;
      apiModalBackdrop.classList.add("hidden");
    } else {
      alert(res.error);
    }
  });

  // Initial full-page KaTeX pass
  typesetMath(document.body);
});
