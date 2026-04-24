
import * as React from 'react'
import * as ReactBootstrap from 'react-bootstrap'
import { useState } from 'react'

function Square({ value, onSquareClick, selected }) {
  return (
    <button type="button" className={selected ? "square selected" : "square"} onClick={onSquareClick}>
      {value}
    </button>
  )
}

function Board({ xIsNext, squares, selectedSquare, onSelect, onPlay }) {
  const winner = calculateWinner(squares)
  const currentPlayer = xIsNext ? 'X' : 'O'

  function handleClick(index) {
  if (winner) return

  if (isPlacementPhase(squares)) {
    if (squares[index]) return

    const updatedSquares = [...squares]
    updatedSquares[index] = currentPlayer
    onPlay(updatedSquares)
    return
  }

  //movement phase
  if (selectedSquare === null) {
    if (squares[index] === currentPlayer) {
      onSelect(index)
    }
    return
  }

  const from = selectedSquare
  const to = index
  onSelect(null)

  if (squares[to] !== null) return
  if (!isAdjacent(from, to)) return
  if (violatesCenterRule(squares, currentPlayer, from, to)) return

  const updatedSquares = [...squares]
  updatedSquares[from] = null
  updatedSquares[to] = currentPlayer

  onPlay(updatedSquares)
  }

  const status = winner ? `Winner: ${winner}`: `Next player: ${currentPlayer}`

  const renderSquare = (index) => (
  <Square
    value={squares[index]}
    selected={selectedSquare === index}
    onSquareClick={() => handleClick(index)}
  />
  )

  return (
    <>
      <div className="status">{status}</div>

      <div className="board-row">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>

      <div className="board-row">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>

      <div className="board-row">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </>
  )
}

export default function App() {
  const [history, setHistory] = useState([Array(9).fill(null)])
  const [currentMove, setCurrentMove] = useState(0)
  const [selectedSquare, setSelectedSquare] = useState(null)

  const currentSquares = history[currentMove]
  const xIsNext = currentMove % 2 === 0

  function handlePlay(nextSquares) {
    const nextHistory = history.slice(0, currentMove + 1)
    nextHistory.push(nextSquares)

    setHistory(nextHistory)
    setCurrentMove(nextHistory.length - 1)
  }

  function jumpTo(moveNumber) {
    setCurrentMove(moveNumber)
  }

  const moves = history.map((_, moveNumber) => {
    const label = moveNumber === 0 ? 'Go to game start' : `Go to move #${moveNumber}`

    return (
      <li key={moveNumber}>
        <button type="button" onClick={() => jumpTo(moveNumber)}>
          {label}
        </button>
      </li>
    )
  })

  return (
    <main className="game">
      <section className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} selectedSquare={selectedSquare} onSelect={setSelectedSquare} onPlay={handlePlay} />
      </section>
      <aside className="game-info">
        <ol>{moves}</ol>
      </aside>
    </main>
  )
}

function calculateWinner(squares) {
  const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (const line of winningLines) {
    const [first, second, third] = line

    if (
      squares[first] && squares[first] === squares[second] && squares[first] === squares[third]
    ) {
      return squares[first]
    }
  }

  return null
}

function isPlacementPhase(squares) {
  return squares.filter(Boolean).length < 6
}

function isAdjacent(from, to) {
  const r1 = Math.floor(from / 3)
  const c1 = from % 3
  const r2 = Math.floor(to / 3)
  const c2 = to % 3

  return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1 && from !== to
}

function violatesCenterRule(squares, player, from, to) {
  const center = 4

  if (squares[center] !== player) return false

  const test = [...squares]
  test[from] = null
  test[to] = player

  const wins = calculateWinner(test) === player
  const movedCenter = from === center

  return !wins && !movedCenter
}