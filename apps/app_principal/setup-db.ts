
import { Client } from 'pg';

// Connection details for the admin user (postgres)
// We assume the default password for the postgres user is 'postgres'.
// This is common in development environments, especially with Docker.
const adminConnectionString = 'postgresql://postgres:kittypaw_password@localhost:5432/postgres';
const appUser = 'kittypaw_user';
const appPassword = 'kittypaw_password';
const appDb = 'kittypaw_db';

// Connection details for the app user
const appConnectionString = `postgresql://${appUser}:${appPassword}@localhost:5432/${appDb}`;

async function setupDatabase() {
  let adminClient = new Client({ connectionString: adminConnectionString });

  try {
    // Connect as admin
    await adminClient.connect();
    console.log('Connected as admin user (postgres).');

    // Check if the app user exists
    const userRes = await adminClient.query("SELECT 1 FROM pg_roles WHERE rolname=$1", [appUser]);
    if (userRes.rowCount === 0) {
      console.log(`User '${appUser}' does not exist. Creating user...`);
      await adminClient.query(`CREATE USER ${appUser} WITH PASSWORD '${appPassword}'`);
      console.log(`User '${appUser}' created.`);
    } else {
      console.log(`User '${appUser}' already exists. Ensuring password is correct...`);
      await adminClient.query(`ALTER USER ${appUser} WITH PASSWORD '${appPassword}'`);
      console.log(`Password for user '${appUser}' has been set.`);
    }

    // Check if the database exists
    const dbRes = await adminClient.query("SELECT 1 FROM pg_database WHERE datname=$1", [appDb]);
    if (dbRes.rowCount === 0) {
        console.log(`Database '${appDb}' does not exist. Creating database...`);
        await adminClient.query(`CREATE DATABASE ${appDb}`);
        console.log(`Database '${appDb}' created.`);
    } else {
        console.log(`Database '${appDb}' already exists.`);
    }

    // Grant privileges
    await adminClient.query(`GRANT ALL PRIVILEGES ON DATABASE ${appDb} TO ${appUser}`);
    console.log(`Privileges granted to '${appUser}' on database '${appDb}'.`);

    await adminClient.end();
    console.log('Admin client disconnected.');

    // Now, connect as the app user to the app database
    const appClient = new Client({ connectionString: appConnectionString });
    await appClient.connect();
    console.log(`Connected to '${appDb}' as '${appUser}'.`);

    // Create table if it does not exist
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          name VARCHAR(255),
          householdId INTEGER,
          email VARCHAR(255) UNIQUE
      );
    `);
    console.log('Table "users" created or already exists.');

    // Check for test user and create if not present
    const testUserRes = await appClient.query('SELECT * FROM users WHERE id = 1');
    if (testUserRes.rowCount === 0) {
      console.log('Test user with id 1 not found. Creating it...');
      await appClient.query(
        "INSERT INTO users (id, name, householdId, email) VALUES (1, 'Usuario Test', 1, 'test@kittypaw.com');"
      );
      console.log('Test user created.');
    } else {
      console.log('Test user with id 1 already exists.');
    }

    await appClient.end();
    console.log('App client disconnected.');

    console.log('Database setup completed successfully!');

  } catch (err) {
    console.error('Error during database setup:', err);
    // Ensure client is closed on error
    if (adminClient) {
        try {
            await adminClient.end();
        } catch (e) {
            console.error('Error closing admin client:', e);
        }
    }
    process.exit(1);
  }
}

setupDatabase();
