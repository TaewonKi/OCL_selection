# Quick Start Guide 🚀

Get the Trip Registration System up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] Git installed

## Setup Steps

### 1️⃣ Install Dependencies (30 seconds)

```bash
npm install
```

### 2️⃣ Create Supabase Project (2 minutes)

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - Name: `trip-registration`
   - Database Password: (save this!)
   - Region: Choose closest to you
4. Wait ~2 minutes for provisioning

### 3️⃣ Set Up Database (1 minute)

1. Open your Supabase project
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy/paste contents of `supabase/migrations/01_create_cities.sql`
5. Click **Run**
6. Repeat for `02_create_students.sql`
7. Repeat for `03_enable_realtime.sql`

### 4️⃣ Deploy Edge Functions (1 minute)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
supabase functions deploy register-trip
supabase functions deploy city-status
```

**Find your project ref:**
- In Supabase Dashboard → Settings → General
- Look for "Reference ID"

### 5️⃣ Configure Environment Variables (30 seconds)

```bash
# Copy template
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=https://xxxxx.supabase.co/functions/v1
```

**Find these values:**
- Supabase Dashboard → Settings → API
- Copy "Project URL" → paste as `NEXT_PUBLIC_SUPABASE_URL`
- Copy "anon public" key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Functions URL is your Project URL + `/functions/v1`

### 6️⃣ Run the App! (10 seconds)

```bash
npm run dev
```

Open http://localhost:3000 🎉

## Verify It's Working

### Test 1: City Cards Should Load
- You should see 4 cities (Bangkok, Chiang Mai, Phuket, Pattaya)
- Each should show quota and remaining slots

### Test 2: Register a Student
1. Click on any city card
2. Fill in the form:
   - Student ID: `12345`
   - Name: `Test`
   - Surname: `Student`
   - Class: `M5`
   - Class No: `1`
3. Click "Register for Trip"
4. Should see success message!

### Test 3: Real-Time Updates
1. Open the site in two browser windows
2. Register a student in one window
3. Watch the quota update in the other window immediately! ⚡

## Troubleshooting

### Can't see cities?
- Check browser console for errors
- Verify `.env.local` has correct values
- Make sure migrations ran successfully

### Registration fails?
- Check Edge Functions are deployed: `supabase functions list`
- View function logs: `supabase functions logs register-trip`
- Ensure Realtime is enabled in Supabase settings

### Real-time not working?
1. Supabase Dashboard → Settings → API → Enable Realtime
2. Run migration `03_enable_realtime.sql`
3. Refresh your browser

## What's Next?

✅ Customize cities in `01_create_cities.sql`  
✅ Modify styling in `app/page.tsx`  
✅ Deploy to Vercel (see README.md)  
✅ Add authentication (optional)  
✅ Export registrations to CSV

## Need Help?

📖 See full `README.md` for detailed documentation  
🐛 Check GitHub Issues for common problems  
💬 Ask questions in Discussions

---

**Setup time:** ~5 minutes  
**Difficulty:** Beginner-friendly  
**Cost:** $0 (free tier)
