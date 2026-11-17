'use strict';
// Builds guides/fishing-cooking-alliance.guide and guides/fishing-cooking-horde.guide.
// Run from the pack folder: node tools/fishing-cooking.js
// Edit the tables below, not the .guide files.

const fs = require('fs');
const path = require('path');

const R = {
	smallfish: { item: 6291, spell: 7751, name: 'Brilliant Smallfish', fish: 'Raw Brilliant Smallfish' },
	mackerel: { item: 6303, spell: 7752, name: 'Slitherskin Mackerel', fish: 'Raw Slitherskin Mackerel' },
	snapper: { item: 6289, spell: 7753, name: 'Longjaw Mud Snapper', fish: 'Raw Longjaw Mud Snapper' },
	albacore: { item: 6361, spell: 7827, name: 'Rainbow Fin Albacore', fish: 'Raw Rainbow Fin Albacore' },
	catfish: { item: 6308, spell: 7755, name: 'Bristle Whisker Catfish', fish: 'Raw Bristle Whisker Catfish' },
	cod: { item: 6362, spell: 7828, name: 'Rockscale Cod', fish: 'Raw Rockscale Cod' },
	trout: { item: 8365, spell: 20916, name: 'Mithril Headed Trout', fish: 'Raw Mithril Head Trout' },
	yellowtail: { item: 4603, spell: 18238, name: 'Spotted Yellowtail', fish: 'Raw Spotted Yellowtail' },
	redgill: { item: 13758, spell: 18241, name: 'Filet of Redgill', fish: 'Raw Redgill' },
};

// A water: zone, point, frame ('e' Era, 'l' live), label, recipe it feeds, a short note, and the
// area id (subzone, else zone) whose fishing pool it uses: see tools/fishing-pools.js.
const W = (zone, x, y, f, label, recipe, note, area) => ({ zone, x, y, f, label, recipe, note, area });

const BANDS = {
	A: { fish: [1, 50], cook: [1, 50] },
	B: { fish: [50, 125], cook: [50, 110] },
	C: { fish: [125, 150], cook: [110, 150] },
	D: { fish: [150, 175], cook: [150, 175] },
	E: { fish: [175, 225], cook: [175, 225] },
	F: { fish: [225, 300], cook: [225, 300] },
};

