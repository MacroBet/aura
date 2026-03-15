# Aura ✨

**A viral internet-native social reputation game where your actions last 24 hours.**

Build clout. Farm aura. Avoid the void.

---

## 🎮 What is Aura?

Aura is a social web game where users:
- Post positive actions that expire in 24 hours
- Get confirmed by the community
- Earn aura points based on confirmations
- Climb leaderboards and build online status
- Invite friends for referral bonuses

**No confirmation, no aura. Lost in the void.**

---

## ⚡ Quick Start

### 1. Setup Supabase

```bash
# 1. Create project at supabase.com
# 2. Run the SQL setup script in Supabase SQL Editor
# (Copy contents of SUPABASE_SETUP.sql)
# 3. Enable Email Auth in Authentication settings
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Add your Supabase credentials to .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📱 Features

### Core Game Mechanics
- ⏱️ **24-hour action expiry** - Urgency drives engagement
- ✅ **Community confirmations** - Earn aura by getting validated
- 🏆 **Leaderboards** - Weekly and all-time rankings
- 💎 **Category system** - 6 categories with different point values
- 🎯 **Daily limits** - 3 actions, 20 confirmations per day

### Social Features
- 👥 **Follow system** - Public and private accounts
- 💬 **Comments & reactions** - Engage with the community
- 🔔 **Notifications** - Stay updated on confirmations and follows
- 🎁 **Referral system** - +50 aura per invited friend

### User Experience
- 📧 **Email OTP auth** - Passwordless, frictionless signup
- 🎨 **Emoji avatars** - 30+ options
- 🌍 **Multi-language** - EN, IT, ES, FR, JP
- 📱 **Mobile-first** - Optimized for phones
- 🌙 **Dark mode** - Clean, modern aesthetic

---

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4 + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth)
- **Animations**: Motion (Framer Motion successor)

---

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide
- **[SUPABASE_SETUP.sql](./SUPABASE_SETUP.sql)** - Database schema
- **[AURA_DOCUMENTATION.md](./AURA_DOCUMENTATION.md)** - Technical docs

---

## 🎯 Game Rules

### Aura Calculation
```
aura_awarded = category_base_points × confirmation_count
```

### Categories
- **Help someone**: 20 points
- **Health**: 20 points
- **Environment**: 25 points
- **Self improvement**: 15 points
- **Knowledge**: 15 points
- **Kindness**: 10 points

### Daily Limits
- Max **3 actions** per day
- Max **20 confirmations** per day

### Expiry Logic
- Actions expire **24 hours** after creation
- If `confirmations >= 1`: Earn aura
- If `confirmations = 0`: **Lost in the void** (0 aura)

---

## 🚀 Deployment

### Netlify / Vercel

1. Push to GitHub
2. Connect repository
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

---

## 🔐 Security

- ✅ Row Level Security (RLS) on all tables
- ✅ Email OTP authentication only
- ✅ No passwords stored
- ✅ Public/private account controls
- ✅ Daily action/confirmation limits

---

## 📄 License

MIT License

---

## 🎨 Design Philosophy

Aura is designed to be:
- **Internet-native** - Sharp copy, meme-friendly
- **Viral** - Shareable, referral loops, leaderboards
- **Clean** - Dark mode, premium spacing
- **Fast** - Mobile-first, optimized performance
- **Addictive** - 24h countdown creates urgency

Not corporate. Not childish. Just cool.

---

## 💡 Support

For issues:
- Check [SETUP.md](./SETUP.md) for setup problems
- Check [AURA_DOCUMENTATION.md](./AURA_DOCUMENTATION.md) for technical details
- Review [Supabase Docs](https://supabase.com/docs) for backend issues

---

**Built for the internet. Launch ready MVP 2026.**

✨ **Start building aura** ✨
