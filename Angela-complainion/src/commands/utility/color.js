const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "color", hex: "Hex", rgb: "RGB", hsl: "HSL", invalid: "Invalid hex color. Use format `#RRGGBB` or `RRGGBB`.", preview: "Color Preview" },
    tl: { title: "color", hex: "Hex", rgb: "RGB", hsl: "HSL", invalid: "Hindi wastong hex color. Gamitin ang format na `#RRGGBB` o `RRGGBB`.", preview: "Preview ng Kulay" },
    ko: { title: "색상", hex: "Hex", rgb: "RGB", hsl: "HSL", invalid: "잘못된 hex 색상입니다. `#RRGGBB` 또는 `RRGGBB` 형식을 사용하세요.", preview: "색상 미리보기" },
    ja: { title: "カラー", hex: "Hex", rgb: "RGB", hsl: "HSL", invalid: "無効なhexカラーです。`#RRGGBB`または`RRGGBB`形式を使用してください。", preview: "カラープレビュー" },
};

function hexToRgb(hex) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function luminance(r, g, b) {
    const toLinear = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function colorName(h, s, l) {
    if (s < 10) return l < 20 ? "Black" : l > 80 ? "White" : "Gray";
    if (h < 15 || h >= 345) return "Red";
    if (h < 45)  return "Orange";
    if (h < 75)  return "Yellow";
    if (h < 150) return "Green";
    if (h < 195) return "Cyan";
    if (h < 255) return "Blue";
    if (h < 285) return "Purple";
    if (h < 345) return "Pink";
    return "Red";
}

async function deliver(ctx, hexInput, isSlash) {
    const lang = ctx.client.languages?.get(ctx.guildId) || "en";
    const t = LOCAL[lang] || LOCAL.en;

    const cleaned = hexInput.replace(/^#/, "").toLowerCase();
    if (!/^[0-9a-f]{6}$/.test(cleaned)) {
        const errMsg = { content: `❌ ${t.invalid}`, ephemeral: true };
        return isSlash ? ctx.reply(errMsg) : ctx.reply(`❌ ${t.invalid}`);
    }

    const hex = `#${cleaned.toUpperCase()}`;
    const { r, g, b } = hexToRgb(cleaned);
    const { h, s, l } = rgbToHsl(r, g, b);
    const lum  = luminance(r, g, b);
    const dark = lum < 0.179;
    const name = colorName(h, s, l);

    const previewUrl = `https://singlecolorimage.com/get/${cleaned}/200x80`;

    const embed = new EmbedBuilder()
        .setColor(hex)
        .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client.user.displayAvatarURL() })
        .setTitle(`🎨 ${name} — ${hex}`)
        .setThumbnail(previewUrl)
        .addFields(
            { name: t.hex, value: `\`${hex}\``, inline: true },
            { name: t.rgb, value: `\`rgb(${r}, ${g}, ${b})\``, inline: true },
            { name: t.hsl, value: `\`hsl(${h}°, ${s}%, ${l}%)\``, inline: true },
            { name: "Brightness", value: dark ? "🌑 Dark" : "☀️ Light", inline: true },
            { name: "Luminance", value: `\`${(lum * 100).toFixed(1)}%\``, inline: true },
        )
        .setTimestamp();

    if (isSlash) await ctx.reply({ embeds: [embed] });
    else await ctx.reply({ embeds: [embed] });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("color")
        .setDescription("✦ View info about any hex color")
        .addStringOption(o => o.setName("hex").setDescription("Hex color code (e.g. #FF69B4)").setRequired(true)),

    async execute(interaction) {
        await deliver(interaction, interaction.options.getString("hex"), true);
    },

    async prefixExecute(message, args) {
        if (!args[0]) return message.reply("❌ Provide a hex color! Example: `color #FF69B4`");
        await deliver(message, args[0], false);
    },
};
