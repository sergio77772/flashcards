import postgres from 'postgres';

const sql = postgres('postgres://postgres.gcbkploinzodxjlnlcrn:nYz0xtO7M6h8E3Ok@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x');

async function main() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS bolillas (
        id TEXT PRIMARY KEY,
        user_id UUID, -- For future user support
        name TEXT NOT NULL,
        color_idx INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS flashcards (
        id TEXT PRIMARY KEY,
        bolilla_id TEXT REFERENCES bolillas(id) ON DELETE CASCADE,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // Make sure we can insert without auth token for now (since we haven't added login yet)
    await sql`ALTER TABLE bolillas DISABLE ROW LEVEL SECURITY;`;
    await sql`ALTER TABLE flashcards DISABLE ROW LEVEL SECURITY;`;

    // Drop tables if we want a clean slate? No, IF NOT EXISTS is fine.

    console.log("Database tables created successfully!");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

main();
