import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import React, { useMemo, useState, useCallback } from 'react'

const SIZE = 4 // 4x4x4
const CELL = 1
const HALF = (SIZE - 1) * 0.5 * CELL

function useBoard() {
  const [turn, setTurn] = useState(0) // 0 = red, 1 = yellow
  const [board, setBoard] = useState(() =>
    Array.from({ length: SIZE }, () =>
      Array.from({ length: SIZE }, () => Array(SIZE).fill(-1))
    )
  )

  const drop = useCallback((x, y) => {
    // find lowest empty z
    for (let z = 0; z < SIZE; z++) {
      if (board[x][y][z] === -1) {
        const next = board.map(layer => layer.map(col => col.slice()))
        next[x][y][z] = turn
        setBoard(next)
        setTurn(t => 1 - t)
        return true
      }
    }
    return false
  }, [board, turn])

  return { board, turn, drop }
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

function Column({ x, y, onDrop }) {
  // tall, thin, invisible hitbox over the column
  return (
    <mesh
      position={[x * CELL - HALF, SIZE * 0.5, y * CELL - HALF]}
      onClick={() => onDrop(x, y)}
    >
      <boxGeometry args={[0.9, SIZE + 0.01, 0.9]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}

function Board() {
  const { board, turn, drop } = useBoard()
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
        <Column key={`col-${x}-${y}`} x={x} y={y} onDrop={drop} />
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
  return (
    <Canvas shadows camera={{ fov: 60 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <Grid args={[SIZE + 2, SIZE + 2]} cellSize={1} sectionSize={SIZE} infiniteGrid={false} position={[0, -0.1, 0]} />
      <OrbitControls enablePan={false} enableDamping target={[0, 0.5, 0]} />
      <Scene />
      <Board />
    </Canvas>
  )
}
