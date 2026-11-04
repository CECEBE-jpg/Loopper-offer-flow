// Build online-offer-v6-approve.html (step 3 "Approve design") from v6: same head/CSS, header, stepper, footer, bottom bar.
const fs = require("fs"), path = require("path");
const dir = process.argv[2];
const src = fs.readFileSync(path.join(dir, "online-offer-v6.html"), "utf8");
const cut = (a, b, label) => {
  const i = src.indexOf(a); if (i < 0) throw new Error("start " + label);
  const j = src.indexOf(b, i); if (j < 0) throw new Error("end " + label);
  return src.slice(i, j);
};
let head = cut("<!doctype html>", "\n    </style>", "head");
head = head.replace(/<title>[^<]*<\/title>/, "<title>Loopper – Approve your design (v6)</title>");
let top = cut('    <div class="usp-bar">', '    <div class="page">', "top");
// stepper: offer done, approve design current
top = top.replace(/<li class="step step-current" aria-current="step">\s*<span class="step-num">2<\/span>Your offer\s*<\/li>/,
  `<li class="step step-done">
            <img src="assets/offer-v3/icon-step-done.svg" width="26" height="26" alt="Done:" /><a class="step-link" href="online-offer-v6.html">Your offer</a>
          </li>`);
top = top.replace(/<li class="step">\s*<span class="step-num">3<\/span\s*>[\s\S]*?Approve design[\s\S]*?<\/li>/,
  `<li class="step step-current" aria-current="step"><span class="step-num">3</span>Approve design</li>`);
top = top.replace(/class="client-logo"(\s)/, "class=\"client-logo\" data-logo-bg=\"dark\"$1"); // white sample logo needs the dark box (v6 sets this from a script)
if (!top.includes('aria-current="step"><span class="step-num">3')) throw new Error("stepper");
const footer = cut("    <!-- Brands that trust us", "    <script>", "footer");
let nav = cut("    <!-- Step navigation, always visible at the bottom -->", "    </nav>", "nav") + "    </nav>\n";
nav = nav.replace(/<span class="step-nav-hint"\s*>[\s\S]*?<\/span\s*>/, `<span class="step-nav-hint" id="navHint">Tick <b>“I agree with this design”</b> to continue to your details.</span>`);
nav = nav.replace(/<button type="button" class="cta step-nav-next" disabled>\s*<span>Next: Approve design<\/span>/, `<button type="button" class="cta step-nav-next" id="navNext" disabled>
            <span>Next: Your details</span>`);
if (!nav.includes('id="navNext"')) throw new Error("nav next");
const condense = cut("    <script>\n      // Shrink header + progress bar after scrolling", "    </script>", "condense") + "    </script>\n";
const amHide = cut("    <script>\n      // Hide the bottom-bar account manager", "    </script>", "amhide") + "    </script>\n";

