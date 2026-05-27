const { EmbedBuilder, GuildVerificationLevel } = require("discord.js");
const store = require("../../database/securityStore");
const { logSecurity } = require("../../utils/securityActions");

// Check account age, blacklist, and suspicious account flags on join.
async function checkAccountAge(member, client) {
    const { guild } = member;
    const cfg = store.guild(guild.id);

    // Blacklist takes priority — kick immediately
    if (store.isBlacklisted(guild.id, member.id)) {
        await member.kick("User is blacklisted.").catch(() => {});
        return;
    }

    // Minimum account age enforcement
    if (cfg.accountAgeMin > 0) {
        const ageDays = (Date.now() - member.user.createdTimestamp) / 86_400_000;

        if (ageDays < cfg.accountAgeMin) {
            const embed = new EmbedBuilder()
                .setColor("#FFA502")
                .setTitle("⚠️ Account Age Requirement Not Met")
                .setDescription(
                    `**User:** ${member.user.tag} (\`${member.id}\`)\n` +
                    `**Account age:** ${ageDays.toFixed(1)} days\n` +
                    `**Required:** ${cfg.accountAgeMin} days`
                )
                .setTimestamp();

            await logSecurity(client, guild.id, embed);

            // Auto-kick accounts less than 1 day old
            if (ageDays < 1) {
                await member.kick("Account too new (< 1 day old).").catch(() => {});
                return;
            }
        }
    }

    // Flag potential alt accounts (< 7 days old + no avatar)
    const isNewAccount = Date.now() - member.user.createdTimestamp < 7 * 86_400_000;
    const hasNoAvatar  = member.user.avatar === null;

    if (isNewAccount && hasNoAvatar) {
        const embed = new EmbedBuilder()
            .setColor("#FFA502")
            .setTitle("🔍 Potential Alt Account Joined")
            .setDescription(
                `**User:** ${member.user.tag} (\`${member.id}\`)\n` +
                `**Reason:** Account < 7 days old with no avatar.`
            )
            .setTimestamp();

        await logSecurity(client, guild.id, embed);
    }
}

// Detect join flooding and auto-apply slowmode + raise verification level.
async function checkRaid(member, client) {
    const { guild } = member;
    const cfg = store.guild(guild.id);

    if (!cfg.config.antiRaid.enabled) return;

    const { threshold, window } = cfg.config.antiRaid;
    const rt = client.security.raidTrackers.get(guild.id) || { joins: [], locked: false };
    client.security.raidTrackers.set(guild.id, rt);

    const now = Date.now();
    rt.joins = rt.joins.filter(t => now - t < window);
    rt.joins.push(now);

    if (rt.joins.length >= threshold && !rt.locked) {
        rt.locked = true;

        await guild.setVerificationLevel(GuildVerificationLevel.High, "Anti-Raid: Join flood").catch(() => {});

        for (const [, ch] of guild.channels.cache) {
            if (ch.isTextBased() && !ch.isDMBased()) {
                await ch.setRateLimitPerUser(10, "Anti-Raid slowmode").catch(() => {});
            }
        }

        const embed = new EmbedBuilder()
            .setColor("#FF4757")
            .setTitle("🚨 RAID DETECTED — AUTO-RESPONSE ACTIVE")
            .setDescription(
                `**${rt.joins.length} joins** in **${window / 1000}s**\n\n` +
                `✅ Verification level → **HIGH**\n` +
                `✅ Slowmode → **10s** on all channels\n\n` +
                `Auto-resets in 5 minutes, or use \`/unlock\` manually.`
            )
            .setTimestamp();

        await logSecurity(client, guild.id, embed);

        // Auto-reset raid lock after 5 minutes
        setTimeout(async () => {
            rt.locked = false;
            rt.joins  = [];
            await guild.setVerificationLevel(GuildVerificationLevel.Low).catch(() => {});
            for (const [, ch] of guild.channels.cache) {
                if (ch.isTextBased() && !ch.isDMBased()) {
                    await ch.setRateLimitPerUser(0).catch(() => {});
                }
            }
        }, 5 * 60 * 1000);
    }
}

module.exports = { checkAccountAge, checkRaid };
