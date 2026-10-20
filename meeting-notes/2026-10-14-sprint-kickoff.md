# Sprint kickoff: offer flow journey

**Date:** Wed 14 Oct 2026
**Attendees:** _tbd_
**Input:** journey map (`journey-map/index.html`, 15 steps), project page prototype (`frontend/prototype/project-page.html`), requirements list (`notes-and-ideas.md` / Notion "Offer flow - requirement list")

---

## Notes

**Online offer page**
- Give clients a **sense of urgency** in the offer.
- Show clients that their **mockup is in progress**. Existing example: the product image is greyed out with an "Ontwerp in uitvoering" (design in progress) overlay. See screenshot below.
- **Multi-product offers:** the client can deactivate a product. Existing example: an "In offerte: Ja" (in offer: yes) toggle per product line.
- **Hide MOQ** for the client in the offer: what does that look like for the client? (see open questions)
- When a mockup is requested, an **extra step is added** to the offer flow.
- **Download offer as PDF is important:** clients use it to share the offer with their manager.
- **"Share this offer"** opens the client's email program.
- **Mockup timing:** after receiving the offer, the client gets a "your digital design is ready" email within **10–30 minutes**. It takes them to the offer step "2. Ontwerp controleren" (check design) to approve it. This step varies per client and case. Added to the journey map as steps 16–19 (design email, design check, payment, checklist), using a Dutch example project.

**Example: multi-product offer (NL)**

![Multi-product offer example](2026-10-14-multi-product-offer-example.webp)

What the example shows, per product line:
- "In offerte" toggle to include or exclude the product.
- Product image with "Ontwerp in uitvoering" overlay while the mockup is being made.
- Personalisation, delivery badge, expected delivery date, and stock info (current stock, incoming stock, date of incoming stock).
- Quantity tiers (250 / 500 / 1,000 / 2,500) with "% Korting" (discount) labels, plus "Wijzig aantal" (change quantity).
- A comment from the account manager per product line.
- Label chips such as "Grotere opdruk" (bigger print), "Geweldig alternatief" (great alternative), "Snelle levering" (fast delivery), "Hoge kwaliteit" (high quality).

## Decisions

- **This sprint focuses mainly on the frontend.** The backend is not a priority this year.
  → Requirements tagged BE (backend) or BO (back office) go to the backlog for now. The project page prototype is for later.
- **Scope starts at the confirmation / "upload your logo" email.** Category page → product page → quote form → thank-you page already have redesigns (projects 01–04) and are out of scope. Journey map now starts at step 6.
- **Mobile is probably where the redesign gains the most.** The current offer flow on mobile is not optimal.

## Action items

| Who | What | When |
|---|---|---|
| _tbd_ | Watch Clarity recordings of how clients interact with the offer flow (focus on mobile). | _tbd_ |
| _tbd_ | Make a list of all emails the client receives: request confirmation, logo upload, offer, reminder(s), … | _tbd_ |

## Open questions

- What does "Hide MOQs" look like for the client in the online offer? (only one quantity, no tiers?)
- Which triggers and timings do the reminder emails have?

## Sprint scope

- Frontend of the client-facing offer flow, mobile first.
