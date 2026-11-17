# thmastin's Professions

A community addon for Polestar, the leveling guide addon for World of
Warcraft: Forever, by thmastin. It is a separate addon with thmastin's own
guides; it is not made by Polestar.

## What's in it

**Fishing and Cooking 1-300** (one guide for Alliance, one for Horde). The two skills level
together: you catch the fish each Cooking range needs, then cook them.

- Waters are picked by catch rate and fishing time, not by distance alone. The guide sends
  you to the water where the fish you need bite most often, if the trip there is worth the
  casts it saves. Each water tip gives the catch rate, the casts and an estimated time.
- The fish line counts down to what your Cooking still needs.
- Trainers, recipes and Campfire Kits (kept topped up to 10) are worked in along the way.

## Known limits

- Played in game from 1 to 150 (Alliance). From 150 up, and all of the Horde guide, the
  route has passed Polestar's automatic playtests but hasn't been played in game yet.
- Some fishing spots aren't checked in game yet. If the arrow points somewhere odd, stand
  at the water, type `/polestar where`, and send the line it prints.
- Catch rates come from Classic loot tables. A few waters have no data (marked
  "unverified" in their tip).
- After a /reload or a guide reset, the fish count can read high until your next Cooking
  point. The guide never waits on it.

## For players

1. Install Polestar first.
2. Get "thmastin's Professions" from Community Guides on polestar.guide: the Polestar Client installs
   and updates it, or download the zip there and unzip it into the game's `Interface/AddOns/` folder,
   next to `Polestar`.
3. Restart the game. Its guides appear in Polestar's guide menu
   (`/polestar guides`) under Community guides; Options > Community guides
   (`/polestar packs`) turns the addon on or off.

Credits: thmastin. Licence: CC-BY-4.0 (see `LICENSE`).

This addon is supported by thmastin, not by Polestar: report its problems
here.

## For authors

This addon is built from a pack: a folder with a `pack.json` and `.guide`
files. This pack was started with `polestar new`, which needs an empty folder: for
your next pack, run `polestar new` first and `git init` in the folder after
(a folder holding only `.git` counts as not empty).

You need Node 24 or newer, Lua 5.1 and a Polestar clone with `npm link`
run in it (`polestar doctor` checks all of it), and `forge` built in the
clone (`cargo build --release -p forge` in its `rust/`) on your PATH. From
this folder:

- `polestar find <text>`: look up quest, NPC, object, item and guide ids, and
  the inn and flight point names `sethome`, `hearth`, `getfp` and `fly` take.
- `forge guide lint`: check the guides (in VS Code: the default build task).
- `polestar playtest`: play every guide to the end in the real addon.
- `polestar dev`: copy the pack into the game's AddOns folder while you work.
- `forge release pack`: write the release zip to `dist/`.

Polestar's source describes the guide format on one page in
docs/GUIDE_CHEATSHEET.md, in full in docs/GUIDE_FORMAT.md, and packs in
docs/GUIDE_PACKS.md (what a community addon is, what the tools require, what is asked
of authors) and docs/PACKS.md (the full handbook).
