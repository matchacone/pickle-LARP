import { db } from './lib/db/index.js';
import { sql } from 'drizzle-orm';

async function run() {
  const users = await db.execute(sql`SELECT email, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous, encrypted_password FROM auth.users`);
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}

run();
