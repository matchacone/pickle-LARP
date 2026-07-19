import { db } from './lib/db/index.js';
import { sql } from 'drizzle-orm';

async function run() {
  console.log('Updating password hashes to cost 10...');
  await db.execute(sql`
    UPDATE auth.users 
    SET encrypted_password = crypt('password', gen_salt('bf', 10))
    WHERE email IN ('pickleall.owner@gmail.com', 'pickleall.admin@gmail.com', 'pickleall.testuser@gmail.com')
  `);
  console.log('Done!');
  process.exit(0);
}

run();
