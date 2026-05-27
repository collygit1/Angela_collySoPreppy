const cooldownMap = new Map();

function isOnCooldown(key, ms) {
    const now  = Date.now();
    const last = cooldownMap.get(key) || 0;
    return (now - last) < ms;
}

function setCooldown(key) {
    cooldownMap.set(key, Date.now());
}

function getRemainingMs(key, ms) {
    const last = cooldownMap.get(key) || 0;
    return Math.max(0, ms - (Date.now() - last));
}

function formatRemaining(ms) {
    const s = Math.floor(ms / 1000);
    if (s < 60)   return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

function clearCooldown(key) {
    cooldownMap.delete(key);
}

module.exports = { isOnCooldown, setCooldown, getRemainingMs, formatRemaining, clearCooldown };
