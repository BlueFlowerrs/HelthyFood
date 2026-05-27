const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load .env.local file
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value.trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!supabaseUrl) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL must be defined in .env.local');
  process.exit(1);
}

// Extract project ref from supabase URL: https://[ref].supabase.co
const match = supabaseUrl.match(/https:\/\/([\w-]+)\.supabase\.co/);
if (!match) {
  console.error('Error: Invalid Supabase URL format in NEXT_PUBLIC_SUPABASE_URL');
  process.exit(1);
}
const projectRef = match[1];
const dbHost = 'aws-1-ap-southeast-1.pooler.supabase.com';
const dbUser = `postgres.${projectRef}`;

if (!dbPassword) {
  console.error('\n================================================================');
  console.error('ERROR: SUPABASE_DB_PASSWORD is not defined in .env.local');
  console.error('================================================================');
  console.error('To run migrations automatically, please add the following line to your .env.local:');
  console.error('  SUPABASE_DB_PASSWORD=your_actual_database_password');
  console.error('\nAlternatively, you can manually run the SQL files in your Supabase SQL Editor:');
  console.error('  1. supabase/migrations/0001_initial.sql');
  console.error('  2. supabase/migrations/0002_fix_rls_policies.sql');
  console.error('  3. supabase/migrations/0003_contact_newsletter.sql');
  console.error('================================================================\n');
  process.exit(1);
}

// Check if pg is installed, install it if not
try {
  require.resolve('pg');
} catch (e) {
  console.log('Installing "pg" package for database migration execution...');
  execSync('npm install pg', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
}

const { Client } = require('pg');

const connectionString = `postgresql://${dbUser}:${encodeURIComponent(dbPassword)}@${dbHost}:6543/postgres`;

const migrationFiles = [
  '0001_initial.sql',
  '0002_fix_rls_policies.sql',
  '0003_contact_newsletter.sql'
];

async function run() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  try {
    console.log(`Connecting to database at ${dbHost}...`);
    await client.connect();
    console.log('Connected successfully!');

    console.log('Resetting public schema to ensure clean migration run...');
    await client.query(`
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
      GRANT ALL ON SCHEMA public TO anon, authenticated, service_role;
      
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
    `);
    console.log('Schema reset completed.');

    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, '..', 'supabase', 'migrations', file);
      console.log(`\nExecuting migration: ${file}...`);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Migration file not found: ${filePath}`);
      }
      
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Execute the migration SQL
      await client.query(sql);

      // Grant permissions on newly created objects in the migration
      await client.query(`
        GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
        GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
      `);
      
      console.log(`Migration ${file} executed successfully!`);
    }

    console.log('\n=========================================');
    console.log('ALL MIGRATIONS APPLIED SUCCESSFULLY!');
    console.log('=========================================\n');

  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await client.end();
  }
}

run();
