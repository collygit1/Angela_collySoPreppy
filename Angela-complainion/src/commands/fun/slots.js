const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "slots", spinning: "Spinning the reels...", win: "✦ JACKPOT! ✦", almostWin: "꒰ Almost! ꒱", loss: "꒰ Try again~ ꒱", status: "Result" },
    tl: { title: "slots", spinning: "Umiikot na ang reels...", win: "✦ JACKPOT! ✦", almostWin: "꒰ Malapit na! ꒱", loss: "꒰ Subukan ulit~ ꒱", status: "Resulta" },
    ko: { title: "슬롯", spinning: "릴을 돌리는 중...", win: "✦ 잭팟! ✦", almostWin: "꒰ 거의 다 왔어요! ꒱", loss: "꒰ 다시 해봐요~ ꒱", status: "결과" },
    ja: { title: "スロット", spinning: "リールを回転中...", win: "✦ ジャックポット！✦", almostWin: "꒰ もう少し！꒱", loss: "꒰ また今度～ ꒱", status: "結果" }
};

const ITEMS = ["<:cupcake:1455889268869435574>", "<:cake:1455889214267719721>", "<:donut:1455889051071811606>", "<:pinkish_starfish:1455901785532268574>"];

module.exports = {
    name: "slots",
    data: new SlashCommandBuilder()
        .setName("slots")
        .setDescription("✦ Test your luck in the Boutique Slots~"),
    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const spinEmbed = new EmbedBuilder().setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription(`🎰 *${t.spinning}*\n> **[ 🎰 | 🎰 | 🎰 ]**`);
        await interaction.reply({ embeds: [spinEmbed] });
        await new Promise(r => setTimeout(r, 1500));
        await this.reveal(interaction, interaction.user, t, lang, true);
    },
    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        await this.reveal(message, message.author, t, lang, false);
    },
    async reveal(ctx, user, t, lang, edit) {
        const s1 = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        const s2 = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        const s3 = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        const win = s1 === s2 && s2 === s3;
        const semi = (s1 === s2 || s2 === s3 || s1 === s3) && !win;
        const embed = new EmbedBuilder()
            .setColor(win ? "#FFD700" : "#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client.user.displayAvatarURL() })
            .setDescription(
                `⊹ ─────────────────── ⊹\n` +
                `🎰 **${t.status}**\n> **║ ${s1} ║ ${s2} ║ ${s3} ║**\n\n` +
                `✨ ${win ? t.win : semi ? t.almostWin : t.loss}\n` +
                `⊹ ─────────────────── ⊹`
            )
            .setFooter({ text: `˚ʚ♡ɞ˚ slots · angela · ${lang.toUpperCase()}`, iconURL: user.displayAvatarURL() })
            .setTimestamp();
        if (edit) return ctx.editReply({ embeds: [embed] });
        return ctx.reply({ embeds: [embed] });
    }
};
