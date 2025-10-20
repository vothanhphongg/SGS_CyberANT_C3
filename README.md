# Resilience Roll — Play for Impact

A lightweight, browser‑only 2D board‑card game that spotlights **community resilience to climate‑driven disasters** (floods in Việt Nam, heatwaves/bushfires in Australia). Players roll a dice to move across a seasonal track; at each stop they draw **realistic event cards** and pick a response (policy/initiative). Choices impact four gauges: **Budget, Resilience, Awareness, Equity**. Finish the season with healthy gauges to win — and learn practical actions communities can take.

> Runs 100% client-side: **HTML + CSS + JavaScript** (no installs, no backend).

---

## How to run
1. Download or clone this repo.
2. Open `game_submission/game_app/index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
3. Play! (Choose region **Việt Nam** or **Australia** on the Menu, then press **Start**.)

_No builds. No package managers. No internet required._

---

## Game loop (high level)
- Choose a **region** and **difficulty**.
- Roll the dice → move along a **30-tile season track**.
- Draw an **Event Card** (e.g., “River flood warning” / “Severe heatwave”) with **3 response options**.
- Your choice changes **Budget / Resilience / Awareness / Equity**.
- Aim to end with **Resilience ≥ 70**, **Budget ≥ 0**, **Awareness ≥ 60**, **Equity ≥ 55**.

---

## Why this topic?
- Việt Nam faces **floods, typhoons, sea-level rise**; Australia faces **heatwaves, bushfires**. Community decisions (early warning, cooling centers, mangrove planting, hazard education, inclusive outreach) matter.
- The game turns policy trade‑offs into a playful, memorable experience.

---

## Tech stack
- **Front-end only:** HTML, CSS, Vanilla JS
- **No frameworks** to keep it portable for judging
- **Accessible first:** keyboard support, high‑contrast mode toggle, reduced‑motion option

---

## Files you’ll find
```
game_submission/
├── README.md
├── project_report.pdf
├── youtube_link.txt
├── prompts/
│   ├── concept_prompts.txt
│   ├── asset_generation_prompts.txt
│   ├── code_generation_prompts.txt
│   └── refinement_prompts.txt
├── game_app/
│   ├── index.html
│   ├── styles.css
│   └── game.js
└── screenshots/
    ├── menu_screen.png
    ├── play_screen1.png
    ├── play_screen2.png
    ├── play_screen3.png
    └── results_screen.png
```

---

## Notes for judges
- **Educational hooks**: After each card, a short fact popover explains why the option helps (or harms) resilience.
- **Localization**: Region switch tailors the event deck (VN or AU context) while keeping core mechanics identical.
- **Replayability**: Events are shuffled; option effects vary by **difficulty**.

---

## Attributions
- Icons are emoji/Unicode, no external assets.
- All code authored by the team using LLM‑assistance (prompts in `/prompts`).

---

## License
MIT — free to reuse for education.
