'use strict';
// Writes tools/fishing-pools.json: per area, the chance each fish is the catch, from the CMaNGOS
// Classic database cached in the Polestar clone (fishing_loot_template and reference_loot_template).
// The server looks up the subzone first and falls back to its zone, so both are listed.
// Run from the pack folder: node tools/fishing-pools.js (needs ../Polestar's data/sources).

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const POLESTAR = path.join(__dirname, '../../Polestar');
const dumpDir = path.join(POLESTAR, 'data/sources/cmangos');
const dump = fs.readdirSync(dumpDir).map((d) => path.join(dumpDir, d, 'classicdb.sql.gz')).find((f) => fs.existsSync(f));
const sql = zlib.gunzipSync(fs.readFileSync(dump)).toString('utf8');

const ROW = /\((\d+),(\d+),(-?[\d.]+),(\d+),(-?\d+),(\d+),(\d+),'(?:[^'\\]|\\.)*'\)/g;
function table(name) {
	const rows = [];
	for (const line of sql.split('\n')) {
		if (!line.startsWith(`INSERT INTO \`${name}\``)) continue;
		for (const m of line.matchAll(ROW)) rows.push({ entry: +m[1], item: +m[2], chance: +m[3], group: +m[4], ref: +m[5] });
	}
	const by = new Map();
	for (const r of rows) {
		const k = `${r.entry}:${r.item}:${r.group}`;
		if (!by.has(r.entry)) by.set(r.entry, new Map());
		by.get(r.entry).set(k, r); // the dump repeats some inserts; keep one copy
	}
	return new Map([...by].map(([e, m]) => [e, [...m.values()]]));
}
const fishing = table('fishing_loot_template');
const reference = table('reference_loot_template');

// Chance of each item being the catch: expand references, then in each group the
// chance-0 entries share what the explicit chances leave.
function rates(rows, scale = 1, out = {}) {
	const groups = new Map();
	for (const r of rows) {
		if (r.ref < 0) { rates(reference.get(-r.ref) || [], scale * Math.abs(r.chance) / 100, out); continue; }
		if (!groups.has(r.group)) groups.set(r.group, []);
		groups.get(r.group).push(r);
	}
	for (const [g, rs] of groups) {
		const fixed = rs.filter((r) => r.chance !== 0);
		const equal = rs.filter((r) => r.chance === 0);
		const left = Math.max(0, 100 - fixed.reduce((s, r) => s + Math.abs(r.chance), 0));
		for (const r of fixed) if (r.chance > 0 || g !== 0) out[r.item] = (out[r.item] || 0) + scale * Math.abs(r.chance) / 100;
		for (const r of equal) out[r.item] = (out[r.item] || 0) + scale * left / equal.length / 100;
	}
	return out;
}

const FISH = { 6291: 'smallfish', 6303: 'mackerel', 6289: 'snapper', 6361: 'albacore', 6308: 'catfish', 6362: 'cod', 8365: 'trout', 4603: 'yellowtail', 13758: 'redgill' };

// Area names and parents from the client's AreaTable (exported for lint; see ../Polestar/CLAUDE.md).
const wago = path.join(POLESTAR, 'data/sources/wago');
const build = fs.readdirSync(wago).filter((d) => d.startsWith('1.60.') && fs.existsSync(path.join(wago, d, 'AreaTable.csv'))).sort().pop();
const csv = fs.readFileSync(path.join(wago, build, 'AreaTable.csv'), 'utf8').split(/\r?\n/).slice(1);
const areas = {};
for (const line of csv) {
	const f = [];
	let cur = '', q = false;
	for (const ch of line) {
		if (ch === '"') q = !q;
		else if (ch === ',' && !q) { f.push(cur); cur = ''; }
		else cur += ch;
	}
	f.push(cur);
	if (/^\d+$/.test(f[0])) areas[f[0]] = { name: f[2], parent: +f[4] };
}

const out = {};
for (const [id, rows] of fishing) {
	const r = rates(rows);
	const fish = {};
	for (const [item, p] of Object.entries(r)) if (FISH[item]) fish[FISH[item]] = Math.round(p * 1000) / 1000;
	const total = Object.values(r).reduce((a, b) => a + b, 0);
	if (Object.keys(fish).length) out[id] = { name: areas[id]?.name || null, parent: areas[id]?.parent || 0, fish, ...(total < 0.9 ? { incomplete: Math.round(total * 100) / 100 } : {}) };
}
fs.writeFileSync(path.join(__dirname, 'fishing-pools.json'), JSON.stringify({ source: `CMaNGOS classic-db (${path.basename(path.dirname(dump))}), AreaTable ${build}`, areas: out }, null, '\t') + '\n');
console.log(`wrote tools/fishing-pools.json: ${Object.keys(out).length} areas`);
