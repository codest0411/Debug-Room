# THE DEBUG ROOM ⚡

**The production server is down. You are the only hope.**

THE DEBUG ROOM is a cinematic, immersive escape room experience designed specifically for developers. Navigate through broken codebases, solve real-world programming puzzles, and escape the mainframe before the timer hits zero.

![THE DEBUG ROOM](/public/hero-preview.png)

## 🎮 Features

- **10 Themed Rooms:** From the depths of the *Database Depths* to the heights of *React Shipwreck*.
- **Real Coding Puzzles:** Solve logic bugs, syntax errors, and architectural flaws in JS, Python, SQL, and more.
- **Ghost AI Hint System:** Get help from the machine... for a price (XP).
- **Global Leaderboard:** Compete against other developers for the fastest escape times.
- **Cinematic Experience:** Terminal-style boot sequences, matrix rain effects, and immersive soundscapes.
- **Comprehensive Admin Panel:** Full control over rooms, puzzles, users, and platform analytics.

## 🛠️ Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Styling:** Tailwind CSS v4 + Framer Motion
- **Database/Auth:** Supabase
- **Editor:** Monaco Editor (VS Code core)
- **Animations:** GSAP + TSParticles

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/codest0411/Debug-Room.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (`.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🛡️ Admin Access

Access the command center at `/admin`. Administrative privileges are required.

---

Made with ☕ by developers, for developers.
