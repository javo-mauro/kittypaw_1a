
import { Client } from 'pg';

const client = new Client({
  user: 'kittypaw_user',
  host: 'localhost',
  database: 'kittypaw_db',
  password: 'kittypaw_password',
  port: 5432,
});

async function createTestUser() {
  try {
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name VARCHAR(255),
        username VARCHAR(255) NOT NULL,
        household_id INTEGER,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        role VARCHAR(50),
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      INSERT INTO users (id, name, username, household_id, email, password, role)
      VALUES (1, 'Usuario Test', 'usertest', 1, 'test@kittypaw.com', '123456', 'carer')
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Test user created successfully!');
    await client.end();
  } catch (err) {
    console.error('Error creating test user:', err);
    process.exit(1);
  }
}

createTestUser();
