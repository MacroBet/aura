# Aura - Complete Technical Documentation

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Authentication Flow](#authentication-flow)
5. [Game Mechanics](#game-mechanics)
6. [API & Data Flow](#api--data-flow)
7. [Features](#features)
8. [File Structure](#file-structure)
9. [Multi-Language System](#multi-language-system)
10. [Security](#security)

---

## Project Overview

**Aura** is a viral, internet-native social reputation game where users post positive actions and the community decides if they're real. Built with:

- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router v7 (Data Mode)
- **Styling**: Tailwind CSS v4 + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Languages**: English, Italian, Spanish, French, Japanese

**Core Concept**: 
- Post an action → 24-hour countdown → Community confirms → Earn aura points
- No confirmations = Lost in the void (0 aura)
- Viral mechanics: Referrals, leaderboards, shareability

---

## Architecture

### Frontend Stack
```
React 18.3.1
├── React Router 7 (Data Mode)
├── Tailwind CSS 4
├── Radix UI (shadcn/ui components)
├── Supabase Client (@supabase/supabase-js)
├── Motion (animations)
├── Sonner (toasts)
└── TypeScript
```

### Backend Stack
```
Supabase
├── PostgreSQL (Database)
├── Auth (Email OTP)
├── Row Level Security (RLS)
├── Database Functions
└── Real-time subscriptions (optional)
```

### Application Flow
```
Landing Page → Email Auth → OTP Verify → Nickname Setup → Main App
                                                              ├── Feed
                                                              ├── Create Action
                                                              ├── Profile
                                                              ├── Leaderboard
                                                              ├── Notifications
                                                              ├── Invite
                                                              └── Settings
```

---

## Database Schema

### Tables

#### 1. `profiles`
```sql
id              UUID PRIMARY KEY (references auth.users)
nickname        TEXT UNIQUE NOT NULL
avatar_emoji    TEXT
bio             TEXT
language        TEXT DEFAULT 'en'
is_private      BOOLEAN DEFAULT false
aura_total      INTEGER DEFAULT 0
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### 2. `categories`
```sql
id              UUID PRIMARY KEY
slug            TEXT UNIQUE
label_key       TEXT
base_points     INTEGER
sort_order      INTEGER
```

**Seeded Categories:**
- help_someone: 20 points
- self_improvement: 15 points
- health: 20 points
- environment: 25 points
- knowledge: 15 points
- kindness: 10 points

#### 3. `actions`
```sql
id                  UUID PRIMARY KEY
user_id             UUID REFERENCES profiles
category_id         UUID REFERENCES categories
body                TEXT
visibility          TEXT ('public' | 'followers')
status              TEXT ('active' | 'scored' | 'void')
confirmation_count  INTEGER DEFAULT 0
aura_awarded        INTEGER DEFAULT 0
created_at          TIMESTAMPTZ
expires_at          TIMESTAMPTZ (created_at + 24 hours)
scored_at           TIMESTAMPTZ
```

#### 4. `action_confirmations`
```sql
id          UUID PRIMARY KEY
action_id   UUID REFERENCES actions
user_id     UUID REFERENCES profiles
created_at  TIMESTAMPTZ

UNIQUE(action_id, user_id)
```

#### 5. `action_reactions`
```sql
id              UUID PRIMARY KEY
action_id       UUID REFERENCES actions
user_id         UUID REFERENCES profiles
reaction_type   TEXT
created_at      TIMESTAMPTZ

UNIQUE(action_id, user_id, reaction_type)
```

#### 6. `comments`
```sql
id          UUID PRIMARY KEY
action_id   UUID REFERENCES actions
user_id     UUID REFERENCES profiles
body        TEXT
created_at  TIMESTAMPTZ
```

#### 7. `follows`
```sql
id              UUID PRIMARY KEY
follower_id     UUID REFERENCES profiles
following_id    UUID REFERENCES profiles
status          TEXT ('pending' | 'accepted')
created_at      TIMESTAMPTZ

UNIQUE(follower_id, following_id)
CHECK(follower_id != following_id)
```

#### 8. `referrals`
```sql
id                  UUID PRIMARY KEY
inviter_user_id     UUID REFERENCES profiles
invitee_user_id     UUID UNIQUE REFERENCES profiles
referral_code       TEXT
aura_bonus          INTEGER DEFAULT 50
awarded             BOOLEAN DEFAULT false
created_at          TIMESTAMPTZ
awarded_at          TIMESTAMPTZ
```

#### 9. `notifications`
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES profiles
type        TEXT
data        JSONB
read_at     TIMESTAMPTZ
created_at  TIMESTAMPTZ
```

### Database Functions

#### `increment_aura(user_id UUID, amount INTEGER)`
Safely increments a user's total aura.

#### `award_referral_bonus(p_inviter_id UUID, p_invitee_id UUID)`
Awards +50 aura to inviter when invitee completes signup.

### Triggers

1. **update_confirmation_count()** - Auto-increment confirmation count
2. **decrease_confirmation_count()** - Auto-decrement on delete
3. **notify_on_comment()** - Create notification on new comment
4. **notify_on_follow()** - Create notification on follow/request
5. **notify_on_follow_accept()** - Notify when request accepted

---

## Authentication Flow

### Email OTP Flow

1. **Landing Page** → User clicks "Sign In"
2. **AuthPage** → User enters email
3. **Server** → Supabase sends 6-digit OTP to email
4. **VerifyOTPPage** → User enters OTP code
5. **Verification** → Supabase validates token
6. **Profile Check** → Check if profile exists
   - If NO → Navigate to NicknameSetupPage
   - If YES → Navigate to Feed

### Nickname Setup

1. User chooses emoji avatar from 30 options
2. User enters unique nickname (3-20 chars, lowercase, alphanumeric + underscore)
3. System checks nickname availability
4. System checks for referral code in URL (`?ref=CODE`)
5. Profile created in `profiles` table
6. If referral exists, create referral record and award bonus
7. Navigate to Feed

### Session Management

- Auth state managed by `AuthContext`
- Persistent across page refreshes
- Auto-redirect to auth if session expires
- Profile data cached in context

---

## Game Mechanics

### Action Lifecycle

```
1. CREATE ACTION
   ├── Choose category (6 options)
   ├── Write body (max 280 chars)
   ├── Set visibility (public/followers)
   └── Post → expires_at = now + 24 hours

2. CONFIRMATION PERIOD (24 hours)
   ├── Users can confirm (max 20/day)
   ├── Each user can confirm once
   ├── Cannot confirm own actions
   └── confirmation_count increments

3. EXPIRY & SCORING
   ├── After 24 hours, action expires
   ├── If confirmation_count = 0:
   │   └── status = 'void', aura_awarded = 0
   └── If confirmation_count >= 1:
       ├── status = 'scored'
       ├── aura_awarded = base_points × confirmation_count
       └── User's aura_total += aura_awarded
```

### Daily Limits

- **Actions**: Max 3 per day (resets at midnight UTC)
- **Confirmations**: Max 20 per day (resets at midnight UTC)
- Enforced client-side with database queries

### Aura Calculation

```
aura_awarded = category_base_points × confirmation_count

Examples:
- Health (20pts) with 5 confirmations = 100 aura
- Environment (25pts) with 10 confirmations = 250 aura
- Kindness (10pts) with 1 confirmation = 10 aura
```

### Leaderboards

**All-Time**: 
- Total aura since account creation
- `ORDER BY aura_total DESC`

**Weekly**:
- Aura earned from actions scored this week
- Calculated from `scored_at >= week_start`
- Resets every Sunday 00:00 UTC

**Friends**:
- All-time leaderboard filtered to followed users
- Only shows users with status = 'accepted'

### Referral System

1. Each user has referral code (first 8 chars of UUID)
2. Share link: `domain.com/setup-nickname?ref=CODE`
3. New user signs up with code → referral record created
4. On nickname setup complete → inviter gets +50 aura
5. Notification sent to inviter

---

## API & Data Flow

### Supabase Client Setup

```typescript
// /src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Common Queries

#### Fetch Feed Actions
```typescript
const { data } = await supabase
  .from('actions')
  .select(`
    *,
    profiles!actions_user_id_fkey (*)
  `)
  .eq('visibility', 'public')
  .order('created_at', { ascending: false })
  .limit(50);
```

#### Create Action
```typescript
const { error } = await supabase
  .from('actions')
  .insert({
    user_id: user.id,
    category_id: categoryId,
    body: text,
    visibility: 'public',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
```

#### Confirm Action
```typescript
const { error } = await supabase
  .from('action_confirmations')
  .insert({
    action_id: actionId,
    user_id: userId,
  });
// Trigger auto-increments confirmation_count
```

#### Follow User
```typescript
const { error } = await supabase
  .from('follows')
  .insert({
    follower_id: currentUserId,
    following_id: targetUserId,
    status: targetIsPrivate ? 'pending' : 'accepted',
  });
```

---

## Features

### ✅ Implemented Features

1. **Authentication**
   - Email OTP (passwordless)
   - Auto-create accounts
   - Session persistence
   - Logout

2. **User Profiles**
   - Emoji avatars (30 options)
   - Nickname system
   - Bio (160 chars)
   - Public/Private toggle
   - Language preference
   - Stats display

3. **Actions**
   - Create with 6 categories
   - 24-hour expiry countdown
   - Public/Followers visibility
   - Daily limit (3)
   - Edit protection

4. **Social Features**
   - Confirm actions
   - Comment on actions
   - React to actions
   - Follow/Unfollow
   - Private account follow requests
   - Share actions

5. **Gamification**
   - Aura point system
   - Category multipliers
   - Weekly leaderboard
   - All-time leaderboard
   - Friends leaderboard
   - "Lost in the Void" tracking

6. **Viral Features**
   - Referral system (+50 aura)
   - Shareable links
   - Invite page with stats
   - Social share buttons

7. **Notifications**
   - New follower
   - Follow accepted
   - Action confirmed
   - Comment received
   - Referral bonus
   - Read/Unread states

8. **Multi-Language**
   - 5 languages supported
   - Language switcher
   - Persistent preference
   - Stored in profile

9. **UI/UX**
   - Mobile-first design
   - Dark mode (forced)
   - Smooth animations
   - Loading states
   - Empty states
   - Error handling
   - Toast notifications

### 🚫 Not Included (Future Features)

- Real-time updates (can add with Supabase Realtime)
- Image uploads (would need Supabase Storage)
- Push notifications (would need service worker)
- Badges/Achievements
- Action editing/deletion (intentionally omitted)
- Direct messaging

---

## File Structure

```
/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ui/              # Radix UI components
│   │   │   ├── ActionCard.tsx   # Reusable action card
│   │   │   └── MainLayout.tsx   # App shell with nav
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── AuthPage.tsx
│   │   │   ├── VerifyOTPPage.tsx
│   │   │   ├── NicknameSetupPage.tsx
│   │   │   ├── FeedPage.tsx
│   │   │   ├── CreateActionPage.tsx
│   │   │   ├── ActionDetailPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── EditProfilePage.tsx
│   │   │   ├── LeaderboardPage.tsx
│   │   │   ├── NotificationsPage.tsx
│   │   │   ├── InvitePage.tsx
│   │   │   ├── SearchPage.tsx
│   │   │   ├── FollowRequestsPage.tsx
│   │   │   └── VoidPage.tsx
│   │   ├── App.tsx              # Root component
│   │   └── routes.tsx           # React Router config
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client
│   │   ├── contexts.tsx         # Auth & Language contexts
│   │   ├── translations.ts      # i18n dictionary
│   │   └── utils.ts             # Helper functions
│   └── styles/
│       ├── index.css
│       ├── tailwind.css
│       ├── theme.css
│       └── fonts.css
├── .env.example
├── SETUP.md                     # Setup instructions
├── SUPABASE_SETUP.sql          # Database schema
├── AURA_DOCUMENTATION.md       # This file
└── package.json
```

---

## Multi-Language System

### Implementation

1. **Translation Dictionary** (`/src/lib/translations.ts`)
   - 5 languages with complete key-value mappings
   - Type-safe with TypeScript
   - Fallback to English if key missing

2. **Language Context**
   - Global state management
   - Persisted to localStorage
   - Synced with user profile

3. **Usage Pattern**
```typescript
import { useTranslation, useLanguage } from '@/lib/contexts';

const { language } = useLanguage();
const t = useTranslation(language);

// Use in components
<h1>{t('hero_title')}</h1>
```

### Supported Languages

- **en**: English (default)
- **it**: Italiano
- **es**: Español
- **fr**: Français
- **ja**: 日本語

### Translation Keys

All UI text has translation keys:
- Navigation: `for_you`, `friends`, `rising`, etc.
- Actions: `post_action`, `confirm`, `comment`, etc.
- Categories: `cat_help_someone`, `cat_health`, etc.
- Auth: `sign_in`, `enter_email`, `verify`, etc.
- Profile: `edit_profile`, `followers`, `following`, etc.

---

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies:

**Profiles**
- ✅ SELECT: Everyone
- ✅ INSERT: Own profile only
- ✅ UPDATE: Own profile only

**Actions**
- ✅ SELECT: Public actions + own + followers-only if following
- ✅ INSERT: Authenticated users
- ✅ UPDATE: Own actions only
- ✅ DELETE: Own actions only

**Confirmations/Reactions/Comments**
- ✅ SELECT: Everyone
- ✅ INSERT: Authenticated users
- ✅ DELETE: Own records only

**Follows**
- ✅ SELECT: Everyone
- ✅ INSERT: As follower only
- ✅ UPDATE: If involved (follower or following)
- ✅ DELETE: If involved

**Notifications**
- ✅ SELECT: Own notifications only
- ✅ UPDATE: Own notifications only
- ✅ DELETE: Own notifications only

### Authentication

- **Email OTP only** - No passwords stored
- **6-digit codes** - Sent via Supabase Auth
- **Token-based sessions** - JWT stored in httpOnly cookies
- **Auto-refresh** - Sessions auto-refresh before expiry

### Input Validation

- Nickname: 3-20 chars, alphanumeric + underscore, unique
- Action body: 1-280 chars
- Bio: Max 160 chars
- Email: Standard email regex
- Category: Must exist in categories table

### Rate Limiting

- Built into game mechanics (3 actions/day, 20 confirmations/day)
- Additional rate limiting via Supabase Edge Functions (optional)

---

## Performance Optimizations

1. **Indexes on all foreign keys and frequently queried columns**
2. **Lazy loading of routes** (React Router code splitting)
3. **Pagination** on feeds (limit 50)
4. **Memoization** in React components where needed
5. **Efficient RLS policies** with indexed columns

---

## Deployment Checklist

- [ ] Create Supabase project
- [ ] Run SUPABASE_SETUP.sql
- [ ] Enable Email Auth
- [ ] Get Supabase URL and anon key
- [ ] Add environment variables
- [ ] Deploy frontend (Netlify/Vercel)
- [ ] Test auth flow
- [ ] Test action creation
- [ ] Test confirmations
- [ ] Test referrals
- [ ] Test leaderboards

---

## Support & Maintenance

### Monitoring

- Supabase Dashboard for DB metrics
- Browser DevTools for frontend errors
- Supabase Logs for auth issues

### Common Issues

1. **OTP not received**: Check spam, check Supabase email settings
2. **Actions not showing**: Check RLS policies, visibility settings
3. **Referral not working**: Check URL params, profile creation

### Database Migrations

To add new features:
1. Write migration SQL
2. Test locally first
3. Apply to production via Supabase SQL Editor
4. Update RLS policies if needed
5. Update TypeScript types

---

## License

MIT License - Built for the internet 🌐

---

**End of Documentation**

For setup instructions, see `SETUP.md`
For SQL schema, see `SUPABASE_SETUP.sql`
