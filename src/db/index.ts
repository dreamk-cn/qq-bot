import Database from 'better-sqlite3';

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS message (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  groupId INTEGER,
  message TEXT,
  time TEXT
)`;

export class HistoryMessage {
  static instance: HistoryMessage | null = null;
  
  db: Database.Database;

  static getInstance(): HistoryMessage {
    if (!HistoryMessage.instance) {
      HistoryMessage.instance = new HistoryMessage();
    }
    return HistoryMessage.instance;
  }

  constructor() {
    this.db = new Database('./src/db/message.db');
    this.db.exec(CREATE_TABLE);
  }

  add(userId: number, message: string, time: string, groupId?: number) {
    this.db.prepare('INSERT INTO message (userId, groupId, message, time) VALUES (?, ?, ?, ?)').run(userId, groupId, message, time);
  }

  get(userId: number, groupId: number, limit: number) {
    return this.db.prepare('SELECT * FROM message WHERE userId = ? AND groupId = ? ORDER BY time DESC LIMIT ?').all(userId, groupId, limit);
  }
}
