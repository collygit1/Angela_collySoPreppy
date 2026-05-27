const { EmbedBuilder } = require("discord.js");
const store = require("../../database/securityStore");
const { logSecurity } = require("../../utils/securityActions");
const { isBypassed } = require("../../utils/permissions");
const { LINK_RE } = require("../../config/constants");

// Escalate punishment based on accumulated warning count.
async function punish(member, guild, warnings, client) {
    const gid = guild.id;

    if (warnings <= 2) {
        const embed = new EmbedBuilder()
            .setColor("#FFA502")
            .setTitle("⚠️ Spam Warning")
            .setDescription(`<@${member.id}> — Warning **${warnings}/5**. Please stop spamming.`)
            .setTimestamp();
        await logSecurity(client, gid, embed);

    } else if (warnings <= 4) {
        await member.timeout(10 * 60 * 1000, `Spam warning ${warnings}/5`).catch(() => {});
        const embed = new EmbedBuilder()
            .setColor("#FF6348")
            .setTitle("🔇 Spammer Timed Out")
            .setDescription(`<@${member.id}> timed out for 10 minutes. (Warning ${warnings}/5)`)
            .setTimestamp();
        await logSecurity(client, gid, embed);

    } else {
        await member.kick(`Spam: ${warnings} warnings accumulated`).catch(() => {});
        store.clearWarnings(gid, member.id);
        const embed = new EmbedBuilder()
            .setColor("#FF4757")
            .setTitle("👢 Spammer Kicked")
            .setDescription(`<@${member.id}> was kicked for repeated spamming.`)
            .setTimestamp();
        await logSecurity(client, gid, embed);
    }
}

// Detect message spam, mass mentions, and link flooding.
async function checkSpam(message, client) {
    const { guild, author, member, content } = message;
    const cfg = store.guild(guild.id);

    if (!cfg.config.antiSpam.enabled) return;
    if (isBypassed(message)) return;

    const { msgThreshold, mentionThreshold, linkThreshold, window } = cfg.config.antiSpam;
    const ud = client.security.spamTrackers.get(author.id) || { messages: [], mentions: [], links: [] };
    client.security.spamTrackers.set(author.id, ud);

    const now = Date.now();
    ud.messages = ud.messages.filter(t => now - t < window);
    ud.mentions = ud.mentions.filter(t => now - t < window);
    ud.links    = ud.links.filter(t => now - t < window);

    ud.messages.push(now);

    const mentionCount = message.mentions.users.size + message.mentions.roles.size;
    for (let i = 0; i < mentionCount; i++) ud.mentions.push(now);

    const linkCount = (content.match(LINK_RE) || []).length;
    for (let i = 0; i < linkCount; i++) ud.links.push(now);

    let spamType = null;
    if      (ud.messages.length >= msgThreshold)       spamType = "Message Spam";
    else if (ud.mentions.length >= mentionThreshold)   spamType = "Mention Spam";
    else if (ud.links.length    >= linkThreshold)      spamType = "Link/Invite Spam";

    if (spamType) {
        ud.messages = [];
        ud.mentions = [];
        ud.links    = [];

        if (message.deletable) await message.delete().catch(() => {});

        const warnings = store.addWarning(guild.id, author.id);
        await punish(member, guild, warnings, client);
    }
}

module.exports = { checkSpam };
