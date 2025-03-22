# 🧨 Minesweeper Game – Modern UI Course Project
A modern user interface-focused minesweeper game in React.

## 📋 Description
This project is a web-based version of the Minesweeper game. The goal is to reveal all safe cells without clicking on a mine.

The game includes classic Minesweeper features like:
- Flagging suspected mines
- Auto-revealing adjacent empty cells (flood fill)
- A timer to track gameplay duration
- A mine counter based on flags placed
- A restart option
- Clean UI feedback for game over and win conditions

## 🛠️ Technologies Used
- ⚛️ React – UI library for building interactive user interfaces
- 🎨 CSS – Styling the grid and UI components
- 📜 JavaScript (ES6) – Game logic and state management

## 🎮 Features
- 10x10 grid with 10 randomly placed mines
- Left-click to reveal a cell
- Right-click to place/remove a flag (🚩)
- Recursive reveal of empty areas (flood fill)
- Reveals all mines on game over (💥)
- Game win detection and message (🎉)
- Timer and remaining mines counter
- Clean and intuitive UI
- Restart button to play again

## How to run locally
1. Clone the project or download the ZIP
2. Open the command prompt in the project folder and run:
    _npm install     # in case of missing dependencies (node modules) otherwise skip this step
    npm start        # or npm run dev if using Vite_

3. Open your browser at http://localhost:3000/ to play
