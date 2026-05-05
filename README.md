# THE DEBUG ROOM ⚡

> **The production server is down. You are the only hope.**

THE DEBUG ROOM is a cinematic, immersive coding escape room platform built for developers.
Solve real-world programming puzzles, debug broken systems, unlock hidden rooms, and escape the mainframe before the timer hits zero.

It starts simple.
It gets deeper.
It gets harder.
Only logic can save you.

---

## 🌊 Project Concept

THE DEBUG ROOM is not just a website — it is a full gamified developer experience.

Users enter different coding-based escape rooms where each room focuses on a different programming technology like HTML, CSS, JavaScript, React, Node.js, Databases, Algorithms, and more.

Each room contains:

* Broken code
* Logic puzzles
* Syntax errors
* Hidden clues
* Time-based challenges
* Unlock systems
* XP rewards
* Achievement badges
* Final boss challenges

The deeper the user goes, the harder the game becomes.

Simple outside. Powerful inside.

---

## 🎮 Core Features

* 10 themed escape rooms
* Real coding challenges
* Ghost AI hint system
* Global leaderboard
* Cinematic terminal experience
* Full theme customization panel
* Admin command center
* XP + achievement system
* Responsive modern UI
* Supabase-powered backend

---

## 🛠️ Tech Stack

### Frontend

* Next.js 15+
* React.js
* TypeScript
* Tailwind CSS v4
* Framer Motion
* GSAP
* Shadcn UI
* Zustand

### Backend

* Supabase

### Tools

* Monaco Editor
* TSParticles
* ESLint
* Prettier
* GitHub Actions

---

## 🚀 Getting Started

### Prerequisites

* Node.js 20+
* npm / pnpm
* Supabase account

### Installation

```bash
git clone https://github.com/codest0411/Debug-Room.git
cd Debug-Room
npm install
```

### Environment Variables

Create `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Run Project

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

## 🔐 Admin Access

Visit:

```bash
/admin
```

Administrative privileges required.

---

---

## 🧭 Complete User Flow

```text
Landing Page
   ↓
Login / Signup
   ↓
Profile Setup
   ↓
Theme Selection Panel
   ↓
Mission Brief
   ↓
Room Selection Dashboard
   ↓
Choose Escape Room
   ↓
Enter Puzzle Room
   ↓
Solve Coding Challenge
   ↓
Need Hint?
   ├── Yes → Ghost AI Hint System (XP Cost)
   └── No
   ↓
Puzzle Solved?
   ├── No → Retry + Timer Continues
   └── Yes
   ↓
Earn XP + Badge + Unlock Next Room
   ↓
Progress Saved to Supabase
   ↓
Leaderboard Update
   ↓
Final Escape Protocol
   ↓
Victory Screen + Ranking
```

---

## 🏗️ System Architecture

```text
Frontend Layer (Next.js + React + TypeScript)
   ↓
UI Components + Theme Engine + Animations
   ↓
Authentication Layer
   ↓
Supabase Auth
   ↓
Game Engine Layer
   ↓
Monaco Editor + Puzzle Validation Engine
   ↓
XP System + Progress Tracker
   ↓
Leaderboard + Achievement System
   ↓
Admin Command Center
   ↓
Analytics + Reports + User Management
```

---

## 🎨 Design System

### UI Philosophy

Simple outside.
Powerful inside.

The interface should feel:

* Premium like a startup product
* Smooth like a modern SaaS platform
* Fun like a real game
* Smart like a developer tool
* Friendly for beginners
* Challenging for advanced coders

### Visual Design Rules

* Rounded premium cards
* Glassmorphism panels
* Soft gradients
* Floating UI elements
* Smooth hover interactions
* Scroll reveal animations
* Minimal clean spacing
* Responsive layout for all devices
* Elegant motion transitions
* Lightweight fast-loading structure

### Theme Engine

Users can switch between:

* Light Mode
* Dark Mode
* Ocean Blue
* Sunset
* Forest
* Purple Neon
* Minimal White
* Midnight
* Soft Pink
* Hacker Green

Theme panel includes:

* Live preview
* Accent color selection
* Font style options
* UI density control
* Animation ON/OFF
* Sound ON/OFF
* Saved preferences

---

## 📊 Admin Dashboard Modules

### User Management

* View users
* Manage access
* Ban / restore users
* Monitor player activity

### Room Management

* Add new escape rooms
* Edit puzzles
* Difficulty balancing
* Unlock conditions

### Analytics Panel

* Completion rates
* Most failed puzzles
* Average escape time
* User retention
* Leaderboard performance

### Content Engine

* Add hidden clues
* Secret rooms
* Bonus challenges
* Seasonal events

---

## 🚀 Premium Features

* Ghost AI smart hint engine
* Daily challenge mode
* Weekly coding tournaments
* Secret hidden rooms
* Easter eggs for developers
* Inspect element hidden clues
* Keyboard shortcuts
* Accessibility support
* PWA support
* Offline mode basics
* Resume progress system
* Achievement unlock animations
* Confetti success effects
* Failure state cinematic alerts

---

## 📈 Future Expansion Roadmap

### Phase 2

* Multiplayer co-op escape mode
* Team coding battles
* Pair programming rooms
* Live coding tournaments

### Phase 3

* AI-generated puzzles
* Company interview simulation rooms
* Hiring challenge rooms
* GitHub profile sync
* Resume scoring room

### Phase 4

* Mobile App
* Discord integration
* Community challenge builder
* Public puzzle marketplace

---

## ☕ Final Line

> Built by developers.
> Designed for problem solvers.
> Escaped by legends.

# Code. Debug. Escape. Repeat. ⚡
