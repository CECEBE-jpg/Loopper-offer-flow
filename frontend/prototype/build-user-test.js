// Builds the User-test version (user-test.html, user-test-approve.html, user-test-details.html)
// from the v6 prototype. Re-run after changing v6:  node build-user-test.js
//
// What is different for the test:
// - Step 1 starts empty: no logo uploaded yet, the logo section is open, no mockup status yet.
// - The purple prototype demo bar is hidden. As soon as the test user uploads a logo (or adds a
//   text logo) the mockup sequence plays ONCE (requested → in progress → ready, 10 s per step)
//   and then stops on "ready".
// - The uploaded logo is kept for the session (sessionStorage) and used in the header, the step 1
//   mockup gallery and the step 2 mockups. Coming back to step 1 shows the finished state again.
// - All links stay inside the User-test pages.
const fs = require("fs");
const path = require("path");
const dir = __dirname;
const must = (c, m) => {
  if (!c) throw new Error("build-user-test: " + m);
};
const read = (f) => fs.readFileSync(path.join(dir, f), "utf8");
const links = (s) =>
  s
    .split("online-offer-v6-checklist.html").join("user-test-checklist.html")
    .split("online-offer-v6-payment.html").join("user-test-payment.html")
    .split("online-offer-v6-approve.html").join("user-test-approve.html")
    .split("online-offer-v6-details.html").join("user-test-details.html")
    .split('"online-offer-v6.html"').join('"user-test.html"');
const title = (s) => s.replace(/<title>([^<]*)\(v6\)<\/title>/, "<title>$1(user test)</title>");
const noindex = (s) => s.replace("<head>", '<head>\n    <meta name="robots" content="noindex" />');
const beforeBodyEnd = (s, html) => {
  const i = s.lastIndexOf("  </body>");
  must(i > 0, "body end");
  return s.slice(0, i) + html + s.slice(i);
};
const BLOOM = "assets/offer-bloom/bloom-logo.png";

