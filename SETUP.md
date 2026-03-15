# Aura - Setup Instructions

## 🚀 Quick Start

Follow these steps to get Aura running with Supabase:

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose a project name (e.g., "aura-mvp")
4. Set a strong database password
5. Choose a region close to your users
6. Click "Create new project"
7. Wait for the project to initialize (~2 minutes)

### 2. Run SQL Setup Script

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `SUPABASE_SETUP.sql` from this project
4. Copy the entire contents
5. Paste into the Supabase SQL Editor
6. Click **"Run"** (or press Ctrl/Cmd + Enter)
7. You should see success messages confirming:
   - All tables created
   - All indexes created
   - All RLS policies created
   - 6 categories seeded

### 3. Enable Email Authentication

1. In Supabase dashboard, go to **Authentication > Providers**
2. Find **Email** in the providers list
3. Enable **"Enable Email provider"**
4. Enable **"Confirm email"** is OFF (for easier testing)
5. Go to **Authentication > Email Templates > Magic Link** and replace template body with OTP content:
   ```html
   <h2>Your login code</h2>
   <p>Enter this 6-digit code in Aura: {{ .Token }}</p>
   ```
6. Scroll down and click **"Save"**

### 4. Get Your Supabase Credentials

1. Go to **Settings > API** in your Supabase dashboard
2. Find **Project URL** - copy this
3. Find **anon public** key under "Project API keys" - copy this

### 5. Configure Environment Variables

1. Create a `.env` file in the project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 6. Install & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Your app should now be running at `http://localhost:5173`

---

## 📋 What Gets Created

### Database Tables

1. **profiles** - User profiles with nickname, avatar, aura total
2. **categories** - 6 action categories (Help, Health, Environment, etc.)
3. **actions** - User actions with 24h expiry
4. **action_confirmations** - Community confirmations
5. **action_reactions** - Reactions (like, etc.)
6. **comments** - Comments on actions
7. **follows** - Follow relationships (supports private accounts)
8. **referrals** - Referral tracking system
9. **notifications** - User notifications

### Features Enabled

✅ Email OTP authentication (passwordless)
✅ User profiles with emoji avatars
✅ 24-hour action expiry system
✅ Aura point calculation
✅ Daily limits (3 actions, 20 confirmations)
✅ Public and private accounts
✅ Follow requests
✅ Referral system (+50 aura per referral)
✅ Weekly and all-time leaderboards
✅ Multi-language support (EN, IT, ES, FR, JP)
✅ Real-time notifications
✅ Comments and reactions
✅ Mobile-first dark mode design

### Security (Row Level Security)

All tables have RLS policies that ensure:
- Users can only edit their own data
- Public actions are visible to all
- Private account actions require follow approval
- Notifications are private to each user

---

## 🎮 How to Use

### First Time Setup

1. **Sign Up**: Enter your email on landing page
2. **Verify**: Enter the 6-digit OTP code sent to your email
3. **Nickname**: Choose a unique nickname and emoji avatar
4. **Start**: You're in! Post your first action

### Creating Actions

1. Click the **"Post action"** button
2. Choose a category
3. Write what you did (max 280 characters)
4. Choose visibility (Public or Followers only)
5. Post! Your action now has 24 hours to get confirmed

### Earning Aura

- Each confirmation on your action = category base points × confirmations
- Example: Health action (20 points) with 5 confirmations = 100 aura
- Actions with 0 confirmations after 24h = Lost in the void (0 aura)

### Referrals

1. Go to **Invite Friends** tab
2. Copy your referral link
3. Share with friends
4. When they sign up and choose a nickname, you get +50 aura!

---

## 🛠️ Database Functions

The setup script creates these helper functions:

- **increment_aura(user_id, amount)** - Safely add aura to user
- **award_referral_bonus(inviter_id, invitee_id)** - Award referral bonus

---

## 🔧 Troubleshooting

### "Email not sent"
- Check Supabase **Authentication > Email Templates**
- Verify email provider is enabled
- Make sure **Magic Link** template contains `{{ .Token }}` (otherwise Supabase sends a clickable link instead of a 6-digit OTP)
- Check spam folder for OTP emails
- For testing, you can see the OTP in Supabase logs

### "Failed to create profile"
- Make sure SQL setup script ran successfully
- Check browser console for errors
- Verify your .env file has correct credentials

### "Actions not showing"
- Check RLS policies are enabled
- Try creating a public action first
- Check browser console for errors

### Database Issues
- Re-run the SQL setup script (it drops and recreates tables)
- Check Supabase project status
- Verify you're using the latest schema

---

## 📱 Testing Flow

1. **Landing Page** - See the product pitch
2. **Sign In** - Enter email
3. **Verify** - Enter OTP code
4. **Setup** - Choose nickname
5. **Feed** - See For You / Friends / Rising tabs
6. **Create** - Post first action
7. **Confirm** - Confirm someone else's action
8. **Profile** - View your stats
9. **Leaderboard** - See rankings
10. **Invite** - Share referral link

---

## 🌍 Multi-Language

The app supports 5 languages:
- English (default)
- Italiano
- Español
- Français
- 日本語

Change language:
- Landing page: Top-right dropdown
- In app: Settings > Language

---

## 🚢 Deployment

### Netlify / Vercel

1. Push code to GitHub
2. Connect repo to Netlify/Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Environment Variables in Production

Make sure to add the same `.env` variables to your deployment platform's environment variable settings.

---

## 📊 Game Mechanics

### Action Limits
- Max 3 actions per day (resets at midnight)
- Max 20 confirmations per day
- Can't confirm own actions
- Can only confirm each action once

### Aura Calculation
```
aura_earned = base_points × confirmation_count

Categories:
- Help someone: 20 points
- Self improvement: 15 points
- Health: 20 points
- Environment: 25 points
- Knowledge: 15 points
- Kindness: 10 points
```

### Leaderboards
- **All-Time**: Total aura since account creation
- **Weekly**: Aura earned this week (resets Sunday)
- **Friends**: All-time rankings of people you follow

---

## 🎨 Design System

- **Mobile-first**: Optimized for phone screens
- **Dark mode**: Default and only theme
- **Colors**: Purple/Pink gradients, clean blacks
- **Typography**: Modern, internet-native copy
- **Components**: Built with Radix UI + Tailwind CSS

---

## 🔐 Security Notes

- **Email OTP only** - No passwords stored
- **Row Level Security** - Database enforced permissions
- **Rate limiting** - Built into daily action limits
- **No PII collection** - Only email + nickname
- **Public/Private profiles** - User controls visibility

---

## 💡 Tips

- Post genuine actions for better confirmations
- Engage with community to get followers
- Use referral system to grow your aura fast
- Check "Rising" tab for trending actions
- Private account = more control over followers

---

## 📞 Support

For issues with:
- **Supabase**: Check [Supabase Docs](https://supabase.com/docs)
- **App Code**: Review this README and code comments
- **Database**: Check SUPABASE_SETUP.sql

---

Built with ❤️ for the internet. Launch ready MVP 2026.
