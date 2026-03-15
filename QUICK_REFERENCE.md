# Aura - Quick Reference Guide

## 🚀 Instant Setup (5 minutes)

```bash
# 1. Create Supabase project at supabase.com

# 2. Run SQL setup
#    → Open Supabase SQL Editor
#    → Copy & paste SUPABASE_SETUP.sql
#    → Click "Run"

# 3. Enable Email Auth
#    → Supabase Dashboard → Authentication → Providers → Email → Enable

# 4. Get credentials
#    → Settings → API → Copy URL & anon key

# 5. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 6. Install & run
npm install
npm run dev
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `SETUP.md` | Step-by-step setup instructions |
| `SUPABASE_SETUP.sql` | Complete database schema (copy-paste ready) |
| `AURA_DOCUMENTATION.md` | Full technical documentation |
| `.env.example` | Environment variable template |
| `/src/lib/supabase.ts` | Supabase client configuration |
| `/src/lib/translations.ts` | Multi-language dictionary |
| `/src/app/routes.tsx` | App routing configuration |

---

## 🗂️ Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (nickname, avatar, aura) |
| `categories` | 6 action categories (seeded) |
| `actions` | User actions with 24h expiry |
| `action_confirmations` | Community confirmations |
| `comments` | Comments on actions |
| `follows` | Follow relationships |
| `referrals` | Referral tracking |
| `notifications` | User notifications |

---

## 🎮 Game Mechanics Cheatsheet

### Aura Formula
```
aura = base_points × confirmations
```

### Categories & Points
- Environment: 25pts
- Help/Health: 20pts
- Self-improvement/Knowledge: 15pts
- Kindness: 10pts

### Daily Limits
- 3 actions per user
- 20 confirmations per user

### Expiry Logic
```
IF confirmations >= 1:
  aura_awarded = base_points × confirmations
  status = 'scored'
ELSE:
  aura_awarded = 0
  status = 'void'
```

---

## 🔑 Environment Variables

```env
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Get from: **Supabase Dashboard → Settings → API**

---

## 📱 Page Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Landing | Marketing page |
| `/auth` | Auth | Email input |
| `/verify-otp` | Verify | OTP code entry |
| `/setup-nickname` | Setup | Choose nickname |
| `/app/feed` | Feed | Main feed (For You/Friends/Rising) |
| `/app/create` | Create | Post new action |
| `/app/profile/:id` | Profile | User profile |
| `/app/leaderboard` | Leaderboard | Rankings |
| `/app/notifications` | Notifications | User notifications |
| `/app/invite` | Invite | Referral system |
| `/app/search` | Search | Find users |

---

## 🛠️ Common Queries

### Get Feed Actions
```typescript
const { data } = await supabase
  .from('actions')
  .select('*, profiles!actions_user_id_fkey (*)')
  .eq('visibility', 'public')
  .order('created_at', { ascending: false });
```

### Create Action
```typescript
await supabase.from('actions').insert({
  user_id: user.id,
  category_id: categoryId,
  body: text,
  expires_at: new Date(Date.now() + 24*60*60*1000).toISOString()
});
```

### Confirm Action
```typescript
await supabase.from('action_confirmations').insert({
  action_id: actionId,
  user_id: userId
});
```

### Follow User
```typescript
await supabase.from('follows').insert({
  follower_id: currentUserId,
  following_id: targetUserId,
  status: isPrivate ? 'pending' : 'accepted'
});
```

---

## 🌍 Languages

```typescript
// In any component
import { useTranslation, useLanguage } from '@/lib/contexts';

const { language } = useLanguage();
const t = useTranslation(language);

// Usage
<h1>{t('hero_title')}</h1>
```

**Supported**: EN, IT, ES, FR, JP

---

## 🔐 RLS Policies Summary

- **Profiles**: Public read, own edit
- **Actions**: Public read (or followers), own edit
- **Confirmations**: Public read, own insert/delete
- **Comments**: Public read, own insert/delete
- **Follows**: Public read, own manage
- **Notifications**: Private (own only)

---

## 🐛 Debugging

### Email not received?
1. Check spam folder
2. Verify Email Auth enabled in Supabase
3. Check Supabase logs for errors
4. For dev: See OTP in Supabase dashboard logs

### Database errors?
1. Verify SQL script ran successfully
2. Check RLS policies
3. Inspect browser console
4. Check Supabase logs

### Actions not showing?
1. Check visibility setting (public vs followers)
2. Verify RLS policies
3. Check if following user (for followers-only)
4. Inspect network tab

---

## 🚢 Deploy Checklist

- [ ] Supabase project created
- [ ] SQL script executed
- [ ] Email Auth enabled
- [ ] Environment variables set
- [ ] Code pushed to GitHub
- [ ] Deployment platform connected
- [ ] Environment variables added to platform
- [ ] Build successful
- [ ] Can sign in/up
- [ ] Can create actions
- [ ] Can confirm actions
- [ ] Leaderboard works
- [ ] Referrals work

---

## 📊 Database Functions

```sql
-- Increment user aura
SELECT increment_aura('[user-id]', 50);

-- Award referral bonus
SELECT award_referral_bonus('[inviter-id]', '[invitee-id]');
```

---

## 🎨 Component Structure

```
App
├── LanguageProvider
└── AuthProvider
    └── RouterProvider
        ├── LandingPage
        ├── AuthPage
        ├── VerifyOTPPage
        ├── NicknameSetupPage
        └── MainLayout (authenticated)
            ├── FeedPage
            ├── CreateActionPage
            ├── ProfilePage
            ├── LeaderboardPage
            └── ...other pages
```

---

## 💡 Tips

- Use `.env.local` for local overrides (gitignored)
- Check browser console for errors
- Supabase dashboard has query logs
- RLS policies can be tested in SQL editor
- Use `?ref=CODE` for referral testing

---

## 📞 Links

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Docs](https://supabase.com/docs)
- [React Router Docs](https://reactrouter.com)
- [Tailwind Docs](https://tailwindcss.com)

---

**Built for the internet ✨**
