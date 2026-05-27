const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const statsPath = path.join(process.cwd(), 'src', 'database', 'json', 'userinfo.json');

const b = {
    starfish: '<:pinkish_starfish:1455901785532268574>',
    moon: '<:moon_atoms:1455934795766038560>',
    atom: '<:atoms_r:1455934918700961833>',
    cupcake: '<:cupcake:1455889268869435574>'
};

const labels = {
    en: { scan: "PROFILE SCAN", id: "Identity", date: "System Dates", roles: "Permissions", join: "Joined", create: "Created", bot: "Synthetic", req: "Requested by", notFound: "❌ **Scan Failed:** ID not found." },
    tl: { scan: "PAGSUSURI NG PROFILE", id: "Pagkakakilanlan", date: "Mga Petsa", roles: "Mga Tungkulin", join: "Saling", create: "Nilikha", bot: "Bot", req: "Hiling ni", notFound: "❌ **Bigo:** Hindi mahanap ang ID." },
    ja: { scan: "プロファイルスキャン", id: "識別 ID", date: "システム日付", roles: "権限", join: "参加日", create: "作成日", bot: "Bot", req: "リクエスト者", notFound: "❌ **エラー:** IDが見つかりません。" },
    ko: { scan: "프로필 스캔", id: "식별 번호", date: "시스템 날짜", roles: "권한", join: "가입일", create: "생성일", bot: "봇", req: "요청자", notFound: "❌ **오류:** ID를 찾을 수 없습니다." }
};

module.exports = {
    name: 'user', 
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('User related commands')
        .addSubcommand(sub =>
            sub
                .setName('info')
                .setDescription('Get deep scan info about a user')
                .addUserOption(opt => opt.setName('member').setDescription('Select a member'))
                .addStringOption(opt => opt.setName('id').setDescription('Or paste a User ID')))
        .addSubcommand(sub =>
            sub
                .setName('avatar')
                .setDescription('View a users profile picture')
                .addUserOption(opt => opt.setName('member').setDescription('Select a member'))
                .addStringOption(opt => opt.setName('id').setDescription('Or paste a User ID')))
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const lang = interaction.client.languages?.get(interaction.guildId) || 'en';
        const t = labels[lang === 'kr' ? 'ko' : lang] || labels.en;

        const idInput = interaction.options.getString('id');
        const memberInput = interaction.options.getUser('member');
        let target = null;

        // 1. Resolve Target
        if (idInput) {
            try {
                target = await interaction.client.users.fetch(idInput);
            } catch (err) {
                return interaction.reply({ content: t.notFound, ephemeral: true });
            }
        } else {
            target = memberInput || interaction.user;
        }

        // 🛡️ BOT PROTECTION LAYER (Invisible Message)
        if (target.bot) {
            return interaction.reply({
                content: `${b.atom} **Scan Denied:** Target is a synthetic entity. Please use the \`/botinfo\` command for bots.`,
                ephemeral: true
            });
        }

        this.updateStats();

        if (sub === 'info') {
            const embed = this.buildUserEmbed(interaction.guild, target, interaction.user, t, lang);
            return interaction.reply({ embeds: [embed] });
        }

        if (sub === 'avatar') {
            const embed = this.buildAvatarEmbed(target, interaction.user, t);
            return interaction.reply({ embeds: [embed] });
        }
    },

    async prefixExecute(message, args) {
        const sub = args[0]?.toLowerCase() === 'avatar' ? 'avatar' : 'info';
        const query = args[0]?.toLowerCase() === 'info' || args[0]?.toLowerCase() === 'avatar' ? args[1] : args[0];

        let target = message.mentions.users.first();
        if (!target && query && /^\d{17,19}$/.test(query)) {
            try { target = await message.client.users.fetch(query); } catch (e) { target = null; }
        }
        if (!target) target = message.author;

        // 🛡️ PREFIX BOT PROTECTION (Auto-deleting message)
        if (target.bot) {
            return message.reply(`**Scan Denied:** Please use the \`botinfo\` command for bots.`).then(m => setTimeout(() => m.delete(), 5000));
        }

        const lang = message.client.languages?.get(message.guildId) || 'en';
        const t = labels[lang === 'kr' ? 'ko' : lang] || labels.en;
        this.updateStats();

        if (sub === 'avatar') {
            const embed = this.buildAvatarEmbed(target, message.author, t);
            return message.reply({ embeds: [embed] });
        }

        const embed = this.buildUserEmbed(message.guild, target, message.author, t, lang);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },

    buildUserEmbed(guild, target, requester, t, lang) {
        const member = guild.members.cache.get(target.id);
        const created = `<t:${Math.floor(target.createdTimestamp / 1000)}:F>`;
        const joined = member?.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : '`External`';

        const roles = member?.roles.cache
            .filter(r => r.id !== guild.id)
            .sort((a, b) => b.position - a.position)
            .map(r => r.toString()) || [];

        const roleDisplay = roles.length > 0 
            ? roles.slice(0, 5).join(', ') + (roles.length > 5 ? ` and ${roles.length - 5} more...` : '')
            : 'None';

        return new EmbedBuilder()
            .setColor('#ffcad4')
            .setAuthor({ name: `ANGELA | ${t.scan}`, iconURL: requester.displayAvatarURL() })
            .setTitle(`${b.starfish} ${target.username}`)
            .setThumbnail(target.displayAvatarURL({ forceStatic: false, size: 512 }))
            .setDescription(
                `### ${b.cupcake} Registry Details\n` +
                `* ${b.moon} **${t.id}:** \`${target.id}\`\n` +
                `* ${b.moon} **${t.bot}:** \`No\`\n\n` + // Always 'No' because of the filter
                `**${t.date}:**\n` +
                `* ${b.moon} **${t.create}:** ${created}\n` +
                `* ${b.moon} **${t.join}:** ${joined}`
            )
            .addFields({ name: `${b.atom} ${t.roles} [${roles.length}]`, value: roleDisplay, inline: false })
            .setFooter({ text: `Protocol: ${lang.toUpperCase()} • ${t.req} ${requester.tag}` })
            .setTimestamp();
    },

    buildAvatarEmbed(target, requester, t) {
        return new EmbedBuilder()
            .setColor('#ffcad4')
            .setAuthor({ name: `ANGELA | AVATAR FETCH`, iconURL: requester.displayAvatarURL() })
            .setTitle(`${b.moon} Source: ${target.username}`)
            .setImage(target.displayAvatarURL({ forceStatic: false, size: 1024 }))
            .setFooter({ text: `${t.req} ${requester.tag}` })
            .setTimestamp();
    },

    updateStats() {
        try {
            const dir = path.dirname(statsPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            let data = { total: 0 };
            if (fs.existsSync(statsPath)) {
                const content = fs.readFileSync(statsPath, 'utf8');
                if (content.trim()) data = JSON.parse(content);
            }
            data.total = (data.total || 0) + 1;
            fs.writeFileSync(statsPath, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error("Stats Update Error:", e.message);
        }
    }
};