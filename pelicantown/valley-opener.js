
// --- PELICAN_TOWN.EXE valley opener (appended at build time; runs in every frame) ---
// The app opens the arcade artifact, but Em wants to land on the farm tracker.
// Inside the arcade's own frame, jump to its #valley route once on load.
// After that the arcade's own links (← stardew page, etc.) work as normal.
(function () {
  try {
    if (window.top === window) return;
  } catch (_) {}
  let done = false;
  function go() {
    if (done) return;
    // Only the arcade has the valley view; leave every other frame alone.
    if (!document.getElementById("v-valley")) return;
    done = true;
    const h = (location.hash || "").slice(1);
    if (!h || h === "lobby") location.hash = "valley";
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
  // The arcade may build its views a moment after load.
  let tries = 0;
  const t = setInterval(() => { go(); if (done || ++tries > 20) clearInterval(t); }, 250);
})();
