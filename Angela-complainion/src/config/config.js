const path = require("node:path");

module.exports = {
    bot: {
        owner:   "aritilia",
        prefix:  "Angela^",
        dataDir: path.join(__dirname, "../../src/database/json"),
    },

    emojis: {
        success: "✔",
        error:   "✖",
        info:    "ℹ",
        warn:    "⚠",
        system:  "✧",
        sparkle: "✨",
        ribbon:  "ೀ",
        heart:   "౨ৎ",
    },

    colors: {
        pink:   "#FF69B4",
        purple: "#8A2BE2",
        cyan:   "#00FFFF",
        red:    "#FF4757",
        orange: "#FFA502",
        green:  "#2ED573",
        blue:   "#747DFF",
    },
};