// ---------- step 1 ----------
let s = read("online-offer-v6.html");
// no logo yet: drop the Bloom logo tile and its preview in the closed summary
{
  const a = s.indexOf('<div class="logo" data-logo="file">');
  const b = s.indexOf("<!-- Add tiles", a);
  must(a > 0 && b > a, "logo tile");
  s = s.slice(0, s.lastIndexOf("\n", a) + 1) + s.slice(s.lastIndexOf("\n", b) + 1);
  const m = /\s*<span class="logo-mini logo-mini-file">\s*<img\s+class="bloom-logo-thumb"[^>]*\/>\s*<\/span>/;
  must(m.test(s), "mini thumb");
  s = s.replace(m, "");
  s = s.replace('<span class="logos-dd-count">1 logo</span>', '<span class="logos-dd-count">No logo yet</span>');
  // logo section open from the start, so the test user sees where to upload
  s = s.replace('<details class="card logos-card logos-dd">', '<details class="card logos-card logos-dd" open>');
}
// the demo no longer starts by itself: it waits for the test user's logo
{
  const start = /if \(new URLSearchParams\(location\.search\)\.get\("mockup"\) === "ready"\) \{\s*show\(STEPS\.length - 1\);\s*pause\(\);\s*\} else \{\s*show\(0\);\s*play\(\);\s*\}/;
  must(start.test(s), "demo start");
  s = s.replace(
    start,
    `// User test: wait for the logo, then play the sequence once and stop on "ready"
        window.utDemo = {
          playOnce: function () {
            clearInterval(timer);
            show(0);
            timer = setInterval(function () {
              if (step >= STEPS.length - 1) {
                clearInterval(timer);
                timer = null;
                return;
              }
              show(step + 1);
            }, 10000);
          },
          finish: function () {
            clearInterval(timer);
            timer = null;
            show(STEPS.length - 1);
          },
        };`,
  );
}
// mockup gallery: use the test user's own logo
s = s.replace(
  `'<span class="p1-gal-logo" aria-hidden="true"><img src="' +\n                LOGO +`,
  `'<span class="p1-gal-logo" aria-hidden="true"><img src="' +\n                (window.utLogo || LOGO) +`,
);
must(s.includes("(window.utLogo || LOGO)"), "gallery logo");
s = beforeBodyEnd(
  s,
  `    <style>
      /* User test: the prototype demo controls are hidden */
      #demoBar {
        display: none !important;
      }
    </style>
    <script>
      // User test: empty start, then the mockup sequence plays once after the first logo
      (function () {
        var list = document.querySelector(".logos-dd .logos");
        var chip = document.querySelector(".logos-dd .chip-status");
        var note = document.getElementById("designNote");
        var hint = document.getElementById("navHint");
        var next = document.getElementById("navNext");
        var KEY = "loopperUserTestLogo";
        var started = false;
        function waiting() {
          document.querySelectorAll(".products-card .p6-photo").forEach(function (p) {
            p.querySelectorAll(".p6-overlay-mockup, .p6-mock-logo, .p6-ready").forEach(function (el) {
              el.remove();
            });
            p.classList.remove("is-ready");
            p.dataset.mockup = "none";
          });
          if (chip) {
            chip.className = chip.className.replace(/\\bis-(requested|progress|ready)\\b/g, "").trim() + " is-requested";
            chip.textContent = "Upload your logo";
          }
          if (note) {
            note.className = "design-note is-requested";
            note.querySelector("span").innerHTML =
              "<b>Upload your logo</b> and we\\u2019ll make a <b>free digital mockup</b> of your products.<br />You can approve it or ask for changes before you order.";
          }
          if (hint) hint.classList.remove("is-count");
          if (hint) hint.innerHTML = "<b>Upload your logo</b> to get your free mockup design.";
        }
        function remember(src) {
          // keep the logo for steps 2 and 3 (as a small PNG, so it survives a page change)
          var img = new Image();
          img.onload = function () {
            try {
              var k = Math.min(1, 600 / img.naturalWidth);
              var c = document.createElement("canvas");
              c.width = Math.max(1, Math.round(img.naturalWidth * k));
              c.height = Math.max(1, Math.round(img.naturalHeight * k));
              c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
              var url = c.toDataURL("image/png");
              window.utLogo = url;
              sessionStorage.setItem(KEY, url);
            } catch (e) {}
          };
          img.src = src;
        }
        function onLogo() {
          if (started) return;
          var file = list.querySelector('[data-logo="file"] .logo-thumb-upload img');
          var text = list.querySelector('[data-logo="text"]');
          if (!file && !text) return;
          started = true;
          if (file) {
            window.utLogo = file.src;
            remember(file.src);
          } else {
            try {
              sessionStorage.setItem(KEY, "text");
            } catch (e) {}
          }
          if (window.utDemo) window.utDemo.playOnce();
        }
        new MutationObserver(onLogo).observe(list, { childList: true, subtree: true });
        // back from step 2: show the uploaded logo and the finished mockups again (no replay)
        var saved = null;
        try {
          saved = sessionStorage.getItem(KEY);
        } catch (e) {}
        if (saved && saved !== "text") {
          started = true;
          window.utLogo = saved;
          var tile = document.createElement("div");
          tile.className = "logo";
          tile.setAttribute("data-logo", "file");
          tile.innerHTML =
            '<div class="logo-top"><div class="logo-thumb logo-thumb-upload is-transparent"><img alt="" /></div>' +
            '<p class="logo-name"><img src="assets/offer-v3/icon-check.svg" width="14" height="14" alt="" /><span>Your logo</span></p>' +
            '<p class="logo-sub">Received today</p></div>';
          tile.querySelector(".logo-thumb-upload img").src = saved;
          list.insertBefore(tile, list.firstChild);
          var count = document.querySelector(".logos-dd-count");
          if (count) count.textContent = "1 logo";
          if (window.utDemo) window.utDemo.finish();
        } else if (saved === "text") {
          started = true;
          if (window.utDemo) window.utDemo.finish();
        } else {
          waiting();
        }
      })();
    </script>
`,
);
// Jildou answers every comment (and warns about foul language), not only the first one
{
  const first = /if \(empty && !answered\) \{\s*answered = true;\s*setTimeout\(function \(\) \{\s*addAm\(\s*"Thanks for your question! I'll look into it and get back to you today\.",\s*now\(\),\s*\);\s*\}, 2500\);\s*\}/;
  must(first.test(s), "step 1 comment reply");
  s = s.replace(
    first,
    `// user test: Jildou answers every message (a warning for foul language)
            setTimeout(function () {
              addAm(window.utAmReply(text), now());
            }, window.utAmDelay());`,
  );
  // the side panel shows Jildou's answers live, so no "you'll get an email" note
  s = s.replace(
    `"Jildou has been notified. You'll get an email when she replies."`,
    `"Jildou usually replies within a few minutes."`,
  );
}
// recommended product: mockup feedback, and it goes on to step 2 and 3
s = beforeBodyEnd(
  s,
  `    <script src="user-test-am.js"></script>
    <style>
      .ut-alt-note {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin: 12px 0 0;
        padding: 10px 12px;
        border-radius: 10px;
        background: #e7f4ff;
        font-size: 13px;
        line-height: 18px;
        color: #006ed0;
      }
      .ut-alt-note.is-ready {
        background: #eaf6e2;
        color: #3d7f15;
      }
      .ut-alt-note.is-wait {
        background: #f1eafd;
        color: #6d28d9;
      }
      .ut-alt-note[hidden] {
        display: none;
      }
    </style>
    <script>
      // User test: switching on the recommended beach bag starts a mockup for it.
      // Feedback in the card (in progress → ready after 10 s); the bag is added to step 2 and 3.
      (function () {
        var card = document.getElementById("altProduct");
        var inOffer = document.getElementById("altInOffer");
        var qty = document.getElementById("altQty");
        if (!card || !inOffer || !qty) return;
        var KEY = "loopperUserTestAlt",
          LOGO_KEY = "loopperUserTestLogo";
        var photo = card.querySelector(".p6-photo");
        var note = document.createElement("p");
        note.className = "ut-alt-note";
        note.setAttribute("role", "status");
        note.hidden = true;
        card.querySelector(".p6-info").appendChild(note);
        var timer = null;
        // the beach bag counts in the bottom-bar mockup count while it is in the offer
        window.extraMockups = function () {
          if (!inOffer.checked) return [];
          var m = photo.dataset.mockup;
          return [m === "ready" ? "ready" : m === "progress" ? "progress" : "requested"];
        };
        function hasLogo() {
          return !!document.querySelector(".logos-dd .logos [data-logo]");
        }
        function store() {
          try {
            if (!inOffer.checked) return sessionStorage.removeItem(KEY);
            var r = qty.querySelector('.q-row > input[type="radio"]:checked');
            var q = r && r.getAttribute("data-price") ? +r.value : 250;
            var p = r && r.getAttribute("data-price") ? +r.getAttribute("data-price") : 4.08;
            sessionStorage.setItem(KEY, JSON.stringify({ q: q, p: p, ready: photo.dataset.mockup === "ready" }));
          } catch (e) {}
        }
        function overlay(on) {
          photo.querySelectorAll(".p6-overlay-mockup").forEach(function (el) {
            el.remove();
          });
          if (on)
            photo.insertAdjacentHTML("beforeend", '<span class="p6-overlay p6-overlay-mockup">Mockup in progress</span>');
        }
        function set(state) {
          note.hidden = false;
          note.className = "ut-alt-note" + (state === "ready" ? " is-ready" : state === "wait" ? " is-wait" : "");
          photo.dataset.mockup = state === "ready" ? "ready" : state === "progress" ? "progress" : "none";
          overlay(state === "progress");
          note.textContent =
            state === "ready"
              ? "Your mockup is ready, review it in the next step."
              : state === "progress"
                ? "A mockup has been requested. We’ll notify you once it’s ready for you to review."
                : "Upload your logo and we\\u2019ll make a free mockup of the beach bag too.";
          store();
          if (window.refreshNav) window.refreshNav();
        }
        function start() {
          clearTimeout(timer);
          if (!hasLogo()) return set("wait");
          set("progress");
          timer = setTimeout(function () {
            set("ready");
          }, 10000);
        }
        function sync() {
          if (inOffer.checked) {
            if (photo.dataset.mockup !== "ready" && photo.dataset.mockup !== "progress") start();
          } else {
            clearTimeout(timer);
            overlay(false);
            photo.dataset.mockup = "none";
            note.hidden = true;
          }
          store();
          if (window.refreshNav) window.refreshNav();
        }
        inOffer.addEventListener("change", function () {
          setTimeout(sync, 0);
        });
        var toggle = document.getElementById("altToggle");
        if (toggle)
          toggle.addEventListener("change", function () {
            setTimeout(sync, 0);
          });
        qty.addEventListener("change", function () {
          setTimeout(store, 0);
        });
        // a logo uploaded after the bag was added: start its mockup too
        var list = document.querySelector(".logos-dd .logos");
        if (list)
          new MutationObserver(function () {
            if (inOffer.checked && photo.dataset.mockup === "none" && hasLogo()) start();
          }).observe(list, { childList: true, subtree: true });
        // back from step 2: the bag is still in the offer with its finished mockup
        var saved = null;
        try {
          saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
        } catch (e) {}
        if (saved && toggle) {
          toggle.checked = true;
          toggle.dispatchEvent(new Event("change", { bubbles: true }));
          setTimeout(function () {
            if (saved.ready) set("ready");
            else start();
          }, 0);
        }
      })();
    </script>
`,
);
s = noindex(title(links(s)));
fs.writeFileSync(path.join(dir, "user-test.html"), s);

