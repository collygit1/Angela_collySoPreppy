require("dotenv").config();

const { ClusterManager } = require("discord-hybrid-sharding");
const chalk = require("chalk");

const THEME = {
    primary:   chalk.hex("#FF69B4"),
    secondary: chalk.hex("#8A2BE2"),
    accent:    chalk.hex("#E6E6FA"),
    success:   chalk.hex("#7FFF00"),
    warn:      chalk.hex("#FFA500"),
    error:     chalk.hex("#FF0000"),
};

const manager = new ClusterManager(`${__dirname}/index.js`, {
    totalShards:      "auto",
    shardsPerClusters: 2,
    mode:             "process",
    token:            process.env.TOKEN,
    restarts: {
        max:      10,
        interval: 600_000,
    },
});

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function printHeader() {
    process.stdout.write("\x1Bc");
    console.log(THEME.secondary("\n    𐔌  ᛝ  ໒ྀི  ℘  𓎢𓎟𓎡  𓇯  𓉸  ☾"));
    console.log(THEME.primary.bold("    ANGELA CLUSTER MANAGER v2.0"));
    console.log(THEME.primary("    " + "━".repeat(40)));

    const rows = [
        { key: "STATUS ", val: "Initializing Clusters" },
        { key: "VERSION", val: "AngelaOS v2.6"         },
        { key: "MODE   ", val: "Hybrid Sharding Active" },
    ];
    rows.forEach(r =>
        console.log(`    ${THEME.accent("୨୧")} ${THEME.primary(r.key)} ${THEME.accent("︰")} ${chalk.white(r.val)}`)
    );

    console.log(THEME.primary("    " + "━".repeat(40) + "\n"));
}

manager.on("clusterCreate", cluster => {
    console.log(
        `    ${THEME.secondary("☾")} ` +
        chalk.white("Cluster [") +
        THEME.primary(`${cluster.id}`) +
        chalk.white("] ") +
        THEME.accent("ೀ Link Established.")
    );
});

async function spawnSystem() {
    await printHeader();

    try {
        process.stdout.write(`    ${THEME.secondary("[!]")} ${chalk.gray("Spreading the magic... ")}`);

        for (const frame of ["♡", "🎀", "✧", "💀"]) {
            process.stdout.write(THEME.primary(frame + " "));
            await wait(500);
        }

        console.log("\n");
        await manager.spawn({ timeout: -1 });
        console.log(`\n    ${THEME.primary("౨ৎ")} ${chalk.white("All clusters are online.")} ${THEME.secondary("౨ৎ")}`);

    } catch (err) {
        console.log(`\n    ${THEME.error("──── CRITICAL ERROR ────")}`);
        console.log(`    ${THEME.error("Error ︰")} ${chalk.white(err.message)}`);

        if (err.message.includes("429")) {
            console.log(`    ${THEME.warn("[!] Rate limited — retrying in 30s...")}`);
            await wait(30_000);
            return spawnSystem();
        }

        console.log(`    ${THEME.error("─────────────────────────────")}\n`);
    }
}

process.on("unhandledRejection", err => {
    console.log(`\n    ${THEME.error("[!] Unhandled Rejection:")} ${err.message}`);
});

spawnSystem();
