# Offer flow: notes and ideas

Loose thoughts captured while walking the flow as a client. Not yet prioritised.

---

## 2026-10-13: Confirmation email and upload-logo page

**Context:** after submitting the quote request (with a logo), I received the confirmation email asking me to upload my logo, and opened the upload-logo page from it. See journey map steps 6–8.

**Thoughts as a client**

- The email asks me to upload my logo, even though I already submitted one with the request. Confusing.
- This email is also an opportunity to encourage the client to sign up or log in to their client account.
- The upload-logo page that opens from the email needs a stronger redesign, and it should link back to the customer account.
- It isn't clear what I should expect once I upload the logo. I uploaded it and not much happened: I got unclear feedback confirming the upload, and that was it.

**Idea: first redesign candidates**

1. The confirmation email the client receives after requesting a quote.
2. The upload-logo page (client portal).

Both should make the next step clear (what happens now, and when) and lead the client into their account.

---

## 2026-10-13: Requirements list for the redesign


Version 0.1 · 2026-10-13 · based on the customer journey walk-through (test project 5436794) and prototype `frontend/prototype/project-page.html`.

**Priority:** Must = needed for the first release · Should = important, can follow shortly · Could = nice to have
**Layer:** FE = frontend (website, emails, portal) · BO = back office UI · BE = backend / data
**Source:** journey map step where the problem was found (see `journey-map/index.html`)

---

### 1. Request form and data carry-over

| ID | Requirement | Priority | Layer | Source |
|---|---|---|---|---|
| R1.1 | The product page configuration (colour, print method, print position, quantity) is passed to the quote form and saved on the request. | Must | FE · BE | Step 4 |
| R1.2 | The quote form shows the chosen configuration as an editable summary, with the indicative price from the product page. | Must | FE | Step 4 |
| R1.3 | The print method saved on the request pre-fills the print option on the auto-created draft offer. | Must | BE | Step 12 |
| R1.4 | "How many colours in your logo?" is only asked for print methods where colour count affects the price (not for engraving). | Should | FE | Step 4 |
| R1.5 | Salutation is optional and has a neutral option. Gender is not inferred from it. | Should | FE · BE | Steps 4, 10 |
| R1.6 | A "What happens next" block next to the submit button: offer arrival time, free digital proof, no obligation. | Must | FE | Step 4 |
| R1.7 | The colour picker shows all colours without a hidden scroll area. The date field is disabled when "As soon as possible" is selected. | Could | FE | Step 4 |

### 2. Thank-you page and confirmation email

| ID | Requirement | Priority | Layer | Source |
|---|---|---|---|---|
| R2.1 | Show an offer arrival time that depends on office hours (e.g. "Your offer arrives Wed 14 Oct before 12:00"). Remove "right away" outside office hours. | Must | FE · BE | Steps 5, 6 |
| R2.2 | The request overview shows the full request: product, configuration, quantity, deadline, logo thumbnail and comments. | Must | FE | Step 5 |
| R2.3 | "Product alternatives" ticks give visible feedback when saved ("We'll include a sustainable option"). | Should | FE | Step 5 |
| R2.4 | The confirmation email is sent from a named account manager (or team inbox) with a monitored reply-to, not `noreply@`. | Must | BE | Step 6 |
| R2.5 | The email shows the logo status ("We received logo.png ✓" or "No logo yet: upload it here"), not a generic upload request. | Must | FE · BE | Step 6 |
| R2.6 | The email has a clear subject (e.g. "We received your request for 25 Thermos bottles"), the request summary, and a link to the client's request page or account. | Must | FE | Step 6 |
| R2.7 | The email invites the client to log in to or create their client account. | Should | FE · BE | Notes 13 Oct |
| R2.8 | Footer content (years of experience, review platform and score, logo, payment logos, flags) is consistent with the website and fits the client's market. | Should | FE | Steps 6, 7 |

### 3. Client portal (request page and logo upload)

