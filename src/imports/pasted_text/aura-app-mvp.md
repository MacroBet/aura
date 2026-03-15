Build a complete, production-minded, mobile-first web app called “Aura”.

Aura is a viral internet-native social reputation game for young users.
Users post positive actions, real or allegedly real, and the community decides if their aura is real.
The tone must be clean, stylish, ironic, and strongly internet-culture-native.
Think: clean UI, dark mode, fast onboarding, meme copy, status-game energy.

IMPORTANT BACKEND REQUIREMENTS
- Use the connected Supabase project as the only backend.
- Use Supabase Auth for passwordless email sign-in/sign-up with email OTP code.
- Do not use passwords.
- Do not use any paid external service.
- If you cannot fully create the SQL schema automatically, generate a single complete SQL setup script that I can paste into Supabase SQL Editor, and then wire the app to that schema.
- Do not leave placeholders. Generate the actual app structure, data model, flows, queries, UI states, and empty/loading/error states.
- Make the app launch-ready MVP, not a static prototype.

PRODUCT GOAL
Create a launch-ready MVP for a social web game where:
- users sign in with email OTP
- choose a nickname right after first login
- land directly in the app
- publish actions that last 24 hours
- actions need at least 1 confirmation to earn aura
- aura points are assigned by category and increase linearly with confirmations
- users can react, comment, follow friends, invite friends, and climb the leaderboard
- the product grows organically with humor, shareability, and referral loops
- languages supported: English, Italian, Spanish, French, Japanese

CORE GAME RULES
- Each action has a category and short description.
- Each action expires exactly 24 hours after creation.
- If an action expires with 0 confirmations, it goes to “Lost in the Void” and awards 0 aura.
- If an action gets at least 1 confirmation before expiry, aura is awarded.
- Aura formula:
  aura_awarded = category_base_points * confirmation_count
- Count only unique confirmations from different users.
- Each user can create max 3 actions per day.
- Each user can give max 20 confirmations per day.
- A user can confirm an action only once.
- Actions can also receive reactions and comments.
- Feed style should feel like Instagram + Twitter + internet leaderboard culture.
- Users can have public or private profiles.
- If profile is private, follow requests must be approved.
- There must be a public feed and a friends/following feed.
- Referral system: inviting a friend gives aura bonus to the inviter once the invited user completes signup and chooses a nickname.
- Add weekly leaderboard and all-time leaderboard.
- All-time aura is permanent.
- Weekly leaderboard resets by time window logic, not by deleting data.

AUTH FLOW
Create the following auth flow:
1. Landing page with CTA
2. Email input page
3. OTP verification page
4. First-time nickname setup page
5. Enter the main app

AUTH REQUIREMENTS
- Single unified login/signup flow
- Email OTP only
- Minimal friction
- If user exists, sign them in
- If user does not exist, create account and sign them in
- After authentication, check if profile/nickname exists:
  - if not, redirect to nickname onboarding
  - if yes, go to feed
- Add proper validation, loading states, resend OTP, and helpful errors

LANDING PAGE
Create a highly shareable landing page designed for organic virality.
It must feel exciting, ironic, fast, and internet-native, not corporate.
Sections:
- Hero section with strong headline and CTA
- One-line explanation of the product
- Live-feeling preview cards of actions, confirmations, aura gains, and leaderboard positions
- “How it works” in 3 simple steps
- Why people share it / why it is addictive
- Referral / invite tease
- Multi-language support
- FAQ
- Final CTA

The copy should feel like:
- “The internet decides if your aura is real.”
- “Your actions last 24 hours.”
- “No confirmation, no aura.”
- “Build clout. Farm aura. Avoid the void.”
- “Post good. Get confirmed. Climb.”

APP PAGES / SCREENS
Generate a complete app with these screens:

