const { Events, EmbedBuilder } = require("discord.js");
const fs   = require("node:fs");
const path = require("node:path");

const statsPath = path.join(__dirname, "../database/json/stats.json");

const INVITE_RE = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/([a-zA-Z0-9-]{2,32})/i;

module.exports = {
    name: Events.MessageCreate,

    async execute(message, client) {
        if (!message.guild || message.author.bot) return;

        const match = message.content.match(INVITE_RE);
        if (!match) return;

        const sendError = async (content) => {
            const embed = new EmbedBuilder()
                .setColor("#000000")
                .setTitle("♰ **V᥆ιd_Sᥡstᥱm_Rᥱjᥱᥴtι᥆ᥒ**")
                .setDescription(`> *${content}*\n\nᣟ݂ᣟരᰍ`);
            try {
                await message.delete().catch(() => {});
                const msg = await message.channel.send({ content: `<@${message.author.id}>`, embeds: [embed] });
                setTimeout(() => msg.delete().catch(() => {}), 5000);
            } catch {}
        };

        try {
            const invite = await client.fetchInvite(match[5]).catch(() => null);
            if (!invite) return sendError("``thᥲt_ᥣιᥒk_hᥲs_ᥒ᥆_ᥣιfᥱ_ᥣᥱft_ιᥒ_ιt...``");

            const targetGuildId = invite.guild.id;

            fs.mkdirSync(path.dirname(statsPath), { recursive: true });
            let stats = {};
            if (fs.existsSync(statsPath)) {
                stats = JSON.parse(fs.readFileSync(statsPath, "utf8") || "{}");
            }

            if (!stats[message.guild.id]) {
                stats[message.guild.id] = { totalPartnerships: 0, partneredGuilds: [], users: {} };
            }

            const guildData = stats[message.guild.id];

            if (targetGuildId === message.guild.id)
                return sendError("``ᥡ᥆ᥙ_ᥴᥲ|ᥒᥒ᥆t_tᥱthᥱr_ᥲ_s᥆ᥙᥣ_thᥲt_ιs_ᥲᥣrᥱᥲdᥡ_hᥱrᥱ...``");

            if (guildData.partneredGuilds.includes(targetGuildId))
                return sendError("``thιs_sᥱrvᥱr_ιs_ᥲᥣrᥱᥲdᥡ_ᥴ᥆ᥒsᥙmᥱd_bᥡ_thᥱ_v᥆ιd_ιᥒ_thιs_ᥴhᥲᥒᥒᥱᥣ.``");

            if (!guildData.users[message.author.id]) {
                guildData.users[message.author.id] = { count: 0, rank: 1 };
            }

            guildData.users[message.author.id].count++;
            guildData.totalPartnerships++;
            guildData.partneredGuilds.push(targetGuildId);
            guildData.users[message.author.id].rank =
                Math.floor(guildData.users[message.author.id].count / 3) + 1;

            fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

            const cookies = ["Bone Calcium Wafer", "Silk Macaron", "Mythic Star-Cookie", "Void Cracker"];
            const loot    = cookies[Math.floor(Math.random() * cookies.length)];

            const partnerEmbed = new EmbedBuilder()
                .setColor("#000000")
                .setTitle("<:dolls:1470710614182596629> **S᥆ᥙᥣ_Tᥱthᥱr_Sᥙᥴᥴᥱssfᥙᥣ**")
                .setAuthor({ name: `ρostᥱd_bᥡ_${message.author.username}`, iconURL: message.author.displayAvatarURL() })
                .setThumbnail(invite.guild.iconURL({ dynamic: true }))
                .setImage(invite.guild.splashURL({ size: 2048 }) || invite.guild.bannerURL({ size: 2048 }))
                .setDescription(
                    `> *The server soul **${invite.guild.name}** has been recorded in the void archives.*\n\n` +
                    `<:cute_ribbons:1471689825970164016> **Pᥲrtᥒᥱr_Rᥲᥒk:** \`Level ${guildData.users[message.author.id].rank}\`\n` +
                    `<:lilo_pop:1472096489630204027> **Pᥲrtᥒᥱrshιρ_Lιᥒk:** \`${match[0]}\`\n` +
                    `<:bow_ribboning:1462028553137815602> **T᥆tᥲᥣ_B᥆ᥒds:** \`${guildData.totalPartnerships}\`\n\n` +
                    `🍪 **Rᥱᥕᥲrd:** \`${loot}\``
                )
                .setFooter({ text: `♰ synchronized_at: ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` });

            await message.reply({ embeds: [partnerEmbed] });

        } catch {
            sendError("ᥲᥒ_ᥙᥒkᥒ᥆ᥕᥒ_ᥴ᥆rrᥙρtι᥆ᥒ_᥆ᥴᥴᥙrrᥱd.");
        }
    },
};