| ID | Requirement | Priority | Layer | Source |
|---|---|---|---|---|
| R3.1 | The portal runs on the Loopper brand domain (e.g. `my.loopper.com`) with the website header and styling. | Must | FE · BE | Step 7 |
| R3.2 | The upload page shows context: greeting, request number, product, current logo status, accepted file types and max size (5 MB; image, AI, EPS, PSD, PDF, SVG). | Must | FE | Step 7 |
| R3.3 | Upload feedback appears next to the upload area: thumbnail, file name, size, ✓ "Received", with remove/replace. No page reload. | Must | FE | Step 8 |
| R3.4 | After an upload, the page shows the next step and a link to the request page. "Close this window" is not the only next step. | Must | FE | Step 8 |
| R3.5 | The portal grows into a "My request" page: timeline, account manager, logos, design proof, offer, accept and pay. | Should | FE · BE | Steps 7, 8 |
| R3.6 | Remove debug information (timer, branch, deploy time) from all client-facing and production pages. | Must | FE | Steps 7, 9 |
| R3.7 | The client can add a note per logo (e.g. "use the white version on dark bottles"). | Could | FE · BE | Step 8 |
| R3.8 | The logo upload page uses the same layout and progress bar as the online offer (e.g. 0. Request received → 1. Offer → 2. My details → 3. Checkout), so the client already knows the interface before the offer arrives. | Should | FE | Notes 13 Oct (offer page) |

### 4. Back office: project page

| ID | Requirement | Priority | Layer | Source |
|---|---|---|---|---|
| R4.1 | The header shows project number, client, status, rating, language/region, request time, **offer due time**, value and source. | Must | BO | Prototype ② |
| R4.2 | One "Change status" control with statuses grouped by stage. Autosave with confirmation; no separate Save buttons. | Must | BO | Step 10 |
| R4.3 | A progress tracker based on real events with timestamps (Requested → Assigned → Offer sent → Viewed → Confirmed → Paid → Delivered) replaces the % bar and checklist tiles. | Must | BO · BE | Step 10 |
| R4.4 | A "Next step" card shows the recommended action and blocking checks, each with an inline fix button. | Must | BO | Prototype ④ |
| R4.5 | A "What the client asked for" card shows the product, configuration, logos, comments and alternatives, and flags differences from the product page configuration. | Must | BO | Step 10 |
| R4.6 | An offer summary card shows total, per-piece price, breakdown, margin, sent/viewed status, and visible actions (edit, preview, PDF, copy link, send). | Must | BO | Step 12 |
| R4.7 | One activity timeline combines client actions, system events, emails, notes, tasks and offer visits, with filters and a single input for notes and tasks. | Should | BO · BE | Step 10 |
| R4.8 | The team block shows each role with an Assign / Change button in place. | Must | BO | Step 10 |
| R4.9 | Payment status reads "Not started" until the client confirms. No "Waiting for payment" on new requests. | Must | BO · BE | Step 10 |
| R4.10 | Company addresses are deduplicated and the most recently used one is suggested. | Should | BO · BE | Step 10 |
| R4.11 | Sections that aren't available yet (Orders, Invoices…) stay visible but disabled, with the reason as a tooltip. | Could | BO | Prototype ① |
| R4.12 | Low-use fields (purchase notes, dates, marketing source, other projects) sit in collapsible sections. | Should | BO | Prototype |
| R4.13 | Section badges show meaningful state ("Logos 2 · not checked") instead of a red ✗. | Must | BO | Steps 10, 11 |

### 5. Back office: logos

| ID | Requirement | Priority | Layer | Source |
|---|---|---|---|---|
| R5.1 | Logo thumbnails render on a checkerboard background and keep transparency (no PNG → JPG conversion for thumbnails). | Must | BO · BE | Steps 10, 11 |
| R5.2 | Each logo shows its source and time (form / portal / AM upload). | Should | BO | Step 11 |
| R5.3 | File facts are detected automatically: vector or raster, resolution, white/transparent logo. Only problems are flagged. | Should | BE | Step 11 |
| R5.4 | Delete is a quiet icon button with a confirm or undo step. | Must | BO | Step 11 |
| R5.5 | "Request logo" and automatic logo emails are blocked when a logo already exists on the project. | Must | BE | Steps 6, 10 |

### 6. Back office: assignment and offer creation

