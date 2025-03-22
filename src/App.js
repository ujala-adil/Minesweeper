
import React, { useState, useEffect } from "react";
import "./styles.css";

const GRID_SIZE = 10;
const MINE_COUNT = 10;

const generateGrid = () => {
  let grid = Array(GRID_SIZE)
    .fill()
    .map(() => Array(GRID_SIZE).fill({ mine: false, revealed: false, flagged: false, adjacent: 0 }));

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
    [1, -1], [1, 0], [1, 1]
  ];
  
  return grid.map((row, rIdx) =>
    row.map((cell, cIdx) => {
      if (cell.mine) return cell;
      
      let count = 0;
      directions.forEach(([dx, dy]) => {
        const nr = rIdx + dx;
        const nc = cIdx + dy;
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && grid[nr][nc].mine) {
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

  useEffect(() => {
    if (!gameOver) {
      const revealedCells = grid.flat().filter(cell => cell.revealed).length;
      const totalCells = GRID_SIZE * GRID_SIZE - MINE_COUNT;
      if (revealedCells === totalCells) {
        setGameWon(true);
        alert("You Win!");
      }
    }
  }, [grid, gameOver]);

  const revealCell = (row, col) => {
    if (grid[row][col].mine) {
      setGameOver(true);
      alert("Game Over!");
      return;
    }
    let newGrid = [...grid];
    newGrid[row][col] = { ...newGrid[row][col], revealed: true };
    setGrid(newGrid);
  };

  const flagCell = (e, row, col) => {
    e.preventDefault();
    let newGrid = [...grid];
    newGrid[row][col] = { ...newGrid[row][col], flagged: !newGrid[row][col].flagged };
    setGrid(newGrid);
  };

  return (
    <div>
      <h1>Minesweeper</h1>
      <p>Right-click to flag a cell. Click to reveal.</p>
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`cell ${cell.revealed ? "revealed" : ""} ${cell.flagged ? "flagged" : ""}`}
                onClick={() => revealCell(rowIndex, colIndex)}
                onContextMenu={(e) => flagCell(e, rowIndex, colIndex)}
              >
                {cell.revealed ? (cell.mine ? "💣" : cell.adjacent || "") : cell.flagged ? "🚩" : ""}
              </div>
            ))}
          </div>
        ))}
      </div>
      {(gameOver || gameWon) && <button onClick={() => { setGrid(generateGrid); setGameOver(false); setGameWon(false); }}>Restart</button>}
    </div>
  );
};

export default Minesweeper;