const css = `
      /* ---------- Step 3 "Approve design" (2026-11-04, from the live proof page) ---------- */
      .step-link { color: inherit; text-decoration: none; }
      .step-link:hover { text-decoration: underline; }
      .proof-page { width: 1212px; margin: 24px auto 0; padding-bottom: 40px; }
      .proof-intro {
        display: flex; gap: 16px; padding: 18px 22px; border: 1px solid #cfe6f3; border-radius: 14px;
        background: #eff7ff; font-size: 15px; line-height: 23px; color: var(--ink);
      }
      .proof-intro-icon { display: grid; flex: none; place-items: center; width: 36px; height: 36px; border-radius: 50%; background: #00aed8; }
      .proof-intro h1 { margin: 0 0 4px; font-size: 20px; line-height: 26px; font-weight: 800; color: #324a67; }
      .proof-intro p { margin: 0; }
      .proof-intro p + p { margin-top: 6px; }
      .proof-grid { display: grid; grid-template-columns: minmax(0, 1fr) 440px; gap: 24px; align-items: start; margin-top: 20px; }
      .proof-card { padding: 20px 24px 24px; border: 1px solid var(--line); border-radius: 14px; background: #fff; box-shadow: 1px 6px 19px rgba(0, 0, 0, 0.04); }
      .proof-head { display: flex; align-items: center; gap: 12px; padding-bottom: 14px; border-bottom: 1px solid var(--line); }
      .proof-head h2 { margin: 0; font-size: 17px; font-weight: 800; }
      .proof-head small { display: block; font-size: 13px; font-weight: 500; color: var(--muted); }
      .proof-dl { display: inline-flex; align-items: center; gap: 6px; height: 34px; margin-left: auto; padding: 0 12px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--ink); font: inherit; font-size: 13px; font-weight: 700; text-decoration: none; cursor: pointer; }
      .proof-dl:hover { border-color: #b7c2cd; }
      .proof-tabs { display: flex; gap: 8px; margin-top: 14px; }
      .proof-tab { display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 14px; border: 1px solid var(--line); border-radius: 20px; background: #fff; font: inherit; font-size: 13px; font-weight: 700; color: var(--text); cursor: pointer; }
      .proof-tab[aria-selected="true"] { border-color: #00aed8; background: #e6f7fc; color: #00799a; }
      .proof-tab .dot { width: 8px; height: 8px; border-radius: 50%; background: #c9d1d9; }
      .proof-tab.is-ok .dot { background: var(--green); }
      .proof-stage { position: relative; display: grid; place-items: center; height: 460px; margin-top: 16px; border-radius: 12px; background: #fafbfc; }
      .proof-stage > img { width: 440px; height: 440px; object-fit: contain; }
      .proof-area {
        position: absolute; top: 50%; left: 50%; width: 96px; height: 172px; transform: translate(-50%, -38%);
        display: grid; place-items: center; border: 1.5px dashed #e3262b;
      }
      .proof-area img { width: 128px; transform: rotate(-90deg); opacity: 0.7; filter: grayscale(1) brightness(0.55); mix-blend-mode: multiply; }
      .proof-legend { display: flex; flex-wrap: wrap; gap: 8px 32px; margin-top: 14px; font-size: 14px; }
      .proof-legend b { font-weight: 800; }
      .proof-legend .line { display: inline-flex; align-items: center; gap: 10px; }
      .proof-legend .line::before { content: ""; width: 44px; border-top: 2px dashed #e3262b; }
      .vector { margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--line); }
      .vector h3 { margin: 0; font-size: 16px; font-weight: 800; }
      .vector > p { margin: 4px 0 12px; font-size: 14px; line-height: 21px; color: var(--text); }
      .vector-actions { display: flex; flex-wrap: wrap; gap: 10px; }
      .vector-btn { display: inline-flex; align-items: center; gap: 8px; height: 42px; padding: 0 16px; border: 1px dashed #b7c2cd; border-radius: 10px; background: #fafbfc; font: inherit; font-size: 14px; font-weight: 800; color: var(--ink); cursor: pointer; }
      .vector-btn small { font-weight: 600; color: var(--muted); }
      .vector-btn:hover { border-color: #00aed8; background: #e6f7fc; }
      .vector-btn-alt { border-style: solid; border-color: #f0c64a; background: #fff8e1; }
      .vector-btn-alt:hover { border-color: #d29a00; background: #fff1c2; }
      .vector-btn-alt[aria-pressed="true"] { border-color: var(--green); background: var(--green-50); color: var(--green-text); }
      .vector-note { margin-top: 12px; padding: 12px 14px; border-radius: 10px; background: #fff8e1; font-size: 14px; line-height: 21px; color: #6b4c00; }
      .vector-note[hidden], .vector-file[hidden] { display: none; }
      .vector-file { margin-top: 12px; font-size: 14px; font-weight: 700; color: var(--green-text); }
      .check-card { position: sticky; top: calc(var(--top-h, 137px) + 16px); }
      .check-card h2 { margin: 0; font-size: 18px; font-weight: 800; }
      .check-card > p { margin: 4px 0 0; font-size: 14px; color: var(--text); }
      .check-list { display: flex; flex-direction: column; gap: 8px; margin: 14px 0 0; padding: 0; list-style: none; }
      .check-list label { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 10px; font-size: 15px; cursor: pointer; }
      .check-list label:has(input:checked) { border-color: #bfe3a6; background: var(--green-50); }
      .check-list input, .agree input { width: 18px; height: 18px; accent-color: var(--green); }
      .change { margin-top: 16px; border: 1px solid var(--line); border-radius: 12px; }
      .change > summary { display: flex; align-items: center; gap: 8px; padding: 12px 14px; font-size: 15px; font-weight: 800; list-style: none; cursor: pointer; }
      .change > summary::-webkit-details-marker { display: none; }
      .change > summary svg:last-child { margin-left: auto; transition: transform 0.2s; }
      .change[open] > summary svg:last-child { transform: rotate(180deg); }
      .change-log { display: flex; flex-direction: column; gap: 8px; max-height: 200px; padding: 0 14px 10px; overflow-y: auto; }
      .change-msg { align-self: flex-start; max-width: 85%; margin: 0; padding: 8px 12px; border-radius: 4px 12px 12px 12px; background: #f2f2f2; font-size: 14px; line-height: 20px; }
      .change-msg small { display: block; font-size: 11px; color: var(--muted); }
      .change-msg.is-you { align-self: flex-end; border-radius: 12px 4px 12px 12px; background: #e6f7fc; }
      .change-form { display: flex; gap: 8px; padding: 10px 14px 14px; border-top: 1px solid var(--line); }
      .change-form input { flex: 1; min-width: 0; height: 40px; padding: 0 12px; border: 1px solid #d5dbe1; border-radius: 8px; font: inherit; font-size: 14px; }
      .change-form input:focus { outline: none; border-color: #00aed8; }
      .change-form button { display: grid; place-items: center; width: 44px; height: 40px; border: 0; border-radius: 8px; background: #00aed8; cursor: pointer; }
      .agree { display: flex; align-items: flex-start; gap: 10px; margin-top: 16px; padding: 12px 14px; border-radius: 10px; background: #f6f8fa; font-size: 15px; font-weight: 800; cursor: pointer; }
      .agree small { display: block; font-size: 12px; font-weight: 500; color: var(--muted); }
      .approve-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 52px; margin-top: 12px; border: 0; border-radius: 10px; background: var(--green); color: #fff; font: inherit; font-size: 17px; font-weight: 800; cursor: pointer; }
      .approve-btn:disabled { background: #cfd5db; cursor: not-allowed; }
      .step-nav .cta:not(:disabled) { background: var(--green); color: #fff; cursor: pointer; }
      .back-link { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 12px; font-size: 14px; font-weight: 700; color: #006ed0; text-decoration: none; }
      .back-link:hover { text-decoration: underline; }
      .proof-page .am-feature { flex-direction: row; align-items: flex-end; gap: 0; width: auto; margin-top: 28px; padding: 0; }
      .proof-page .am-feature-photo { width: 220px; height: auto; margin: 0 -20px 0 0; }
      .proof-page .am-feature-card { width: 560px; margin: 0; }
    </style>`;

