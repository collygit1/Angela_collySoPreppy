const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getUser, updateUser } = require("../economyStore");

const LOCAL = {
    en: { title: "pay", sent: "Transfer Complete", from: "From", to: "To", amount: "Amount", newBal: "Your Balance", noSelf: "Can't pay yourself. Nice try.", noBot: "Bots don't accept tips. (I do, actually. But not through here.)", insufficient: "You don't have that many coins.", invalidAmt: "Invalid amount. Must be a positive number.", tooLow: "Minimum transfer is 1 coin." },
    tl: { title: "magbayad", sent: "Nailipat na", from: "Mula kay", to: "Para kay", amount: "Halaga", newBal: "Iyong Balanse", noSelf: "Hindi mo mababayaran ang sarili mo.", noBot: "Hindi tumatanggap ng bayad ang mga bot.", insufficient: "Kulang ang iyong pera.", invalidAmt: "Hindi wastong halaga.", tooLow: "Minimum na 1 coin." },
    ko: { title: "보내기", sent: "송금 완료", from: "보낸 사람", to: "받는 사람", amount: "금액", newBal: "내 잔액", noSelf: "자신에게 송금할 수 없습니다.", noBot: "봇은 팁을 받지 않습니다.", insufficient: "잔액이 부족합니다.", invalidAmt: "유효하지 않은 금액입니다.", tooLow: "최소 1코인 이상이어야 합니다." },
    ja: { title: "送金", sent: "送金完了", from: "送信者", to: "受取人", amount: "金額", newBal: "残高", noSelf: "自分に送金はできません。", noBot: "ボットにチップは渡せません。", insufficient: "残高が不足しています。", invalidAmt: "無効な金額です。", tooLow: "最低1コインから送金できます。" },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pay")
        .setDescription("✦ Send coins to another user")
        .addUserOption(o => o.setName("user").setDescription("Who to pay").setRequired(true))
        .addIntegerOption(o => o.setName("amount").setDescription("How many coins to send").setRequired(true).setMinValue(1)),

    async execute(interaction) {
        const lang   = interaction.client.languages?.get(interaction.guildId) || "en";
        const t      = LOCAL[lang] || LOCAL.en;
        const target = interaction.options.getUser("user");
        const amount = interaction.options.getInteger("amount");
        const sender = interaction.user;

        if (target.id === sender.id)      return interaction.reply({ content: `❌ ${t.noSelf}`, ephemeral: true });
        if (target.bot)                   return interaction.reply({ content: `❌ ${t.noBot}`, ephemeral: true });

        const u = getUser(interaction.guildId, sender.id);
        if (u.coins < amount) return interaction.reply({ content: `❌ ${t.insufficient} You have \`${u.coins}\` coins.`, ephemeral: true });

        updateUser(interaction.guildId, sender.id,   u => { u.coins -= amount; });
        updateUser(interaction.guildId, target.id,   u => { u.coins += amount; });

        const refreshed = getUser(interaction.guildId, sender.id);

        const embed = new EmbedBuilder()
            .setColor("#4CAF50")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle(`💸 ${t.sent}`)
            .addFields(
                { name: `👤 ${t.from}`,   value: `${sender}`, inline: true },
                { name: `👤 ${t.to}`,     value: `${target}`, inline: true },
                { name: `💰 ${t.amount}`, value: `\`${amount.toLocaleString()} coins\``, inline: true },
                { name: `👛 ${t.newBal}`, value: `\`${refreshed.coins.toLocaleString()} coins\``, inline: true },
            )
            .setFooter({ text: "˚ʚ♡ɞ˚ pay · angela" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message, args) {
        const lang   = message.client.languages?.get(message.guildId) || "en";
        const t      = LOCAL[lang] || LOCAL.en;
        const target = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!target)             return message.reply(`❌ Mention a user to pay.`);
        if (target.id === message.author.id) return message.reply(`❌ ${t.noSelf}`);
        if (target.bot)          return message.reply(`❌ ${t.noBot}`);
        if (isNaN(amount) || amount < 1) return message.reply(`❌ ${t.invalidAmt}`);

        const u = getUser(message.guildId, message.author.id);
        if (u.coins < amount) return message.reply(`❌ ${t.insufficient}`);

        updateUser(message.guildId, message.author.id, u => { u.coins -= amount; });
        updateUser(message.guildId, target.id,         u => { u.coins += amount; });

        message.reply(`💸 Sent \`${amount} coins\` to **${target.username}**. Tiny economy preserved.`);
    },
};
