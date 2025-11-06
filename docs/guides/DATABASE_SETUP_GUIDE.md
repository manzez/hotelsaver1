# 🗄️ Database Setup Guide - Neon PostgreSQL

## Step 1: Create Neon Database Account

1. Go to **https://console.neon.tech/**
2. Sign up with GitHub or Google (free tier available)
3. Create a new project called "hotelsaver-db"

## Step 2: Get Database Connection String

After creating the project:
1. Go to **Dashboard** → **Connection Details**
2. Select **"Pooled connection"** (recommended for serverless)
3. Copy the connection string that looks like:
   ```
   postgresql://username:password@ep-xxxxx-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## Step 3: Update .env File

Replace this line in your `.env` file:
```bash
# Replace this:
DATABASE_URL="postgresql://hotelsaver_user:your_password@localhost:5432/hotelsaver_db?schema=public"

# With your actual Neon connection string:
DATABASE_URL="postgresql://your_actual_neon_connection_string_here"
```

## Step 4: Test Database Connection

Once you have Node.js working in terminal:
```bash
# Test Prisma connection
npx prisma db push

# Generate Prisma client
npx prisma generate

# Open Prisma Studio to verify
npx prisma studio
```

## Alternative: Local PostgreSQL Setup

If you prefer local development:

### Option A: PostgreSQL on Windows
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Create database: `hotelsaver_db`
4. Use connection string in .env as currently set

### Option B: Docker PostgreSQL
```bash
# Run PostgreSQL in Docker
docker run --name hotelsaver-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=hotelsaver_db -p 5432:5432 -d postgres:15

# Connection string:
DATABASE_URL="postgresql://postgres:password@localhost:5432/hotelsaver_db?schema=public"
```

## Next Steps After Database Setup

1. **Configure .env** - Update DATABASE_URL with real connection
2. **Run migrations** - `npx prisma db push`
3. **Test connection** - `npx prisma studio`
4. **Switch to database mode** - Change `DATA_SOURCE="db"` in .env
5. **Run hotel migration** - Execute the migration script to populate hotels

---

**Recommendation:** Use Neon for production-ready setup. It's free, serverless, and handles connection pooling automatically.