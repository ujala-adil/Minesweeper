import React, { useEffect, useState } from "react";
import "./styles.css";

const DEFAULT_SIZE = 10;
const DEFAULT_MINES = 10;

const createEmptyGrid = (rows, cols) => {
  return Array(rows)
    .fill()
    .map(() =>
      Array(cols).fill({
        mine: false,
        revealed: false,
        flagged: false,
        adjacent: 0,
      })
    );
};

const placeMines = (grid, rows, cols, mineCount) => {
  let newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
  let minesPlaced = 0;
  while (minesPlaced < mineCount) {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * cols);
    if (!newGrid[r][c].mine) {
      newGrid[r][c].mine = true;
      minesPlaced++;
    }
  }
  return calculateAdjacency(newGrid, rows, cols);
};

const calculateAdjacency = (grid, rows, cols) => {
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1],
  ];
  return grid.map((row, rIdx) =>
    row.map((cell, cIdx) => {
      if (cell.mine) return cell;
      let count = 0;
      directions.forEach(([dx, dy]) => {
        const nr = rIdx + dx;
        const nc = cIdx + dy;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].mine) {
          count++;
        }
      });
      return { ...cell, adjacent: count };
    })
  );
};

const Minesweeper = () => {
  const [rows, setRows] = useState(DEFAULT_SIZE);
  const [cols, setCols] = useState(DEFAULT_SIZE);
  const [mineCount, setMineCount] = useState(DEFAULT_MINES);
  const [grid, setGrid] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [selectedCell, setSelectedCell] = useState([0, 0]);

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
    if (gameStarted && !gameOver && !gameWon) {
      const revealedCells = grid.flat().filter((cell) => cell.revealed).length;
      const total = rows * cols - mineCount;
      if (revealedCells === total) {
        setGameWon(true);
        setStartTime(false);
      }
    }
  }, [grid]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted || gameOver || gameWon) return;
      const [r, c] = selectedCell;
      if (e.key === "ArrowUp") setSelectedCell([Math.max(0, r - 1), c]);
      if (e.key === "ArrowDown") setSelectedCell([Math.min(rows - 1, r + 1), c]);
      if (e.key === "ArrowLeft") setSelectedCell([r, Math.max(0, c - 1)]);
      if (e.key === "ArrowRight") setSelectedCell([r, Math.min(cols - 1, c + 1)]);
      if (e.key === " ") revealCell(r, c);
      if (e.key.toLowerCase() === "f") toggleFlag(r, c);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, grid, gameStarted]);

  const revealCell = (r, c) => {
    if (grid[r][c].flagged || grid[r][c].revealed) return;
    if (!startTime) setStartTime(true);
    let newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    if (newGrid[r][c].mine) {
      newGrid = newGrid.map((row) =>
        row.map((cell) => (cell.mine ? { ...cell, revealed: true } : cell))
      );
      setGrid(newGrid);
      setGameOver(true);
      setStartTime(false);
      return;
    }
    revealEmptyCells(r, c, newGrid);
    setGrid(newGrid);
  };

  const revealEmptyCells = (r, c, newGrid) => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];
    const stack = [[r, c]];
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      if (
        x < 0 || y < 0 || x >= rows || y >= cols ||
        newGrid[x][y].revealed || newGrid[x][y].flagged
      ) continue;

      newGrid[x][y].revealed = true;
      if (newGrid[x][y].adjacent === 0) {
        directions.forEach(([dx, dy]) => stack.push([x + dx, y + dy]));
      }
    }
  };

  const toggleFlag = (r, c) => {
    const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    if (!newGrid[r][c].revealed) {
      newGrid[r][c].flagged = !newGrid[r][c].flagged;
      setGrid(newGrid);
    }
  };

  const handleFlag = (e, r, c) => {
    e.preventDefault();
    toggleFlag(r, c);
  };

  const startGame = () => {
    const freshGrid = createEmptyGrid(rows, cols);
    const minedGrid = placeMines(freshGrid, rows, cols, mineCount);
    setGrid(minedGrid);
    setGameStarted(true);
    setGameOver(false);
    setGameWon(false);
    setTime(0);
    setStartTime(false);
    setSelectedCell([0, 0]);
  };

  const restartGame = () => {
    setGameStarted(false);
  };

  const flaggedCount = grid.flat().filter((cell) => cell.flagged).length;

  return (
    <div>
      <h1>Minesweeper</h1>

      {!gameStarted && (
        <div className="menu">
          <input
            type="text"
            placeholder="Enter player name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />

          <div className="menu-row">
            <div className="input-row">
              <span>Rows:</span>
              <input type="number" min="5" max="20" value={rows} onChange={(e) => setRows(Number(e.target.value))} />
            </div>
            <div className="input-row">
              <span>Columns:</span>
              <input type="number" min="5" max="20" value={cols} onChange={(e) => setCols(Number(e.target.value))} />
            </div>
            <div className="input-row">
              <span>Mines:</span>
              <input type="number" min="5" max={rows * cols - 1} value={mineCount} onChange={(e) => setMineCount(Number(e.target.value))} />
            </div>
          </div>

          <button onClick={startGame}>Start Game</button>
        </div>
      )}

      {gameStarted && (
        <>
          <div className="info">
            <span>Player: {playerName}</span>
            <span>Time: {time}s</span>
            <span>Flags Used: {flaggedCount}/{mineCount}</span>
            <button className="restart-button" onClick={restartGame} style={{ marginLeft: '20px' }}>
              Restart Game
            </button>
          </div>

          {!gameOver && !gameWon && (
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${cols}, 30px)` }}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`cell ${cell.revealed ? "revealed" : ""} ${cell.flagged ? "flagged" : ""} ${selectedCell[0] === r && selectedCell[1] === c ? "selected" : ""}`}
                    onClick={() => revealCell(r, c)}
                    onContextMenu={(e) => handleFlag(e, r, c)}
                  >
                    {cell.revealed
                      ? cell.mine
                        ? "💣"
                        : cell.adjacent || ""
                      : cell.flagged
                        ? "🚩"
                        : ""}
                  </div>
                ))
              )}
            </div>
          )}

          {(gameOver || gameWon) && (
            <div className="end-message">
              <p className="end-text">{gameWon ? "You Win!" : "Game Over!"}</p>
              <p>Player: {playerName}</p>
              <p>Time: {time}s</p>
              <p>Flags Used: {flaggedCount}</p>
              <button className="restart-button" onClick={restartGame}>
                Restart Game
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Minesweeper;
