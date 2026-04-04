const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const impackPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'impack_db',
  password: 'root',
  port: 5432,
});

async function run() {
  try {
    const hashedPassword = await bcrypt.hash('Phoenix786', 10);
    
    // Step 1: Drop the old constraint to allow 'super_admin'
    await impackPool.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;`);
    await impackPool.query(`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('super_admin', 'admin', 'user'));`);
    
    // Step 2: Insert the superadmin user
    const res = await impackPool.query(`SELECT * FROM users WHERE email='superadmin@phoenic-pack.com'`);
    if (res.rows.length === 0) {
      await impackPool.query(`
        INSERT INTO users (name, email, password, role, status, login_count, company_access)
        VALUES ('Super Administrator', 'superadmin@phoenic-pack.com', $1, 'super_admin', 'active', 0, '{}')
      `, [hashedPassword]);
      console.log('Successfully inserted super_admin into impack_db.');
    } else {
      console.log('super_admin already exists in impack_db!');
    }
  } catch (e) {
    console.error('Error inserting super_admin:', e.message);
  } finally {
    impackPool.end();
  }
}

run();
