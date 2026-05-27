const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getUser, updateUser, hasItem, SHOP_ITEMS } = require("../economyStore");

const LOCAL = {
    en: { title: "trade", offered: "Offer Sent", accepted: "Trade Accepted", declined: "Trade Declined", expired: "Trade Expired", offerDesc: "has offered you", noSelf: "Can't trade with yourself. Yes I checked.", noBot: "Bots don't trade items.", notOwned: "You don't own that item.", alreadyHas: "They already own that item.", insufficient: "You don't have enough coins.", noItem: "That item doesn't exist.", pending: "Awaiting Response", coins: "Coins", item: "Item", accept: "✅ Accept", decline: "❌ Decline" },
    tl: { title: "kalakalan", offered: "Naipadala ang Alok", accepted: "Tinanggap ang Kalakalan", declined: "Tinanggihan ang Kalakalan", expired: "Nag-expire ang Kalakalan", offerDesc: "nag-alok sa iyo ng", noSelf: "Hindi ka makakalakalan sa sarili mo.", noBot: "Hindi nag-e-engage ang mga bot sa kalakalan.", notOwned: "Wala kang item na iyon.", alreadyHas: "Mayroon na siya niyan.", insufficient: "Hindi sapat ang iyong pera.", noItem: "Hindi umiiral ang item na iyon.", pending: "Naghihintay ng Sagot", coins: "Coins", item: "Item", accept: "✅ Tanggapin", decline: "❌ Tanggihan" },
    ko: { title: "거래", offered: "제안 전송됨", accepted: "거래 수락됨", declined: "거래 거절됨", expired: "거래 만료됨", offerDesc: "이(가) 제안을 보냈습니다", noSelf: "자신과는 거래할 수 없습니다.", noBot: "봇은 거래에 참여하지 않습니다.", notOwned: "그 아이템이 없습니다.", alreadyHas: "상대방이 이미 그 아이템을 가지고 있습니다.", insufficient: "코인이 부족합니다.", noItem: "그 아이템은 존재하지 않습니다.", pending: "응답 대기 중", coins: "코인", item: "아이템", accept: "✅ 수락", decline: "❌ 거절" },
    ja: { title: "取引", offered: "オファー送信済み", accepted: "取引成立", declined: "取引拒否", expired: "取引期限切れ", offerDesc: "からオファーが届きました", noSelf: "自分とは取引できません。", noBot: "ボットは取引に参加しません。", notOwned: "そのアイテムを持っていません。", alreadyHas: "相手はすでにそのアイテムを持っています。", insufficient: "コインが不足しています。", noItem: "そのアイテムは存在しません。", pending: "返答待ち", coins: "コイン", item: "アイテム", accept: "✅ 承諾", decline: "❌ 拒否" },
};

