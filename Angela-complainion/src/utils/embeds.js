const { EmbedBuilder } = require("discord.js");

const PINK   = "#ffcad4";
const GREEN  = "#a8e6cf";
const RED    = "#ff8fab";
const ORANGE = "#ffcf77";
const PURPLE = "#c9b1ff";
const FOOTER = "˚ʚ♡ɞ˚ angela companion";

function base(color, client) {
    const e = new EmbedBuilder().setColor(color).setTimestamp();
    if (client?.user) e.setAuthor({ name: "angela ♡", iconURL: client.user.displayAvatarURL() });
    return e;
}

const Embeds = {
    success(desc, client, title) {
        const e = base(GREEN, client).setDescription(`✨ ${desc}`);
        if (title) e.setTitle(title);
        return e.setFooter({ text: FOOTER });
    },

    error(desc, client, title) {
        const e = base(RED, client).setDescription(`oh no~ ${desc}`);
        if (title) e.setTitle(title);
        return e.setFooter({ text: FOOTER });
    },

    warn(desc, client, title) {
        const e = base(ORANGE, client).setDescription(`⚠️ ${desc}`);
        if (title) e.setTitle(title);
        return e.setFooter({ text: FOOTER });
    },

    info(title, desc, client) {
        return base(PINK, client)
            .setTitle(title)
            .setDescription(desc)
            .setFooter({ text: FOOTER });
    },

    loading(desc, client) {
        return base(PURPLE, client)
            .setDescription(`⏳ ${desc ?? "loading..."}`)
            .setFooter({ text: FOOTER });
    },

    security(title, desc, color = RED) {
        return new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(desc)
            .setTimestamp()
            .setFooter({ text: FOOTER });
    },

    rank({ username, avatarURL, level, currentXp, neededXp, totalXp, rank, guildName }) {
        const pct    = neededXp > 0 ? Math.min(1, currentXp / neededXp) : 1;
        const filled = Math.round(pct * 14);
        const bar    = "▰".repeat(filled) + "▱".repeat(14 - filled);
        return new EmbedBuilder()
            .setColor(PINK)
            .setAuthor({ name: `${username}'s rank`, iconURL: avatarURL })
            .setThumbnail(avatarURL)
            .setDescription(
                `> **Level ${level}** · Rank **#${rank}**\n` +
                `\`${bar}\` ${Math.round(pct * 100)}%\n` +
                `\`${currentXp.toLocaleString()} / ${neededXp.toLocaleString()} XP\`` +
                `  ·  Total: \`${totalXp.toLocaleString()} XP\``
            )
            .setFooter({ text: `${guildName ?? "server"} · ${FOOTER}` })
            .setTimestamp();
    },

    leaderboard(entries, guildName, page, totalPages, client) {
        const desc = entries.length === 0
            ? "*no one has leveled up yet~ start chatting! ♡*"
            : entries.map((u, i) => {
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `\`#${u.rank}\``;
                return `${medal} <@${u.userId}> — **Lv ${u.level}** · \`${u.totalXp.toLocaleString()} XP\``;
            }).join("\n");
        return new EmbedBuilder()
            .setColor(PURPLE)
            .setAuthor({ name: "angela ♡ | leaderboard", iconURL: client?.user?.displayAvatarURL() })
            .setTitle(`✨ ${guildName ?? "Server"} — Top Members`)
            .setDescription(desc)
            .setFooter({ text: `Page ${page} of ${totalPages} · ${FOOTER}` })
            .setTimestamp();
    },
};

module.exports = Embeds;
