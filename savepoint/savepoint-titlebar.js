// SAVE_POINT.EXE — retro pixel title bar for the Pake wrapper.
// Draws everything as inline SVG pixels (no web fonts, no images), so the
// page's content policy can't block it and it stays crisp at any DPI.
// Follows save point's own light/dark theme: a tiny reporter running inside
// the dashboard's frame (savepoint-theme-reporter.js) posts which theme is
// showing, and the bar re-skins to match.
(function () {
  if (window.top !== window) return;
  const BAR = 30; // px

  const THEMES = {
    // day: matches save point's cream + ink departures strip
    light: {
      bg: "#2b2a25", hi: "#4e4536", lo: "#1a1915",
      text: "#faf6eb", shadow: "#1a1915", accent: "#ef7fb6",
      btn: "#faf6eb", btnHi: "#ffffff", btnLo: "#dcdacb", btnInk: "#1a1915",
      btnHover: "#ffd3e8", closeHover: "#ef7fb6",
      stripe: "#4e4536", glow: "none", page: "#faf6eb",
    },
    // night: matches save point's navy + neon pink/cyan
    dark: {
      bg: "#0f0e30", hi: "#2a2a5e", lo: "#070824",
      text: "#f1ecff", shadow: "#a01e66", accent: "#00e491",
      btn: "#13102d", btnHi: "#30bddb", btnLo: "#070824", btnInk: "#d3cfea",
      btnHover: "#22205a", closeHover: "#ff4fa8",
      stripe: "#2a2a5e", glow: "0 0 3px rgba(255,79,168,.6)", page: "#080e32",
    },
  };

  // 5x7 bitmap glyphs, one string per row.
  const FONT = {
    A: ["01110","10001","10001","11111","10001","10001","10001"],
    B: ["11110","10001","10001","11110","10001","10001","11110"],
    C: ["01111","10000","10000","10000","10000","10000","01111"],
    D: ["11110","10001","10001","10001","10001","10001","11110"],
    E: ["11111","10000","10000","11110","10000","10000","11111"],
    F: ["11111","10000","10000","11110","10000","10000","10000"],
    G: ["01111","10000","10000","10011","10001","10001","01111"],
    H: ["10001","10001","10001","11111","10001","10001","10001"],
    I: ["11111","00100","00100","00100","00100","00100","11111"],
    J: ["00111","00010","00010","00010","00010","10010","01100"],
    K: ["10001","10010","10100","11000","10100","10010","10001"],
    L: ["10000","10000","10000","10000","10000","10000","11111"],
    M: ["10001","11011","10101","10101","10001","10001","10001"],
    N: ["10001","11001","10101","10011","10001","10001","10001"],
    O: ["01110","10001","10001","10001","10001","10001","01110"],
    P: ["11110","10001","10001","11110","10000","10000","10000"],
    Q: ["01110","10001","10001","10001","10101","10010","01101"],
    R: ["11110","10001","10001","11110","10100","10010","10001"],
    S: ["01111","10000","10000","01110","00001","00001","11110"],
    T: ["11111","00100","00100","00100","00100","00100","00100"],
    U: ["10001","10001","10001","10001","10001","10001","01110"],
    V: ["10001","10001","10001","10001","10001","01010","00100"],
    W: ["10001","10001","10001","10101","10101","10101","01010"],
    X: ["10001","10001","01010","00100","01010","10001","10001"],
    Y: ["10001","10001","01010","00100","00100","00100","00100"],
    Z: ["11111","00001","00010","00100","01000","10000","11111"],
    _: ["00000","00000","00000","00000","00000","00000","11111"],
    "1": ["00100","01100","00100","00100","00100","00100","01110"],
    "-": ["00000","00000","00000","11111","00000","00000","00000"],
    ".": ["00000","00000","00000","00000","00000","01100","01100"],
    " ": ["00000","00000","00000","00000","00000","00000","00000"],
  };

  const HEART = [
    "..XX...XX..",
    ".XppX.XppX.",
    "XphppXpppoX",
    "XphpppppppX",
    "XppppppppoX",
    ".XppppppoX.",
    "..XppppoX..",
    "...XppoX...",
    "....XoX....",
    ".....X.....",
  ];

  const NS = "http://www.w3.org/2000/svg";
  const svg = (w, h, px) => {
    const s = document.createElementNS(NS, "svg");
    s.setAttribute("width", w * px);
    s.setAttribute("height", h * px);
    s.setAttribute("viewBox", `0 0 ${w} ${h}`);
    s.setAttribute("shape-rendering", "crispEdges");
    s.style.display = "block";
    s.style.pointerEvents = "none";
    return s;
  };
  // Fills are CSS variables so a theme switch is one attribute change.
  const rect = (s, x, y, fillVar) => {
    const r = document.createElementNS(NS, "rect");
    r.setAttribute("x", x); r.setAttribute("y", y);
    r.setAttribute("width", 1); r.setAttribute("height", 1);
    r.style.fill = `var(${fillVar})`;
    s.appendChild(r);
  };

  function textSvg(str, colorVar, shadowVar, px) {
    const s = svg(str.length * 6 + 1, 8, px);
    const each = (fn) => [...str].forEach((ch, i) =>
      (FONT[ch] || FONT[" "]).forEach((row, y) =>
        [...row].forEach((b, x) => { if (b === "1") fn(i * 6 + x, y); })));
    if (shadowVar) each((x, y) => rect(s, x + 1, y + 1, shadowVar));
    each((x, y) => rect(s, x, y, colorVar));
    return s;
  }

  function heartSvg(px) {
    const s = svg(11, 10, px);
    const map = { X: "--sp-heart-line", p: "--sp-heart", h: "--sp-heart-hi", o: "--sp-heart-lo" };
    HEART.forEach((row, y) => [...row].forEach((c, x) => {
      if (map[c]) rect(s, x, y, map[c]);
    }));
    return s;
  }

  const GLYPH = {
    min: [".........", ".........", ".........", ".........", ".........", ".........", ".XXXXXXX.", ".XXXXXXX.", "........."],
    max: ["XXXXXXXXX", "XXXXXXXXX", "X.......X", "X.......X", "X.......X", "X.......X", "X.......X", "XXXXXXXXX", "........."],
    home: ["...X.....", "..XX.....", ".XXXXXXXX", "XXXXXXXXX", ".XXXXXXXX", "..XX.....", "...X.....", ".........", "........."],
    close: ["XX.....XX", ".XX...XX.", "..XX.XX..", "...XXX...", "..XX.XX..", ".XX...XX.", "XX.....XX", ".........", "........."],
  };
  function glyphSvg(name) {
    const s = svg(9, 9, 2);
    GLYPH[name].forEach((row, y) => [...row].forEach((c, x) => {
      if (c === "X") rect(s, x, y, "--sp-btn-ink");
    }));
    return s;
  }

  const vars = (t) => `
    --sp-bg:${t.bg}; --sp-hi:${t.hi}; --sp-lo:${t.lo};
    --sp-text:${t.text}; --sp-shadow:${t.shadow}; --sp-accent:${t.accent};
    --sp-btn:${t.btn}; --sp-btn-hi:${t.btnHi}; --sp-btn-lo:${t.btnLo}; --sp-btn-ink:${t.btnInk};
    --sp-btn-hover:${t.btnHover}; --sp-close-hover:${t.closeHover};
    --sp-stripe:${t.stripe}; --sp-glow:${t.glow}; --sp-page:${t.page};
    --sp-heart:#ef7fb6; --sp-heart-hi:#ffd3e8; --sp-heart-lo:#9c3f6e; --sp-heart-line:${t.lo};`;

  const CSS = `
    html { ${vars(THEMES.light)} background: var(--sp-page) !important; }
    html[data-sp-theme="dark"] { ${vars(THEMES.dark)} --sp-heart:#ff4fa8; --sp-heart-hi:#ffc2e2; --sp-heart-lo:#a01e66; }
    #sp-titlebar, #sp-titlebar * { box-sizing: border-box; }
    #sp-titlebar {
      position: fixed; top: 0; left: 0; right: 0; height: ${BAR}px;
      z-index: 2147483647; display: flex; align-items: center; gap: 10px;
      padding: 0 4px 0 10px; background: var(--sp-bg);
      border-bottom: 2px solid var(--sp-lo);
      box-shadow: inset 0 2px 0 var(--sp-hi);
      user-select: none; -webkit-user-select: none; cursor: default;
      transition: background-color .4s steps(4);
    }
    html[data-sp-theme="dark"] #sp-titlebar { border-bottom-color: #ff4fa8; box-shadow: inset 0 2px 0 var(--sp-hi), 0 1px 8px rgba(255,79,168,.35); }
    #sp-titlebar .sp-drag { flex: 1; align-self: stretch; display: flex; align-items: center; gap: 10px; }
    #sp-titlebar .sp-title { filter: drop-shadow(var(--sp-glow)); }
    #sp-titlebar .sp-stripes {
      flex: 1; height: 12px; margin: 0 6px;
      background: repeating-linear-gradient(to bottom, var(--sp-stripe) 0 2px, transparent 2px 4px);
    }
    #sp-titlebar .sp-btn {
      width: 30px; height: 22px; display: grid; place-items: center;
      background: var(--sp-btn); border: 2px solid var(--sp-lo);
      box-shadow: inset -2px -2px 0 var(--sp-btn-lo), inset 2px 2px 0 var(--sp-btn-hi);
      cursor: pointer; padding: 0;
    }
    #sp-titlebar .sp-btn:hover { background: var(--sp-btn-hover); }
    #sp-titlebar .sp-btn:active { box-shadow: inset 2px 2px 0 var(--sp-btn-lo); transform: translateY(1px); }
    #sp-titlebar .sp-btn.sp-close:hover { background: var(--sp-close-hover); }
    html[data-sp-theme="dark"] #sp-titlebar .sp-btn { border-color: #30bddb; box-shadow: inset -2px -2px 0 var(--sp-btn-lo), 0 0 5px rgba(48,189,219,.45); }
    html[data-sp-theme="dark"] #sp-titlebar .sp-btn.sp-close { border-color: #ff4fa8; box-shadow: inset -2px -2px 0 var(--sp-btn-lo), 0 0 5px rgba(255,79,168,.5); }
    #sp-titlebar .sp-btns { display: flex; gap: 4px; }
    #sp-titlebar .sp-btn.sp-home { width: 40px; background: var(--sp-close-hover); margin-right: 6px; }
    @keyframes sp-beat { 0%,100% { transform: scale(1); } 12% { transform: scale(1.15); } 24% { transform: scale(1); } }
    #sp-titlebar .sp-heart { animation: sp-beat 2.4s steps(4) infinite; }
    #sp-titlebar .sp-blink { animation: sp-blink 1.1s steps(1) infinite; }
    @keyframes sp-blink { 50% { opacity: 0; } }

    /* Push the whole page under the bar. The transform makes body the
       containing block for the page's own fixed-position layers. */
    html:not(.sp-pinned) body {
      position: fixed !important; top: ${BAR}px !important; left: 0 !important;
      right: 0 !important; bottom: 0 !important; height: auto !important;
      transform: translateZ(0); overflow: hidden;
    }
    /* On the save point page: pin the dashboard's own frame under the bar so
       it fills the window and covers Claude's page header. */
    iframe[data-sp-pinned] {
      position: fixed !important; top: ${BAR}px !important; left: 0 !important;
      width: 100vw !important; height: calc(100vh - ${BAR}px) !important;
      max-width: none !important; max-height: none !important; margin: 0 !important;
      border: 0 !important; border-radius: 0 !important; transform: none !important;
      z-index: 2147483646 !important; background: var(--sp-page) !important;
    }
    /* Pake's own invisible drag strip would cover the dashboard's top nav. */
    #pake-top-dom { display: none !important; }
  `;

  function addStyle() {
    if (document.getElementById("sp-titlebar-style")) return;
    if (typeof window.__PAKE_INJECT_STYLE__ === "function") {
      window.__PAKE_INJECT_STYLE__(CSS, "sp-titlebar-style");
      return;
    }
    const st = document.createElement("style");
    st.id = "sp-titlebar-style";
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  // ---- theme: follow whatever save point is showing ----
  function setTheme(mode) {
    document.documentElement.setAttribute("data-sp-theme", mode === "dark" ? "dark" : "light");
  }
  // Before the dashboard reports in, guess from the clock so the bar
  // doesn't flash the wrong colours at night.
  const h = new Date().getHours();
  setTheme(h >= 18 || h < 6 ? "dark" : "light");
  // Several frames may report; trust the biggest one (the dashboard itself).
  let bestArea = 0;
  window.addEventListener("message", (e) => {
    const d = e.data;
    if (!d || d.type !== "sp-theme") return;
    const area = Number(d.area) || 0;
    if (area + 1 < bestArea * 0.5) return;
    bestArea = Math.max(bestArea, area);
    setTheme(d.mode);
  });

  // The bar is named after whichever dashboard is open (from the frame title).
  let currentName = "SAVE_POINT.EXE";
  function nameFor(t) {
    const n = String(t || "").trim().toUpperCase().replace(/[^A-Z0-9 _-]/g, "").replace(/\s+/g, "_").slice(0, 18);
    return n ? n + ".EXE" : "SAVE_POINT.EXE";
  }
  function setName(n) {
    if (n === currentName) return;
    currentName = n;
    const old = document.querySelector("#sp-titlebar .sp-title");
    if (old) {
      const fresh = textSvg(n, "--sp-text", "--sp-shadow", 2);
      fresh.classList.add("sp-title");
      old.replaceWith(fresh);
    }
    try { win()?.setTitle?.(n); } catch (_) {}
    document.title = n;
  }

  // Find the dashboard frame (the biggest iframe on a claude.ai page) and pin it.
  function pin() {
    if (!/(^|\.)claude\.ai$/.test(location.hostname)) return;
    const cur = document.querySelector("iframe[data-sp-pinned]");
    let best = null, area = 0;
    for (const f of document.querySelectorAll("iframe")) {
      if (f === cur) { best = f; break; }
      const r = f.getBoundingClientRect();
      const a = r.width * r.height;
      if (a > area) { area = a; best = f; }
    }
    if (best && best !== cur && area < innerWidth * innerHeight * 0.15) best = null;
    if (!best) {
      if (cur) cur.removeAttribute("data-sp-pinned");
      document.documentElement.classList.remove("sp-pinned");
      return;
    }
    if (best !== cur) {
      if (cur) cur.removeAttribute("data-sp-pinned");
      best.setAttribute("data-sp-pinned", "");
    }
    // Anything that creates a containing block would trap position:fixed.
    for (let a = best.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.transform !== "none") a.style.setProperty("transform", "none", "important");
      if (cs.filter !== "none") a.style.setProperty("filter", "none", "important");
      if (cs.perspective !== "none") a.style.setProperty("perspective", "none", "important");
      if (cs.contain !== "none" && cs.contain !== "") a.style.setProperty("contain", "none", "important");
      if (cs.willChange && cs.willChange !== "auto") a.style.setProperty("will-change", "auto", "important");
      if (cs.backdropFilter && cs.backdropFilter !== "none") a.style.setProperty("backdrop-filter", "none", "important");
    }
    document.documentElement.classList.add("sp-pinned");
    if (best.title) setName(nameFor(best.title));
  }
  setInterval(pin, 700);

  function win() {
    return window.__TAURI__?.window?.getCurrentWindow?.();
  }

  // Pake only lets the window controls work on claude.ai. If sign-in or a
  // link wanders somewhere else (Google sign-in, etc.), show a way home.
  const HOME = "https://claude.ai/artifact/99syVi2QVFcSx8LNc99wtp";
  const onClaude = /(^|\.)claude\.ai$/.test(location.hostname);

  // Undecorated windows have no native resize border; add our own edges.
  function addResizeEdges() {
    const E = 6;
    const edges = [
      ["North", `top:0;left:${E}px;right:${E}px;height:${E}px;cursor:ns-resize`],
      ["South", `bottom:0;left:${E}px;right:${E}px;height:${E}px;cursor:ns-resize`],
      ["West", `left:0;top:${E}px;bottom:${E}px;width:${E}px;cursor:ew-resize`],
      ["East", `right:0;top:${E}px;bottom:${E}px;width:${E}px;cursor:ew-resize`],
      ["NorthWest", `top:0;left:0;width:${E * 2}px;height:${E * 2}px;cursor:nwse-resize`],
      ["NorthEast", `top:0;right:0;width:${E * 2}px;height:${E * 2}px;cursor:nesw-resize`],
      ["SouthWest", `bottom:0;left:0;width:${E * 2}px;height:${E * 2}px;cursor:nesw-resize`],
      ["SouthEast", `bottom:0;right:0;width:${E * 2}px;height:${E * 2}px;cursor:nwse-resize`],
    ];
    for (const [dir, css] of edges) {
      const h = document.createElement("div");
      h.className = "sp-resize";
      h.style.cssText = `position:fixed;z-index:2147483647;${css}`;
      h.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault(); e.stopPropagation();
        win()?.startResizeDragging?.(dir);
      });
      document.documentElement.appendChild(h);
    }
  }

  function build() {
    if (document.getElementById("sp-titlebar")) return;
    addStyle();

    const bar = document.createElement("div");
    bar.id = "sp-titlebar";

    const drag = document.createElement("div");
    drag.className = "sp-drag";

    const heart = heartSvg(2);
    heart.classList.add("sp-heart");
    drag.appendChild(heart);
    const title = textSvg(currentName, "--sp-text", "--sp-shadow", 2);
    title.classList.add("sp-title");
    drag.appendChild(title);

    const stripes = document.createElement("div");
    stripes.className = "sp-stripes";
    drag.appendChild(stripes);

    const p1 = textSvg("P1", "--sp-accent", "--sp-lo", 2);
    p1.classList.add("sp-blink");
    drag.appendChild(p1);

    drag.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      if (e.detail === 2) { win()?.toggleMaximize?.(); return; }
      win()?.startDragging?.();
    });

    const btns = document.createElement("div");
    btns.className = "sp-btns";
    const mk = (name, label, fn, extra) => {
      const b = document.createElement("button");
      b.className = "sp-btn" + (extra ? " " + extra : "");
      b.title = label;
      b.setAttribute("aria-label", label);
      b.appendChild(glyphSvg(name));
      b.addEventListener("mousedown", (e) => e.stopPropagation());
      b.addEventListener("click", fn);
      return b;
    };
    if (!onClaude) {
      btns.appendChild(mk("home", "back to save point", () => { location.href = HOME; }, "sp-home"));
    }
    btns.appendChild(mk("min", "minimize", () => win()?.minimize?.()));
    btns.appendChild(mk("max", "maximize", () => win()?.toggleMaximize?.()));
    btns.appendChild(mk("close", "close", () => win()?.close?.(), "sp-close"));

    bar.appendChild(drag);
    bar.appendChild(btns);
    // On <html>, not <body>, so it isn't pushed down with the page.
    document.documentElement.appendChild(bar);
    if (!document.querySelector(".sp-resize")) addResizeEdges();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
  // The site is a single-page app; put the bar back if a re-render removes it.
  new MutationObserver(() => {
    if (!document.getElementById("sp-titlebar") && document.body) build();
  }).observe(document.documentElement, { childList: true });
})();