const pending = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("trade")
        .setDescription("✦ Trade an item or coins with another user")
        .addUserOption(o => o.setName("user").setDescription("Who to trade with").setRequired(true))
        .addStringOption(o => o.setName("offer_item").setDescription("Item ID you're offering (optional)"))
        .addIntegerOption(o => o.setName("offer_coins").setDescription("Coins you're offering (optional)").setMinValue(1)),

    async execute(interaction) {
        const lang     = interaction.client.languages?.get(interaction.guildId) || "en";
        const t        = LOCAL[lang] || LOCAL.en;
        const target   = interaction.options.getUser("user");
        const offerId  = interaction.options.getString("offer_item");
        const offerCoin= interaction.options.getInteger("offer_coins") || 0;
        const sender   = interaction.user;

        if (target.id === sender.id) return interaction.reply({ content: `❌ ${t.noSelf}`, ephemeral: true });
        if (target.bot)              return interaction.reply({ content: `❌ ${t.noBot}`, ephemeral: true });

        const senderData = getUser(interaction.guildId, sender.id);

        if (offerId) {
            if (!SHOP_ITEMS[offerId])                            return interaction.reply({ content: `❌ ${t.noItem}`, ephemeral: true });
            if (!senderData.inventory.includes(offerId))         return interaction.reply({ content: `❌ ${t.notOwned}`, ephemeral: true });
            if (hasItem(interaction.guildId, target.id, offerId))return interaction.reply({ content: `❌ ${t.alreadyHas}`, ephemeral: true });
        }
        if (offerCoin && senderData.coins < offerCoin)           return interaction.reply({ content: `❌ ${t.insufficient}`, ephemeral: true });
        if (!offerId && !offerCoin)                               return interaction.reply({ content: `❌ Provide an item or coins to offer.`, ephemeral: true });

        const tradeId = `trade_${interaction.id}`;
        const item    = offerId ? SHOP_ITEMS[offerId] : null;

        const offerLines = [];
        if (item)      offerLines.push(`${item.emoji} **${item.name}**`);
        if (offerCoin) offerLines.push(`💰 \`${offerCoin.toLocaleString()} coins\``);

        const embed = new EmbedBuilder()
            .setColor("#FFD700")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle(`🔄 ${t.pending}`)
            .setDescription(`${sender} ${t.offerDesc} ${target}:\n\n${offerLines.join("\n")}`)
            .setFooter({ text: "Expires in 60 seconds · ˚ʚ♡ɞ˚ angela" })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`${tradeId}_accept`).setLabel(t.accept).setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`${tradeId}_decline`).setLabel(t.decline).setStyle(ButtonStyle.Danger),
        );

        pending.set(tradeId, { senderId: sender.id, targetId: target.id, offerId, offerCoin, guildId: interaction.guildId });

        await interaction.reply({ content: `${target}`, embeds: [embed], components: [row] });

        const collector = interaction.channel.createMessageComponentCollector({
            filter: i => i.customId.startsWith(tradeId) && i.user.id === target.id,
            time: 60000, max: 1,
        });

        collector.on("collect", async i => {
            const trade = pending.get(tradeId);
            if (!trade) return i.reply({ content: "Trade no longer valid.", ephemeral: true });
            pending.delete(tradeId);

            if (i.customId.endsWith("_decline")) {
                return i.update({ embeds: [embed.setColor("#FF6B6B").setTitle(`❌ ${t.declined}`)], components: [] });
            }

            const sD = getUser(trade.guildId, trade.senderId);
            if (trade.offerId && !sD.inventory.includes(trade.offerId)) return i.reply({ content: "Sender no longer has that item.", ephemeral: true });
            if (trade.offerCoin && sD.coins < trade.offerCoin) return i.reply({ content: "Sender no longer has enough coins.", ephemeral: true });

            updateUser(trade.guildId, trade.senderId, u => {
                if (trade.offerId) u.inventory = u.inventory.filter(x => x !== trade.offerId);
                if (trade.offerCoin) u.coins -= trade.offerCoin;
            });
            updateUser(trade.guildId, trade.targetId, u => {
                if (trade.offerId && !u.inventory.includes(trade.offerId)) u.inventory.push(trade.offerId);
                if (trade.offerCoin) u.coins += trade.offerCoin;
            });

            const successEmbed = new EmbedBuilder()
                .setColor("#4CAF50")
                .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                .setTitle(`✅ ${t.accepted}`)
                .setDescription(offerLines.join("\n") + `\n\n> Transferred from ${sender} → ${target}`)
                .setTimestamp();

            await i.update({ embeds: [successEmbed], components: [] });
        });

        collector.on("end", (collected) => {
            if (collected.size === 0 && pending.has(tradeId)) {
                pending.delete(tradeId);
                interaction.editReply({ embeds: [embed.setColor("#808080").setTitle(`⏰ ${t.expired}`)], components: [] }).catch(() => {});
            }
        });
    },

    async prefixExecute(message, args) {
        message.reply("❌ Use `/trade` for trading — it requires the confirmation buttons to work properly. 🔄");
    },
};
