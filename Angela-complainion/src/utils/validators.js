function isValidHex(hex) {
    return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);
}

function isValidUrl(str) {
    try { new URL(str); return true; } catch { return false; }
}

function isValidDuration(input) {
    return /^\d+[smhd]$/i.test(input);
}

function parseDurationMs(input) {
    const match = input.match(/^(\d+)([smhd])$/i);
    if (!match) return null;
    const [, n, unit] = match;
    const mul = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return parseInt(n) * mul[unit.toLowerCase()];
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function isPositiveInt(val) {
    const n = parseInt(val);
    return !isNaN(n) && n > 0 && Number.isInteger(n);
}

module.exports = { isValidHex, isValidUrl, isValidDuration, parseDurationMs, clamp, isPositiveInt };
