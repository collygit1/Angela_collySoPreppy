const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const mongoose = require("mongoose");

async function sendPing(context, user, timestamp) {
    const { client, guild } = context;
    const ms      = Math.abs(Date.now() - timestamp);
    const ws      = client.ws.ping;
    const db      = mongoose.connection.readyState === 1 ? "connected ✅" : "offline ❌";
    const mem     = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const uptime  = Math.floor(process.uptime() / 60);
    const prefix  = client.prefixes?.get(guild?.id) || "Angela^";

    const embed = new EmbedBuilder()
        .setColor("#ffcad4")
        .setAuthor({ name: "angela ♡ | pong!", iconURL: client.user.displayAvatarURL() })
        .setDescription(`🏓 **${ms}ms** latency · **${ws}ms** websocket`)
        .addFields(
            { name: "💾 memory",  value: `\`${mem} MB\``,  inline: true },
            { name: "⏱️ uptime",  value: `\`${uptime}m\``, inline: true },
            { name: "🗄️ db",      value: db,               inline: true },
            { name: "🌐 servers", value: `\`${client.guilds.cache.size}\``, inline: true },
            { name: "🔑 prefix",  value: `\`${prefix}\``,  inline: true },
            { name: "📡 shard",   value: `\`#${client.cluster?.id ?? 0}\``, inline: true },
        )
        .setFooter({ text: `requested by ${user.username} · ˚ʚ♡ɞ˚ angela companion`, iconURL: user.displayAvatarURL() })
        .setTimestamp();

    return context.reply({ embeds: [embed] });
}

module.exports = {
    name: "ping",
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("🎀 Check Angela's ping"),

    async execute(interaction) {
        await sendPing(interaction, interaction.user, interaction.createdTimestamp);
    },

    async prefixExecute(message) {
        await sendPing(message, message.author, message.createdTimestamp);
    },
};
