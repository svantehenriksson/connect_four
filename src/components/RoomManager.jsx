import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import './RoomManager.css'

export default function RoomManager({ onJoinRoom }) {
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const createRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name')
      return
    }

    setLoading(true)
    setError('')

    try {
      const newRoomCode = generateRoomCode()
      const playerId = `${playerName}-${Date.now()}`
      
      // Initialize empty 4x4x4 board
      const emptyBoard = Array.from({ length: 4 }, () =>
        Array.from({ length: 4 }, () => Array(4).fill(-1))
      )

      const { data, error } = await supabase
        .from('rooms')
        .insert({
          room_code: newRoomCode,
          host_player_id: playerId,
          board: emptyBoard,
          current_turn: 0,
          status: 'waiting'
        })
        .select()
        .single()

      if (error) throw error

      onJoinRoom(data.id, newRoomCode, playerId, 'host')
    } catch (err) {
      console.error('Error creating room:', err)
      setError('Failed to create room. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const joinRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name')
      return
    }
    if (!roomCode.trim()) {
      setError('Please enter a room code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const playerId = `${playerName}-${Date.now()}`

      // Find the room
      const { data: room, error: fetchError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .single()

      if (fetchError || !room) {
        throw new Error('Room not found')
      }

      if (room.status !== 'waiting') {
        throw new Error('Room is not available')
      }

      if (room.guest_player_id) {
        throw new Error('Room is full')
      }

      // Join the room
      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          guest_player_id: playerId,
          status: 'playing'
        })
        .eq('id', room.id)

      if (updateError) throw updateError

      onJoinRoom(room.id, roomCode.toUpperCase(), playerId, 'guest')
    } catch (err) {
      console.error('Error joining room:', err)
      setError(err.message || 'Failed to join room. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="room-manager">
      <div className="room-manager-container">
        <h1>Connect Four 3D</h1>
        <p className="subtitle">4x4x4 Multiplayer Game</p>

        <div className="input-group">
          <label>Your Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="button-group">
          <button
            className="create-button"
            onClick={createRoom}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </div>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="input-group">
          <label>Room Code</label>
          <input
            type="text"
            placeholder="Enter room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            disabled={loading}
            maxLength={6}
          />
        </div>

        <div className="button-group">
          <button
            className="join-button"
            onClick={joinRoom}
            disabled={loading}
          >
            {loading ? 'Joining...' : 'Join Room'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  )
}

