import Database from 'better-sqlite3';

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS message (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  groupId INTEGER,
  message TEXT,
  token INTEGER,
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
    this.db = new Database('./src/plugin/ai/message.db');
    this.db.exec(CREATE_TABLE);
  }

  add(userId: number, message: string, time: string, token: number, groupId?: number) {
    this.db.prepare('INSERT INTO message (userId, groupId, message, token, time) VALUES (?, ?, ?, ?, ?)').run(userId, groupId, message, token, time);
  }

  addList(data: { userId: number, message: string, time: string, token: number, groupId?: number }[]) {
    data.forEach((item) => {
      this.add(item.userId, item.message, item.time, item.token, item.groupId);
    });
  }

  get(userId: number, groupId: number, limit: number) {
    return this.db.prepare('SELECT * FROM message WHERE userId = ? AND groupId = ? ORDER BY time DESC LIMIT ?').all(userId, groupId, limit);
  }
}
