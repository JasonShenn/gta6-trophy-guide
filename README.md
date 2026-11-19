# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/JasonShenn/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/JasonShenn/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Build an offline web app that guides and tracks all 55 GTA 6 trophies: the official list with saved progress, filters and a spoiler setting, a roadmap to the platinum, and a guide to each that cites its sources; an AI judge compares the guides two at a time, places go by win rate, and the 50 best share $250.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no network needed: every file the page loads lives under `app/`.

## What it is

**Leonida Platinum** — an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden; 0 online; about 200 hours at difficulty 4/10, one playthrough).

- **Checklist** — every trophy with its official name, description and grade, a progress bar and per-grade counts, search, filters by kind (story, missable, collectibles, activities, online) and by grade. Ticking a trophy saves it in localStorage.
- **Guides** — each trophy has a guide written in this entry's own words, with its sources named and linked beside it (KeenGamer, GTA Zone, OutputLag, Exophase, PSNProfiles). Five hidden trophies whose unlocks are still unconfirmed say so plainly instead of inventing a method.
- **Platinum roadmap** — eight steps from setup to cleanup, in chapter order, with the 100% completion checklist numbers and the missable step flagged.
- **Missables** — only one trophy can possibly be missed: Positive Mental Attitude (18 meditation spots, the first in Chapter 1). The page explains the save discipline that protects it.
- **Spoiler-safe mode** — hides the names and descriptions of story trophies you have not earned yet.
- **Export / import** — download your progress as JSON and import it back; a reset button clears the ticks.

The trophy list was checked against KeenGamer, GTA Zone and OutputLag, which agree on all 55 names, descriptions, grades and counts.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
