import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import React, { useMemo, useState, useCallback } from 'react'

const SIZE = 4 // 4x4x4
const CELL = 1
const HALF = (SIZE - 1) * 0.5 * CELL

function useBoard() {
  function createEmptyBoard() {
    return Array.from({ length: SIZE }, () =>
      Array.from({ length: SIZE }, () => Array(SIZE).fill(-1))
    )
  }

  const [turn, setTurn] = useState(0) // 0 = red, 1 = yellow
  const [winner, setWinner] = useState(null) // null | 0 | 1
  const [board, setBoard] = useState(createEmptyBoard)

  function hasFourInARow(b, x, y, z, player) {
    const directions = [
      [1, 0, 0], [0, 1, 0], [0, 0, 1],
      [1, 1, 0], [1, -1, 0], [1, 0, 1], [1, 0, -1], [0, 1, 1], [0, 1, -1],
      [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
    ]

    function inBounds(ix, iy, iz) {
      return ix >= 0 && ix < SIZE && iy >= 0 && iy < SIZE && iz >= 0 && iz < SIZE
    }

    for (const [dx, dy, dz] of directions) {
      let count = 1
      for (let step = 1; step < SIZE; step++) {
        const nx = x + dx * step
        const ny = y + dy * step
        const nz = z + dz * step
        if (!inBounds(nx, ny, nz) || b[nx][ny][nz] !== player) break
        count++
      }
      for (let step = 1; step < SIZE; step++) {
        const nx = x - dx * step
        const ny = y - dy * step
        const nz = z - dz * step
        if (!inBounds(nx, ny, nz) || b[nx][ny][nz] !== player) break
        count++
      }
      if (count >= 4) return true
    }
    return false
  }

  const drop = useCallback((x, y) => {
    if (winner !== null) return false
    // find lowest empty z
    for (let z = 0; z < SIZE; z++) {
      if (board[x][y][z] === -1) {
        const player = turn
        const next = board.map(layer => layer.map(col => col.slice()))
        next[x][y][z] = player
        const didWin = hasFourInARow(next, x, y, z, player)
        setBoard(next)
        if (didWin) {
          setWinner(player)
        } else {
          setTurn(t => 1 - t)
        }
        return true
      }
    }
    return false
  }, [board, turn, winner])

  const reset = useCallback(() => {
    setBoard(createEmptyBoard())
    setTurn(0)
    setWinner(null)
  }, [])

  return { board, turn, winner, drop, reset }
}

function Piece({ x, y, z, player }) {
  const color = player === 0 ? 'crimson' : 'gold'
  return (
    <mesh position={[x * CELL - HALF, z * CELL + 0.5, y * CELL - HALF]} castShadow>
      <sphereGeometry args={[0.4, 24, 24]} />
      <meshStandardMaterial color={color} metalness={0.1} roughness={0.6} />
    </mesh>
  )
}

function Column({ x, y, onDrop, disabled }) {
  // tall, thin, invisible hitbox over the column
  return (
    <mesh
      position={[x * CELL - HALF, SIZE * 0.5, y * CELL - HALF]}
      onClick={() => { if (!disabled) onDrop(x, y) }}
    >
      <boxGeometry args={[0.9, SIZE + 0.01, 0.9]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}

function Board({ board, turn, winner, drop }) {
  const columns = useMemo(() => {
    const arr = []
    for (let x = 0; x < SIZE; x++) {
      for (let y = 0; y < SIZE; y++) arr.push([x, y])
    }
    return arr
  }, [])

  return (
    <group>
      {/* Base plate */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[SIZE * CELL + 0.5, 0.2, SIZE * CELL + 0.5]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Vertical posts as a visual lattice */}
      {columns.map(([x, y]) => (
        <mesh key={`post-${x}-${y}`} position={[x * CELL - HALF, SIZE * 0.5, y * CELL - HALF]}>
          <boxGeometry args={[0.05, SIZE, 0.05]} />
          <meshStandardMaterial color="#666" />
        </mesh>
      ))}

      {/* Hoverable/clickable columns */}
      {columns.map(([x, y]) => (
        <Column key={`col-${x}-${y}`} x={x} y={y} onDrop={drop} disabled={winner !== null} />
      ))}

      {/* Pieces */}
      {board.flatMap((layer, x) =>
        layer.flatMap((col, y) =>
          col.map((v, z) => (v !== -1 ? (
            <Piece key={`p-${x}-${y}-${z}`} x={x} y={y} z={z} player={v} />
          ) : null))
        )
      )}

      {/* Turn indicator */}
      <group position={[0, SIZE + 0.6, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.8, 0.2, 1.8]} />
          <meshStandardMaterial color={turn === 0 ? 'crimson' : 'gold'} />
        </mesh>
      </group>
    </group>
  )
}

function Scene() {
  const { size, camera } = useThree()
  camera.position.set(6, 6, 10)
  camera.lookAt(0, 0, 0)
  return null
}

export default function App() {
  const { board, turn, winner, drop, reset } = useBoard()
  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', height: '100vh', background: '#0a0a0a' }}>
      <header style={{
        padding: '12px 16px',
        textAlign: 'center',
        color: '#fff',
        fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
        fontSize: 36,
        fontWeight: 900,
        letterSpacing: 2,
        textShadow: '0 4px 12px rgba(0,0,0,0.7)'
      }}>Connect Four 3D</header>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 0 }}>
        <aside style={{ padding: 16, color: '#fff', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {winner === null ? (
            <div style={{ fontSize: 22, fontWeight: 800 }}>
              {turn === 0 ? '🔴 Red to move' : '🟡 Yellow to move'}
            </div>
          ) : (
            <div style={{ fontSize: 28, fontWeight: 900 }}>
              {winner === 0 ? '🔴 RED WINS!!' : '🟡 YELLOW WINS!!'}
            </div>
          )}
          <button onClick={reset} style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: 'none',
            background: '#333',
            color: '#fff',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            cursor: 'pointer',
            width: 'fit-content'
          }}>Reset</button>
        </aside>
        <div style={{ position: 'relative', minHeight: 0 }}>
          <Canvas shadows camera={{ fov: 60 }} style={{ width: '100%', height: '100%' }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
            <Grid args={[SIZE + 2, SIZE + 2]} cellSize={1} sectionSize={SIZE} infiniteGrid={false} position={[0, -0.1, 0]} />
            <OrbitControls enablePan={false} enableDamping target={[0, 0.5, 0]} />
            <Scene />
            <Board board={board} turn={turn} winner={winner} drop={drop} />
          </Canvas>
        </div>
      </div>
    </div>
  )
}
