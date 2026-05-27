const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "disconnect", noVoice: "Angela is not in a voice channel~", left: "Disconnected from voice channel." },
    tl: { title: "disconnect", noVoice: "Si Angela ay wala sa voice channel~", left: "Umalis na sa voice channel." },
    ko: { title: "연결 해제", noVoice: "Angela가 음성 채널에 없습니다~", left: "음성 채널에서 연결이 해제되었습니다." },
    ja: { title: "切断", noVoice: "Angelaはボイスチャンネルにいません～", left: "ボイスチャンネルから切断しました。" },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("disconnect")
        .setDescription("✦ Disconnect Angela from the voice channel"),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        const botVoice = interaction.guild.members.me?.voice?.channel;
        if (!botVoice && !queue) return interaction.reply({ content: `🎵 ${t.noVoice}`, ephemeral: true });
        if (queue) queue.stop();
        else interaction.guild.members.me?.voice?.disconnect();
        const embed = new EmbedBuilder().setColor("#c9b1ff")
            .setAuthor({ name: "angela ♡ | disconnect", iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription(`⊹ ─────────────────── ⊹\n🔌 **${t.left}**\n⊹ ─────────────────── ⊹`)
            .setFooter({ text: `˚ʚ♡ɞ˚ disconnect · angela · ${lang.toUpperCase()}` });
        await interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = message.client.distube.getQueue(message.guildId);
        if (!queue && !message.guild.members.me?.voice?.channel) return message.reply(`🎵 ${t.noVoice}`);
        if (queue) queue.stop();
        else message.guild.members.me?.voice?.disconnect();
        message.reply(`🔌 **${t.left}**`);
    },
};
