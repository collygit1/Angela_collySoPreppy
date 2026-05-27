const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getUser, SHOP_ITEMS } = require("../economyStore");

const LOCAL = {
    en: { title: "inventory", empty: "Your bag is empty. Spend some coins.", items: "Items Owned", effect: "Effect", coins: "Wallet", bank: "Bank" },
    tl: { title: "imbentaryo", empty: "Walang laman ang bag mo.", items: "Mga Item", effect: "Epekto", coins: "Pitaka", bank: "Bangko" },
    ko: { title: "인벤토리", empty: "가방이 비어 있습니다. 코인을 쓰세요.", items: "보유 아이템", effect: "효과", coins: "지갑", bank: "은행" },
    ja: { title: "インベントリ", empty: "バッグが空です。コインを使いましょう。", items: "所持アイテム", effect: "効果", coins: "財布", bank: "銀行" },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("inventory")
        .setDescription("✦ View your items and active boosts")
        .addUserOption(o => o.setName("user").setDescription("Check someone else's inventory")),

    async execute(interaction) {
        const lang   = interaction.client.languages?.get(interaction.guildId) || "en";
        const t      = LOCAL[lang] || LOCAL.en;
        const target = interaction.options.getUser("user") || interaction.user;
        const u      = getUser(interaction.guildId, target.id);

        if (u.inventory.length === 0) {
            return interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setColor("#FF6B6B")
                    .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle(`🎒 ${target.username}'s Inventory`)
                    .setDescription(`> ${t.empty}`)
                    .setFooter({ text: "˚ʚ♡ɞ˚ inventory · angela" })
            ]});
        }

        const fields = u.inventory.map(id => {
            const item = SHOP_ITEMS[id];
            if (!item) return { name: `❓ ${id}`, value: "> Unknown item.", inline: true };
            return { name: `${item.emoji} ${item.name}`, value: `> ${item.desc}`, inline: true };
        });

        const embed = new EmbedBuilder()
            .setColor("#FFD700")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle(`🎒 ${target.username}'s Inventory`)
            .setThumbnail(target.displayAvatarURL())
            .addFields(
                ...fields,
                { name: `👛 ${t.coins}`, value: `\`${u.coins.toLocaleString()} coins\``, inline: true },
                { name: `🏦 ${t.bank}`,  value: `\`${u.bank.toLocaleString()} coins\``, inline: true },
            )
            .setFooter({ text: `${u.inventory.length} item(s) · ˚ʚ♡ɞ˚ angela` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message, args) {
        const lang   = message.client.languages?.get(message.guildId) || "en";
        const t      = LOCAL[lang] || LOCAL.en;
        const target = message.mentions.users.first() || message.author;
        const u      = getUser(message.guildId, target.id);

        if (u.inventory.length === 0) return message.reply(`🎒 **${target.username}** · ${t.empty}`);

        const listed = u.inventory.map(id => {
            const item = SHOP_ITEMS[id];
            return item ? `${item.emoji} **${item.name}** — ${item.desc}` : `❓ ${id}`;
        }).join("\n");

        await message.reply({ embeds: [
            new EmbedBuilder()
                .setColor("#FFD700")
                .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: message.client.user.displayAvatarURL() })
                .setTitle(`🎒 ${target.username}'s Inventory`)
                .setDescription(listed)
        ]});
    },
};
