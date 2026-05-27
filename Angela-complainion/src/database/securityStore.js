const fs   = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "json/security.json");

const defaults = () => ({
    logChannel:    null,
    lockdown:      false,
    whitelist:     [],
    blacklist:     [],
    accountAgeMin: 0,
    warnings:      {},
    config: {
        antiNuke: { enabled: true, threshold: 5,  window: 10000 },
        antiRaid: { enabled: true, threshold: 10, window: 10000 },
        antiSpam: { enabled: true, msgThreshold: 5, mentionThreshold: 5, linkThreshold: 3, window: 5000 },
    },
});

function load() {
    try {
        if (!fs.existsSync(DATA_PATH)) {
            fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
            fs.writeFileSync(DATA_PATH, "{}");
            return {};
        }
        return JSON.parse(fs.readFileSync(DATA_PATH, "utf8") || "{}");
    } catch { return {}; }
}

function save(data) {
    try { fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2)); } catch {}
}

function guild(guildId) {
    const data = load();
    if (!data[guildId]) { data[guildId] = defaults(); save(data); }
    return data[guildId];
}

function update(guildId, fn) {
    const data = load();
    if (!data[guildId]) data[guildId] = defaults();
    fn(data[guildId]);
    save(data);
}

module.exports = {
    guild,
    update,
    load,
    save,
    isWhitelisted:   (gid, uid) => guild(gid).whitelist.includes(uid),
    isBlacklisted:   (gid, uid) => guild(gid).blacklist.includes(uid),
    getWarnings:     (gid, uid) => guild(gid).warnings[uid] || 0,
    addWarning:      (gid, uid) => { let n; update(gid, g => { g.warnings[uid] = (g.warnings[uid] || 0) + 1; n = g.warnings[uid]; }); return n; },
    clearWarnings:   (gid, uid) => update(gid, g => { delete g.warnings[uid]; }),
    addWhitelist:    (gid, uid) => update(gid, g => { if (!g.whitelist.includes(uid)) g.whitelist.push(uid); }),
    removeWhitelist: (gid, uid) => update(gid, g => { g.whitelist = g.whitelist.filter(i => i !== uid); }),
    addBlacklist:    (gid, uid) => update(gid, g => { if (!g.blacklist.includes(uid)) g.blacklist.push(uid); }),
    removeBlacklist: (gid, uid) => update(gid, g => { g.blacklist = g.blacklist.filter(i => i !== uid); }),
    setLogChannel:   (gid, cid) => update(gid, g => { g.logChannel = cid; }),
    setLockdown:     (gid, v)   => update(gid, g => { g.lockdown = v; }),
    setAccountAge:   (gid, d)   => update(gid, g => { g.accountAgeMin = d; }),
};
