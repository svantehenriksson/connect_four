# Quick Start Guide - Connect Four 3D Multiplayer

Follow these steps to get your multiplayer Connect Four game running:

## ⚡ Quick Setup (5 minutes)

### 1️⃣ Create Supabase Project (2 min)
- Go to https://supabase.com and sign up/login
- Click "New Project"
- Fill in project details and wait for it to initialize

### 2️⃣ Get Your Credentials (1 min)
- In your Supabase dashboard: **Settings** → **API**
- Copy:
  - **Project URL**
  - **anon/public key**

### 3️⃣ Create Environment File (30 sec)
Create `.env.local` in the root folder:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4️⃣ Set Up Database (1 min)
- In Supabase dashboard: **SQL Editor**
- Paste this SQL and click "Run":

```sql
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

CREATE INDEX idx_room_code ON rooms(room_code);
CREATE INDEX idx_status ON rooms(status);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow room players to update" ON rooms FOR UPDATE USING (true);
CREATE POLICY "Allow host to delete" ON rooms FOR DELETE USING (true);
```

### 5️⃣ Enable Real-time (30 sec)
- In Supabase: **Database** → **Replication**
- Toggle ON for `rooms` table

### 6️⃣ Start Playing! (10 sec)
```bash
npm run dev
```

Open the local URL in your browser!

---

## 🎮 How to Play

### Player 1 (Host):
1. Enter your name
2. Click "Create Room"
3. Share the 6-character room code with Player 2

### Player 2 (Guest):
1. Enter your name
2. Enter the room code
3. Click "Join Room"

### Game On!
- Red (Host) plays first
- Yellow (Guest) plays second  
- Click columns to drop pieces
- Rotate the camera with your mouse to see all angles
- Connect 4 in any direction to win!

---

## 📚 More Information

- **Detailed Setup**: See `README.md`
- **Environment Variables**: See `ENV_SETUP.md`
- **Database Schema**: See `SUPABASE_SETUP.md`

## 🐛 Troubleshooting

**Game not connecting?**
- Check that `.env.local` has correct credentials
- Restart dev server after creating `.env.local`

**Real-time not working?**
- Verify replication is enabled in Supabase Database → Replication

**Room not found?**
- Ensure room code is correct (6 characters)
- Check that host created the room successfully

---

## 🚀 Features

✅ Real-time multiplayer  
✅ Turn-based gameplay  
✅ 3D graphics with camera controls  
✅ Room-based matchmaking  
✅ Beautiful modern UI  
✅ Responsive design

Enjoy your game! 🎉

