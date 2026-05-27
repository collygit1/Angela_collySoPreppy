const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const OWNER_ID = process.env.OWNER_ID;

function formatUptime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0)  return `${d}d ${h % 24}h ${m % 60}m`;
    if (h > 0)  return `${h}h ${m % 60}m ${s % 60}s`;
    if (m > 0)  return `${m}m ${s % 60}s`;
    return `${s}s`;
}

function memMB(key) {
    return (process.memoryUsage()[key] / 1024 / 1024).toFixed(1) + " MB";
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("botstats")
        .setDescription("✦ [Owner] View Angela's live system stats"),

    async execute(interaction) {
        if (OWNER_ID && interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: "❌ This command is restricted to the bot owner.", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const client    = interaction.client;
        const uptime    = formatUptime(process.uptime() * 1000);
        const ping      = client.ws.ping;
        const guilds    = client.guilds.cache.size;
        const users     = client.guilds.cache.reduce((a, g) => a + (g.memberCount || 0), 0);
        const cmdCount  = client.commands.size;
        const aiMemSize = client.aiMemory?.size ?? 0;
        const rss       = memMB("rss");
        const heap      = memMB("heapUsed");
        const shardId   = client.cluster?.id ?? 0;

        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: "angela ♡ | Owner Dashboard", iconURL: client.user.displayAvatarURL() })
            .setTitle("📊 Angela System Stats")
            .addFields(
                { name: "🌐 Servers",       value: String(guilds),   inline: true },
                { name: "👥 Users",          value: String(users),    inline: true },
                { name: "📡 Shard",          value: `#${shardId}`,   inline: true },
                { name: "⚡ WS Ping",        value: `${ping}ms`,     inline: true },
                { name: "⏱️ Uptime",         value: uptime,          inline: true },
                { name: "💬 Commands",       value: String(cmdCount), inline: true },
                { name: "🧠 AI Sessions",    value: String(aiMemSize), inline: true },
                { name: "💾 RAM (RSS)",      value: rss,             inline: true },
                { name: "📦 Heap Used",      value: heap,            inline: true },
                { name: "🔧 Maintenance",    value: client.maintenance ? "🔴 ON" : "🟢 OFF", inline: true },
                { name: "🤖 Node.js",        value: process.version, inline: true },
                { name: "📚 discord.js",     value: require("discord.js").version, inline: true },
            )
            .setFooter({ text: "˚ʚ♡ɞ˚ botstats · angela owner dashboard" })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },

    async prefixExecute(message) {
        if (OWNER_ID && message.author.id !== OWNER_ID) return;
        const uptime   = formatUptime(process.uptime() * 1000);
        const guilds   = message.client.guilds.cache.size;
        const cmdCount = message.client.commands.size;
        const rss      = memMB("rss");
        return message.reply(`📊 **Stats** — Servers: \`${guilds}\` | Commands: \`${cmdCount}\` | Uptime: \`${uptime}\` | RAM: \`${rss}\` | Ping: \`${message.client.ws.ping}ms\``);
    },
};