const body = `
    <div class="proof-page">
      <section class="proof-intro" aria-labelledby="proofTitle">
        <span class="proof-intro-icon"><svg width="18" height="18" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.2 6.3 4.8 8.8 9.8 3.4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
        <div>
          <h1 id="proofTitle">Your mockup design is ready</h1>
          <p>We made a digital preview based on the file you sent. It is a preview, so it may not be 100% sharp. The dashed line around your logo shows the maximum print area; it will not be printed.</p>
          <p>Once you approve the design, you can still send us your logo as a vector file (EPS, AI, SVG or PDF). No vector file? We will make one for you, free of charge.</p>
        </div>
      </section>

      <div class="proof-grid">
        <section class="proof-card" aria-labelledby="proofProduct">
          <div class="proof-head">
            <div>
              <h2 id="proofProduct">Thermos bottle | Stainless steel | 500 ml | Silver</h2>
              <small>Article number 6383162 · 25 pieces</small>
            </div>
            <a class="proof-dl" href="assets/offer-v3/thermos-silver.jpg" download>
              <img src="assets/offer-v3/icon-download.svg" width="16" height="16" alt="" />Download proof
            </a>
          </div>
          <div class="proof-tabs" role="tablist" aria-label="Designs in this offer">
            <button type="button" class="proof-tab" role="tab" aria-selected="true" data-title="Thermos bottle | Stainless steel | 500 ml | Silver" data-sub="Article number 6383162 · 25 pieces"><span class="dot"></span>Design 1 of 2</button>
            <button type="button" class="proof-tab" role="tab" aria-selected="false" data-title="Thermos bottle | Stainless steel | 500 ml | Silver" data-sub="Article number 6383162 · 25 pieces · text logo"><span class="dot"></span>Design 2 of 2</button>
          </div>
          <div class="proof-stage">
            <img src="assets/offer-v3/thermos-silver.jpg" width="500" height="500" alt="Mockup: your logo engraved on the front of the silver thermos bottle" />
            <span class="proof-area" aria-hidden="true"><img src="assets/offer-v3/sample-logo-black.svg" alt="" /></span>
          </div>
          <div class="proof-legend">
            <span><b>Print option:</b> Engraving, front (50×90 mm)</span>
            <span class="line">Maximum print area (this line is not printed)</span>
          </div>

          <div class="vector">
            <h3>Vector logo</h3>
            <p>A vector file gives the sharpest print. Upload it here, or let our design team redraw your logo for you.</p>
            <div class="vector-actions">
              <button type="button" class="vector-btn" id="vectorUpload">
                <img src="assets/offer-v3/icon-download.svg" width="16" height="16" alt="" style="transform: rotate(180deg)" />Upload vector logo <small>.svg, .ai, .pdf, .eps</small>
              </button>
              <input type="file" id="vectorFile" accept=".svg,.ai,.pdf,.eps" hidden />
              <button type="button" class="vector-btn vector-btn-alt" id="vectorise" aria-pressed="false">I don’t have a vector logo, vectorise it for me</button>
            </div>
            <p class="vector-file" id="vectorFileName" hidden></p>
            <p class="vector-note" id="vectorNote" hidden>
              <b>We will vectorise your logo.</b> Our design team redraws your pixel logo by hand as a vector. This is part of our service. We aim for perfection, but with very complex logos small differences can occur.
            </p>
          </div>
        </section>

        <aside class="proof-card check-card" aria-labelledby="checkTitle">
          <h2 id="checkTitle">Check your proof</h2>
          <p>Tick each point once you have checked it.</p>
          <ul class="check-list">
            <li><label><input type="checkbox" class="check" />Your logo is in the right place</label></li>
            <li><label><input type="checkbox" class="check" />The print shown is correct</label></li>
            <li><label><input type="checkbox" class="check" />Spelling and punctuation are correct</label></li>
          </ul>

          <details class="change">
            <summary>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 3.5a1.5 1.5 0 0 1 1.5-1.5h8a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H7l-3 2.5V11h0a1.5 1.5 0 0 1-1.5-1.5v-6Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg>
              I want to request a change
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 8l5 5 5-5" stroke="#00aed8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </summary>
            <div class="change-log" id="changeLog" aria-live="polite">
              <p class="change-msg"><small>Jildou · your account manager</small>Tell me what you would like to change, for example the size or position of your logo.</p>
            </div>
            <form class="change-form" id="changeForm">
              <input type="text" placeholder="Describe your change…" aria-label="Describe your change" />
              <button type="submit" aria-label="Send"><img src="assets/offer-v3/icon-send.svg" width="18" height="18" alt="" style="filter: brightness(0) invert(1)" /></button>
            </form>
          </details>

          <label class="agree">
            <input type="checkbox" id="agree" />
            <span>I agree with this design<small>After your approval we turn it into a final print proof.</small></span>
          </label>
          <button type="button" class="approve-btn" id="approveBtn" disabled>
            Continue to your details
            <img src="assets/offer-v3/icon-chevron.svg" width="18" height="18" alt="" />
          </button>
          <a class="back-link" href="online-offer-v6.html">← Back to step 2 to check your offer</a>
        </aside>
      </div>

      <section class="am-feature" aria-label="Your account manager">
        <img class="am-feature-photo" src="assets/offer-v3/account-manager-model.png" width="293" height="240" alt="Jildou, your account manager" />
        <div class="am-feature-card">
          <div class="am-feature-id">
            <p class="am-feature-name">Jildou</p>
            <p class="eyebrow">Your account manager</p>
          </div>
          <p class="am-feature-quote">“This is where the fun starts! Pick the design you love. Once you approve it, we turn it into a final print proof. Have a vector logo? Upload it here to speed up your order.”</p>
          <p class="am-feature-contact">
            <a href="tel:+442045765960">+44 20 4576 5960</a>
            <a href="mailto:Jildou@loopper.com">Jildou@loopper.com</a>
          </p>
        </div>
      </section>
    </div>

`;