| ID | Requirement | Priority | Layer | Source |
|---|---|---|---|---|
| R6.1 | New requests are assigned automatically (country/language → AM pool → workload or round robin, with a duty-AM fallback). | Must | BE | Step 9 |
| R6.2 | Every request gets an offer-due time based on office hours. The project list shows it with colour coding and sorts by urgency. | Must | BO · BE | Step 9 |
| R6.3 | Standard requests (stock product, known print method, logo present) are sent automatically as "Offer sent by system". Only exceptions go to manual review. | Should | BE | Steps 9, 12 |
| R6.4 | A pre-send check blocks or warns on: print option missing, logo not attached, invoice address missing, VAT not validated. | Must | BO · BE | Step 12 |
| R6.5 | VAT numbers are validated automatically (VIES) and the VAT rule is explained in the editor (e.g. "0% export, non-EU"). | Must | BE | Step 12 |
| R6.6 | Price tiers are generated automatically around the requested quantity (e.g. 25 / 50 / 100 / 250). | Should | BE | Step 12 |
| R6.7 | Uploaded logos are attached to the offer and mockup request automatically. | Must | BE | Step 12 |
| R6.8 | Requested alternatives (Sustainable, Bigger print…) appear as a to-do in the offer editor with an "Add alternative" action. | Should | BO | Step 12 |
| R6.9 | The offer editor has one primary "Send offer" button with a preview of what the client will see. | Must | BO | Step 12 |

### 7. Data, tracking and platform

| ID | Requirement | Priority | Layer | Source |
|---|---|---|---|---|
| R7.1 | Google Ads click id and UTM parameters are stored with the request and resolved to source, medium and campaign. | Must | BE | Step 10 |
| R7.2 | Quote requests are tracked as their own conversion, separate from shop orders (not via `/shoppingcart/thank-you` only). | Should | FE · BE | Step 5 |
| R7.3 | One review platform and score is used on all touchpoints, from a single source. | Should | FE · BE | Step 7 |
| R7.4 | Track key timings per request: request → assigned, request → offer sent, offer sent → viewed, viewed → confirmed. | Must | BE | Steps 9, 12 |
| R7.5 | Investigate the 1,769 "Offer not viewed" call tasks: measure offer email open and click rates before and after the redesign. | Must | BE | Back office header |

### 8. Security and privacy

| ID | Requirement | Priority | Layer | Source |
|---|---|---|---|---|
| R8.1 | Client portal and login links expire, are single-purpose, and aren't regenerated on every back-office page load. | Must | BE | Back office source |
| R8.2 | Business KPIs (revenue, ad spend, CPA) and staff lists are only loaded for roles that need them, not hidden in every page's HTML. | Should | BO · BE | Back office source |

### 9. Online offer page (client)

Features the current offer page already has, and must come back in the redesign, plus the fixes found in journey map step 14.

**Keep (existing features)**

| ID | Requirement | Priority | Layer | Source |
|---|---|---|---|---|
| R9.1 | A progress bar for the ordering steps: Offer → My details → Checkout. It's extended to start earlier in the flow (see R3.8). | Must | FE | Step 14 |
| R9.2 | Project header: project number, company, project date, assigned account manager with name, email and website link. | Must | FE | Step 14 |
| R9.3 | Personal greeting and short intro text from the account manager. | Must | FE | Step 14 |
| R9.4 | "Your logo" section: shows the text logo (text, font, colour) and uploaded logo files, with Edit, Delete, Upload logo and a "White logo" switch. | Must | FE | Step 14 |
| R9.5 | Product line: image with thumbnails, title, colour, article number, personalisation (method and position), delivery badge and expected delivery date. | Must | FE | Step 14 |
| R9.6 | Quantity selection with price tiers (all-in price per piece and subtotal per tier), plus a custom quantity field. | Must | FE · BE | Step 14 |
| R9.7 | Order summary: subtotal, shipping, VAT, total, and payment terms ("to be paid prior to production"). | Must | FE | Step 14 |
| R9.8 | Primary action "Proceed with ordering" to step 2 (My details). | Must | FE | Step 14 |
| R9.9 | Secondary actions: Download offer as PDF, Share this offer, Request sample quote, Found a better price? | Must | FE · BE | Step 14 |
| R9.10 | Account manager block next to the actions ("Hi, I am …, your personal account manager"). | Must | FE | Step 14 |
| R9.11 | Social proof: "Clients we are proud to work with" logos, USP bar and review score. | Should | FE | Step 14 |
| R9.12 | Offer visit tracking (first visit, latest visit, number of visits) feeding the back office. | Must | BE | Step 10 |
| R9.13 | Support for multiple product lines and alternatives in one offer, with "Deselect row", "Block from ordering" and "Hide MOQs" controlled from the back office. | Must | FE · BE | Step 12 |
| R9.14 | Digital design / mockup step visible in the offer when the flow includes a mockup ("Mockup visible online offer" setting). | Must | FE · BE | Step 12 |

