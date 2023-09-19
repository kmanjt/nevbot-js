# COMSCI3 Discord Bot

## Overview

NevBot-JS is designed to help manage timetables and task reminders for DCU Computer Science Level 3 students. The bot provides daily and weekly timetables, allows users to add and view task reminders, and even mark tasks as complete.

## Features

- **Daily Timetable**: Displays today's classes with details like time, duration, and location.
- **Weekly Timetable**: Provides an overview of the week's classes.
- **Task Reminders**: Allows users to add, view, and complete tasks with due dates.

## Commands

- `/timetable daily`: Shows today's timetable.
- `/timetable weekly`: Shows this week's timetable.
- `/reminders add`: Adds a new task reminder.
- `/reminders get`: Retrieves all task reminders for the user.
- `/reminders complete`: Marks a task as complete.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/kmanjt/nevbot-js
   ```

2. Navigate to the project directory:

   ```bash
   cd nevbot-js
   ```

3. Install dependencies:

   ```bash
   npm install -g nodemon
   npm install
   ```

4. Create a `.env` file and add your Discord bot token:

   ```env
   DISCORD_BOT_TOKEN=your_token_here
   ```

5. Run the bot:

   ```bash
   nodemon
   ```