const FACTIONS = {
	Alliance: {
		file: 'fishing-cooking-alliance',
		capitals: ['Stormwind City', 'Ironforge', 'Darnassus'],
		startZone: 'Elwynn Forest',
		artisan: { fish: 6609, cook: 6612, city: 'Ironforge' },
		waters: {
			A: [
				W('Elwynn Forest', 47.61, 62.32, 'e', 'Crystal Lake', 'smallfish', 'a quiet lake south of Goldshire', 18),
				W('Dun Morogh', 35.48, 40.22, 'e', 'Iceflow Lake', 'smallfish', 'the frozen lake west of Kharanos', 211),
				W('Teldrassil', 55.88, 93.51, 'e', "Rut'theran Village", 'mackerel', "salt water off the Rut'theran docks", 702),
				W('Darnassus', 46.94, 57.0, 'e', 'Darnassus lake', 'smallfish', 'the lake in the middle of the city', 1657),
				W('Stormwind City', 55.09, 69.76, 'l', 'Canal docks', 'smallfish', 'the canals by the fishing shop', 1519),
				W('Zephras Isle', 45.02, 48.44, 'l', 'Zephras shore', 'smallfish', 'the shore by Fenn Fairweather', 16593),
			],
			B: [
				// Darkshore (30% Albacore) is left out by hand: for 68 fish it costs ~35 minutes more than
				// Menethil (59%), far more than the boat from Auberdine (checked in game: 9 of 30).
				W('Wetlands', 8.02, 58.35, 'e', 'Menethil Harbor', 'albacore', 'the harbour at Menethil', 150),
				W('Westfall', 36.23, 90.18, 'e', 'Westfall coast', 'albacore', 'the south coast below the lighthouse', 115),
				W('Loch Modan', 40.55, 39.7, 'e', 'The Loch', 'snapper', 'the big lake beside Thelsamar', 556),
				// Redridge (35% Snapper) is left out: ~26 minutes more than the Westfall coast, a short flight away.
			],
			C: [
				W('Redridge Mountains', 21.9, 51.13, 'l', 'Lake Everstill', 'catfish', 'the lake at Lakeshire', 68),
				W('Ashenvale', 38.0, 49.7, 'e', 'Astranaar lake', 'catfish', 'the lake around Astranaar', 331),
			],
			E: [
				// Trout first: 52 fish for Cooking 175-225 against 95 Cod, at about the same rate (~28 minutes less).
				W('Dustwallow Marsh', 58.7, 17.2, 'e', 'North coast', 'trout', 'the north coast of the marsh, away from Theramore Isle', 15),
				W('Alterac Mountains', 30.4, 35.2, 'e', 'Alterac lake', 'trout', 'the lake by the ruins of Alterac', 36),
				W('Dustwallow Marsh', 66.9, 45.25, 'e', 'Theramore docks', 'cod', 'the sea around Theramore', 513),
				W('Stranglethorn Vale', 27.42, 77.16, 'e', 'Booty Bay docks', 'cod', 'the bay under Booty Bay', 35),
				W('Arathi Highlands', 27.8, 85.4, 'e', "Faldir's Cove", 'cod', 'the cove on the south-west coast', 327),
			],
			F: [
				// Azshara first: 35% Redgill beats Tanaris's 25% Yellowtail by ~45 minutes over Cooking 225-300.
				W('Azshara', 51.6, 53.6, 'e', 'Azshara coast', 'redgill', 'the east coast', 16),
				W('Tanaris', 68.6, 23.0, 'e', 'Steamwheedle coast', 'yellowtail', 'the coast by Steamwheedle Port, where Gikkix sells the recipe', 977),
				W('Feralas', 31.08, 46.14, 'e', 'Feathermoon', 'yellowtail', 'the sea around Feathermoon Stronghold', 1116),
				W('Feralas', 44.1, 45.1, 'e', 'Verdantis River', 'redgill', 'the river south of Dire Maul (fresh water: Redgill)', 2521),
			],
		},
		// How to get there, where it isn't walking or a flight: "from>to" -> text.
		via: {
			'Darkshore>Wetlands': 'Take the boat from the Auberdine docks to Menethil Harbor.',
			'Teldrassil>Wetlands': "Take the boat from Rut'theran Village to Auberdine, then the Menethil boat from the next pier.",
			'Darnassus>Wetlands': "Take the portal down to Rut'theran Village, the boat to Auberdine, then the Menethil boat.",
			'Wetlands>Dustwallow Marsh': 'Take the boat from Menethil Harbor to Theramore.',
			'Ironforge>Dustwallow Marsh': 'Fly to Menethil Harbor and take the boat to Theramore.',
			'Loch Modan>Dustwallow Marsh': 'Fly to Menethil Harbor and take the boat to Theramore.',
			'Stormwind City>Dustwallow Marsh': 'Fly to Menethil Harbor and take the boat to Theramore.',
			'Redridge Mountains>Dustwallow Marsh': 'Fly to Menethil Harbor and take the boat to Theramore.',
			'Stormwind City>Azshara': 'Take the boat from Stormwind Harbor to Auberdine, then fly to Azshara.',
			'Ironforge>Azshara': 'Fly to Menethil Harbor, take the boat to Theramore, then fly to Azshara.',
				'Stranglethorn Vale>Azshara': 'Take the boat from Booty Bay to Ratchet, then fly to Azshara.',
			},
		// Capital or nearby zone -> the water of that band to send the player to.
		hubs: {
			A: { Ironforge: 'Dun Morogh', 'Loch Modan': 'Dun Morogh', Westfall: 'Elwynn Forest', Darkshore: 'Teldrassil', Darnassus: 'Teldrassil', 'Stormwind City': 'Elwynn Forest' },
			B: { 'Redridge Mountains': 'Westfall', 'Stormwind City': 'Westfall', 'Elwynn Forest': 'Westfall', Ironforge: 'Wetlands', 'Dun Morogh': 'Wetlands', Darnassus: 'Wetlands', Teldrassil: 'Wetlands', Darkshore: 'Wetlands' },
			C: { Wetlands: 'Redridge Mountains', 'Stormwind City': 'Redridge Mountains', 'Elwynn Forest': 'Redridge Mountains', Westfall: 'Redridge Mountains', Ironforge: 'Redridge Mountains', 'Loch Modan': 'Redridge Mountains', Darnassus: 'Ashenvale', Darkshore: 'Ashenvale' },
			E: { 'Stormwind City': 'Dustwallow Marsh', Ironforge: 'Dustwallow Marsh', 'Loch Modan': 'Dustwallow Marsh', Wetlands: 'Dustwallow Marsh', 'Redridge Mountains': 'Dustwallow Marsh', Darnassus: 'Dustwallow Marsh', Ashenvale: 'Dustwallow Marsh', 'Hillsbrad Foothills': 'Alterac Mountains' },
			F: { 'Dustwallow Marsh': 'Azshara', 'Stormwind City': 'Azshara', Ironforge: 'Azshara', Darnassus: 'Azshara', Feralas: 'Azshara', 'Stranglethorn Vale': 'Azshara' },
		},
	},
	Horde: {
		file: 'fishing-cooking-horde',
		capitals: ['Orgrimmar', 'Thunder Bluff', 'Undercity'],
		startZone: 'Durotar',
		artisan: { fish: 6608, cook: 6611, city: 'Orgrimmar' },
		waters: {
			A: [
				W('Durotar', 53.25, 81.59, 'e', "Sen'jin coast", 'mackerel', "the sea below Sen'jin Village", 14),
				W('Mulgore', 44.16, 63.8, 'l', 'Stonebull Lake', 'smallfish', 'the lake south of Bloodhoof Village', 223),
				W('Tirisfal Glades', 67.17, 50.99, 'e', 'Brightwater Lake', 'smallfish', 'the lake east of Brill', 162),
				W('Thunder Bluff', 56.13, 46.38, 'e', 'Thunder Bluff pools', 'smallfish', 'the pools under the rises', 1638),
				W('Undercity', 80.7, 31.26, 'e', 'Undercity canals', 'smallfish', 'the canals by the fishing trainer', 1497),
				W('Zephras Isle', 45.02, 48.44, 'l', 'Zephras shore', 'smallfish', 'the shore by Fenn Fairweather', 16593),
			],
			B: [
				// Ratchet first: 50% Albacore, ~11 minutes less than the oasis in the same zone.
				W('The Barrens', 62.77, 38.24, 'e', 'Ratchet docks', 'albacore', 'the sea at Ratchet, where Kilxx sells recipes', 392),
				W('The Barrens', 45.9, 39.8, 'e', 'Crossroads oasis', 'snapper', 'the oasis north-west of the Crossroads', 386),
				W('Silverpine Forest', 59.6, 33.4, 'e', 'Lordamere Lake', 'snapper', 'the lake shore east of the Sepulcher', 1338),
			],
			C: [
				W('Stonetalon Mountains', 46.9, 41.7, 'e', 'Mirkfallon Lake', 'catfish', 'the lake in the middle of the zone', 464),
				W('Ashenvale', 47.5, 71.2, 'e', 'Falfarren River', 'catfish', 'the river south of Raynewood', 433),
				W('Alterac Mountains', 30.4, 35.2, 'e', 'Alterac lake', 'catfish', 'the lake by the ruins of Alterac', 36),
			],
			E: [
				// Trout first: 52 fish for Cooking 175-225 against 95 Cod, at about the same rate (~28 minutes less).
				W('Dustwallow Marsh', 58.7, 17.2, 'e', 'North coast', 'trout', 'the north coast of the marsh', 15),
				W('Alterac Mountains', 30.4, 35.2, 'e', 'Alterac lake', 'trout', 'the lake by the ruins of Alterac', 36),
				W('Stranglethorn Vale', 27.42, 77.16, 'e', 'Booty Bay docks', 'cod', 'the bay under Booty Bay', 35),
				W('Desolace', 22.7, 72.42, 'e', 'Shadowprey coast', 'cod', 'the sea at Shadowprey Village, where Wulan sells both recipes', 2408),
				W('Arathi Highlands', 27.8, 85.4, 'e', "Faldir's Cove", 'cod', 'the cove on the south-west coast', 327),
			],
			F: [
				// Azshara first: 35% Redgill beats Tanaris's 25% Yellowtail by ~45 minutes over Cooking 225-300.
				W('Azshara', 51.6, 53.6, 'e', 'Azshara coast', 'redgill', 'the east coast', 16),
				W('Tanaris', 68.6, 23.0, 'e', 'Steamwheedle coast', 'yellowtail', 'the coast by Steamwheedle Port, where Gikkix sells the recipe', 977),
				W('Feralas', 44.1, 45.1, 'e', 'Verdantis River', 'redgill', 'the river south of Dire Maul (fresh water: Redgill)', 2521),
				W('The Hinterlands', 80.33, 81.54, 'e', 'Revantusk coast', 'redgill', 'the sea below Revantusk Village', 47),
			],
		},
		via: {
			'Stranglethorn Vale>Azshara': 'Take the boat from Booty Bay to Ratchet, then fly to Azshara.',
		},
		hubs: {
			A: { Orgrimmar: 'Durotar', 'The Barrens': 'Durotar', 'Silverpine Forest': 'Tirisfal Glades', 'Thunder Bluff': 'Mulgore', Undercity: 'Tirisfal Glades' },
			B: { Orgrimmar: 'The Barrens', Durotar: 'The Barrens', 'Thunder Bluff': 'The Barrens', Mulgore: 'The Barrens', Undercity: 'Silverpine Forest', 'Tirisfal Glades': 'Silverpine Forest' },
			C: { Orgrimmar: 'Stonetalon Mountains', 'The Barrens': 'Stonetalon Mountains', 'Thunder Bluff': 'Stonetalon Mountains', Mulgore: 'Stonetalon Mountains', Undercity: 'Alterac Mountains', 'Silverpine Forest': 'Alterac Mountains', 'Hillsbrad Foothills': 'Alterac Mountains' },
			E: { Orgrimmar: 'Dustwallow Marsh', 'The Barrens': 'Dustwallow Marsh', Durotar: 'Dustwallow Marsh', 'Thunder Bluff': 'Dustwallow Marsh', 'Stonetalon Mountains': 'Dustwallow Marsh', Undercity: 'Alterac Mountains', 'Hillsbrad Foothills': 'Alterac Mountains' },
			F: { 'Dustwallow Marsh': 'Azshara', Orgrimmar: 'Azshara', 'Thunder Bluff': 'Azshara', Feralas: 'Azshara', Undercity: 'The Hinterlands', 'Stranglethorn Vale': 'Azshara' },
		},
	},
};

