const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getUser, updateUser } = require("../economyStore");

const LOCAL = {
    en: { title: "bank", deposit: "Deposited", withdraw: "Withdrawn", wallet: "Wallet", bankBal: "Bank", insufficient: "You don't have that much.", invalidAmt: "That's not a valid amount.", noBank: "Your bank is empty. Bold strategy.", modes: ["deposit", "withdraw", "balance"] },
    tl: { title: "bangko", deposit: "Na-deposit", withdraw: "Na-withdraw", wallet: "Pitaka", bankBal: "Bangko", insufficient: "Kulang ang pera mo.", invalidAmt: "Hindi wastong halaga.", noBank: "Walang laman ang bangko mo.", modes: ["deposit", "withdraw", "balance"] },
    ko: { title: "은행", deposit: "입금됨", withdraw: "출금됨", wallet: "지갑", bankBal: "은행", insufficient: "잔액이 부족합니다.", invalidAmt: "유효하지 않은 금액입니다.", noBank: "은행이 비어 있습니다.", modes: ["deposit", "withdraw", "balance"] },
    ja: { title: "銀行", deposit: "入金完了", withdraw: "出金完了", wallet: "財布", bankBal: "銀行", insufficient: "残高が不足しています。", invalidAmt: "無効な金額です。", noBank: "銀行が空です。", modes: ["deposit", "withdraw", "balance"] },
};

async function handle(ctx, guildId, userId, action, rawAmount, isSlash, t, clientUser) {
    const u = getUser(guildId, userId);

    if (action === "balance") {
        const embed = new EmbedBuilder()
            .setColor("#FFD700")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: clientUser.displayAvatarURL() })
            .setTitle("🏦 Bank Balance")
            .addFields(
                { name: `👛 ${t.wallet}`, value: `\`${u.coins.toLocaleString()} coins\``, inline: true },
                { name: `🏦 ${t.bankBal}`, value: `\`${u.bank.toLocaleString()} coins\``, inline: true },
                { name: "💎 Total", value: `\`${(u.coins + u.bank).toLocaleString()} coins\``, inline: true },
            )
            .setFooter({ text: "˚ʚ♡ɞ˚ bank · angela" })
            .setTimestamp();
        return isSlash ? ctx.reply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
    }

    let amount;
    if (rawAmount === "all") {
        amount = action === "deposit" ? u.coins : u.bank;
    } else {
        amount = parseInt(rawAmount);
        if (isNaN(amount) || amount <= 0) {
            return isSlash
                ? ctx.reply({ content: `❌ ${t.invalidAmt}`, ephemeral: true })
                : ctx.reply(`❌ ${t.invalidAmt}`);
        }
    }

    if (action === "deposit" && amount > u.coins) {
        return isSlash ? ctx.reply({ content: `❌ ${t.insufficient}`, ephemeral: true }) : ctx.reply(`❌ ${t.insufficient}`);
    }
    if (action === "withdraw" && amount > u.bank) {
        return isSlash ? ctx.reply({ content: `❌ ${t.noBank}`, ephemeral: true }) : ctx.reply(`❌ ${t.noBank}`);
    }

    updateUser(guildId, userId, u => {
        if (action === "deposit")  { u.coins -= amount; u.bank += amount; }
        if (action === "withdraw") { u.bank -= amount; u.coins += amount; }
    });

    const refreshed = getUser(guildId, userId);
    const isDeposit = action === "deposit";

    const embed = new EmbedBuilder()
        .setColor(isDeposit ? "#4CAF50" : "#FFD700")
        .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: clientUser.displayAvatarURL() })
        .setTitle(isDeposit ? `🏦 ${t.deposit}` : `💸 ${t.withdraw}`)
        .addFields(
            { name: isDeposit ? "📥 Into Bank" : "📤 From Bank", value: `\`${amount.toLocaleString()} coins\``, inline: true },
            { name: `👛 ${t.wallet}`, value: `\`${refreshed.coins.toLocaleString()} coins\``, inline: true },
            { name: `🏦 ${t.bankBal}`, value: `\`${refreshed.bank.toLocaleString()} coins\``, inline: true },
        )
        .setFooter({ text: "˚ʚ♡ɞ˚ bank · angela" })
        .setTimestamp();

    return isSlash ? ctx.reply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bank")
        .setDescription("✦ Deposit, withdraw, or check your bank balance")
        .addStringOption(o => o.setName("action").setDescription("What to do").setRequired(true)
            .addChoices({ name: "deposit", value: "deposit" }, { name: "withdraw", value: "withdraw" }, { name: "balance", value: "balance" }))
        .addStringOption(o => o.setName("amount").setDescription("Amount to deposit/withdraw (or 'all')")),

    async execute(interaction) {
        const lang   = interaction.client.languages?.get(interaction.guildId) || "en";
        const t      = LOCAL[lang] || LOCAL.en;
        const action = interaction.options.getString("action");
        const amount = interaction.options.getString("amount") || "0";
        await handle(interaction, interaction.guildId, interaction.user.id, action, amount, true, t, interaction.client.user);
    },

    async prefixExecute(message, args) {
        const lang   = message.client.languages?.get(message.guildId) || "en";
        const t      = LOCAL[lang] || LOCAL.en;
        const action = args[0]?.toLowerCase();
        const amount = args[1] || "0";
        if (!["deposit", "withdraw", "balance"].includes(action)) {
            return message.reply(`❌ Usage: \`bank <deposit|withdraw|balance> [amount|all]\``);
        }
        await handle(message, message.guildId, message.author.id, action, amount, false, t, message.client.user);
    },
};