const script = `    <script>
      // Step 3 prototype: design tabs, vector logo choice, change requests, approval gate
      (function () {
        var tabs = document.querySelectorAll(".proof-tab");
        tabs.forEach(function (t) {
          t.addEventListener("click", function () {
            tabs.forEach(function (o) { o.setAttribute("aria-selected", o === t ? "true" : "false"); });
            document.getElementById("proofProduct").textContent = t.dataset.title;
            document.querySelector(".proof-head small").textContent = t.dataset.sub;
          });
        });
        var up = document.getElementById("vectorUpload"), file = document.getElementById("vectorFile");
        var fileName = document.getElementById("vectorFileName");
        var vec = document.getElementById("vectorise"), note = document.getElementById("vectorNote");
        up.addEventListener("click", function () { file.click(); });
        file.addEventListener("change", function () {
          if (!file.files[0]) return;
          fileName.textContent = "✓ " + file.files[0].name + " uploaded";
          fileName.hidden = false;
          vec.setAttribute("aria-pressed", "false");
          vec.textContent = "I don’t have a vector logo, vectorise it for me";
          note.hidden = true;
        });
        vec.addEventListener("click", function () {
          var on = vec.getAttribute("aria-pressed") !== "true";
          vec.setAttribute("aria-pressed", on ? "true" : "false");
          vec.textContent = on ? "✓ We will vectorise your logo" : "I don’t have a vector logo, vectorise it for me";
          note.hidden = !on;
        });
        var log = document.getElementById("changeLog"), form = document.getElementById("changeForm");
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          var input = form.querySelector("input"), text = input.value.trim();
          if (!text) return;
          var p = document.createElement("p");
          p.className = "change-msg is-you";
          p.innerHTML = "<small>You · just now</small>";
          p.appendChild(document.createTextNode(text));
          log.appendChild(p);
          input.value = "";
          log.scrollTop = log.scrollHeight;
        });
        var agree = document.getElementById("agree");
        var approve = document.getElementById("approveBtn"), next = document.getElementById("navNext");
        var hint = document.getElementById("navHint");
        agree.addEventListener("change", function () {
          approve.disabled = next.disabled = !agree.checked;
          hint.innerHTML = agree.checked ? "Design approved. Next: fill in your details." : "Tick <b>“I agree with this design”</b> to continue to your details.";
          document.querySelector(".proof-tab[aria-selected=true]").classList.toggle("is-ok", agree.checked);
        });
      })();
    </script>
`;

const out = head + css + "\n  </head>\n  <body>\n" + top + body + footer + nav + condense + amHide + script + "  </body>\n</html>\n";
fs.writeFileSync(path.join(dir, "online-offer-v6-approve.html"), out);
console.log("ok", out.length);
