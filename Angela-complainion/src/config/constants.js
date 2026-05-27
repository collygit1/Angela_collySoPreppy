// Shared regex patterns used across security systems
const LINK_RE   = /https?:\/\/[^\s]+/gi;
const INVITE_RE = /discord(?:\.gg|app\.com\/invite|\.com\/invite)\/[a-zA-Z0-9-]+/gi;

// Image MIME types the image filter cares about
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

// Anti-swear word list
const BANNED_WORDS = [
    "fuck", "shit", "bitch", "asshole", "dick", "pussy", "cunt", "bastard", "slut", "whore",
    "cum", "sex", "porn", "fap", "hentai", "rape", "condom", "penis", "vagina",
    "nigger", "nigga", "retard", "faggot", "negro", "idiot", "stupid", "fck", "btch", "stfu",
];

// Leetspeak / obfuscated pattern detection
const BANNED_PATTERNS = [
    /f[u4k|v]ck/gi,
    /sh[i1|!]t/gi,
    /b[i1!j]tch/gi,
    /a[s$5][s$5]h[o0]le/gi,
    /p[u4][s$5][s$5]y/gi,
    /d[i1|!|l]ck/gi,
    /n[i1]gg[e3]r/gi,
    /f[a@][g]g[o0]t/gi,
];

// Server name keywords that trigger auto-leave on guild join
const GUILD_BLACKLIST_KEYWORDS = ["nsfw", "dating", "18+", "porn", "adult", "sex", "rp nsfw"];

module.exports = {
    LINK_RE,
    INVITE_RE,
    IMAGE_TYPES,
    BANNED_WORDS,
    BANNED_PATTERNS,
    GUILD_BLACKLIST_KEYWORDS,
};
