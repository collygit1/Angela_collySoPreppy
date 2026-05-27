const fs   = require("fs");
const path = require("path");

const DATA_PATH = path.join(process.cwd(), "src/database/json/economy.json");

const SHOP_ITEMS = {
    fishing_rod:    { name: "Fishing Rod",    emoji: "🎣", price: 500,  desc: "Better fish yields (+50% coins)",   boost: "fish"  },
    pickaxe:        { name: "Pickaxe",         emoji: "⛏️", price: 500,  desc: "Better mine yields (+50% coins)",   boost: "mine"  },
    hunting_knife:  { name: "Hunting Knife",   emoji: "🔪", price: 750,  desc: "Better hunt yields (+50% coins)",   boost: "hunt"  },
    lucky_charm:    { name: "Lucky Charm",     emoji: "🍀", price: 1500, desc: "+25% coins on all activities",      boost: "all"   },
    vip_pass:       { name: "VIP Pass",        emoji: "👑", price: 3000, desc: "Cooldowns cut in half",             boost: "cd"    },
    treasure_map:   { name: "Treasure Map",    emoji: "🗺️", price: 2000, desc: "Rare chance of jackpot finds",      boost: "rare"  },
};

const COOLDOWNS = { daily: 86400000, work: 1800000, fish: 600000, mine: 600000, hunt: 600000 };

const defaults = () => ({
    coins: 0, bank: 0, xp: 0, level: 1,
    inventory: [], dailyStreak: 0,
    lastDaily: 0, lastWork: 0, lastFish: 0, lastMine: 0, lastHunt: 0,
});

function load() {
    try {
        if (!fs.existsSync(DATA_PATH)) { fs.writeFileSync(DATA_PATH, "{}"); return {}; }
        return JSON.parse(fs.readFileSync(DATA_PATH, "utf8") || "{}");
    } catch { return {}; }
}

function save(data) {
    try { fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2)); } catch {}
}

function getUser(guildId, userId) {
    const data = load();
    if (!data[guildId])         data[guildId] = {};
    if (!data[guildId][userId]) data[guildId][userId] = defaults();
    return { ...defaults(), ...data[guildId][userId] };
}

function updateUser(guildId, userId, fn) {
    const data = load();
    if (!data[guildId])         data[guildId] = {};
    if (!data[guildId][userId]) data[guildId][userId] = defaults();
    fn(data[guildId][userId]);
    save(data);
}

function xpNeeded(level) { return level * 100; }

function addXP(guildId, userId, amount) {
    let leveled = false;
    let newLevel = 1;
    updateUser(guildId, userId, u => {
        u.xp = (u.xp || 0) + amount;
        while (u.xp >= xpNeeded(u.level)) {
            u.xp -= xpNeeded(u.level);
            u.level++;
            leveled = true;
        }
        newLevel = u.level;
    });
    return { leveled, newLevel };
}

function hasItem(guildId, userId, itemId) {
    return getUser(guildId, userId).inventory.includes(itemId);
}

function cooldownLeft(lastTime, type) {
    return Math.max(0, COOLDOWNS[type] - (Date.now() - lastTime));
}

function formatCooldown(ms) {
    if (ms <= 0) return null;
    const s = Math.floor(ms / 1000);
    if (s < 60)   return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

function getLeaderboard(guildId, limit = 10) {
    const data = load();
    const guild = data[guildId] || {};
    return Object.entries(guild)
        .map(([uid, u]) => ({ uid, total: (u.coins || 0) + (u.bank || 0), coins: u.coins || 0, bank: u.bank || 0, level: u.level || 1 }))
        .sort((a, b) => b.total - a.total)
        .slice(0, limit);
}

module.exports = { getUser, updateUser, addXP, hasItem, cooldownLeft, formatCooldown, getLeaderboard, SHOP_ITEMS, COOLDOWNS, xpNeeded };