1. Landing page
2. Auth / email entry
3. OTP verification
4. Nickname onboarding
5. Main feed
6. Friends/following feed
7. Create action screen
8. Action detail screen
9. Comments screen or panel
10. Notifications
11. Profile page
12. Edit profile / settings
13. Invite friends / referral page
14. Leaderboard page
15. Search / discover users
16. Follow requests page
17. Lost in the Void / expired actions view
18. Empty states for new users

MAIN FEED REQUIREMENTS
- Tabs:
  - For You / Public
  - Friends / Following
  - Rising
- Show action cards with:
  - nickname
  - category
  - short action text
  - time left countdown
  - confirmation count
  - reaction count
  - comment count
  - aura to earn / aura earned
- Primary interactions:
  - confirm
  - react
  - comment
  - open detail
  - share
- Expired actions should clearly show if they:
  - gained aura
  - got lost in the void

CREATE ACTION FLOW
- very fast action composer
- choose category
- enter short text
- optional visibility: public or followers
- show how many actions remaining today
- show “expires in 24h” warning
- do not allow long essays
- keep it lightweight and social

CATEGORIES
Create 6 default categories with base points:
- Help someone = 20
- Self improvement = 15
- Health = 20
- Environment = 25
- Knowledge = 15
- Kindness = 10

LEADERBOARD
Create:
- Weekly leaderboard
- All-time leaderboard
- Friends leaderboard
Each leaderboard entry should show:
- rank
- nickname
- aura
- profile quick link
- possible badge / verified marker if the design supports it
Do not make verification the core of the MVP. It can exist visually as a future-ready field but should not drive the main loop.

PROFILE
Profile should include:
- nickname
- optional avatar / emoji avatar
- bio
- language
- public/private toggle
- total aura
- weekly aura
- actions posted
- confirmations received
- confirmations given
- followers / following
- referral stats
- action history
- lost in the void count

SOCIAL FEATURES
- comments on actions
- reactions on actions
- follow users
- private account follow requests
- notifications for:
  - new follower
  - follow request accepted
  - action confirmed
  - comment received
  - reaction received
  - referral bonus earned

REFERRAL / INVITE LOOP
Implement a built-in viral invite system:
- every user has a referral code and referral link
- Invite Friends page must let users copy a referral link/code
- inviter gets +50 aura when invitee completes signup and chooses nickname
- show referral progress and total aura earned from referrals
- make the invite screen playful and meme-friendly
- create copy that encourages screenshotting and sharing

SHAREABILITY
Design the product so users want to share it.
Add share affordances on:
- action cards
- leaderboard placements
- profile stats
- referral screen
Generate clean social-share-friendly card layouts inside the UI.

DESIGN SYSTEM
Style:
- mobile-first
- dark mode default
- clean but expressive
- sharp internet-native copy
- premium spacing and typography
- subtle gradients allowed
- rounded corners
- fast, punchy visual hierarchy
- no corporate SaaS look
- no childish gamification look
- should feel like a cool consumer social product for Gen Z

COPY STYLE
Use short internet-native copy such as:
- “Aura confirmed”
- “No one bought it”
- “Lost in the void”
- “Massive aura gain”
- “Invite and farm aura”
- “Highest Aura”
- “Rising fast”
- “That actually counts”
- “Too slow, it expired”

MULTILINGUAL SUPPORT
Support:
- English
- Italian
- Spanish
- French
- Japanese

Implementation requirement:
- English default
- language switcher on landing and in settings
- store language preference in user profile
- use a simple translation dictionary structure in app code
- all UI text must be translatable
- do not hardcode everything in one language only

DATA MODEL
Use Supabase tables for a proper MVP SQL schema.
Create and wire the app to a schema like this, with exact SQL:

1. profiles
- id uuid primary key references auth.users(id) on delete cascade
- nickname text unique not null
- avatar_emoji text nullable
- bio text nullable
- language text not null default 'en'
- is_private boolean not null default false
- aura_total integer not null default 0
- created_at timestamptz default now()
- updated_at timestamptz default now()

