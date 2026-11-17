
// --- SAVE_POINT.EXE theme reporter (appended at build time; runs in every frame) ---
// Tells the top window whether the dashboard inside this frame is showing its
// light or dark theme, so the custom title bar can match.
(function () {
  try {
    if (window.top === window) return;
  } catch (_) {}
  const lum = (c) => {
    const m = String(c).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(",").map((v) => parseFloat(v));
    if (a < 0.5) return null;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  };
  function detect() {
    const body = document.body;
    if (!body) return null;
    // Text colour is the most reliable signal: light text means a dark theme.
    const t = lum(getComputedStyle(body).color);
    // Fall back to the first solid background from the middle of the page up.
    let bg = null;
    let el = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
    while (el && bg === null) { bg = lum(getComputedStyle(el).backgroundColor); el = el.parentElement; }
    if (bg !== null) return bg < 0.35 ? "dark" : "light";
    if (t !== null) return t > 0.6 ? "dark" : "light";
    return null;
  }
  let last = null;
  function report() {
    const mode = detect();
    if (!mode || mode === last) return;
    last = mode;
    try {
      window.top.postMessage({ type: "sp-theme", mode, area: innerWidth * innerHeight }, "*");
    } catch (_) {}
  }
  function start() {
    report();
    let pending = 0;
    const soon = () => { if (!pending) pending = setTimeout(() => { pending = 0; report(); }, 250); };
    new MutationObserver(soon).observe(document.documentElement, {
      attributes: true, subtree: false, attributeFilter: ["class", "data-theme", "style"],
    });
    if (document.body) new MutationObserver(soon).observe(document.body, {
      attributes: true, attributeFilter: ["class", "data-theme", "style"],
    });
    // Late-loading frames and theme changes the observers miss: re-send now and then.
    setInterval(() => { last = null; report(); }, 3000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