// Band D reuses band C's waters (the same Catfish, with Expert in between).
for (const f of Object.values(FACTIONS)) {
	f.waters.D = f.waters.C;
	f.hubs.D = f.hubs.C;
}

const fmt = (n) => String(Number(n.toFixed(2)));
const goto = (w) => `  goto ${fmt(w.x)},${fmt(w.y)}${w.f === 'l' ? ' live' : ''} "${w.label}" r 25 optional`;
const uniq = (a) => [...new Set(a)];

// Gotos go after these goals: Polestar counts a goto as done once any goal after it is done
// (Fishing already past the band), which left the step with no arrow.
// The fish line is a bag count under the guide's one section (Cooking 1-300): Polestar lowers it
// by what the section's crafts would have used up to the player's Cooking, so it reads as the
// fish still needed for this band. Its count is cumulative from Cooking 1 (fishCount).
function bandGoals(L, band, w, count) {
	const r = R[w.recipe];
	L.push(`  learn ${r.spell} nearest`);
	L.push(`  skill Fishing ${band.fish[1]}`);
	L.push(`  collect ${r.item} x${count} anywhere optional`); // optional: Polestar caches the count per skill level (Own.sectionDemand memo), so it can be stale until a skill-up or /reload
	L.push(`  craft ${r.spell} until ${band.cook[1]}`);
}

