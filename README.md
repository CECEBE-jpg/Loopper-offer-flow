# Loopper offer flow

Redesign of the client-facing offer flow (online offer → design approval → details → payment). Prototypes only, dummy data.

## What's here

| Path | What it is |
|---|---|
| `frontend/prototype/online-offer-v6.html` | Layout variant (also on branch `v6`): header card with offer facts + account manager, centred steps, full-width collapsible product cards, summary bottom-right, fixed Previous/Next bar |
| `frontend/prototype/online-offer-v5.html` | Latest online offer page (Figma "Offer flow" 17:128: compact product cards, full-width quantity rows, custom-quantity row) |
| `frontend/prototype/online-offer-v4.html` | Previous version, also kept on branch `v4` (Figma "Offer flow" 5:914 + iterations: logo dropdown, sticky/condensing header, add-alternative toggle) |
| `frontend/prototype/online-offer-v4-figma.html` | Static 3-frame version of v4 for pushing into Figma; built with `node export-figma.js` |
| `frontend/prototype/online-offer-v3.html` | Previous version (Figma node 5:1396) |
| `frontend/prototype/interactive/` | Clickable mobile/desktop flow prototype (edit content in `data.js`) |
| `frontend/*.html` | Earlier static drafts (v1, v2, design check) |
| `backend/project-page.html` | Back-office project page prototype (parked) |
| `journey-map/index.html` | Customer journey map of the current flow |
| `notes-and-ideas.md` | Notes and requirements list (R1–R9) |
| `meeting-notes/` | Sprint notes |

## Run locally

Serve the folder with any static server, for example:

```bash
npx serve . -l 3000
```

Then open `http://localhost:3000/frontend/prototype/online-offer-v5`.

## Not in the repo

`screenshots/`, the account manager photo and the meeting-notes example image are excluded (`.gitignore`) because they can show real client data or real people. Pages that use the photo show an empty avatar without it.
