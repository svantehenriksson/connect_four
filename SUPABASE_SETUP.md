# Supabase Setup Instructions

## 1. Create a Supabase Project
1. Go to https://supabase.com
2. Sign up or log in
3. Create a new project
4. Wait for the project to be set up

## 2. Get Your Credentials
1. Go to Project Settings > API
2. Copy your Project URL
3. Copy your anon/public key

## 3. Create Environment Variables
1. Create a `.env` file in the root directory
2. Add your credentials:
```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 4. Set Up Database Tables

Run these SQL commands in the Supabase SQL Editor (Database > SQL Editor):

```sql
-- Create rooms table
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  host_player_id TEXT NOT NULL,
  guest_player_id TEXT,
  board JSONB DEFAULT '[]',
  current_turn INTEGER DEFAULT 0,
  status TEXT DEFAULT 'waiting', -- 'waiting', 'playing', 'finished'
  winner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on room_code for faster lookups
CREATE INDEX idx_room_code ON rooms(room_code);
CREATE INDEX idx_status ON rooms(status);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rooms (for joining)
CREATE POLICY "Allow public read access" ON rooms
  FOR SELECT
  USING (true);

-- Allow anyone to insert rooms (for creating)
CREATE POLICY "Allow public insert access" ON rooms
  FOR INSERT
  WITH CHECK (true);

-- Allow players in the room to update
CREATE POLICY "Allow room players to update" ON rooms
  FOR UPDATE
  USING (true);

-- Allow players to delete their own rooms
CREATE POLICY "Allow host to delete" ON rooms
  FOR DELETE
  USING (true);

-- Enable real-time for the rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
```

## 5. Enable Realtime
1. Go to Database > Replication
2. Ensure "rooms" table is enabled for replication
3. This allows real-time updates between players

## 6. Start the Development Server
```bash
npm run dev
```

