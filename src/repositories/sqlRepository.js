const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./notifications.db");

// Function to initialize the table with all classes for the day
const initializeClasses = (todayClasses) => {
  for (const [time, classInfo] of Object.entries(todayClasses)) {
    const classIdentifier = `${classInfo.module}-${time}`;
    db.run(
      "INSERT OR IGNORE INTO notifiedClasses (classIdentifier, notifiedAt30, notifiedAt15) VALUES (?, 0, 0)",
      [classIdentifier]
    );
  }
};

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS notifiedClasses (classIdentifier TEXT PRIMARY KEY, notifiedAt30 INTEGER, notifiedAt15 INTEGER)"
  );
});

const clearDatabase = () => {
  db.run("DELETE FROM notifiedClasses", [], (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Cleared the database.");
  });
};

module.exports = {
  clearDatabase,
  initializeClasses,
  db,
};