**Improve (fixes for the redesign)**

| ID | Requirement | Priority | Layer | Source |
|---|---|---|---|---|
| R9.15 | VAT is calculated with the same rule as the back office and product page. The VAT rule is shown in words ("20% UK VAT" or "0% export, outside EU"), and prices are labelled excl./incl. VAT. | Must | FE · BE | Step 14 |
| R9.16 | Uploaded logos render on a checkerboard background with file name and ✓ received. Text logos are never truncated. | Must | FE | Step 14 |
| R9.17 | Design status is shown: "Design in progress, ready by …", the design proof with Approve / Request change, or "Upload your logo to get a free design". | Must | FE · BE | Steps 13, 14 |
| R9.18 | Price tiers are presented as volume prices ("price per piece drops to €5.77 at 250, save €…"), not as discounts on a crossed-out price. The recommended tier can be highlighted. | Should | FE | Step 14 |
| R9.19 | Shipping is shown honestly: either as a separate line, or as "Shipping included in the price", not as "free". | Must | FE | Step 14 |
| R9.20 | Requested alternatives (Sustainable, Bigger print…) appear as selectable offer lines, or the account manager explains why none were added. | Should | FE · BO | Steps 5, 14 |
| R9.21 | The account manager is the same person as in the emails, with a real photo, direct phone and email next to the main action. | Must | FE · BE | Steps 13, 14 |
| R9.22 | Offer validity is shown ("Valid until …"), and a reminder is sent before it expires. | Should | FE · BE | Step 13 |
| R9.23 | The page uses the brand domain and website styling (see R3.1) and works well on mobile, with the total and main action always visible (sticky summary). | Must | FE | Steps 7, 14 |
| R9.24 | Copy and data are cleaned up: no typos ("opecn"), no stray labels ("Laser"), one review platform and score, payment logos that fit the client's market. | Must | FE | Step 14 |
| R9.25 | Price changes are explained when the client changes the quantity (total, per-piece price and delivery date update straight away, without a page reload). | Should | FE | Step 14 |

---

### Open questions

- What decides between "Offer sent by system" and manual handling today? (`/settings/automaticoffer`)
- What is the internal target for request → offer time?
- Is `client.loopperprojects.com` built in-house, and who owns it?
- Why does Payments show 2 entries before the client has confirmed?
- Why did the offer total come to €246.50 when product + engraving + setup + shipping add up to €246.31?

---

## 2026-10-13: Use the offer page's progress bar from the logo upload onwards

**Context:** the online offer page (journey map step 14) has a clear 3-step progress bar: 1. Offer → 2. My details → 3. Checkout. The logo upload page (steps 7–8) has no progress bar and looks like a different system.

**Thought as a client**

- Why not make the client familiar with this interface already when they upload the logo?
- Why not show the progress bar on the logo upload page too?

**Idea**

- Show the same progress bar on the upload page, with an extra first step for where the client is now. For example: *Request received ✓ → Logo & design (you are here) → Offer → My details → Checkout*.
- Use the same layout, header and account manager block as the offer page. When the offer arrives, the client recognises the page and knows the next step.
- This fits the "My request" page idea (R3.5): one page that grows with the project, instead of separate one-off pages.

Added as requirement **R3.8** in the requirements list above.
