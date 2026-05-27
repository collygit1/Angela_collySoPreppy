const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "reminder", set: "Reminder set!", when: "Reminding you", reminderMsg: "⏰ Reminder!", note: "Your note", invalid: "Invalid time format. Use: `10m`, `1h`, `2d` (max 7 days).", tooLong: "Maximum reminder time is 7 days.", noReminder: "Could not DM you — make sure your DMs are open!" },
    tl: { title: "reminder", set: "Reminder na-set!", when: "Papaalalahanan ka", reminderMsg: "⏰ Paalala!", note: "Iyong tala", invalid: "Hindi wastong format. Gamitin: `10m`, `1h`, `2d` (max 7 araw).", tooLong: "Maximum na 7 araw lamang.", noReminder: "Hindi makagawa ng DM — siguraduhing bukas ang iyong DMs!" },
    ko: { title: "알림", set: "알림 설정됨!", when: "알림 예정", reminderMsg: "⏰ 알림!", note: "메모", invalid: "잘못된 시간 형식. 사용: `10m`, `1h`, `2d` (최대 7일).", tooLong: "최대 7일까지 설정 가능합니다.", noReminder: "DM을 보낼 수 없습니다 — DM이 열려 있는지 확인하세요!" },
    ja: { title: "リマインダー", set: "リマインダー設定済み！", when: "リマインド予定", reminderMsg: "⏰ リマインダー！", note: "メモ", invalid: "無効な時間形式。使用: `10m`, `1h`, `2d` (最大7日)。", tooLong: "最大7日間まで設定できます。", noReminder: "DMを送信できませんでした — DMが開いているか確認してください！" },
};

const MAX_MS = 7 * 24 * 60 * 60 * 1000;

function parseTime(input) {
    const match = input.match(/^(\d+)(m|h|d)$/i);
    if (!match) return null;
    const [, n, unit] = match;
    const mul = { m: 60000, h: 3600000, d: 86400000 };
    return parseInt(n) * mul[unit.toLowerCase()];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reminder")
        .setDescription("✦ Set a reminder — Angela will DM you")
        .addStringOption(o => o.setName("time").setDescription("When to remind you (e.g. 10m, 2h, 1d)").setRequired(true))
        .addStringOption(o => o.setName("note").setDescription("What to remind you about").setRequired(true)),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const input = interaction.options.getString("time");
        const note  = interaction.options.getString("note");
        const ms    = parseTime(input);

        if (!ms)         return interaction.reply({ content: `❌ ${t.invalid}`, ephemeral: true });
        if (ms > MAX_MS) return interaction.reply({ content: `❌ ${t.tooLong}`, ephemeral: true });

        const fireAt = Math.floor((Date.now() + ms) / 1000);

        const confirmEmbed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle(`⏰ ${t.set}`)
            .addFields(
                { name: t.when, value: `<t:${fireAt}:R> (<t:${fireAt}:f>)`, inline: false },
                { name: t.note, value: note, inline: false },
            )
            .setFooter({ text: "Angela will DM you when it's time~" })
            .setTimestamp();

        await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });

        setTimeout(async () => {
            const reminderEmbed = new EmbedBuilder()
                .setColor("#ffcad4")
                .setAuthor({ name: `angela ♡ | ${t.reminderMsg}`, iconURL: interaction.client.user.displayAvatarURL() })
                .setTitle(`⏰ ${t.reminderMsg}`)
                .addFields({ name: t.note, value: note })
                .setFooter({ text: `Set in: ${interaction.guild?.name ?? "DM"}` })
                .setTimestamp();

            await interaction.user.send({ embeds: [reminderEmbed] }).catch(async () => {
                await interaction.channel?.send({ content: `${interaction.user} ${t.noReminder}`, embeds: [reminderEmbed] }).catch(() => {});
            });
        }, ms);
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const input = args[0];
        const note  = args.slice(1).join(" ");

        if (!input || !note) return message.reply(`❌ Usage: \`remind <time> <note>\` (e.g. \`remind 10m study break\`)`);
        const ms = parseTime(input);
        if (!ms)         return message.reply(`❌ ${t.invalid}`);
        if (ms > MAX_MS) return message.reply(`❌ ${t.tooLong}`);

        const fireAt = Math.floor((Date.now() + ms) / 1000);
        await message.reply(`⏰ ${t.set} I'll remind you <t:${fireAt}:R>!`);

        setTimeout(async () => {
            const reminderEmbed = new EmbedBuilder()
                .setColor("#ffcad4")
                .setAuthor({ name: `angela ♡ | ${t.reminderMsg}`, iconURL: message.client.user.displayAvatarURL() })
                .setTitle(`⏰ ${t.reminderMsg}`)
                .addFields({ name: t.note, value: note })
                .setTimestamp();
            await message.author.send({ embeds: [reminderEmbed] }).catch(() => {
                message.channel.send({ content: `${message.author} ⏰ ${note}` }).catch(() => {});
            });
        }, ms);
    },
};