// ---------- steps 2 and 3: use the test user's logo where the prototype shows the client logo ----------
const useLogo = `    <script>
      // User test: show the logo the test user uploaded in step 1
      (function () {
        var logo = null;
        try {
          logo = sessionStorage.getItem("loopperUserTestLogo");
        } catch (e) {}
        if (!logo || logo === "text") return;
        document.querySelectorAll('img[src="${BLOOM}"]').forEach(function (img) {
          img.src = logo;
        });
        var box = document.querySelector(".client-logo");
        if (box) box.setAttribute("aria-label", "Your uploaded logo");
      })();
    </script>
`;
let s2 = read("online-offer-v6-approve.html");
// the step 2 mockups take their logo from the product data: point it at the test user's logo
const n2 = s2.split('logo: "' + BLOOM + '"').length - 1;
must(n2 >= 3, "step 2 logos " + n2);
s2 = s2.split('logo: "' + BLOOM + '"').join("logo: UT_LOGO");
s2 = s2.replace(
  "        var PRODUCTS = [",
  `        // User test: the logo uploaded in step 1 (falls back to the scenario logo)
        var UT_LOGO = "${BLOOM}";
        try {
          var utL = sessionStorage.getItem("loopperUserTestLogo");
          if (utL && utL !== "text") UT_LOGO = utL;
        } catch (e) {}
        var PRODUCTS = [`,
);
// beach bag added in step 1: one more product to review
{
  const end = "\n        ];\n        var state = PRODUCTS.map(";
  must(s2.includes(end), "PRODUCTS end");
  s2 = s2.replace(
    end,
    `
        ];
        // User test: the recommended beach bag, when it was added to the offer in step 1
        try {
          var utAlt = JSON.parse(sessionStorage.getItem("loopperUserTestAlt") || "null");
          if (utAlt)
            PRODUCTS.push({
              name: "Beach bag | Cotton 220 g/m² | 55x39 cm | Cord handle | Beige",
              short: "Beach bag",
              meta: "Cotton · Beige",
              card: "Beach bag, beige",
              cardSub: "Screen print: front (30×20 cm)",
              sub: "Article number 6377143 · " + utAlt.q + " pieces",
              img: "assets/offer-bloom/beach-13.jpg",
              print: "Screen print in 1 colour, front (30×20 cm)",
              area: "beach",
              designs: [
                { label: "Logo centred", kind: "logo", logo: UT_LOGO, dir: "horizontal" },
                { label: "Logo large", kind: "logo", logo: UT_LOGO, dir: "horizontal", big: true },
              ],
              pending: !utAlt.ready, // mockup not finished yet when the client left step 1
            });
        } catch (e) {}
        var state = PRODUCTS.map(`,
  );
  // the beach bag finishes like the other products (v6 timer); remember it for step 3 and back to step 1
  s2 = beforeBodyEnd(
    s2,
    `    <script>
      document.addEventListener("mockupready", function (e) {
        if (e.detail.area !== "beach") return;
        try {
          var a = JSON.parse(sessionStorage.getItem("loopperUserTestAlt") || "null");
          if (a) {
            a.ready = true;
            sessionStorage.setItem("loopperUserTestAlt", JSON.stringify(a));
          }
        } catch (err) {}
      });
    </script>
`,
  );
  // Jildou answers every chat message (a warning for foul language)
  const once = /if \(!log\.querySelector\("\.is-reply"\)\) \{\s*setTimeout\(function \(\) \{\s*var r = document\.createElement\("p"\);\s*r\.className = "change-msg is-reply";\s*r\.innerHTML =\s*"<small>Jildou · just now<\/small>Thanks! I will update your design and let you know when the new version is ready\.";\s*log\.appendChild\(r\);\s*log\.scrollTop = log\.scrollHeight;\s*\}, 900\);\s*\}/;
  must(once.test(s2), "step 2 chat reply");
  s2 = s2.replace(
    once,
    `// user test: Jildou answers every message
          setTimeout(function () {
            var r = document.createElement("p");
            r.className = "change-msg is-reply";
            r.innerHTML = "<small>Jildou · just now</small>";
            r.appendChild(document.createTextNode(window.utAmReply(text)));
            log.appendChild(r);
            log.scrollTop = log.scrollHeight;
          }, window.utAmDelay());`,
  );
  s2 = beforeBodyEnd(
    s2,
    `    <script src="user-test-am.js"></script>
    <style>
      /* print area on the beach bag photo (348 px stage) */
      .pr-viewer .proof-area.pr-area-beach {
        top: 150px;
        left: 104px;
        width: 140px;
        height: 95px;
        transform: none;
      }
      .pr-viewer .proof-area.pr-area-beach img {
        width: 96px;
        transform: none;
        opacity: 0.95;
        filter: none;
        mix-blend-mode: multiply;
      }
      .pr-viewer .proof-area.pr-area-beach.pr-big img {
        width: 132px;
      }
    </style>
`,
  );
}
s2 = beforeBodyEnd(s2, useLogo);
s2 = noindex(title(links(s2)));
fs.writeFileSync(path.join(dir, "user-test-approve.html"), s2);