// Fish of a recipe the crafts use from Cooking 1 to the end of this band: every band up to it
// whose waters cook that recipe (only Catfish spans two bands, C and D).
function fishCount(F, key, recipe) {
	let n = 0;
	for (const k of Object.keys(BANDS)) {
		if (F.waters[k].some((w) => w.recipe === recipe)) n += fishNeeded(R[recipe].spell, BANDS[k].cook[0], BANDS[k].cook[1]);
		if (k === key) break;
	}
	return n;
}

// Expected crafts from Cooking a to b with Polestar's skill-up model: a point every craft
// below yellow, then (grey - skill) / (grey - yellow) (Own.craftsFrom).
const COOKING = (() => {
	const p = JSON.parse(fs.readFileSync(path.join(__dirname, "../../Polestar/data/forever/professions.json"), "utf8"));
	return Array.isArray(p) ? p.find((x) => x.id == 185) : p["185"];
})();
function fishNeeded(spell, a, b) {
	const rec = COOKING.recipes.find((x) => x.spell === spell);
	let n = 0;
	for (let k = Math.max(a, 1); k < b; k++) n += k < rec.yellow ? 1 : (rec.grey - rec.yellow) / (rec.grey - k);
	return Math.ceil(n);
}

// Chance a catch is the water's fish: its area's pool, else its zone's (the server's order).
// null when the Classic data has no complete pool for it (Forever-only areas, gaps in the dump).
const POOLS = JSON.parse(fs.readFileSync(path.join(__dirname, 'fishing-pools.json'), 'utf8')).areas;
const AREA_PARENT = { 115: 40, 18: 12, 211: 1, 702: 141, 556: 38, 442: 148, 68: 44, 150: 11, 35: 33, 327: 45, 513: 15, 977: 440, 1116: 357, 2521: 357, 223: 215, 162: 85, 386: 17, 392: 17, 1338: 130, 464: 406, 433: 331, 2408: 405 };
function rate(w) {
	const p = POOLS[w.area] || POOLS[AREA_PARENT[w.area]];
	if (!p || p.incomplete) return null;
	return p.fish[w.recipe] || 0;
}

