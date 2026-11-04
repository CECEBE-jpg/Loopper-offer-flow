/* PDP header behaviour, from 04 product-page-prototype-seo/script.js. */
/* ---------- compact header on scroll ----------
   Down: the USP banner and the category bar hide; the main bar (logo,
   search, actions) stays (styles.css .hd.is-compact). Up, or back at the
   very top: they return.
   The header is fixed to the top with a spacer of its full height in the
   page flow (styles.css .hd-spacer), so hiding / showing its parts never
   moves the page — that removed the jump, and with it the need for a
   threshold or cool-down: the first pixel of scrolling down compacts it.
   The parts ease out / in (styles.css), measured here for the animation. */
(function compactHeader() {
  const hd = document.getElementById("hd");
  const spacer = document.createElement("div");
  spacer.className = "hd-spacer";
  spacer.setAttribute("aria-hidden", "true");
  hd.after(spacer);
  // the spacer always holds the full (expanded) header height
  // (not while the parts are animating: it would follow the in-between heights).
  // Phones zoom the page by screen / 393 but undo it on the header (fitPhone),
  // so the spacer, inside the zoomed page, needs the header's on-screen height
  // divided by that zoom — otherwise on a 320px phone it falls 24px short and
  // the header covers the breadcrumbs.
  const sizeSpacer = () => {
    if (hd.classList.contains("is-compact") || hd.classList.contains("hd-anim")) return;
    const pageZoom = parseFloat(document.body.style.zoom) || 1;
    spacer.style.height = `${hd.getBoundingClientRect().height / pageZoom}px`;
  };
  new ResizeObserver(sizeSpacer).observe(hd);
  window.addEventListener("resize", sizeSpacer); // the page zoom follows the width
  sizeSpacer();

  // natural heights of the parts that collapse, for the height animation
  const root = document.documentElement;
  const measure = () => {
    if (hd.classList.contains("is-compact")) return;
    const usp = hd.querySelector(".usp");
    const cat = hd.querySelector(".cat");
    root.style.setProperty("--usp-h", `${usp ? usp.scrollHeight : 0}px`);
    root.style.setProperty("--cat-h", `${cat ? cat.scrollHeight : 0}px`);
  };
  measure();
  window.addEventListener("resize", measure);
  if (document.fonts) document.fonts.ready.then(measure);

  let lastY = window.scrollY;
  let animTimer;
  let holdUntil = 0;
  // keep the header compact for a while (programmatic scroll to the summary)
  window.holdCompactHeader = (ms) => {
    holdUntil = performance.now() + ms;
    if (ms > 0) set(true);
  };
  const set = (on) => {
    if (hd.classList.contains("is-compact") === on) return;
    if (on) measure();
    // clip the parts while they move; unclipped again once settled
    hd.classList.add("hd-anim");
    clearTimeout(animTimer);
    animTimer = setTimeout(() => {
      hd.classList.remove("hd-anim");
      sizeSpacer();
    }, 400);
    hd.classList.toggle("is-compact", on);
  };
  window.addEventListener(
    "scroll",
    () => {
      const y = Math.max(0, window.scrollY);
      const dy = y - lastY;
      lastY = y;
      if (performance.now() < holdUntil && y > 0) set(true);
      else if (document.getElementById("drawer").classList.contains("open") || y <= 0) set(false);
      else if (dy > 0) set(true);
      // phones (user): the trust banner only returns at the very top, not
      // on any scroll up; desktop / tablet bring the header back on scroll up
      else if (dy < -4 && !matchMedia("(width < 768px)").matches) set(false);
    },
    { passive: true }
  );
  if (window.scrollY > 0) set(true);
})();

/* ---------- header height for the sticky photo column ----------
   styles.css pins .col1 under the header; the header's height changes as it
   compacts on scroll, so it's published as --hd-h. */
(function headerHeightVar() {
  const hd = document.getElementById("hd");
  const set = () => document.documentElement.style.setProperty("--hd-h", `${hd.offsetHeight}px`);
  new ResizeObserver(set).observe(hd);
  set();
})();

