import { Client } from 'pg';

const connectionString = 'postgresql://kittypaw_user:kittypaw_password@localhost:5432/kittypaw_db';

const client = new Client({
  connectionString: connectionString,
});

async function manageTestUser() {
  try {
    await client.connect();
    console.log('Connected to the database successfully!');

    const res = await client.query('SELECT * FROM users');
    console.log('Existing users:', res.rows);

    const testUser = res.rows.find(u => u.id === 1);

    if (!testUser) {
      console.log('Test user with id 1 not found. Creating it...');
      await client.query(
        "INSERT INTO users (id, name, householdId, email) VALUES (1, 'Usuario Test', 1, 'test@kittypaw.com') ON CONFLICT (id) DO NOTHING;"
      );
      console.log('Test user created.');
    } else {
      console.log('Test user with id 1 already exists.');
    }

    await client.end();
  } catch (err) {
    console.error('Error during database operation:', err);
    process.exit(1);
  }
}

manageTestUser();