2. categories
- id uuid primary key
- slug text unique not null
- label_key text not null
- base_points integer not null
- sort_order integer not null

3. actions
- id uuid primary key
- user_id uuid references profiles(id) on delete cascade
- category_id uuid references categories(id)
- body text not null
- visibility text not null default 'public'
- status text not null default 'active'
- confirmation_count integer not null default 0
- aura_awarded integer not null default 0
- created_at timestamptz default now()
- expires_at timestamptz not null
- scored_at timestamptz nullable

4. action_confirmations
- id uuid primary key
- action_id uuid references actions(id) on delete cascade
- user_id uuid references profiles(id) on delete cascade
- created_at timestamptz default now()
- unique(action_id, user_id)

5. action_reactions
- id uuid primary key
- action_id uuid references actions(id) on delete cascade
- user_id uuid references profiles(id) on delete cascade
- reaction_type text not null
- created_at timestamptz default now()
- unique(action_id, user_id, reaction_type)

6. comments
- id uuid primary key
- action_id uuid references actions(id) on delete cascade
- user_id uuid references profiles(id) on delete cascade
- body text not null
- created_at timestamptz default now()

7. follows
- id uuid primary key
- follower_id uuid references profiles(id) on delete cascade
- following_id uuid references profiles(id) on delete cascade
- status text not null default 'accepted'
- created_at timestamptz default now()
- unique(follower_id, following_id)

8. referrals
- id uuid primary key
- inviter_user_id uuid references profiles(id) on delete cascade
- invitee_user_id uuid unique references profiles(id) on delete cascade
- referral_code text not null
- aura_bonus integer not null default 50
- awarded boolean not null default false
- created_at timestamptz default now()
- awarded_at timestamptz nullable

9. notifications
- id uuid primary key
- user_id uuid references profiles(id) on delete cascade
- type text not null
- data jsonb not null default '{}'::jsonb
- read_at timestamptz nullable
- created_at timestamptz default now()

BACKEND / LOGIC REQUIREMENTS
- Generate the exact SQL migration for all tables, constraints, indexes, and seed categories.
- Add row level security policies appropriate for a public social MVP.
- Users can edit only their own profile.
- Users can create only their own actions/comments/reactions/confirmations.
- Public data should be readable where appropriate.
- Private profiles and followers-only actions must be respected.
- Add efficient indexes for feeds, follows, confirmations, leaderboards, and notifications.
- Add automatic updated_at handling where needed.
- If useful, create SQL views for weekly leaderboard and all-time leaderboard.

IMPORTANT SCORING / EXPIRY LOGIC
Do NOT rely on an external cron or paid service.
Implement expiry and scoring in a launch-ready but simple way:
- if an action is fetched after expires_at and status is still active, compute its final state
- if confirmation_count = 0, mark it as void / lost_in_the_void
- if confirmation_count >= 1, compute aura_awarded = base_points * confirmation_count, mark it scored, and update profile.aura_total
- make this scoring idempotent so it cannot double-award points
- ensure weekly leaderboard can be computed from scored actions by time window

USER EXPERIENCE REQUIREMENTS
- very fast onboarding
- no dead-end states
- empty state prompts for first post, first follow, first invite
- polished loading states
- obvious countdown timers
- good mobile spacing
- responsive desktop shell
- accessible text contrast
- clear to understand in less than 10 seconds

OUTPUT REQUIREMENTS
Build the full app UI and logic.
Also provide:
1. the exact SQL setup script if needed
2. the exact Supabase tables and policies used
3. any setup notes for auth/email OTP
4. no placeholder lorem ipsum
5. no fake backend assumptions
6. no omitted “to be implemented later” core logic

FINAL PRODUCT FEEL
The final result should feel like a launchable, viral, internet-native social product.
Not a template.
Not a generic SaaS dashboard.
Not a toy.

It should feel like:
“A clean, addictive, meme-smart web social game where your aura lives or dies in 24 hours.”