let s3 = read("online-offer-v6-details.html");
s3 = beforeBodyEnd(s3, useLogo);
// beach bag added in step 1: extra order row and totals
s3 = beforeBodyEnd(
  s3,
  `    <script>
      // User test: the recommended beach bag, when it was added to the offer in step 1
      (function () {
        var alt = null;
        try {
          alt = JSON.parse(sessionStorage.getItem("loopperUserTestAlt") || "null");
        } catch (e) {}
        if (!alt) return;
        function eur(n) {
          return "€ " + n.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        var body = document.querySelector(".det-table tbody");
        var first = body && body.querySelector("tr");
        if (!first) return;
        var row = first.cloneNode(true);
        var img = row.querySelector(".det-prod-img");
        img.src = "assets/offer-bloom/beach-13.jpg";
        img.alt = "Beach bag with cord handle, beige";
        var th = ["beach-12.jpg", "beach-04.jpg", "beach-05.jpg"];
        row.querySelectorAll(".det-prod-thumbs img").forEach(function (t, i) {
          t.src = "assets/offer-bloom/" + th[i];
        });
        var txt = row.querySelectorAll(".det-prod h3, .det-prod p");
        txt[0].textContent = "Beach bag | Cotton 220 g/m² | 55x39 cm | Cord handle | Beige";
        txt[1].textContent = "Article number: 6377143";
        txt[2].textContent = "Screen print · Personalisation: front (30×20 cm)";
        if (txt[3]) txt[3].textContent = "Expected delivery: 1 December 2026";
        var cells = row.querySelectorAll(":scope > td");
        cells[1].innerHTML = "<b>" + alt.q + "</b>";
        cells[2].textContent = eur(alt.p);
        cells[3].innerHTML = "<b>" + eur(alt.p * alt.q) + "</b>";
        body.appendChild(row);
        // totals: the two products in the scenario + the beach bag
        var sub = 1567.5 + alt.p * alt.q,
          vat = Math.round(sub * 21) / 100,
          tot = sub + vat;
        ["sumSub", "sumExcl"].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.textContent = eur(sub);
        });
        var v = document.getElementById("sumVat");
        if (v) v.textContent = eur(vat);
        var t = document.getElementById("sumTotal");
        if (t) t.textContent = eur(tot);
        document.querySelectorAll(".step-nav-hint b").forEach(function (b) {
          if (/€/.test(b.textContent)) b.textContent = eur(tot);
        });
      })();
    </script>
`,
);
s3 = noindex(title(links(s3)));
fs.writeFileSync(path.join(dir, "user-test-details.html"), s3);

