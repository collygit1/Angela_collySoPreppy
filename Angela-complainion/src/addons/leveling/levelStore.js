const fs   = require("fs");
const path = require("path");

const DATA_PATH   = path.join(process.cwd(), "src", "database", "json", "leveling.json");
const TOGGLE_PATH = path.join(process.cwd(), "src", "database", "json", "leveling_toggle.json");
const ROLES_PATH  = path.join(process.cwd(), "src", "database", "json", "leveling_roles.json");

function readJSON(p) {
    try { return JSON.parse(fs.readFileSync(p, "utf8") || "{}"); } catch { return {}; }
}
function writeJSON(p, data) {
    try {
        fs.mkdirSync(path.dirname(p), { recursive: true });
        fs.writeFileSync(p, JSON.stringify(data, null, 2));
    } catch {}
}

// ── XP formula (Mee6-style) ────────────────────────────────────────
// xpNeeded(level) = XP to advance FROM this level to the next
function xpNeeded(level) {
    return 5 * level * level + 50 * level + 100;
}

// Derive current level + XP within that level from raw total XP
function parseXp(totalXp) {
    let level = 0;
    let remaining = totalXp;
    while (remaining >= xpNeeded(level)) {
        remaining -= xpNeeded(level);
        level++;
    }
    return { level, currentXp: remaining, neededXp: xpNeeded(level) };
}

// ── User CRUD ─────────────────────────────────────────────────────

function getUser(guildId, userId) {
    const db = readJSON(DATA_PATH);
    const raw = db[guildId]?.[userId] ?? { totalXp: 0 };
    return { userId, totalXp: raw.totalXp ?? 0, ...parseXp(raw.totalXp ?? 0) };
}

function addXp(guildId, userId, amount) {
    const db = readJSON(DATA_PATH);
    if (!db[guildId]) db[guildId] = {};
    const before = parseXp(db[guildId][userId]?.totalXp ?? 0);
    const newTotal = (db[guildId][userId]?.totalXp ?? 0) + amount;
    db[guildId][userId] = { totalXp: newTotal };
    writeJSON(DATA_PATH, db);
    const after = parseXp(newTotal);
    return { leveled: after.level > before.level, newLevel: after.level, totalXp: newTotal, ...after };
}

function resetUser(guildId, userId) {
    const db = readJSON(DATA_PATH);
    if (db[guildId]) delete db[guildId][userId];
    writeJSON(DATA_PATH, db);
}

function resetAll(guildId) {
    const db = readJSON(DATA_PATH);
    delete db[guildId];
    writeJSON(DATA_PATH, db);
}

// ── Leaderboard ───────────────────────────────────────────────────

function getTop(guildId, limit = 10, page = 1) {
    const db      = readJSON(DATA_PATH);
    const guild   = db[guildId] ?? {};
    const sorted  = Object.entries(guild)
        .map(([userId, d]) => ({ userId, totalXp: d.totalXp ?? 0, ...parseXp(d.totalXp ?? 0) }))
        .sort((a, b) => b.totalXp - a.totalXp);
    const total   = sorted.length;
    const offset  = (page - 1) * limit;
    return {
        entries: sorted.slice(offset, offset + limit).map((u, i) => ({ ...u, rank: offset + i + 1 })),
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    };
}

function getRank(guildId, userId) {
    const db     = readJSON(DATA_PATH);
    const guild  = db[guildId] ?? {};
    const sorted = Object.entries(guild)
        .map(([uid, d]) => ({ uid, totalXp: d.totalXp ?? 0 }))
        .sort((a, b) => b.totalXp - a.totalXp);
    const idx = sorted.findIndex(u => u.uid === userId);
    return idx === -1 ? sorted.length + 1 : idx + 1;
}

// ── Toggle ─────────────────────────────────────────────────────────

function isDisabled(guildId) {
    return readJSON(TOGGLE_PATH)[guildId] === false;
}
function setEnabled(guildId, enabled) {
    const d = readJSON(TOGGLE_PATH);
    if (enabled) delete d[guildId];
    else d[guildId] = false;
    writeJSON(TOGGLE_PATH, d);
}

// ── Role rewards ───────────────────────────────────────────────────

function getRoles(guildId) {
    return readJSON(ROLES_PATH)[guildId] ?? {};
}
function setRole(guildId, level, roleId) {
    const d = readJSON(ROLES_PATH);
    if (!d[guildId]) d[guildId] = {};
    d[guildId][String(level)] = roleId;
    writeJSON(ROLES_PATH, d);
}
function removeRole(guildId, level) {
    const d = readJSON(ROLES_PATH);
    if (d[guildId]) delete d[guildId][String(level)];
    writeJSON(ROLES_PATH, d);
}

module.exports = {
    xpNeeded, parseXp,
    getUser, addXp, resetUser, resetAll,
    getTop, getRank,
    isDisabled, setEnabled,
    getRoles, setRole, removeRole,
};