// The breakpoint: a water under half the band's best rate takes twice the casts or more (about
// 85 extra casts, ~15 minutes, for 50 fish), longer than the short trips to a better one. Those
// waters are left out; waters with no data stay, marked unverified.
function goodWaters(key, waters) {
	const best = Math.max(0, ...waters.map(rate).filter((r) => r !== null));
	const keep = waters.filter((w) => rate(w) === null || rate(w) >= best / 2);
	for (const w of waters) if (!keep.includes(w)) console.log(`  band ${key}: left out ${w.label} (${Math.round(rate(w) * 100)}% ${R[w.recipe].fish}; best ${Math.round(best * 100)}%)`);
	return keep;
}

function bandTip(band, w) {
	const r = R[w.recipe];
	const n = fishNeeded(r.spell, band.cook[0], band.cook[1]);
	const p = rate(w);
	const catchText = p === null
		? `it should be mostly ${r.fish} (unverified: the Classic catch tables have no data for this water)`
		: `about ${Math.round(p * 100)}% of catches are ${r.fish}`;
	// 20 s a cast: measured in game (30 casts in 9:47 at Auberdine, bobber wait and looting included).
	const zp = POOLS[AREA_PARENT[w.area]];
	const trout = w.recipe === 'cod' && zp && !zp.incomplete && zp.fish.trout
		? ` Away from this coast, ${w.zone}'s inland water gives ${R.trout.fish} (about ${Math.round(zp.fish.trout * 100)}% of catches), and Cooking ${band.cook[0]}-${band.cook[1]} takes only about ${fishNeeded(R.trout.spell, band.cook[0], band.cook[1])} of those: learn ${R.trout.name} and fish there if you know a spot.`
		: '';
	const casts = p ? ` That is roughly ${Math.ceil(n / p / 10) * 10} casts here, about ${Math.round(n / p * 20 / 60 / 5) * 5} minutes.` : '';
	const extra = trout;
	return `If you don't know ${r.name} yet, the arrow first takes you to its nearest seller. Fish ${w.note} until Fishing ${band.fish[1]} and cook what you catch as you go until Cooking ${band.cook[1]}: ${catchText}, so cook ${r.name}. Place a Basic Campfire Kit beside the water (one every 5 minutes) and empty your bags into the fire; any fish recipe you know counts toward the Cooking target. The ${r.fish} line counts the fish you still need for Cooking ${band.cook[1]} (about ${n} from Cooking ${band.cook[0]}) and drops as your Cooking rises; once your bags hold that many, stop fishing and cook.${casts}${extra}`;
}

