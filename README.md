# 📚 StudyHub — React + Vite EdTech Dashboard

A production-ready, fully-featured EdTech dashboard built from Google Stitch UI exports.

## Tech Stack
- **React 18** + **Vite 6**
- **TailwindCSS 3** — utility-first styling
- **React Router v6** — client-side routing
- **Material Symbols** — icon library (Google)
- **Lexend** — primary font

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # App shell with Navbar + BottomNav
│   ├── Navbar.jsx          # Top navigation bar
│   ├── BottomNav.jsx       # Mobile bottom navigation
│   ├── SubjectCard.jsx     # Reusable subject card
│   ├── ProgressBar.jsx     # Reusable progress bar
│   ├── QuickActions.jsx    # Dashboard quick action grid
│   └── PageHeader.jsx      # Inner page header with back button
├── pages/
│   ├── Dashboard.jsx       # Main dashboard
│   ├── Subjects.jsx        # Subjects grid + overall progress
│   ├── Lesson.jsx          # Video player + lesson outline
│   ├── Practice.jsx        # Interactive MCQ quiz
│   ├── Notes.jsx           # Markdown editor + preview
│   ├── Flashcards.jsx      # Flip card interface
│   ├── FocusTimer.jsx      # Pomodoro timer with ring UI
│   ├── MindMap.jsx         # Visual mind map
│   ├── AITutor.jsx         # Chat interface with simulated AI
│   ├── Analytics.jsx       # Study charts and stats
│   ├── Profile.jsx         # User profile page
│   └── Settings.jsx        # App settings with toggles
├── data/
│   └── sampleData.js       # All example data (subjects, quizzes, etc.)
├── App.jsx                 # Router configuration
├── main.jsx                # React entry point
└── index.css               # Global styles + Tailwind directives
```

## Routes

| Path | Page |
|------|------|
| `/dashboard` | Main dashboard |
| `/subjects` | All subjects |
| `/lesson/:id` | Lesson player |
| `/practice` | MCQ practice quiz |
| `/notes` | Markdown notes editor |
| `/flashcards` | Flashcard review |
| `/focus` | Pomodoro timer |
| `/mindmap` | Visual mind map |
| `/ai-tutor` | AI chat assistant |
| `/analytics` | Study analytics |
| `/profile` | User profile |
| `/settings` | App settings |

## Design System

| Token | Value |
|-------|-------|
| Primary | `#2563EB` |
| Background | `#F5F7FB` |
| Font | Lexend |
| Card shadow | `0 1px 3px rgba(0,0,0,0.07)` |
| Border radius | `0.5rem` – `1.5rem` |

## Features

- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Dark mode ready (add `.dark` to `<html>`)
- ✅ Interactive MCQ quiz with scoring
- ✅ Working Pomodoro timer with SVG ring
- ✅ Flashcard flip animation (CSS 3D transform)
- ✅ Markdown notes editor with live preview
- ✅ Simulated AI chat with typing indicator
- ✅ Interactive mind map nodes
- ✅ All navigation functional via React Router
