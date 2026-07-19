import { db } from './lib/db/index.js';
import { sql } from 'drizzle-orm';

async function run() {
  console.log('Fixing null tokens...');
  await db.execute(sql`
    UPDATE auth.users 
    SET 
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change = ''
    WHERE email IN ('pickleall.owner@gmail.com', 'pickleall.admin@gmail.com')
  `);
  console.log('Done!');
  process.exit(0);
}

run();
