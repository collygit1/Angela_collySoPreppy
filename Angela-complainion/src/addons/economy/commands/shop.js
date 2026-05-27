const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getUser, updateUser, hasItem, SHOP_ITEMS } = require("../economyStore");

const LOCAL = {
    en: { title: "shop", browse: "Item Shop", buy: "Purchase Complete", price: "Price", desc: "Effect", owned: "Already Owned", alreadyOwned: "You already own this item. Collector energy.", insufficient: "Not enough coins.", bought: "Purchased", wallet: "New Balance", invalid: "That item doesn't exist in the shop." },
    tl: { title: "tindahan", browse: "Tindahan", buy: "Nabili na", price: "Presyo", desc: "Epekto", owned: "Nasa inyo na", alreadyOwned: "Mayroon ka na nito.", insufficient: "Hindi sapat ang coins.", bought: "Nabili", wallet: "Bagong Balanse", invalid: "Wala ang item na iyon sa tindahan." },
    ko: { title: "상점", browse: "아이템 상점", buy: "구매 완료", price: "가격", desc: "효과", owned: "이미 보유 중", alreadyOwned: "이미 이 아이템을 보유하고 있습니다.", insufficient: "코인이 부족합니다.", bought: "구매됨", wallet: "현재 잔액", invalid: "상점에 없는 아이템입니다." },
    ja: { title: "ショップ", browse: "アイテムショップ", buy: "購入完了", price: "価格", desc: "効果", owned: "既に所持中", alreadyOwned: "このアイテムは既に持っています。", insufficient: "コインが不足しています。", bought: "購入済み", wallet: "現在の残高", invalid: "そのアイテムはショップにありません。" },
};

function buildShopEmbed(guildId, userId, t, clientUser) {
    const u = getUser(guildId, userId);

    const fields = Object.entries(SHOP_ITEMS).map(([id, item]) => {
        const owned = u.inventory.includes(id);
        return {
            name: `${item.emoji} ${item.name} ${owned ? "✅" : ""}`,
            value: `> ${item.desc}\n> 💰 \`${item.price.toLocaleString()} coins\` · ID: \`${id}\``,
            inline: false,
        };
    });

    return new EmbedBuilder()
        .setColor("#FFD700")
        .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: clientUser.displayAvatarURL() })
        .setTitle(`🛒 ${t.browse}`)
        .addFields(fields)
        .setDescription(`> Your balance: **${u.coins.toLocaleString()} coins**\n> Use \`/shop buy <item_id>\` to purchase.`)
        .setFooter({ text: "˚ʚ♡ɞ˚ shop · angela" })
        .setTimestamp();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shop")
        .setDescription("✦ Browse or buy items from Angela's shop")
        .addSubcommand(sub => sub
            .setName("list")
            .setDescription("Browse all available items"))
        .addSubcommand(sub => sub
            .setName("buy")
            .setDescription("Purchase an item")
            .addStringOption(o => o.setName("item").setDescription("Item ID from the shop").setRequired(true)
                .addChoices(
                    ...Object.entries(SHOP_ITEMS).map(([id, item]) => ({ name: `${item.emoji} ${item.name}`, value: id }))
                ))),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t    = LOCAL[lang] || LOCAL.en;
        const sub  = interaction.options.getSubcommand();

        if (sub === "list") {
            return interaction.reply({ embeds: [buildShopEmbed(interaction.guildId, interaction.user.id, t, interaction.client.user)] });
        }

        if (sub === "buy") {
            const itemId = interaction.options.getString("item");
            const item   = SHOP_ITEMS[itemId];
            if (!item) return interaction.reply({ content: `❌ ${t.invalid}`, ephemeral: true });

            const u = getUser(interaction.guildId, interaction.user.id);
            if (u.inventory.includes(itemId)) return interaction.reply({ content: `❌ ${t.alreadyOwned}`, ephemeral: true });
            if (u.coins < item.price)         return interaction.reply({ content: `❌ ${t.insufficient} You have \`${u.coins}\` coins, need \`${item.price}\`.`, ephemeral: true });

            updateUser(interaction.guildId, interaction.user.id, u => {
                u.coins -= item.price;
                if (!u.inventory.includes(itemId)) u.inventory.push(itemId);
            });

            const refreshed = getUser(interaction.guildId, interaction.user.id);

            return interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setColor("#4CAF50")
                    .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle(`${item.emoji} ${t.buy}`)
                    .addFields(
                        { name: `🛍️ ${t.bought}`,   value: `**${item.name}**`, inline: true },
                        { name: `✨ ${t.desc}`,       value: item.desc, inline: true },
                        { name: `👛 ${t.wallet}`,    value: `\`${refreshed.coins.toLocaleString()} coins\``, inline: true },
                    )
                    .setFooter({ text: "˚ʚ♡ɞ˚ shop · angela" })
                    .setTimestamp()
            ]});
        }
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t    = LOCAL[lang] || LOCAL.en;
        const sub  = args[0]?.toLowerCase();

        if (!sub || sub === "list") {
            return message.reply({ embeds: [buildShopEmbed(message.guildId, message.author.id, t, message.client.user)] });
        }

        if (sub === "buy") {
            const itemId = args[1]?.toLowerCase();
            const item   = SHOP_ITEMS[itemId];
            if (!item) return message.reply(`❌ ${t.invalid}\nValid IDs: ${Object.keys(SHOP_ITEMS).map(k => `\`${k}\``).join(", ")}`);

            const u = getUser(message.guildId, message.author.id);
            if (u.inventory.includes(itemId)) return message.reply(`❌ ${t.alreadyOwned}`);
            if (u.coins < item.price)         return message.reply(`❌ ${t.insufficient}`);

            updateUser(message.guildId, message.author.id, u => {
                u.coins -= item.price;
                if (!u.inventory.includes(itemId)) u.inventory.push(itemId);
            });

            message.reply(`${item.emoji} **${t.bought} ${item.name}** for \`${item.price} coins\`. ${item.desc}`);
        }
    },
};