function render(faction) {
	const F = FACTIONS[faction];
	const L = [];
	L.push(`guide thmastin-professions/${F.file}`);
	L.push(`title Fishing and Cooking 1-300 (${faction})`);
	L.push(`faction ${faction}`);
	L.push('category Professions');
	L.push('coords era');
	L.push('levels 5-60');
	L.push(`zone ${F.startZone}`);
	L.push('');
	L.push('# Generated by tools/fishing-cooking.js: edit that script, then run it again.');
	L.push('# Levels Fishing and Cooking together: every fish you catch is cooked, so Cooking');
	L.push('# needs no hunting. Each band picks its water from where you are: the step for the');
	L.push('# zone you stand in (or a nearby one when you are in a city), else a default water.');
	L.push('# Once you reach a listed zone the guide stays with it; flying over another listed');
	L.push('# zone can switch it early (zone text changes in the air).');
	L.push('# Catch rates: the Classic fishing tables (CMaNGOS classic-db) per subzone, else zone;');
	L.push('# tools/fishing-pools.json. Waters under half the best rate of their band are left out.');
	L.push('# ASSUMED: Forever keeps the Classic tables (Darnassus checked in game: few Smallfish).');
	L.push('# Recipes, skill colours, vendors, trainers and quest data: Polestar reference data.');
	L.push('');
	// One section for the whole guide: its counted fish lines follow the player's Cooking. A
	// section per band would skip the steps of a band whose end Cooking has passed, Fishing or not.
	L.push('section Cooking 1-300');

	const section = (band) => {
		L.push('');
		// Not a `section`: Polestar starts a guide at the section the player's skill is in, which
		// would skip Cooking whenever Fishing is ahead. Steps pass on their own goals instead.
		L.push(`# ---- Fishing ${band.fish[0]}-${band.fish[1]}, Cooking ${band.cook[0]}-${band.cook[1]}`);
	};

	// Tops the bags up to 10 Basic Campfire Kits; skipped when they already hold 10. The kit count
	// is the goal (a bag count), so the wood buy is optional: only the shortfall is needed.
	const KITS = 10;
	const kitStep = (extra) => {
		L.push('');
		L.push('step Make Campfire Kits');
		L.push(`  when !has 279981 x${KITS}`);
		L.push(`  tip Kits are used up, so carry ${KITS}. Every cook on Forever knows Basic Campfire: it crafts a Basic Campfire Kit from one Simple Wood (Flint and Tinder stays in your bags), and placing the kit lights a cooking fire at the water, one every 5 minutes. Buy one Simple Wood for each kit you are short and craft them in your Cooking window${extra ? `; ${extra}` : ''}.`);
		L.push('  buy 4471 x1 nearest');
		L.push(`  buy 4470 x${KITS} nearest optional`);
		L.push(`  collect 279981 x${KITS} anywhere`);
	};

	const waterSteps = (key) => {
		const band = BANDS[key];
		const waters = goodWaters(key, F.waters[key]);
		const hubs = F.hubs[key] || {};
		const zones = uniq(waters.map((w) => w.zone));
		const byZone = (z) => {
			const w = waters.find((x) => x.zone === z);
			if (!w) throw new Error(`${faction} band ${key}: a hub points at ${z}, which has no water left`);
			return w;
		};
		const def = waters[0];
		const listed = uniq([...zones, ...Object.keys(hubs)]);
		const range = `${band.fish[0]}-${band.fish[1]}`;
		const options = zones.join(', ');

		for (const [from, to] of Object.entries(hubs)) {
			if (zones.includes(from)) continue;
			const w = byZone(to);
			L.push('');
			L.push(`step Fishing ${range}: to ${to}`);
			L.push(`  when zone "${from}"`);
			L.push(`  zone ${to}`);
			const p = rate(w);
			const out = F.waters[key].find((x) => x.zone === from && !waters.includes(x));
			const why = (p === null ? '' : ` About ${Math.round(p * 100)}% of catches there are ${R[w.recipe].fish}.`)
				+ (out ? ` ${out.label} gives only about ${Math.round(rate(out) * 100)}% ${R[out.recipe].fish}, so it is left out.` : '');
			const via = (F.via || {})[`${from}>${to}`];
			L.push(`  tip The nearest good water for this range from ${from} is ${to}: ${w.note}.${via ? ` ${via}` : ''}${why} Any of ${options} works too: go there instead and the guide follows you.`);
			bandGoals(L, band, w, fishCount(F, key, w.recipe));
			L.push(goto(w));
		}

		L.push('');
		L.push(`step Fishing ${range}: pick a water`);
		for (const z of listed) L.push(`  when !zone "${z}"`);
		L.push(`  zone ${def.zone}`);
		L.push(`  tip Fish in any of ${options}. The arrow points at ${def.zone}; go to whichever is closer and the guide switches to that zone's step when you arrive.`);
		bandGoals(L, band, def, fishCount(F, key, def.recipe));
		L.push(goto(def));

		for (const w of waters) {
			const same = waters.filter((x) => x.zone === w.zone);
			if (same[0] !== w) continue;
			L.push('');
			L.push(`step Fishing ${range}: ${w.zone}`);
			L.push(`  when zone "${w.zone}"`);
			L.push(`  zone ${w.zone}`);
			let tip = bandTip(band, w);
			if (same.length > 1) tip += ` The ${same.slice(1).map((x) => `${x.label} (${x.note}) gives ${R[x.recipe].fish}`).join('; ')}.`;
			L.push(`  tip ${tip}`);
			bandGoals(L, band, w, fishCount(F, key, w.recipe));
			for (const x of same) L.push(goto(x));
		}

		L.push('');
		L.push(`step Fishing ${range}: anywhere`);
		L.push(`  zone ${def.zone}`);
		L.push(`  tip Keep going at any of ${options}; the arrow points at ${def.zone}.`);
		bandGoals(L, band, def, fishCount(F, key, def.recipe));
		L.push(goto(def));
	};

	// ---- Apprentice
	section(BANDS.A);
	L.push('');
	// Only for characters without Fishing: `buy` counts this exact item, so any other pole
	// (a quest reward, Blump Family Fishing Pole) would hold the step forever.
	L.push('step Get a Fishing Pole');
	L.push('  when !skill Fishing 1');
	L.push('  tip You fish with a pole equipped. The arrow picks the nearest seller. Any fishing pole works; if you already have one, skip this step.');
	L.push('  buy 6256 x1 nearest');
	L.push('');
	L.push('step Learn Fishing and Cooking');
	L.push('  tip The arrow picks the nearest trainer of each. Equip your Fishing Pole. A Shiny Bauble on the pole (+25 for ten minutes) means fewer fish get away early on.');
	L.push('  train Fishing Apprentice');
	L.push('  train Cooking Apprentice');
	L.push('  buy 6529 x2 nearest optional');
	kitStep('the first ones also raise Cooking to about 5');
	waterSteps('A');

	// ---- Journeyman
	section(BANDS.B);
	L.push('');
	L.push('step Journeyman Fishing and Cooking');
	L.push('  tip Both ranks raise the cap to 150. Journeyman Fishing needs character level 10.');
	L.push('  level 10');
	L.push('  train Fishing Journeyman');
	L.push('  train Cooking Journeyman');
	kitStep('');
	waterSteps('B');

	section(BANDS.C);
	waterSteps('C');

	// ---- Expert
	section(BANDS.D);
	L.push('');
	L.push('step Expert Fishing and Cooking');
	L.push('  tip Both are books, not trainer ranks, and both lift the cap to 225. Expert Fishing - The Bass and You is sold only by Old Man Heming on the docks of Booty Bay; the Expert Cookbook has its own sellers and the arrow picks the nearest. Buy each and read it. Both need character level 20.');
	L.push('  level 20');
	L.push('  train Fishing Expert');
	L.push('  train Cooking Expert');
	L.push('  buy 6530 x5 nearest optional');
	waterSteps('D');

	section(BANDS.E);
	waterSteps('E');

	// ---- Artisan
	const A = F.artisan;
	section(BANDS.F);
	L.push('');
	L.push(`step Artisan: ${A.city}`);
	L.push(`  zone ${A.city}`);
	L.push(`  tip Both Artisan ranks come from quests that start with the trainers in ${A.city}: the fishing trainer sends you to Nat Pagle in Dustwallow Marsh, the cooking trainer to Dirge Quikcleave in Gadgetzan. Both need skill 225 and character level 35. Buy the Alterac Swiss for Dirge while you are in town.`);
	L.push('  skill Fishing 225');
	L.push('  skill Cooking 225');
	L.push('  level 35');
	L.push(`  accept ${A.fish}`);
	L.push(`  accept ${A.cook}`);
	L.push('  buy 8932 x20 nearest');

	L.push('');
	L.push('step Nat Pagle');
	L.push('  zone Dustwallow Marsh');
	L.push('  tip Nat Pagle fishes on a small island off the coast south of Theramore: swim across. He wants four fish, each from its own stretch of water; they only bite while you have his quest.');
	L.push(`  turnin ${A.fish}`);
	L.push('  accept 6607');

	L.push('');
	L.push('step Zesty Clam Meat');
	L.push('  zone Dustwallow Marsh');
	L.push('  tip The Muckshell crabs along the shore south-west of Theramore drop Big-mouth Clams; open each one for Zesty Clam Meat. Dirge wants 10.');
	L.push('  collect 7974 x10 @55.4,63.3');

	L.push('');
	L.push("step Sar'theris Striker");
	L.push('  zone Desolace');
	L.push("  tip Fish the coast of Desolace along Sar'theris Strand until a Sar'theris Striker comes up.");
	L.push('  collect 16968 quest 6607.3');

	L.push('');
	L.push('step Feralas Ahi');
	L.push('  zone Feralas');
	L.push('  tip Fish the Verdantis River until a Feralas Ahi comes up. Feralas water is hard below 300: put a lure on the pole.');
	L.push('  collect 16967 quest 6607.1');

	L.push('');
	L.push('step Clamlette Surprise');
	L.push('  zone Tanaris');
	L.push('  tip The rocs of Tanaris drop Giant Eggs; the arrow picks the nearest. Then hand everything to Dirge Quikcleave in Gadgetzan for Artisan Cooking, and buy Spotted Yellowtail from Gikkix on the coast while you are in Tanaris.');
	L.push('  collect 12207 x12 nearest');
	L.push(`  turnin ${A.cook}`);
	L.push('  accept 6610');
	L.push('  turnin 6610');
	L.push(`  learn ${R.yellowtail.spell} nearest`);

	L.push('');
	L.push('step Savage Coast Blue Sailfin');
	L.push('  zone Stranglethorn Vale');
	L.push("  tip Take the boat from Ratchet to Booty Bay and fish the Savage Coast, the west shore of Stranglethorn, until a Savage Coast Blue Sailfin comes up. Buy Filet of Redgill from Kelsey Yance in Booty Bay: Redgill is the best fish for the last stretch to 300.");
	L.push('  collect 16969 quest 6607.4');
	L.push(`  learn ${R.redgill.spell} nearest`);

	L.push('');
	L.push('step Misty Reed Mahi Mahi');
	L.push('  zone Swamp of Sorrows');
	L.push('  tip Fish the Misty Reed Strand, the east shore of the Swamp of Sorrows, until a Misty Reed Mahi Mahi comes up.');
	L.push('  collect 16970 quest 6607.2');

	L.push('');
	L.push('step Back to Nat Pagle');
	L.push('  zone Dustwallow Marsh');
	L.push('  tip Hand Nat his four fish for Artisan Fishing.');
	L.push('  turnin 6607');

	waterSteps('F');
	L.push('');
	return L.join('\n');
}

