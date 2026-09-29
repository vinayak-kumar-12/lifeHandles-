const { query } = require("./db");

async function initDB() {
  try {
    // 1. Core Users Table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        profile_image VARCHAR(500),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS pincode VARCHAR(20);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500);

      CREATE TABLE IF NOT EXISTS email_verification_otps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        otp_hash VARCHAR(255) NOT NULL,
        attempts INT DEFAULT 0,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        revoked_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(100) DEFAULT 'construct-outline',
        price DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        task_id VARCHAR(100),
        title VARCHAR(255),
        category VARCHAR(100),
        description TEXT,
        icon VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Scheduled',
        scheduled_date VARCHAR(100),
        scheduled_time VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Insert default tasks if empty
    const res = await query("SELECT COUNT(*) FROM tasks");
    if (parseInt(res.rows[0].count, 10) === 0) {
      await query(`
        INSERT INTO tasks (id, title, category, description, icon, price) VALUES
        ('plumbing-1', 'Pipe Leak Repair', 'Plumbing', 'Fix leaking pipes, taps, and drain blockages.', 'water-outline', 499),
        ('electrical-1', 'Switchboard Repair', 'Electrical', 'Repair or replace faulty electrical switchboards and wiring.', 'flash-outline', 299),
        ('cleaning-1', 'Home Deep Cleaning', 'Cleaning', 'Complete deep cleaning of living room, kitchen, and bathrooms.', 'sparkles-outline', 1499),
        ('appliance-1', 'AC Service & Repair', 'Appliance', 'Comprehensive AC servicing, gas check, and cooling fix.', 'snow-outline', 799),
        ('carpentry-1', 'Furniture Assembly', 'Carpentry', 'Assemble tables, beds, wardrobes, and wooden fixtures.', 'hammer-outline', 599),
        ('painting-1', 'Wall Touch-up & Painting', 'Painting', 'Interior wall painting, touch-ups, and waterproof coating.', 'color-palette-outline', 1999);
      `);
    }
    console.log("✅ PostgreSQL schema updated & default tasks seeded.");
  } catch (error) {
    console.error("❌ DB init error:", error);
  }
}

module.exports = initDB;
