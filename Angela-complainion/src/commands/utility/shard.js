const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('node:path');
const { bot, emojis, theme } = require(path.join(process.cwd(), 'src/config/settings'));

/* ================= 🎀 TRANSLATIONS ================= */
const translations = {
    en: { title: "SHARD DIAGNOSTIC", info: "Territory Info", shard: "Shard ID", cluster: "Cluster ID", ping: "Shard Latency", req: "Requested by" },
    tl: { title: "PAGSUSURI NG SHARD", info: "Impormasyon ng Teritoryo", shard: "ID ng Shard", cluster: "ID ng Cluster", ping: "Latensya ng Shard", req: "Hiningi ni" },
    ko: { title: "샤드 진단", info: "영역 정보", shard: "샤드 ID", cluster: "클러스터 ID", ping: "샤드 대기 시간", req: "요청자:" },
    ja: { title: "シャード診断", info: "テリトリー情報", shard: "シャードID", cluster: "クラスターID", ping: "シャード遅延速度", req: "リクエスト:" }
};

module.exports = {
    name: 'shard',
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('shard')
        .setDescription('🎀 View the shard and cluster managing this server'),

    async execute(interaction) {
        await this.processShard(interaction, interaction.user);
    },

    async prefixExecute(message) {
        await this.processShard(message, message.author);
    },

    async processShard(context, user) {
        const { client, guild } = context;

        // 🌐 LANGUAGE & CONFIG
        const langKey = client.languages?.get(guild?.id) || 'en';
        const t = translations[langKey] || translations.en;

        // 📊 SHARD DATA
        // Calculate Shard ID: (guild_id >> 22) % num_shards
        const shardId = guild?.shardId ?? 0;
        const clusterId = client.cluster?.id ?? 0;
        const shardPing = client.ws.shards.get(shardId)?.ping || client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor(theme?.pink || '#ff99cc')
            .setAuthor({ 
                name: `ANGELA TETRA | ${t.title}`, 
                iconURL: client.user.displayAvatarURL() 
            })
            .setDescription(
                `**__꒰ . ^ 。${t.info} ◟ \`\` ˖__**\n` +
                `> \`Server Name :\` **${guild.name}**\n` +
                `> \`Server ID   :\` **${guild.id}**\n\n` +

                `**__꒰ . ^ 。Internal Route ◟ \`\` ˖__**\n` +
                `> \`${t.cluster}  :\` **[ ${clusterId} ]**\n` +
                `> \`${t.shard}    :\` **[ ${shardId} ]**\n` +
                `> \`${t.ping}    :\` **${shardPing}ms**\n\n` +

                `${emojis?.system || "✧"} **Status:** Route stable.`
            )
            .setImage('https://cdn.discordapp.com/attachments/1497110108881293442/1499178499829928178/IMG_7341.jpeg')
            .setFooter({ 
                text: `${t.req} ${user.tag.toUpperCase()} • Cluster Mode`, 
                iconURL: user.displayAvatarURL() 
            })
            .setTimestamp();

        return context.reply({ embeds: [embed] });
    }
};