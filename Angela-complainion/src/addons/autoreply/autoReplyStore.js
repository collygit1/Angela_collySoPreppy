const fs   = require("fs");
const path = require("path");

const DATA_PATH = path.join(process.cwd(), "src", "database", "json", "autoreply.json");

function read() {
    try { return JSON.parse(fs.readFileSync(DATA_PATH, "utf8") || "{}"); } catch { return {}; }
}
function write(data) {
    try {
        fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
        fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    } catch {}
}

function getGuild(guildId) {
    return read()[guildId] ?? { enabled: false, cooldown: 10000, triggers: [], whitelist: [], blacklist: [] };
}

function saveGuild(guildId, cfg) {
    const d = read();
    d[guildId] = cfg;
    write(d);
}

function addTrigger(guildId, keyword, response, match = "contains") {
    const cfg = getGuild(guildId);
    cfg.triggers = cfg.triggers.filter(t => t.keyword.toLowerCase() !== keyword.toLowerCase());
    cfg.triggers.push({ keyword: keyword.toLowerCase(), response, match });
    saveGuild(guildId, cfg);
}

function removeTrigger(guildId, keyword) {
    const cfg = getGuild(guildId);
    const before = cfg.triggers.length;
    cfg.triggers = cfg.triggers.filter(t => t.keyword.toLowerCase() !== keyword.toLowerCase());
    saveGuild(guildId, cfg);
    return cfg.triggers.length < before;
}

function setEnabled(guildId, enabled) {
    const cfg = getGuild(guildId);
    cfg.enabled = enabled;
    saveGuild(guildId, cfg);
}

function setCooldown(guildId, ms) {
    const cfg = getGuild(guildId);
    cfg.cooldown = ms;
    saveGuild(guildId, cfg);
}

function setWhitelist(guildId, channelIds) {
    const cfg = getGuild(guildId);
    cfg.whitelist = channelIds;
    saveGuild(guildId, cfg);
}

function setBlacklist(guildId, channelIds) {
    const cfg = getGuild(guildId);
    cfg.blacklist = channelIds;
    saveGuild(guildId, cfg);
}

// Find matching trigger for a message
function findMatch(guildId, content) {
    const cfg  = getGuild(guildId);
    const text = content.toLowerCase();
    for (const t of cfg.triggers) {
        if (t.match === "exact"      && text === t.keyword)           return t;
        if (t.match === "startswith" && text.startsWith(t.keyword))   return t;
        if ((!t.match || t.match === "contains") && text.includes(t.keyword)) return t;
    }
    return null;
}

module.exports = {
    getGuild, saveGuild,
    addTrigger, removeTrigger,
    setEnabled, setCooldown,
    setWhitelist, setBlacklist,
    findMatch,
};