// node tools/fishing-cooking.js --report: each band's waters as minutes of fishing (20 s a cast)
// next to the band's best, to weigh against the trip there. Writes nothing.
if (process.argv.includes('--report')) {
	for (const [faction, F] of Object.entries(FACTIONS)) {
		for (const key of Object.keys(BANDS)) {
			if (key === 'D') continue; // C's waters
			const band = BANDS[key];
			const rows = F.waters[key].map((w) => {
				const n = fishNeeded(R[w.recipe].spell, band.cook[0], band.cook[1]);
				const p = rate(w);
				return { w, n, p, min: p ? n / p * 20 / 60 : null, zero: p === 0 };
			});
			const best = Math.min(...rows.filter((r) => r.min !== null).map((r) => r.min));
			console.log(`${faction} ${key} (Cooking ${band.cook[0]}-${band.cook[1]}):`);
			for (const r of rows.sort((a, b) => (a.min ?? 1e9) - (b.min ?? 1e9))) {
				const extra = r.min === null ? '' : `  +${Math.round(r.min - best)} min vs best`;
				console.log(`  ${(r.w.zone + ' / ' + r.w.label).padEnd(44)} ${String(r.n).padStart(4)} ${R[r.w.recipe].fish.padEnd(28)} ${r.p === null ? '  ?' : String(Math.round(r.p * 100)).padStart(3) + '%'}  ${r.zero ? 'left out' : r.min === null ? 'unverified' : Math.round(r.min) + ' min'}${extra}`);
			}
		}
	}
	process.exit(0);
}

const out = path.join(__dirname, '..', 'guides');
for (const faction of Object.keys(FACTIONS)) {
	const file = path.join(out, `${FACTIONS[faction].file}.guide`);
	fs.writeFileSync(file, render(faction));
	console.log(`wrote ${path.relative(process.cwd(), file)}`);
}
