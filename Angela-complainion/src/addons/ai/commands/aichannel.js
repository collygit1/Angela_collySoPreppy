const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require("discord.js");
const fs   = require("fs");
const path = require("path");

const CHANNELS_PATH = path.join(process.cwd(), "src", "database", "json", "ai_channels.json");

function loadData() {
    try { return JSON.parse(fs.readFileSync(CHANNELS_PATH, "utf8") || "{}"); } catch { return {}; }
}

function saveData(data) {
    try { fs.writeFileSync(CHANNELS_PATH, JSON.stringify(data, null, 2)); } catch {}
}

function getGuildChannels(guildId) {
    return loadData()[guildId] || [];
}

const LOCAL = {
    en: { title: "AI Channel", set: "AI channel enabled!", remove: "AI channel removed.", list: "AI Channels", none: "No AI channels set. Use `/aichannel set` to add one.", noPerms: "You need **Manage Channels** permission.", alreadySet: "That channel already has AI enabled.", notSet: "That channel doesn't have AI enabled.", howto: "Angela will auto-reply to **all messages** in AI channels.\nOutside AI channels, she only responds to @mentions." },
    tl: { title: "AI Channel", set: "AI channel pinagana na!", remove: "AI channel inalis na.", list: "Mga AI Channel", none: "Wala pang AI channel. Gamitin ang `/aichannel set`.", noPerms: "Kailangan mo ng permisong **Manage Channels**.", alreadySet: "May AI na ang channel na iyon.", notSet: "Wala namang AI ang channel na iyon.", howto: "Sumasagot si Angela sa lahat ng mensahe sa AI channel.\nSa labas ng AI channel, sa @mention lamang." },
    ko: { title: "AI 채널", set: "AI 채널이 활성화되었습니다!", remove: "AI 채널이 제거되었습니다.", list: "AI 채널 목록", none: "설정된 AI 채널이 없습니다. `/aichannel set`을 사용하세요.", noPerms: "**채널 관리** 권한이 필요합니다.", alreadySet: "해당 채널은 이미 AI가 활성화되어 있습니다.", notSet: "해당 채널에는 AI가 활성화되어 있지 않습니다.", howto: "AI 채널에서는 모든 메시지에 응답합니다.\n그 외에는 @멘션에만 응답합니다." },
    ja: { title: "AIチャンネル", set: "AIチャンネルが有効になりました！", remove: "AIチャンネルが削除されました。", list: "AIチャンネル一覧", none: "AIチャンネルが設定されていません。`/aichannel set`を使用してください。", noPerms: "**チャンネル管理**権限が必要です。", alreadySet: "そのチャンネルはすでにAIが有効です。", notSet: "そのチャンネルにAIは設定されていません。", howto: "AIチャンネルではすべてのメッセージに返信します。\nそれ以外は@メンションのみです。" },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("aichannel")
        .setDescription("✦ Manage which channels Angela auto-replies in")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(sub => sub
            .setName("set")
            .setDescription("Enable AI auto-reply in a channel")
            .addChannelOption(o => o.setName("channel").setDescription("The channel to enable AI in").setRequired(true)
                .addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(sub => sub
            .setName("remove")
            .setDescription("Disable AI auto-reply in a channel")
            .addChannelOption(o => o.setName("channel").setDescription("The channel to disable AI in").setRequired(true)
                .addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(sub => sub
            .setName("list")
            .setDescription("Show all AI channels in this server")),

    async execute(interaction) {
        const lang    = interaction.client.languages?.get(interaction.guildId) || "en";
        const t       = LOCAL[lang] || LOCAL.en;
        const sub     = interaction.options.getSubcommand();
        const guildId = interaction.guildId;
        const data    = loadData();

        if (sub === "list") {
            const channels = getGuildChannels(guildId);
            const embed = new EmbedBuilder()
                .setColor("#ffcad4")
                .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                .setTitle(`🤖 ${t.list}`)
                .setDescription(
                    channels.length > 0
                        ? channels.map(id => `<#${id}>`).join("\n")
                        : `> ${t.none}`
                )
                .addFields({ name: "ℹ️ How it works", value: t.howto })
                .setFooter({ text: "˚ʚ♡ɞ˚ aichannel · angela" })
                .setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const channel = interaction.options.getChannel("channel");

        if (sub === "set") {
            if (!data[guildId]) data[guildId] = [];
            if (data[guildId].includes(channel.id)) {
                return interaction.reply({ content: `❌ ${t.alreadySet}`, ephemeral: true });
            }
            data[guildId].push(channel.id);
            saveData(data);
            interaction.client.aiChannels?.add(channel.id);

            return interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setColor("#4CAF50")
                    .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle(`✅ ${t.set}`)
                    .setDescription(`${channel} — Angela will now auto-reply to all messages here.`)
                    .setFooter({ text: "˚ʚ♡ɞ˚ aichannel · angela" })
                    .setTimestamp()
            ]});
        }

        if (sub === "remove") {
            const list = data[guildId] || [];
            if (!list.includes(channel.id)) {
                return interaction.reply({ content: `❌ ${t.notSet}`, ephemeral: true });
            }
            data[guildId] = list.filter(id => id !== channel.id);
            saveData(data);
            interaction.client.aiChannels?.delete(channel.id);

            return interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setColor("#FF6B6B")
                    .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle(`🔕 ${t.remove}`)
                    .setDescription(`${channel} — Angela will no longer auto-reply here.`)
                    .setFooter({ text: "˚ʚ♡ɞ˚ aichannel · angela" })
                    .setTimestamp()
            ]});
        }
    },

    async prefixExecute(message, args) {
        const lang  = message.client.languages?.get(message.guildId) || "en";
        const t     = LOCAL[lang] || LOCAL.en;

        if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels) &&
            message.author.id !== message.guild?.ownerId) {
            return message.reply(`❌ ${t.noPerms}`);
        }

        const sub     = args[0]?.toLowerCase();
        const channel = message.mentions.channels.first();
        const guildId = message.guildId;
        const data    = loadData();

        if (!sub || sub === "list") {
            const channels = getGuildChannels(guildId);
            return message.reply(
                channels.length > 0
                    ? `🤖 **${t.list}:** ${channels.map(id => `<#${id}>`).join(", ")}`
                    : `🤖 ${t.none}`
            );
        }

        if (!channel) return message.reply(`❌ Mention a channel. Example: \`aichannel set #chat\``);

        if (sub === "set") {
            if (!data[guildId]) data[guildId] = [];
            if (data[guildId].includes(channel.id)) return message.reply(`❌ ${t.alreadySet}`);
            data[guildId].push(channel.id);
            saveData(data);
            message.client.aiChannels?.add(channel.id);
            return message.reply(`✅ ${t.set} ${channel}`);
        }

        if (sub === "remove") {
            const list = data[guildId] || [];
            if (!list.includes(channel.id)) return message.reply(`❌ ${t.notSet}`);
            data[guildId] = list.filter(id => id !== channel.id);
            saveData(data);
            message.client.aiChannels?.delete(channel.id);
            return message.reply(`🔕 ${t.remove} ${channel}`);
        }

        message.reply(`❌ Usage: \`aichannel set/remove/list #channel\``);
    },
};
