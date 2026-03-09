# StudyHub — Backend Integration Guide
## Supabase + Firebase Setup

---

## 1. Install Dependencies

```bash
npm install @supabase/supabase-js firebase
```

---

## 2. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `VITE_FIREBASE_API_KEY` | Firebase → Project Settings → Your Apps |
| `VITE_FIREBASE_VAPID_KEY` | Firebase → Project Settings → Cloud Messaging → Web Push |

---

## 3. Supabase Setup

### 3a. Create Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **anon/public API key** into `.env`

### 3b. Run the Schema
1. Open **SQL Editor** in your Supabase dashboard
2. Paste the entire contents of `supabase-schema.sql`
3. Click **Run**

This creates all 7 tables, RLS policies, triggers, and the seed function.

### 3c. Enable Auth Providers
- Go to **Authentication → Providers**
- Enable **Email** (enable "Confirm email" for production)
- Enable **Google** and/or **Apple** OAuth if needed
  - For Google: add your Client ID + Secret from Google Cloud Console
  - Set redirect URL to: `https://your-project.supabase.co/auth/v1/callback`

### 3d. Add Supabase RPC Helper
Run this in SQL Editor (needed by `studyService.js`):

```sql
-- Increment study minutes atomically
create or replace function public.increment_study_minutes(p_user_id uuid, p_minutes integer)
returns void language sql security definer as $$
  update public.users
  set total_study_minutes = total_study_minutes + p_minutes
  where id = p_user_id;
$$;
```

---

## 4. Firebase Setup

### 4a. Create Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project → enable **Google Analytics**
3. Add a **Web App** → copy the config into `.env`

### 4b. Enable Analytics
Analytics is auto-enabled when you create the project with GA.

