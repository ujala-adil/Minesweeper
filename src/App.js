import React, { useState, useEffect } from "react";
import "./styles.css";

const GRID_SIZE = 10;
const MINE_COUNT = 10;

const generateGrid = () => {
  let grid = Array(GRID_SIZE)
    .fill()
    .map(() =>
      Array(GRID_SIZE).fill({
        mine: false,
        revealed: false,
        flagged: false,
        adjacent: 0,
      })
    );

  let minesPlaced = 0;
  while (minesPlaced < MINE_COUNT) {
    let row = Math.floor(Math.random() * GRID_SIZE);
    let col = Math.floor(Math.random() * GRID_SIZE);
    if (!grid[row][col].mine) {
      grid[row][col] = { ...grid[row][col], mine: true };
      minesPlaced++;
    }
  }

  return calculateAdjacency(grid);
};

const calculateAdjacency = (grid) => {
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],          [0, 1],
    [1, -1], [1, 0], [1, 1],
  ];

  return grid.map((row, rIdx) =>
    row.map((cell, cIdx) => {
      if (cell.mine) return cell;

      let count = 0;
      directions.forEach(([dx, dy]) => {
        const nr = rIdx + dx;
        const nc = cIdx + dy;
        if (
          nr >= 0 &&
          nr < GRID_SIZE &&
          nc >= 0 &&
          nc < GRID_SIZE &&
          grid[nr][nc].mine
        ) {
          count++;
        }
      });

      return { ...cell, adjacent: count };
    })
  );
};

const Minesweeper = () => {
  const [grid, setGrid] = useState(generateGrid);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState(false);

  // Timer
  useEffect(() => {
    let timer;
    if (startTime && !gameOver && !gameWon) {
      timer = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, gameOver, gameWon]);

  // Win check
  useEffect(() => {
    if (!gameOver) {
      const revealedCells = grid.flat().filter((cell) => cell.revealed).length;
      const totalCells = GRID_SIZE * GRID_SIZE - MINE_COUNT;
      if (revealedCells === totalCells) {
        setGameWon(true);
        setStartTime(false);
      }
    }
  }, [grid, gameOver]);

  const revealEmptyCells = (r, c, newGrid) => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],          [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];

    const stack = [[r, c]];

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      if (
        x < 0 ||
        y < 0 ||
        x >= GRID_SIZE ||
        y >= GRID_SIZE ||
        newGrid[x][y].revealed ||
        newGrid[x][y].flagged
      )
        continue;

      newGrid[x][y].revealed = true;

      if (newGrid[x][y].adjacent === 0) {
        directions.forEach(([dx, dy]) => stack.push([x + dx, y + dy]));
      }
    }
  };

  const revealCell = (row, col) => {
    if (gameOver || gameWon) return;

    if (!startTime) setStartTime(true);

    const clickedCell = grid[row][col];
    if (clickedCell.flagged || clickedCell.revealed) return;

    let newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));

    if (clickedCell.mine) {
      // Reveal all mines
      newGrid = newGrid.map((r) =>
        r.map((cell) => (cell.mine ? { ...cell, revealed: true } : cell))
      );
      setGrid(newGrid);
      setGameOver(true);
      setStartTime(false);
      return;
    }

    revealEmptyCells(row, col, newGrid);
    setGrid(newGrid);
  };

  const flagCell = (e, row, col) => {
    e.preventDefault();
    if (gameOver || gameWon) return;

    const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    const cell = newGrid[row][col];
    if (!cell.revealed) cell.flagged = !cell.flagged;
    setGrid(newGrid);
  };

  const restartGame = () => {
    setGrid(generateGrid());
    setGameOver(false);
    setGameWon(false);
    setTime(0);
    setStartTime(false);
  };

  const flaggedCount = grid.flat().filter((cell) => cell.flagged).length;

  return (
    <div>
      <h1>Minesweeper</h1>
      <p>Right-click to flag a cell. Click to reveal.</p>
      <p>⏱️ Time: {time}s | 🚩 Mines Left: {MINE_COUNT - flaggedCount}</p>

      {/* Show grid only if game is not over/won */}
      {!(gameOver || gameWon) && (
        <div className="grid">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={`cell ${cell.revealed ? "revealed" : ""} ${
                    cell.flagged ? "flagged" : ""
                  }`}
                  onClick={() => revealCell(rowIndex, colIndex)}
                  onContextMenu={(e) => flagCell(e, rowIndex, colIndex)}
                >
                  {cell.revealed
                    ? cell.mine
                      ? "💣"
                      : cell.adjacent || ""
                    : cell.flagged
                    ? "🚩"
                    : ""}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Show end message + restart */}
      {(gameOver || gameWon) && (
        <div className="end-message">
          <p className="end-text">
            {gameWon ? "🎉 You Win!" : "💥 Game Over!"}
          </p>
          <button className="restart-button" onClick={restartGame}>
            🔄 Restart Game
          </button>
        </div>
      )}
    </div>
  );
};

export default Minesweeper;
