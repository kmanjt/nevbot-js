const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./notifications.db");

db.run("PRAGMA foreign_keys = ON;"); // Enable foreign key constraints

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

  db.run(
    "CREATE TABLE IF NOT EXISTS tasks (taskID INTEGER PRIMARY KEY, task TEXT, dueDate DATETIME, lastNotified DATETIME, completed BOOLEAN, late BOOLEAN)"
  );

  db.run(
    "CREATE TABLE IF NOT EXISTS notifyUsers (userID TEXT PRIMARY KEY, taskID INTEGER, FOREIGN KEY(taskID) REFERENCES tasks(taskID))"
  );
});

/**
 * Fetch tasks associated from the database associated with a user
 *
 *
 */

/**
 * Inserts a new task into the database and associates it with a user.
 *
 * @param {string} task - The description of the task.
 * @param {Date|string} dueDate - The due date of the task. Can be a Date object or a string that can be parsed into a Date.
 * @param {string} userID - The ID of the user to whom the task is assigned.
 */
const insertTask = (task, dueDate, userID) => {
  // Start a database transaction
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    db.run(
      "INSERT INTO tasks (task, dueDate, lastNotified, completed, late) VALUES (?, ?, ?, ?, ?)",
      [task, dueDate, null, false, false],
      function (err) {
        if (err) {
          console.error(err.message);
          return db.run("ROLLBACK");
        }
        console.log(
          `A row has been inserted into tasks with rowid ${this.lastID}`
        );

        db.run(
          "INSERT INTO notifyUsers (userID, taskID) VALUES (?, ?)",
          [userID, this.lastID],
          function (err) {
            if (err) {
              console.error(err.message);
              return db.run("ROLLBACK");
            }
            console.log(
              `A row has been inserted into notifyUsers with rowid ${this.lastID}`
            );
            db.run("COMMIT");
          }
        );
      }
    );
  });
};

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
  insertTask,
  db,
};