// ---------- step 4: payment ----------
let s4 = read("online-offer-v6-payment.html");
s4 = beforeBodyEnd(s4, useLogo);
// beach bag added in step 1: the amount to pay includes it
s4 = beforeBodyEnd(
  s4,
  `    <script>
      (function () {
        try {
          var alt = JSON.parse(sessionStorage.getItem("loopperUserTestAlt") || "null");
          if (alt && window.setPayBase) window.setPayBase(Math.round((1567.5 + alt.p * alt.q) * 121) / 100);
        } catch (e) {}
      })();
    </script>
`,
);
s4 = noindex(title(links(s4)));
fs.writeFileSync(path.join(dir, "user-test-payment.html"), s4);

// ---------- checklist (after payment) ----------
let s5 = read("online-offer-v6-checklist.html");
s5 = beforeBodyEnd(s5, useLogo);
s5 = beforeBodyEnd(
  s5,
  `    <script src="user-test-am.js"></script>
    <script>
      // beach bag added in step 1: in the order list and the amount to pay
      (function () {
        var alt = null;
        try {
          alt = JSON.parse(sessionStorage.getItem("loopperUserTestAlt") || "null");
        } catch (e) {}
        if (!alt || !window.renderChecklist) return;
        var sum = alt.p * alt.q;
        var li = document.createElement("li");
        li.innerHTML =
          '<img src="assets/offer-bloom/beach-13.jpg" alt="" /><span><b>Beach bag, beige</b><small>' +
          alt.q +
          " pieces · screen print</small></span><em></em>";
        li.querySelector("em").textContent =
          "€ " + sum.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.getElementById("ckItems").appendChild(li);
        window.renderChecklist(1567.5 + sum);
      })();
    </script>
`,
);
s5 = noindex(title(links(s5)));
fs.writeFileSync(path.join(dir, "user-test-checklist.html"), s5);

for (const f of ["user-test.html", "user-test-approve.html", "user-test-details.html", "user-test-payment.html", "user-test-checklist.html"]) {
  const t = read(f);
  must(!/online-offer-v6[a-z-]*\.html/.test(t), f + " still links to v6");
}
console.log("built user-test.html, -approve, -details, -payment, -checklist");
