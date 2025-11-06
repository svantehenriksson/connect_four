import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import './GameRoom.css'

const SIZE = 4 // 4x4x4
const CELL = 1
const HALF = (SIZE - 1) * 0.5 * CELL

function useMultiplayerBoard(roomId, playerId, playerRole) {
  const [turn, setTurn] = useState(0) // 0 = red (host), 1 = yellow (guest)
  const [board, setBoard] = useState(() =>
    Array.from({ length: SIZE }, () =>
      Array.from({ length: SIZE }, () => Array(SIZE).fill(-1))
    )
  )
  const [status, setStatus] = useState('waiting')
  const [winner, setWinner] = useState(null)

  // My turn number: host = 0, guest = 1
  const myTurnNumber = playerRole === 'host' ? 0 : 1

  // Subscribe to room updates
  useEffect(() => {
    if (!roomId) return

    // Fetch initial state
    const fetchRoomState = async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (!error && data) {
        setBoard(data.board)
        setTurn(data.current_turn)
        setStatus(data.status)
        setWinner(data.winner)
      }
    }

    fetchRoomState()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`
        },
        (payload) => {
          const newData = payload.new
          setBoard(newData.board)
          setTurn(newData.current_turn)
          setStatus(newData.status)
          setWinner(newData.winner)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  const drop = useCallback(async (x, y) => {
    // Check if it's my turn
    if (turn !== myTurnNumber) {
      console.log('Not your turn!')
      return false
    }

    if (status !== 'playing') {
      console.log('Game is not in playing state')
      return false
    }

    // Find lowest empty z
    for (let z = 0; z < SIZE; z++) {
      if (board[x][y][z] === -1) {
        const next = board.map(layer => layer.map(col => col.slice()))
        next[x][y][z] = turn

        // Update in Supabase
        try {
          const { error } = await supabase
            .from('rooms')
            .update({
              board: next,
              current_turn: 1 - turn,
              updated_at: new Date().toISOString()
            })
            .eq('id', roomId)

          if (error) throw error

          return true
        } catch (err) {
          console.error('Error updating board:', err)
          return false
        }
      }
    }
    return false
  }, [board, turn, roomId, myTurnNumber, status])

  return { board, turn, drop, status, winner, myTurnNumber }
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
  const [hover, setHover] = useState(false)
  
  return (
    <mesh
      position={[x * CELL - HALF, SIZE * 0.5, y * CELL - HALF]}
      onClick={() => onDrop(x, y)}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <boxGeometry args={[0.9, SIZE + 0.01, 0.9]} />
      <meshBasicMaterial 
        transparent 
        opacity={hover ? 0.1 : 0} 
        color={hover ? '#4CAF50' : '#000'}
      />
    </mesh>
  )
}

function Board({ roomId, playerId, playerRole }) {
  const { board, turn, drop, status, winner, myTurnNumber } = useMultiplayerBoard(roomId, playerId, playerRole)
  const columns = useMemo(() => {
    const arr = []
    for (let x = 0; x < SIZE; x++) {
      for (let y = 0; y < SIZE; y++) arr.push([x, y])
    }
    return arr
  }, [])

  const isMyTurn = turn === myTurnNumber && status === 'playing'

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

      {/* Hoverable/clickable columns - only if it's my turn */}
      {isMyTurn && columns.map(([x, y]) => (
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
  const { camera } = useThree()
  camera.position.set(6, 6, 10)
  camera.lookAt(0, 0, 0)
  return null
}

export default function GameRoom({ roomId, roomCode, playerId, playerRole, onLeaveRoom }) {
  const [roomData, setRoomData] = useState(null)

  useEffect(() => {
    if (!roomId) return

    const fetchRoomData = async () => {
      const { data } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (data) setRoomData(data)
    }

    fetchRoomData()

    const channel = supabase
      .channel(`room-info:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`
        },
        (payload) => {
          setRoomData(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  const handleLeaveRoom = async () => {
    // Optionally update room status or delete if host leaves
    if (playerRole === 'host') {
      await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)
    }
    onLeaveRoom()
  }

  const getStatusText = () => {
    if (!roomData) return 'Loading...'
    
    if (roomData.status === 'waiting') {
      return 'Waiting for opponent...'
    }
    
    if (roomData.status === 'playing') {
      const currentPlayer = roomData.current_turn === 0 ? 'Red (Host)' : 'Yellow (Guest)'
      const isMyTurn = (playerRole === 'host' && roomData.current_turn === 0) ||
                       (playerRole === 'guest' && roomData.current_turn === 1)
      
      if (isMyTurn) {
        return "Your turn!"
      } else {
        return `${currentPlayer}'s turn`
      }
    }
    
    if (roomData.status === 'finished') {
      return `Game Over! Winner: ${roomData.winner}`
    }
    
    return ''
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div className="game-hud">
        <div className="game-info">
          <div className="info-item">
            <span className="label">Room Code:</span>
            <span className="value code">{roomCode}</span>
          </div>
          <div className="info-item">
            <span className="label">You are:</span>
            <span className="value" style={{ color: playerRole === 'host' ? '#dc143c' : '#ffd700' }}>
              {playerRole === 'host' ? 'Red (Host)' : 'Yellow (Guest)'}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Status:</span>
            <span className="value">{getStatusText()}</span>
          </div>
        </div>
        <button className="leave-button" onClick={handleLeaveRoom}>
          Leave Game
        </button>
      </div>

      <Canvas shadows camera={{ fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <Grid args={[SIZE + 2, SIZE + 2]} cellSize={1} sectionSize={SIZE} infiniteGrid={false} position={[0, -0.1, 0]} />
        <OrbitControls enablePan={false} enableDamping target={[0, 0.5, 0]} />
        <Scene />
        <Board roomId={roomId} playerId={playerId} playerRole={playerRole} />
      </Canvas>
    </div>
  )
}

