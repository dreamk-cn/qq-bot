import * as Sqlite3 from 'sqlite3';

let db = new Sqlite3.Database('./message.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS history_message (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- 对话记录的唯一标识符，自增
    group_id TEXT, -- 群聊表示，如果不为空则说明该条消息是用户在群里发送的消息
    user_id TEXT NOT NULL, -- 用户的唯一标识，可以是用户名、邮箱或其他唯一标识符
    create_time INTEGER DEFAULT (strftime('%s', 'now')), -- 对话发生的时间，默认为当前时间
    context TEXT NOT NULL, -- 用于存储对话的上下文或会话状态信息
);`, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('创建表成功');
    }
  });
});