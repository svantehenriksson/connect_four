import React, { useState } from 'react'
import RoomManager from './components/RoomManager'
import GameRoom from './components/GameRoom'

export default function App() {
  const [gameState, setGameState] = useState({
    inRoom: false,
    roomId: null,
    roomCode: null,
    playerId: null,
    playerRole: null
  })

  const handleJoinRoom = (roomId, roomCode, playerId, playerRole) => {
    setGameState({
      inRoom: true,
      roomId,
      roomCode,
      playerId,
      playerRole
    })
  }

  const handleLeaveRoom = () => {
    setGameState({
      inRoom: false,
      roomId: null,
      roomCode: null,
      playerId: null,
      playerRole: null
    })
  }

  if (!gameState.inRoom) {
    return <RoomManager onJoinRoom={handleJoinRoom} />
  }

  return (
    <GameRoom
      roomId={gameState.roomId}
      roomCode={gameState.roomCode}
      playerId={gameState.playerId}
      playerRole={gameState.playerRole}
      onLeaveRoom={handleLeaveRoom}
    />
  )
}
