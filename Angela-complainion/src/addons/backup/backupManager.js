const fs   = require("fs");
const path = require("path");

const JSON_DIR    = path.join(process.cwd(), "src", "database", "json");
const BACKUP_ROOT = path.join(process.cwd(), "src", "database", "backups");

const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_BACKUPS = 7;                     // keep last 7 days

function dateStamp() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function runBackup() {
    const stamp  = dateStamp();
    const dest   = path.join(BACKUP_ROOT, stamp);

    fs.mkdirSync(dest, { recursive: true });

    const files = fs.readdirSync(JSON_DIR).filter(f => f.endsWith(".json"));
    let count = 0;

    for (const file of files) {
        try {
            fs.copyFileSync(path.join(JSON_DIR, file), path.join(dest, file));
            count++;
        } catch {}
    }

    // Prune old backups beyond MAX_BACKUPS days
    try {
        const existing = fs.readdirSync(BACKUP_ROOT)
            .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
            .sort();
        while (existing.length > MAX_BACKUPS) {
            const old = existing.shift();
            fs.rmSync(path.join(BACKUP_ROOT, old), { recursive: true, force: true });
        }
    } catch {}

    return { stamp, count, dest };
}

function startBackupScheduler() {
    // Run once on startup
    try {
        const result = runBackup();
        console.log(`[Backup] ✔ ${result.count} files backed up → backups/${result.stamp}`);
    } catch (err) {
        console.error("[Backup] Startup backup failed:", err.message);
    }

    // Then daily
    setInterval(() => {
        try {
            const result = runBackup();
            console.log(`[Backup] ✔ ${result.count} files backed up → backups/${result.stamp}`);
        } catch (err) {
            console.error("[Backup] Daily backup failed:", err.message);
        }
    }, INTERVAL_MS);
}

module.exports = { runBackup, startBackupScheduler };