### 4c. Enable Cloud Messaging (Push Notifications)
1. **Project Settings → Cloud Messaging → Web Push Certificates**
2. Click **Generate key pair** → copy the **Key pair (VAPID key)** into `VITE_FIREBASE_VAPID_KEY`
3. The service worker at `public/firebase-messaging-sw.js` handles background messages
4. **Replace the placeholder values** in `firebase-messaging-sw.js` with your actual config values (hardcoded — service workers can't use `import.meta.env`)

---

## 5. Project Structure

```
src/
├── services/
│   ├── supabaseClient.js   # Singleton Supabase client
│   ├── firebase.js         # Firebase: analytics, messaging, performance
│   ├── authService.js      # sign up / login / logout / profile
│   ├── notesService.js     # CRUD + realtime subscription
│   ├── flashcardsService.js# CRUD + spaced repetition
│   ├── studyService.js     # Focus timer sessions + streak
│   └── quizService.js      # Save scores + performance stats
├── hooks/
│   ├── useAuth.js          # Auth context + RequireAuth guard
│   ├── useNotes.js         # Notes state + auto-save + realtime
│   ├── useFlashcards.js    # Flashcard deck management
│   └── useStudySession.js  # Pomodoro → DB integration
└── pages/
    ├── Login.jsx           # Uses useAuth().login
    ├── SignUp.jsx          # Uses useAuth().signUp
    ├── Notes.jsx           # Uses useNotes()
    ├── Flashcards.jsx      # Uses useFlashcards()
    ├── Practice.jsx        # Uses saveQuizResult()
    └── FocusTimer.jsx      # Uses useStudySession()
```

---

## 6. Authentication Flow

```
User visits /dashboard
    ↓
RequireAuth checks useAuth().isAuthenticated
    ↓ not authenticated
Redirect → /login
    ↓ submit form
useAuth().login({ email, password })
    ↓
authService.login() → supabase.auth.signInWithPassword()
    ↓ success
onAuthStateChange fires → session + profile loaded
Firebase: identifyUser(userId), requestNotificationToken()
    ↓
Navigate → /dashboard
```

### Usage in any component:
```jsx
import { useAuth } from '../hooks/useAuth'

function MyComponent() {
  const { user, profile, logout } = useAuth()
  return <p>Hello {profile?.full_name}</p>
}
```

---

## 7. Notes — Example Usage

```jsx
import { useNotes } from '../hooks/useNotes'

function NotesPage() {
  const { notes, loading, create, update, remove } = useNotes()

  // Create
  const newNote = await create({ title: 'My Note', content: '# Hello' })

  // Auto-save on keystroke (debounced 1 second)
  const handleChange = (e) => update(activeNote.id, { content: e.target.value }, { debounced: true })

  // Delete
  await remove(noteId)
}
```

Realtime updates are automatic — any change from another browser tab syncs instantly via Supabase Realtime.

---

## 8. Flashcards — Spaced Repetition

```jsx
import { useFlashcards } from '../hooks/useFlashcards'

function FlashcardsPage() {
  const { currentCard, review, sessionStats } = useFlashcards()

  // After user rates recall:
  await review('easy')   // next review: 7 days
  await review('medium') // next review: 3 days
  await review('hard')   // next review: 1 day
}
```

---

## 9. Focus Timer → Study Session

```jsx
import { useStudySession } from '../hooks/useStudySession'

function FocusTimer() {
  const { formattedTime, running, mode, sessions, start, pause, reset, switchMode } = useStudySession({
    subjectId: selectedSubject?.id,
  })
  // start() → creates a study_sessions row in DB
  // pause() → marks it incomplete
  // Timer completion → marks complete, updates streak + total_study_minutes
}
```

---

## 10. Quiz Results

```jsx
import { saveQuizResult, getAccuracyBySubject } from '../services/quizService'

// Save after quiz completion
await saveQuizResult({
  userId: user.id,
  subjectId: physicsId,
  quizTitle: 'Quantum Mechanics Quiz',
  totalQuestions: 5,
  correctAnswers: 4,
  timeTakenSec: 120,
  answers: [{ question: '...', chosen: 1, correct: 1 }, ...]
})

// Analytics: accuracy per subject
const stats = await getAccuracyBySubject(user.id)
// → [{ subjectName: 'Physics', avgScore: 88, totalAttempts: 12 }, ...]
```

---

## 11. Firebase Analytics

```jsx
import { logEvent, AnalyticsEvents } from '../services/firebase'

// Log a custom event anywhere in your code
logEvent(AnalyticsEvents.LESSON_COMPLETED, {
  subject: 'Physics',
  lesson_id: lesson.id,
})
```

All predefined events are listed in `src/services/firebase.js` under `AnalyticsEvents`.

---

## 12. Push Notifications

Notifications are requested automatically on login via `requestNotificationToken()`.
The token is stored in `users.fcm_token` and used by your backend/server functions
to send targeted notifications (study reminders, streak alerts, etc.).

To send a notification from a Supabase Edge Function:

```typescript
// supabase/functions/send-reminder/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async () => {
  const fcmToken = '...' // from users table
  await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      Authorization: `key=${Deno.env.get('FCM_SERVER_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: fcmToken,
      notification: {
        title: '📚 Time to Study!',
        body: 'Your 7-day streak is at risk. Open StudyHub now.',
      },
      data: { url: '/dashboard' },
    }),
  })
  return new Response('OK')
})
```

---

## 13. Database Schema Summary

| Table | Purpose |
|---|---|
| `users` | Extended profile (streak, study minutes, FCM token) |
| `subjects` | Student's subjects with progress % |
| `lessons` | Individual lessons per subject |
| `notes` | Markdown notes with optional subject link |
| `flashcards` | Cards with spaced-repetition fields |
| `study_sessions` | Focus timer records (duration, completion) |
| `quiz_results` | Quiz scores with per-question answer log |

All tables have **Row Level Security** — users can only access their own data.

---

## 14. Security Checklist

- [x] RLS enabled on all tables
- [x] Anon key only (never use service_role key in frontend)
- [x] `.env` in `.gitignore`
- [x] Email confirmation enabled for production
- [x] FCM VAPID key stored in env var
- [ ] Set up Supabase Edge Functions for server-side notifications
- [ ] Configure Supabase Auth email templates (branding)
- [ ] Set up rate limiting in Supabase dashboard
