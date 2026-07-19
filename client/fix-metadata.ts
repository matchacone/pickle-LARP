import { db } from './lib/db/index.js';
import { sql } from 'drizzle-orm';

async function run() {
  console.log('Fixing raw_user_meta_data...');
  
  await db.execute(sql`
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_build_object(
      'sub', id::text,
      'email', email,
      'username', raw_user_meta_data->>'username',
      'email_verified', true,
      'phone_verified', false
    )
    WHERE email IN ('pickleall.owner@gmail.com', 'pickleall.admin@gmail.com')
  `);
  
  console.log('Done!');
  process.exit(0);
}

run();
