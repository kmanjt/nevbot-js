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
    "CREATE TABLE IF NOT EXISTS notifyUsers (userID TEXT, taskID INTEGER, FOREIGN KEY(taskID) REFERENCES tasks(taskID))"
  );
});

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

/**
 * Deletes a specific task from the database for a given user.
 *
 * @param {number} taskID - The ID of the task to be deleted.
 * @param {string} userID - The ID of the user from whom the task will be deleted.
 */
const deleteTask = (taskID, userID) => {
  // Start a database transaction
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    // First, delete the association between the user and the task in the notifyUsers table
    db.run(
      "DELETE FROM notifyUsers WHERE taskID = ? AND userID = ?",
      [taskID, userID],
      function (err) {
        if (err) {
          console.error(err.message);
          return db.run("ROLLBACK");
        }
        console.log(
          `Deleted association for taskID ${taskID} and userID ${userID} from notifyUsers.`
        );

        // Then, delete the task itself from the tasks table
        db.run("DELETE FROM tasks WHERE taskID = ?", [taskID], function (err) {
          if (err) {
            console.error(err.message);
            return db.run("ROLLBACK");
          }
          console.log(`Deleted task with taskID ${taskID} from tasks.`);
          db.run("COMMIT");
        });
      }
    );
  });
};

const getAllTasksForUser = (userID) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT tasks.* 
      FROM tasks 
      JOIN notifyUsers ON tasks.taskID = notifyUsers.taskID 
      WHERE notifyUsers.userID = ?`;

    db.all(query, [userID], (err, rows) => {
      if (err) {
        console.error(err.message);
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

const getAllIncompleteTasks = (callback) => {
  const query = "SELECT * FROM tasks WHERE completed = 0";

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return;
    }
    callback(rows);
  });
};

const markTaskAsComplete = (taskID, userID) => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE tasks SET completed = 1 WHERE taskID = ? AND EXISTS (SELECT 1 FROM notifyUsers WHERE taskID = ? AND userID = ?)",
      [taskID, taskID, userID],
      function (err) {
        if (err) {
          console.error(err.message);
          reject(err);
          return;
        }
        if (this.changes === 0) {
          reject(new Error("No task found to mark as complete"));
          return;
        }
        resolve();
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
  deleteTask,
  getAllTasksForUser,
  getAllIncompleteTasks,
  markTaskAsComplete,
  db,
};
