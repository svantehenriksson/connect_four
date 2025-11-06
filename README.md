# Connect Four 3D - Multiplayer Edition

This is a 3D version of Connect Four (4x4x4 grid) with online multiplayer support using Supabase for real-time turn-based gameplay.

## Features

- 🎮 3D Connect Four game (4x4x4 grid)
- 👥 Real-time multiplayer with room-based gameplay
- 🔄 Turn-based system with live updates
- 🎨 Beautiful 3D graphics using React Three Fiber
- 📱 Responsive UI with modern design

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be set up (this may take a few minutes)
3. Go to **Project Settings** > **API**
4. Copy your **Project URL** and **anon/public key**

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Replace the values with your actual Supabase credentials.

### 4. Set Up Database Tables

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL commands:

```sql
-- Create rooms table
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  host_player_id TEXT NOT NULL,
  guest_player_id TEXT,
  board JSONB DEFAULT '[]',
  current_turn INTEGER DEFAULT 0,
  status TEXT DEFAULT 'waiting',
  winner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_room_code ON rooms(room_code);
CREATE INDEX idx_status ON rooms(status);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON rooms
  FOR SELECT USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access" ON rooms
  FOR INSERT WITH CHECK (true);

-- Allow room players to update
CREATE POLICY "Allow room players to update" ON rooms
  FOR UPDATE USING (true);

-- Allow host to delete
CREATE POLICY "Allow host to delete" ON rooms
  FOR DELETE USING (true);
```

### 5. Enable Real-time

1. Go to **Database** > **Replication**
2. Enable replication for the `rooms` table
3. This allows players to see updates in real-time

### 6. Start the Development Server

```bash
npm run dev
```

## How to Play

### Creating a Room

1. Enter your name
2. Click **Create Room**
3. Share the generated room code with your opponent
4. Wait for them to join

### Joining a Room

1. Enter your name
2. Enter the room code shared with you
3. Click **Join Room**
4. Game starts automatically when both players are in

### Gameplay

- **Red player (Host)** goes first
- **Yellow player (Guest)** goes second
- Click on any column to drop your piece
- The piece will fall to the lowest available position in that column
- Players take turns until the game ends
- Use your mouse to rotate the camera and view the board from different angles

## Game Rules

Connect 4 pieces in a row to win! In this 3D version, you can connect:
- Horizontally (X or Y axis)
- Vertically (Z axis)
- Diagonally (in any plane or through 3D space)

## Technologies Used

- **React** - UI framework
- **React Three Fiber** - 3D rendering
- **Three.js** - 3D graphics library
- **Supabase** - Real-time database and backend
- **Vite** - Build tool

## Project Structure

```
src/
├── App.jsx                      # Main app component with game state
├── components/
│   ├── RoomManager.jsx          # Room creation/joining UI
│   ├── RoomManager.css          # Room manager styles
│   ├── GameRoom.jsx             # 3D game board and multiplayer logic
│   └── GameRoom.css             # Game room styles
├── supabaseClient.js            # Supabase client configuration
└── main.jsx                     # App entry point
```

## Troubleshooting

### "Room not found" error
- Make sure the room code is correct (6 characters)
- Check that the host has created the room successfully

### Real-time updates not working
- Verify that replication is enabled for the `rooms` table in Supabase
- Check that your Supabase URL and keys are correct in `.env.local`

### Connection issues
- Make sure you're connected to the internet
- Check that your Supabase project is active

## License

MIT
