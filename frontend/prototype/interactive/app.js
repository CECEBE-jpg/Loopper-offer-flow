/*
  Offer flow prototype: app logic (vanilla JS, no build step).
  Screens: offer → design (optional) → details → payment → done.
  Content lives in data.js. Render functions below are one per screen; edit freely.
*/
(function () {
  const D = window.OFFER;
  const P = D.project;

  // ---------- State ----------
  const initial = () => ({
    step: "offer",
    viewport: window.innerWidth < 700 ? "desktop" : "mobile",
    mockup: true, // offer includes a digital design → extra "Check your design" step
    designReady: false, // false = "design in progress", true = proofs ready to approve
    hideMoq: false, // back-office "Hide MOQs": no tiers, only a quantity field
    urgency: true,
    lines: D.products.map((p, i) => ({
      id: p.id, on: p.inOffer, qty: p.qty, open: i === 0, custom: "",
      checks: [false, false, false], status: "todo", change: "", changeOpen: false,
    })),
    designIdx: 0,
    logoOpen: false, // "Your logo & design" dropdown
    details: Object.assign({}, D.details),
    errors: {},
    pay: "bank",
    orderNo: null,
    ctrlOpen: false,
  });
  let S = initial();

  // ---------- Helpers ----------
  const nf = new Intl.NumberFormat("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const eur = (n) => "€ " + nf.format(n);
  const int = (n) => n.toLocaleString("en-GB");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const prod = (id) => D.products.find((p) => p.id === id);
  const line = (id) => S.lines.find((l) => l.id === id);
  const activeLines = () => S.lines.filter((l) => l.on);
  const tierFor = (p, qty) => {
    let t = p.tiers[0];
    p.tiers.forEach((x) => { if (qty >= x.qty) t = x; });
    return t;
  };
  const unit = (p, qty) => tierFor(p, qty).price;
  const lineTotal = (l) => unit(prod(l.id), l.qty) * l.qty;
  const totals = () => {
    const sub = activeLines().reduce((s, l) => s + lineTotal(l), 0);
    const vat = sub * P.vatRate;
    return { sub, vat, total: sub + vat };
  };
  const flow = () =>
    [
      { id: "received", label: "Request received" },
      { id: "offer", label: "Your offer" },
      S.mockup && { id: "design", label: "Check your design" },
      { id: "details", label: "Your details" },
      { id: "payment", label: "Payment" },
    ].filter(Boolean);

  const ICON = {
    check: '<svg class="icon" viewBox="0 0 20 20" fill="none"><path d="M5 10.5l3 3 7-7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg class="icon" viewBox="0 0 20 20" fill="none"><path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    back: '<svg class="icon" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    clock: '<svg class="icon" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#B45F00" stroke-width="2"/><path d="M10 5.5V10l3 2" stroke="#B45F00" stroke-width="2" stroke-linecap="round"/></svg>',
    pdf: '<svg class="icon" viewBox="0 0 20 20" fill="none"><path d="M10 3v10m0 0l-4-4m4 4l4-4M4 16h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    mail: '<svg class="icon" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3.5 6l6.5 5 6.5-5" stroke="currentColor" stroke-width="2"/></svg>',
    chev: '<svg class="icon" viewBox="0 0 20 20" fill="none"><path d="M5 8l5 5 5-5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    trash: '<svg class="icon" style="width:14px;height:14px" viewBox="0 0 20 20" fill="none"><path d="M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10M9 9v5M11 9v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    edit: '<svg class="icon" style="width:14px;height:14px" viewBox="0 0 20 20" fill="none"><path d="M10 4H5a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-5M8 12l1-3 6-6 2 2-6 6-3 1z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  };

  function visual(p) {
    if (p.image === "svg:bottle")
      return '<svg viewBox="0 0 40 72" width="60%" height="80%" fill="none"><rect x="11" y="2" width="18" height="9" rx="3" fill="#3f7f1e"/><path d="M29 6c8 0 8 10 0 10" stroke="#3f7f1e" stroke-width="3"/><rect x="5" y="11" width="30" height="58" rx="10" fill="#6cc43a"/></svg>';
    if (p.image === "svg:bag")
      return '<svg viewBox="0 0 44 50" width="70%" height="70%" fill="none"><path d="M14 14c0-10 16-10 16 0" stroke="#c9b48a" stroke-width="3"/><rect x="4" y="14" width="36" height="34" rx="2" fill="#efe6d2"/></svg>';
    return `<img src="${p.image}" alt="${esc(p.short)}" />`;
  }

  function prodImg(p, opts = {}) {
    const status = !S.mockup ? "" : S.designReady
      ? `<div class="overlay ready">✓ Design ready</div>`
      : `<div class="overlay"><span class="dot pulse"></span>Design in progress</div>`;
    return `<div class="prod-img ${opts.sm ? "sm" : ""} ${opts.dim ? "dim" : ""}">${visual(p)}${opts.sm ? "" : status}</div>`;
  }

  // ---------- Header / stepper / footer ----------
  function header() {
    return `
    <div class="topbar"><div class="wrap row inner">
      <div class="row" style="gap:20px">
        <div class="logo">loopper<span>.</span></div>
        <div class="col am-contact" style="border-left:1px solid var(--line);padding-left:20px">
          <span class="tiny strong">YOUR OFFER</span><span class="strong">${P.number} · ${esc(P.company)}</span>
        </div>
      </div>
      <div class="row" style="gap:10px">
        <div class="col am-contact" style="align-items:flex-end">
          <span class="strong" style="font-size:14px">${esc(D.am.name)} · your account manager</span>
          <span class="small">${esc(D.am.phone)} · ${esc(D.am.email)}</span>
        </div>
        <div class="col" style="align-items:flex-end" data-hide-desktop>
          <span class="tiny strong">Offer ${P.number}</span>
        </div>
        <div class="avatar">${D.am.initials}</div>
      </div>
    </div></div>
    <div class="usp"><div class="wrap row" style="height:36px;padding:0 24px;justify-content:space-between">
      <div class="row" style="gap:28px">
        <span class="row" style="gap:6px">${ICON.check}Free digital design</span>
        <span class="row" style="gap:6px">${ICON.check}Personal service</span>
        <span class="row" style="gap:6px">${ICON.check}24 years of experience</span>
      </div>
      <span>${D.reviews.platform} ${D.reviews.score}/5 · ${D.reviews.count} reviews</span>
    </div></div>`;
  }

  function stepper() {
    if (S.step === "done") return "";
    const steps = flow();
    const cur = steps.findIndex((s) => s.id === S.step);
    const next = steps[cur + 1];
    const segs = steps.map((s, i) => `<div class="seg ${i < cur ? "done" : i === cur ? "current" : ""}"></div>`).join("");
    const desk = steps
      .map((s, i) => {
        const cls = i < cur ? "done" : i === cur ? "current" : "";
        const can = i < cur && s.id !== "received";
        return `<button class="step ${cls}" ${can ? `data-a="go" data-step="${s.id}"` : "disabled"}>
          <span class="num">${i < cur ? "✓" : i + 1}</span>${s.label}</button>`;
      })
      .join("");
    return `
    <div class="stepper-mobile">
      <div class="row" style="justify-content:space-between;margin-bottom:8px">
        <span class="strong" style="font-size:14px">Step ${cur + 1} of ${steps.length} · ${steps[cur].label}</span>
        ${next ? `<span class="tiny">Next: ${next.label.toLowerCase()}</span>` : ""}
      </div>
      <div class="row" style="gap:4px">${segs}</div>
    </div>
    <div class="wrap stepper-wrap"><div class="stepper">${desk}</div></div>`;
  }

  function footer() {
    return `<div class="footer"><div class="wrap col inner" style="gap:12px;padding:0 8px">
      <div class="logo" style="font-size:20px">loopper<span>.</span></div>
      <div class="pay-logos"><span>Bank transfer</span><span>Visa</span><span>Mastercard</span><span>PayPal</span><span>Klarna</span></div>
    </div></div>`;
  }

  function amCard(text) {
    return `<div class="card row" style="padding:16px;gap:12px;align-items:flex-start">
      <div class="avatar lg">${D.am.initials}</div>
      <div class="col" style="gap:3px">
        <span class="strong">${esc(D.am.name)}, your account manager</span>
        <span class="small">"${esc(text || D.am.quote)}"</span>
        <div class="row" style="gap:8px;margin-top:8px">
          <a class="btn secondary sm" href="tel:${D.am.phone.replace(/\s/g, "")}">Call ${esc(D.am.phone)}</a>
          <a class="btn secondary sm" href="mailto:${D.am.email}">Email</a>
        </div>
      </div>
    </div>`;
  }

  function reviews() {
    return `<div class="row" style="gap:10px;justify-content:center;padding:4px 0">
      <div class="stars">${"<div class='star'>★</div>".repeat(5)}</div>
      <span class="strong" style="font-size:14px">${D.reviews.score}</span>
      <span class="tiny">${D.reviews.platform} · ${D.reviews.count} reviews</span></div>`;
  }

  // ---------- Summary (shared by offer, details, payment) ----------
  function summary(opts = {}) {
    const t = totals();
    const rows = S.lines
      .map((l) => {
        const p = prod(l.id);
        return l.on
          ? `<div class="sum-row"><span>${int(l.qty)} × ${esc(p.short)} <span class="tiny">(${eur(unit(p, l.qty))})</span></span><b>${eur(lineTotal(l))}</b></div>`
          : `<div class="sum-row off"><span>${esc(p.short)}</span><span>not in order</span></div>`;
      })
      .join("");
    return `<div class="card" style="padding:20px">
      <span class="h2">Summary</span>
      <div class="col" style="gap:9px;margin-top:14px">
        ${rows}
        <div class="sum-row"><span>Printing, setup &amp; shipping</span><span>included in price</span></div>
        <div class="divider"></div>
        <div class="sum-row"><span>Subtotal excl. VAT</span><b>${eur(t.sub)}</b></div>
        <div class="sum-row"><span>${esc(P.vatLabel)}</span><b>${eur(t.vat)}</b></div>
      </div>
      <div class="total" style="margin-top:12px"><span class="strong">Total incl. VAT</span><span class="amount">${eur(t.total)}</span></div>
      <span class="tiny" style="display:block;margin-top:4px">Delivery ${esc(P.deliveryDate)} · valid until ${esc(P.validUntil)} · ${esc(P.paymentTerms.toLowerCase())}</span>
      ${opts.cta ? `<div class="summary-cta" style="margin-top:16px">${opts.cta}</div>` : ""}
      ${opts.extra || ""}
    </div>`;
  }

  // ---------- Screen: offer ----------
  function tiersHtml(p, l) {
    if (S.hideMoq) {
      return `<div class="col" style="gap:8px">
        <span class="strong">Quantity</span>
        <div class="row" style="gap:12px;flex-wrap:wrap">
          <div class="qty-stepper">
            <button data-a="qty-step" data-id="${p.id}" data-d="-50" aria-label="Fewer">−</button>
            <input type="number" min="1" value="${l.qty}" data-in="qty-direct" data-id="${p.id}" aria-label="Quantity" />
            <button data-a="qty-step" data-id="${p.id}" data-d="50" aria-label="More">+</button>
          </div>
          <div class="col"><span class="strong">${eur(unit(p, l.qty))} per piece</span><span class="tiny">${eur(lineTotal(l))} excl. VAT</span></div>
        </div>
      </div>`;
    }
    const base = p.tiers[0].price;
    const isTier = p.tiers.some((t) => t.qty === l.qty);
    const tiles = p.tiers
      .map((t) => {
        const save = (base - t.price) * t.qty;
        return `<button class="tier ${l.qty === t.qty ? "sel" : ""}" data-a="qty" data-id="${p.id}" data-q="${t.qty}">
          ${t.flag ? `<span class="flag">${t.flag}</span>` : ""}
          <span class="radio"></span>
          <span class="col"><span class="q">${int(t.qty)} pcs</span>
            <span class="pp">${eur(t.price)} per piece</span>
            ${save > 0 ? `<span class="save">save ${eur(save).replace(",00", "")}</span>` : ""}</span>
          <span class="sub">${eur(t.price * t.qty)}</span>
        </button>`;
      })
      .join("");
    const customTile = !isTier
      ? `<div class="tier sel"><span class="radio"></span><span class="col"><span class="q">${int(l.qty)} pcs</span>
          <span class="pp">${eur(unit(p, l.qty))} per piece</span></span><span class="sub">${eur(lineTotal(l))}</span></div>`
      : "";
    return `<div class="col" style="gap:8px">
      <span class="strong">Choose your quantity</span>
      <div class="tiers">${tiles}${customTile}</div>
      <div class="row" style="gap:8px">
        <input class="input" type="number" min="1" placeholder="Other quantity…" value="${esc(l.custom)}" data-in="custom" data-id="${p.id}" style="max-width:220px" />
        <button class="btn secondary" style="height:44px" data-a="custom" data-id="${p.id}">Update price</button>
      </div>
    </div>`;
  }

  function stockHtml(p, l) {
    const s = p.stock || {};
    const parts = [];
    if (s.now != null) parts.push(`<span>In stock: <b>${int(s.now)}</b></span>`);
    if (s.incoming) parts.push(`<span>Incoming: <b>${int(s.incoming)}</b> on ${s.incomingDate}</span>`);
    if (s.limit && l.qty > s.limit) parts.push(`<span class="warn">Above ${s.limit} pcs: delivery from ${s.lateDelivery}</span>`);
    return parts.length ? `<div class="stock">${parts.join("")}</div>` : "";
  }

  function productLine(p, l) {
    const toggle = `<button class="toggle ${l.on ? "on" : ""}" data-a="toggle" data-id="${p.id}" aria-label="${l.on ? "Remove from" : "Add to"} order"><span class="knob"></span></button>`;
    if (!l.on) {
      return `<div class="card line off"><div class="line-head" style="align-items:center">
        ${prodImg(p, { sm: true, dim: true })}
        <div class="col dim" style="flex:1;gap:2px"><span class="h3">${esc(p.short)}</span>
          <span class="tiny">Not in order · from ${eur(p.tiers[0].price)} per piece</span></div>
        <span class="small strong" style="white-space:nowrap">Add</span>${toggle}
      </div></div>`;
    }
    const late = p.stock && p.stock.limit && l.qty > p.stock.limit;
    return `<div class="card line ${l.open ? "open" : ""}">
      <div class="line-head">
        ${prodImg(p)}
        <div class="col" style="flex:1;gap:6px;min-width:0">
          <div class="row" style="justify-content:space-between;align-items:flex-start;gap:10px">
            <div class="col" style="gap:2px"><span class="h3">${esc(p.name)}</span>
              <span class="tiny">${esc(p.variant)} · Article ${p.article}</span></div>
            ${toggle}
          </div>
          ${p.tag ? `<span class="pill ${p.tag.tone}">${esc(p.tag.label)}</span>` : ""}
          <div class="line-summary">${int(l.qty)} pcs · ${eur(lineTotal(l))} ·
            <button class="link" data-a="open" data-id="${p.id}">Change</button></div>
          <div class="line-body" style="gap:6px">
            <div class="spec"><span class="pill grey">${esc(p.print)}</span>
              <span class="pill ${late ? "orange" : "blue"}">${late ? "Delivery from " + p.stock.lateDelivery : (p.fast ? "Fast delivery · " : "Delivery ") + p.delivery}</span></div>
            ${stockHtml(p, l)}
            ${p.chips && p.chips.length ? `<div class="spec">${p.chips.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>` : ""}
          </div>
        </div>
      </div>
      <div class="line-body">
        ${tiersHtml(p, l)}
        ${p.amNote ? `<div class="am-note"><div class="avatar sm">${D.am.initials}</div><span><b>${esc(D.am.name)}:</b> ${esc(p.amNote)}</span></div>` : ""}
      </div>
    </div>`;
  }

  // Logo & design: dropdown section, closed by default (S.logoOpen)
  function logoCard() {
    const tiles = D.logos
      .map((lg) =>
        lg.type === "file"
          ? `<div class="logo-tile"><div class="logo-img checker">YOUR DESIGN<br/>HERE</div>
              <span class="tiny strong" style="color:var(--ink)"><span style="color:var(--green-dark)">✓</span> ${esc(lg.name)}</span><span class="tiny">Received ${esc(lg.received)}</span>
              <button class="btn ghost sm" data-a="toast" data-msg="Prototype: removes this logo">${ICON.trash}Remove</button></div>`
          : `<div class="logo-tile"><div class="logo-img text">${esc(lg.text)}</div>
              <span class="tiny strong" style="color:var(--ink)">Text logo</span><span class="tiny">${esc(lg.font)} · ${esc(lg.colour)}</span>
              <button class="btn ghost sm" data-a="toast" data-msg="Prototype: opens the text logo editor">${ICON.edit}Edit text logo</button></div>`
      )
      .join("");
    const minis = D.logos
      .map((lg) => (lg.type === "file" ? `<div class="logo-mini checker"></div>` : `<div class="logo-mini text">Aa</div>`))
      .join("");
    const status = !S.mockup
      ? `<span class="pill grey">No design requested</span>`
      : S.designReady
      ? `<span class="pill green">✓ Design ready to check</span>`
      : `<span class="pill yellow"><span class="dot"></span>Design requested · ready within 30 min</span>`;
    const text = !S.mockup
      ? "We print your logo as shown. Want to see it on the product first? <b>Ask for a free digital design.</b>"
      : S.designReady
      ? "<b>Your free digital design is ready.</b> You'll check it in the next step, before you pay."
      : "We'll <b>email you as soon as your free digital design is ready</b>.<br/>You can approve it or ask for changes before you order.";
    return `<div class="card logo-card ${S.logoOpen ? "open" : ""}">
      <button class="logo-head" data-a="logo-toggle" aria-expanded="${S.logoOpen}">
        <span class="col" style="gap:6px;align-items:flex-start;flex:1;min-width:0">
          <span class="row" style="gap:10px;flex-wrap:wrap"><span class="h2">Your logo &amp; design</span>${status}</span>
          <span class="row logo-sum" style="gap:8px">${minis}<span class="tiny">${D.logos.length} logo${D.logos.length > 1 ? "s" : ""} · tap to view or change</span></span>
        </span>
        <span class="chev">${ICON.chev}</span>
      </button>
      <div class="logo-body">
        <div class="logo-grid">
          <div class="logos">${tiles}</div>
          <div class="info-box">${text}</div>
        </div>
        <div class="row" style="justify-content:flex-end;margin-top:14px">
          <button class="link" data-a="toast" data-msg="Prototype: opens the logo upload">＋ Upload another logo</button>
        </div>
      </div>
    </div>`;
  }

  function offerActions() {
    const subject = encodeURIComponent(`Offer ${P.number} from Loopper`);
    const body = encodeURIComponent(`Hi,\n\nCan you take a look at this offer for ${activeLines().map((l) => prod(l.id).short).join(" and ")}?\nTotal ${eur(totals().total)} incl. VAT, valid until ${P.validUntil}.\n\n${location.href}\n`);
    return `<div class="row" style="gap:8px;margin-top:14px">
        <button class="btn secondary" style="flex:1" data-a="pdf">${ICON.pdf}PDF</button>
        <a class="btn secondary" style="flex:1" href="mailto:?subject=${subject}&body=${body}">${ICON.mail}Share</a>
      </div>
      <span class="tiny" style="display:block;text-align:center;margin-top:6px">Need approval? Send the offer to your manager.</span>
      <div class="row" style="justify-content:center;gap:18px;margin-top:10px">
        <button class="link" data-a="toast" data-msg="Prototype: opens the sample request">Request a sample</button>
        <button class="link" data-a="toast" data-msg="Prototype: opens 'Found a better price?'">Found a better price?</button>
      </div>`;
  }

  function nextFrom(step) {
    const steps = flow().map((s) => s.id);
    return steps[steps.indexOf(step) + 1] || "done";
  }

  function viewOffer() {
    const n = activeLines().length;
    const cont = `<button class="btn primary block" data-a="go" data-step="${nextFrom("offer")}" ${n ? "" : "disabled"}>
      ${S.mockup ? "Continue to check your design" : "Continue to your details"} ${ICON.next}</button>
      <span class="tiny" style="text-align:center">No payment yet · ${esc(P.paymentTerms.toLowerCase())}</span>`;
    return {
      body: `<div class="layout">
        <div class="main">
          <div class="col" style="gap:6px">
            <span class="h1">Hi ${esc(P.client)}, here's your offer</span>
            <span style="color:var(--ink-2)">${esc(D.intro)}</span>
          </div>
          ${S.urgency ? `<div class="urgency">${ICON.clock}<span>Order before <b>${esc(P.orderBefore)}</b> to receive everything on <b>${esc(P.deliveryDate)}</b>. This offer is valid until ${esc(P.validUntil)}.</span></div>` : ""}
          <div class="row" style="justify-content:space-between">
            <span class="h2">Your products</span>
            <span class="pill grey">${n} of ${S.lines.length} in your order</span>
          </div>
          ${S.lines.map((l) => productLine(prod(l.id), l)).join("")}
          ${logoCard()}
          <div class="col" style="gap:10px;padding:4px"><span class="small strong">Trusted by</span>
            <div class="clients">${D.clients.map((c) => `<span>${c}</span>`).join("")}</div></div>
        </div>
        <div class="aside">
          ${summary({ cta: cont, extra: offerActions() })}
          ${amCard()}
          ${reviews()}
        </div>
      </div>`,
      sticky: n
        ? `<div class="col"><span class="tiny">Total incl. VAT</span><span class="strong" style="font-size:19px">${eur(totals().total)}</span></div>
           <button class="btn primary" data-a="go" data-step="${nextFrom("offer")}">Continue ${ICON.next}</button>`
        : `<span class="small" style="flex:1">Switch on at least one product to continue.</span>`,
    };
  }

  // ---------- Screen: design check ----------
  const CHECKS = ["Is your logo in the right position?", "Is the print correct?", "Are spelling and punctuation correct?"];

  function viewDesign() {
    const lines = activeLines();
    if (!S.designReady) {
      return {
        body: `<div class="card col waiting" style="max-width:560px;margin:0 auto">
          <div class="spinner"></div>
          <span class="h2">Your designs are being made</span>
          <span class="small">Our designer is placing your logo on ${lines.length} product${lines.length > 1 ? "s" : ""}. This usually takes 10–30 minutes. We'll email you when they're ready, so you can close this page.</span>
          <button class="btn secondary" data-a="design-ready">Prototype: make designs ready</button>
          <button class="link" data-a="go" data-step="offer">Back to your offer</button>
        </div>`,
        sticky: "",
      };
    }
    if (S.designIdx >= lines.length) S.designIdx = 0;
    const l = lines[S.designIdx];
    const p = prod(l.id);
    const approved = lines.filter((x) => x.status === "approved").length;
    const allOk = approved === lines.length;
    const statusPill = (x) =>
      x.status === "approved" ? `<span class="pill green">✓ Approved</span>`
      : x.status === "change" ? `<span class="pill orange">Change requested</span>`
      : `<span class="pill grey">To check</span>`;
    const switcher = lines
      .map((x, i) => `<button class="sw ${i === S.designIdx ? "current" : ""}" data-a="design-idx" data-i="${i}">
          ${prodImg(prod(x.id), { sm: true })}<span class="name">${esc(prod(x.id).short)}</span>${statusPill(x)}</button>`)
      .join("");
    const a = p.printArea;
    const allChecked = l.checks.every(Boolean);
    const nextTodo = lines.findIndex((x, i) => i !== S.designIdx && x.status !== "approved");
    let decision;
    if (l.status === "approved") {
      decision = `<div class="note" style="background:var(--green-50);color:var(--green-dark);font-weight:700">✓ You approved this design.</div>
        <button class="link" data-a="unapprove">Undo approval</button>`;
    } else if (l.status === "change") {
      decision = `<div class="note"><b>Change sent to our designer:</b><br/>"${esc(l.change)}"<br/><span class="tiny">Free · new design within 1 working day. We'll email you.</span></div>
        <button class="btn secondary sm" data-a="prototype-new-design">Prototype: new design arrived</button>`;
    } else {
      decision = `
        <button class="btn primary block" data-a="approve" ${allChecked ? "" : "disabled"}>${ICON.check} Approve design</button>
        <span class="tiny" style="text-align:center">${allChecked ? (nextTodo >= 0 ? "Next: " + esc(prod(lines[nextTodo].id).short) : "This is your last design") : "Tick the 3 checks above to approve"}</span>
        ${l.changeOpen
          ? `<textarea class="textarea" data-in="change" data-id="${l.id}" placeholder="Describe what you'd like to change…">${esc(l.change)}</textarea>
             <div class="row" style="gap:8px"><button class="btn blue" data-a="send-change">Send to designer</button>
             <button class="link" data-a="change-close">Cancel</button></div>
             <span class="tiny">Changes are free. New design within 1 working day.</span>`
          : `<button class="btn secondary block" data-a="change-open">Request a change</button>`}
        <span class="tiny">Approving doesn't mean ordering yet. You can still change quantities.</span>`;
    }
    return {
      body: `<div class="col" style="gap:16px">
        <div class="col" style="gap:6px">
          <span class="h1">Hi ${esc(P.client)}, check your designs</span>
          <span style="color:var(--ink-2)">Your free digital design is ready. Check it and approve, or ask for a change. Changes are free.</span>
        </div>
        <div class="switcher">${switcher}</div>
        <div class="col design-grid" style="gap:16px">
          <div class="col" style="gap:10px">
            <div class="proof">
              <span class="tag">${esc(p.print)}</span>
              <div class="stage-img">${visual(p)}
                <div class="print-area ready" style="left:${a.x}%;top:${a.y}%;width:${a.w}%;height:${a.h}%">YOUR DESIGN<br/>HERE</div>
              </div>
            </div>
            <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px">
              <span class="tiny"><span style="color:#e0413b;font-weight:900">- - -</span> Red dashed line = max print area (not printed)</span>
              <button class="link" data-a="toast" data-msg="Prototype: downloads the proof as PDF">Download proof (PDF)</button>
            </div>
            <div class="card" style="padding:14px 16px">
              <span class="h3">${esc(p.name)}</span>
              <span class="tiny" style="display:block">${esc(p.variant)} · ${int(l.qty)} pcs · Design ${S.designIdx + 1} of ${lines.length}</span>
            </div>
          </div>
          <div class="col" style="gap:16px">
            <div class="card col" style="padding:16px;gap:10px">
              <span class="h3">Check these 3 things</span>
              ${CHECKS.map((c, i) => `<button class="check-item ${l.checks[i] ? "on" : ""}" data-a="check" data-i="${i}" ${l.status !== "todo" ? "disabled" : ""}><span class="box">${l.checks[i] ? "✓" : ""}</span>${c}</button>`).join("")}
              ${decision}
            </div>
            <div class="card col" style="padding:16px;gap:10px">
              <div class="row" style="justify-content:space-between"><span class="h3">${approved} of ${lines.length} designs approved</span><span class="tiny">Valid until ${esc(P.validUntil)}</span></div>
              <div class="bar"><div style="width:${(approved / lines.length) * 100}%"></div></div>
              <div class="summary-cta" style="display:flex">
                <button class="btn primary block" data-a="go" data-step="details" ${allOk ? "" : "disabled"}>Continue to your details ${ICON.next}</button>
                <span class="tiny" style="text-align:center">${allOk ? "All designs approved" : `Approve all ${lines.length} designs to continue`}</span>
              </div>
              <button class="link" data-a="go" data-step="offer">${"← Back to your offer"}</button>
            </div>
            <details class="card" style="padding:14px 16px;background:var(--bg)">
              <summary class="h3" style="cursor:pointer">Improve print quality <span class="tiny">(optional)</span></summary>
              <div class="col" style="gap:8px;margin-top:10px">
                <span class="small">You can skip this. Our designer already checked your logo.</span>
                <span class="small strong">Have a vector logo (.svg, .ai, .pdf, .eps)?</span>
                <button class="btn secondary sm" data-a="toast" data-msg="Prototype: opens file upload">Upload vector logo</button>
                <span class="tiny">No vector file? We redraw your logo for free.</span>
              </div>
            </details>
            ${amCard("Not sure about a detail? Call me, I'll check it with our designer.")}
          </div>
        </div>
      </div>`,
      sticky: l.status === "todo" && allChecked
        ? `<button class="btn primary" data-a="approve">${ICON.check} Approve design ${S.designIdx + 1}/${lines.length}</button>`
        : allOk
        ? `<button class="btn primary" data-a="go" data-step="details">Continue to your details ${ICON.next}</button>`
        : `<span class="small" style="flex:1;text-align:center">${approved} of ${lines.length} approved · ${l.status === "todo" ? "tick the 3 checks" : "pick the next design"}</span>`,
    };
  }

  // ---------- Screen: details ----------
  const FIELDS = [
    ["company", "Company name", true], ["name", "Your name", true], ["email", "Email", true], ["phone", "Phone", true],
    ["street", "Street and number", true, "full"], ["postcode", "Postcode", true], ["city", "City", true],
    ["country", "Country", true], ["vat", "VAT number (optional)", false], ["po", "PO / reference number (optional)", false, "full"],
  ];

  function viewDetails() {
    const fields = FIELDS.map(([k, label, req, full]) => `<div class="field ${full || ""}">
        <label for="f-${k}">${label}</label>
        <input id="f-${k}" class="input ${S.errors[k] ? "err" : ""}" value="${esc(S.details[k] || "")}" data-in="detail" data-k="${k}" ${req ? "required" : ""} />
        ${S.errors[k] ? `<span class="msg">${S.errors[k]}</span>` : ""}</div>`).join("");
    const cont = `<button class="btn primary block" data-a="submit-details">Continue to payment ${ICON.next}</button>`;
    return {
      body: `<div class="layout">
        <div class="main">
          <div class="col" style="gap:6px"><span class="h1">Your details</span>
            <span style="color:var(--ink-2)">Where should we send the order and invoice?</span></div>
          <div class="card" style="padding:18px"><div class="form-grid">${fields}</div>
            <div class="note" style="margin-top:14px">UK business with a VAT number? Add it and we'll check if VAT applies.</div></div>
          <button class="link" data-a="go" data-step="${S.mockup ? "design" : "offer"}">← Back</button>
        </div>
        <div class="aside">${summary({ cta: cont })}${amCard()}</div>
      </div>`,
      sticky: `<div class="col"><span class="tiny">Total incl. VAT</span><span class="strong" style="font-size:19px">${eur(totals().total)}</span></div>
        <button class="btn primary" data-a="submit-details">Continue ${ICON.next}</button>`,
    };
  }

  // ---------- Screen: payment ----------
  function viewPayment() {
    const t = totals();
    const opts = D.paymentMethods.map((m) => `<button class="pay-opt ${S.pay === m.id ? "sel" : ""}" data-a="pay" data-id="${m.id}">
        <span class="radio"></span><span class="col"><span class="strong">${m.label}</span>${m.note ? `<span class="tiny">${m.note}</span>` : ""}</span></button>`).join("");
    const cta = `<button class="btn primary block" data-a="place">Place order · ${eur(t.total)}</button>
      <span class="tiny" style="text-align:center">By ordering you accept our terms. ${esc(P.paymentTerms)}.</span>`;
    const d = S.details;
    return {
      body: `<div class="layout">
        <div class="main">
          <div class="col" style="gap:6px"><span class="h1">Payment</span>
            <span style="color:var(--ink-2)">Choose how you'd like to pay. Production starts when we receive your payment.</span></div>
          <div class="col" style="gap:8px">${opts}</div>
          <div class="card" style="padding:16px">
            <div class="row" style="justify-content:space-between"><span class="h3">Delivery address</span><button class="link" data-a="go" data-step="details">Edit</button></div>
            <span class="small" style="display:block;margin-top:6px">${esc(d.company)}<br/>${esc(d.name)}<br/>${esc(d.street)}, ${esc(d.postcode)} ${esc(d.city)}<br/>${esc(d.country)}</span>
          </div>
          <button class="link" data-a="go" data-step="details">← Back</button>
        </div>
        <div class="aside">${summary({ cta })}</div>
      </div>`,
      sticky: `<button class="btn primary" data-a="place">Place order · ${eur(t.total)}</button>`,
    };
  }

  // ---------- Screen: done ----------
  function viewDone() {
    const steps = [
      ["Order received", "Today", true],
      ["Payment", S.pay === "bank" ? "Invoice sent to " + S.details.email : "Paid", S.pay !== "bank"],
      ["Production", "Starts after payment", false],
      ["Shipped", "You get a track & trace link", false],
      ["Delivered", P.deliveryDate, false],
    ];
    return {
      body: `<div class="col" style="gap:16px;max-width:640px;margin:0 auto;width:100%">
        <div class="card col" style="padding:24px;gap:8px;align-items:center;text-align:center">
          <div class="avatar lg" style="background:var(--green);color:#fff;font-size:26px">✓</div>
          <span class="h1">Thanks ${esc(P.client)}, your order is in!</span>
          <span class="small">Order ${S.orderNo} · confirmation sent to ${esc(S.details.email)}</span>
        </div>
        <div class="card" style="padding:20px"><span class="h2">What happens next</span>
          <div class="timeline" style="margin-top:14px">${steps.map(([t, s, done], i) => `<div class="tl ${done ? "done" : ""}">
            <div class="mark"><div class="circle">${done ? "✓" : ""}</div>${i < steps.length - 1 ? '<div class="stem"></div>' : ""}</div>
            <div class="body"><span class="strong">${t}</span><br/><span class="tiny">${esc(s)}</span></div></div>`).join("")}</div>
        </div>
        ${summary()}
        ${amCard("I'll keep an eye on your order. Questions? Call or email me.")}
        <button class="btn secondary" data-a="reset">Restart prototype</button>
      </div>`,
      sticky: "",
    };
  }

  // ---------- Prototype controls ----------
  function controls() {
    if (!S.ctrlOpen) return `<button class="ctrl-btn" data-a="ctrl">⚙ Prototype controls</button>`;
    const seg = (key, opts) => `<div class="seg-ctl">${opts.map(([v, l]) => `<button class="${S[key] === v ? "on" : ""}" data-a="set" data-k="${key}" data-v="${v}">${l}</button>`).join("")}</div>`;
    const tog = (key, label) => `<div class="opt"><span>${label}</span><button class="toggle ${S[key] ? "on" : ""}" data-a="flip" data-k="${key}"><span class="knob"></span></button></div>`;
    const jumps = flow().filter((s) => s.id !== "received").concat([{ id: "done", label: "Done" }])
      .map((s) => `<button class="${S.step === s.id ? "on" : ""}" data-a="go" data-step="${s.id}">${s.label}</button>`).join("");
    return `<div class="ctrl">
      <div class="row" style="justify-content:space-between"><b>Prototype controls</b><button data-a="ctrl" style="color:#b7a8d9">✕</button></div>
      <span class="hint">Not part of the design. Flip scenarios while iterating.</span>
      <h4>Viewport</h4>${seg("viewport", [["mobile", "Mobile 390"], ["desktop", "Desktop"]])}
      <h4>Scenario</h4>
      ${tog("mockup", "Offer includes digital design")}
      ${tog("designReady", "Design ready")}
      ${tog("hideMoq", "Hide MOQs (no tiers)")}
      ${tog("urgency", "Urgency banner")}
      <h4>Jump to screen</h4><div class="jump">${jumps}</div>
      <button class="btn secondary sm" data-a="reset" style="color:#2b2140">Reset everything</button>
    </div>`;
  }

  // ---------- Render ----------
  const stage = document.getElementById("stage");
  const device = document.getElementById("device");
  const ctrlRoot = document.getElementById("controls");

  function render() {
    if (S.step === "design" && !S.mockup) S.step = "details";
    stage.className = "stage " + S.viewport;
    const v = { offer: viewOffer, design: viewDesign, details: viewDetails, payment: viewPayment, done: viewDone }[S.step]();
    device.innerHTML = `<div class="app">
      ${header()}${stepper()}
      <div class="content"><div class="wrap">${v.body}</div></div>
      ${footer()}
      ${v.sticky ? `<div class="sticky">${v.sticky}</div>` : ""}
    </div>`;
    ctrlRoot.innerHTML = controls();
    try { history.replaceState(null, "", "#" + S.step); } catch (e) {}
  }

  let toastTimer;
  function toast(msg) {
    let el = document.querySelector(".toast");
    if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
    el.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.remove(), 2600);
  }

  function goTo(step) {
    S.step = step;
    render();
    device.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function setQty(id, qty, source) {
    const l = line(id), p = prod(id);
    qty = Math.max(1, Math.round(qty) || 1);
    const before = unit(p, l.qty);
    l.qty = qty;
    const after = unit(p, qty);
    render();
    // R9.25: explain the price change
    if (after !== before) toast(`${p.short}: ${eur(after)} per piece at ${int(qty)} pcs (was ${eur(before)})`);
    else if (source === "custom" && qty < p.tiers[0].qty) toast(`Minimum price tier is ${p.tiers[0].qty} pcs; price shown is the ${p.tiers[0].qty} pcs price`);
  }

  // ---------- Events ----------
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-a]");
    if (!el || el.disabled) return;
    const a = el.dataset.a, id = el.dataset.id;
    const cur = () => activeLines()[S.designIdx];
    switch (a) {
      case "go": goTo(el.dataset.step); break;
      case "toggle": {
        const l = line(id); l.on = !l.on; if (l.on) l.open = true; render();
        toast(l.on ? `${prod(id).short} added to your order` : `${prod(id).short} removed. Turn it back on any time.`);
        break;
      }
      case "open": S.lines.forEach((l) => (l.open = l.id === id)); render(); break;
      case "qty": setQty(id, +el.dataset.q); break;
      case "qty-step": setQty(id, line(id).qty + +el.dataset.d); break;
      case "custom": { const v = parseInt(line(id).custom, 10); if (v > 0) setQty(id, v, "custom"); break; }
      case "pdf": toast("Prototype: opens the print dialog as PDF"); setTimeout(() => window.print(), 300); break;
      case "toast": toast(el.dataset.msg); break;
      case "design-ready": S.designReady = true; render(); break;
      case "logo-toggle": S.logoOpen = !S.logoOpen; render(); break;
      case "design-idx": S.designIdx = +el.dataset.i; render(); break;
      case "check": { const l = cur(); l.checks[+el.dataset.i] = !l.checks[+el.dataset.i]; render(); break; }
      case "approve": {
        const lines = activeLines(); cur().status = "approved";
        const next = lines.findIndex((x) => x.status !== "approved");
        if (next >= 0) { S.designIdx = next; toast("Design approved. Next one."); } else toast("All designs approved!");
        render(); break;
      }
      case "unapprove": cur().status = "todo"; render(); break;
      case "change-open": cur().changeOpen = true; render(); break;
      case "change-close": cur().changeOpen = false; render(); break;
      case "send-change": {
        const l = cur();
        if (!l.change.trim()) { toast("Describe what you'd like to change first"); break; }
        l.status = "change"; l.changeOpen = false; render(); toast("Sent to our designer"); break;
      }
      case "prototype-new-design": { const l = cur(); l.status = "todo"; l.checks = [false, false, false]; l.change = ""; render(); break; }
      case "submit-details": {
        S.errors = {};
        FIELDS.forEach(([k, label, req]) => { if (req && !String(S.details[k] || "").trim()) S.errors[k] = "Please fill in " + label.toLowerCase(); });
        if (S.details.email && !/^\S+@\S+\.\S+$/.test(S.details.email)) S.errors.email = "Please check your email address";
        if (Object.keys(S.errors).length) { render(); toast("Please check the highlighted fields"); } else goTo("payment");
        break;
      }
      case "pay": S.pay = id; render(); break;
      case "place": S.orderNo = P.number + ".01"; goTo("done"); break;
      case "reset": { const keep = { viewport: S.viewport, ctrlOpen: S.ctrlOpen }; S = Object.assign(initial(), keep); goTo("offer"); break; }
      case "ctrl": S.ctrlOpen = !S.ctrlOpen; render(); break;
      case "set": S[el.dataset.k] = el.dataset.v; render(); break;
      case "flip": S[el.dataset.k] = !S[el.dataset.k]; render(); break;
    }
  });

  // Text inputs update state without re-rendering (keeps focus)
  document.addEventListener("input", (e) => {
    const el = e.target, k = el.dataset.in;
    if (!k) return;
    if (k === "custom") line(el.dataset.id).custom = el.value;
    if (k === "change") line(el.dataset.id).change = el.value;
    if (k === "detail") S.details[el.dataset.k] = el.value;
  });
  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.dataset.in === "qty-direct") setQty(el.dataset.id, parseInt(el.value, 10));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.dataset && e.target.dataset.in === "custom") {
      const v = parseInt(e.target.value, 10); if (v > 0) setQty(e.target.dataset.id, v, "custom");
    }
  });

  const hash = location.hash.slice(1);
  if (["offer", "design", "details", "payment", "done"].includes(hash)) S.step = hash;
  if (S.step === "done") S.orderNo = P.number + ".01";
  render();
})();
