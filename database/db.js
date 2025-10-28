const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'bot.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS mutes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guildId TEXT NOT NULL,
      userId TEXT NOT NULL,
      mutedAt INTEGER NOT NULL,
      unmuteAt INTEGER NOT NULL,
      reason TEXT,
      mutedBy TEXT NOT NULL,
      UNIQUE(guildId, userId)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS logs_channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guildId TEXT UNIQUE NOT NULL,
      channelId TEXT NOT NULL
    )
  `);
});

module.exports = db;
