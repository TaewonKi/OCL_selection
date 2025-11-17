#!/bin/bash

# Trip Registration Setup Script
# This script helps you set up the project quickly

echo "🌏 Trip Registration System - Setup Script"
echo "==========================================="
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "✅ .env.local already exists"
else
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your Supabase credentials"
    echo ""
fi

# Check if node_modules exists
if [ -d node_modules ]; then
    echo "✅ Dependencies already installed"
else
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo ""
echo "1. Create a Supabase project at https://supabase.com"
echo ""
echo "2. Run the database migrations:"
echo "   - Go to Supabase Dashboard → SQL Editor"
echo "   - Run supabase/migrations/01_create_cities.sql"
echo "   - Run supabase/migrations/02_create_students.sql"
echo "   - Run supabase/migrations/03_enable_realtime.sql"
echo ""
echo "3. Deploy Edge Functions:"
echo "   supabase login"
echo "   supabase link --project-ref your-project-ref"
echo "   supabase functions deploy register-trip"
echo "   supabase functions deploy city-status"
echo ""
echo "4. Update .env.local with your Supabase credentials:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL"
echo ""
echo "5. Run the development server:"
echo "   npm run dev"
echo ""
echo "📚 For detailed instructions, see README.md"
echo ""
