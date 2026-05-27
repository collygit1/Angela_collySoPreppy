const { EmbedBuilder } = require("discord.js");
const https = require("https");
const http  = require("http");
const store = require("../../database/securityStore");
const { logSecurity } = require("../../utils/securityActions");
const { isBypassed } = require("../../utils/permissions");
const { BANNED_WORDS, BANNED_PATTERNS, IMAGE_TYPES } = require("../../config/constants");
const { bot } = require("../../config/settings");

// Censor a detected word for display (e.g. "fuck" → "f**k")
function censor(str) {
    if (str.length <= 2) return "*".repeat(str.length);
    return str[0] + "*".repeat(str.length - 2) + str.slice(-1);
}

// Download an image from a URL and return it as base64
function fetchImageBase64(url) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith("https") ? https : http;
        lib.get(url, (res) => {
            const chunks = [];
            res.on("data", c => chunks.push(c));
            res.on("end",  () => resolve(Buffer.concat(chunks).toString("base64")));
            res.on("error", reject);
        }).on("error", reject);
    });
}

// Scan message text for banned words / patterns and warn/mute the user.
async function checkSwear(message, client) {
    if (!message.guild || message.author.bot) return;
    if (isBypassed(message)) return;

    const lower      = message.content.toLowerCase();
    const simplified = lower.replace(/[^a-z]/g, "");
    const compressed = lower.replace(/(.)\1+/g, "$1");

    let detected = "";

    for (const word of BANNED_WORDS) {
        if (simplified.includes(word) || compressed.includes(word)) {
            detected = word;
            break;
        }
    }

    if (!detected) {
        for (const pattern of BANNED_PATTERNS) {
            const match = message.content.match(pattern);
            if (match) { detected = match[0]; break; }
        }
    }

    if (!detected) return;

    await message.delete().catch(() => {});

    const stats = client.security.spamTrackers.get(message.author.id) || { violations: 0 };
    stats.violations = (stats.violations || 0) + 1;
    client.security.spamTrackers.set(message.author.id, stats);

    const warn = await message.channel.send({
        content: `### ✨ System Highlight\n> **${message.author.username}**, please do not swear [||\`${censor(detected)}\`||]\n> *Angela keeps the chat pure! ♡*`,
    }).catch(() => null);

    if (warn) setTimeout(() => warn.delete().catch(() => {}), 5000);

    if (stats.violations >= 5) {
        await message.member.timeout(600_000, "Repeated bad language").catch(() => {});
        message.channel.send(
            `🎀 **${message.author.username}** has been muted for 10 minutes. Please use kind words!`
        ).catch(() => {});
    }
}

// Use Gemini AI to scan image attachments for NSFW content.
async function checkImage(message, client) {
    if (!client.aiModel || !message.guild || message.author.bot) return;

    const images = message.attachments.filter(a => IMAGE_TYPES.has(a.contentType));
    if (images.size === 0) return;

    // Extra bypass: owner and server owner are always trusted for images
    if (message.author.id === bot.owner)            return;
    if (message.author.id === message.guild.ownerId) return;
    if (message.member?.permissions.has("Administrator")) return;
    if (store.isWhitelisted(message.guild.id, message.author.id)) return;

    for (const [, attachment] of images) {
        try {
            const base64   = await fetchImageBase64(attachment.proxyURL || attachment.url);
            const mimeType = attachment.contentType || "image/png";

            const result = await client.aiModel.generateContent([
                { inlineData: { data: base64, mimeType } },
                "Is this image NSFW, sexually explicit, graphically violent, or otherwise inappropriate for a general Discord server? Reply with ONLY: YES or NO.",
            ]);

            const verdict = result.response.text().trim().toUpperCase().slice(0, 3);
            if (verdict !== "YES") continue;

            if (message.deletable) await message.delete().catch(() => {});

            const warnings = store.addWarning(message.guild.id, message.author.id);

            const notice = await message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor("#FF4757")
                    .setTitle("🚫 Inappropriate Image Removed")
                    .setDescription(`<@${message.author.id}> — Your image was flagged.\n**Warning ${warnings}/5.**`)
                    .setTimestamp()],
            }).catch(() => null);

            if (notice) setTimeout(() => notice.delete().catch(() => {}), 8000);

            const logEmbed = new EmbedBuilder()
                .setColor("#FF4757")
                .setTitle("🖼️ Inappropriate Image Detected")
                .addFields(
                    { name: "User",     value: `${message.author.tag} (\`${message.author.id}\`)`, inline: true },
                    { name: "Channel",  value: `<#${message.channel.id}>`,                          inline: true },
                    { name: "File",     value: attachment.name || "image",                          inline: true },
                    { name: "Warnings", value: `${warnings}/5`,                                     inline: true },
                )
                .setTimestamp();

            await logSecurity(client, message.guild.id, logEmbed);

            if (warnings >= 5) {
                await message.member.timeout(60 * 60 * 1000, "Repeated inappropriate image uploads").catch(() => {});
                store.clearWarnings(message.guild.id, message.author.id);
            }

        } catch (err) {
            console.error("Image Filter Error:", err.message || err);
        }
    }
}

module.exports = { checkSwear, checkImage };
