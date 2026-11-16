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
          if (next) next.disabled = true;
          if (hint) hint.innerHTML = "Available when your <b>Mockup design</b> is ready. Upload your logo to get started.";
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
s2 = beforeBodyEnd(s2, useLogo);
s2 = noindex(title(links(s2)));
fs.writeFileSync(path.join(dir, "user-test-approve.html"), s2);

let s3 = read("online-offer-v6-details.html");
s3 = beforeBodyEnd(s3, useLogo);
s3 = noindex(title(links(s3)));
fs.writeFileSync(path.join(dir, "user-test-details.html"), s3);

for (const f of ["user-test.html", "user-test-approve.html", "user-test-details.html"]) {
  const t = read(f);
  must(!/online-offer-v6[a-z-]*\.html/.test(t), f + " still links to v6");
}
console.log("built user-test.html, user-test-approve.html, user-test-details.html");
