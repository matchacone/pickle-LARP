import { db } from './lib/db/index.js';
import { sql } from 'drizzle-orm';

async function run() {
  console.log('Inserting into auth.identities...');
  
  const emails = ['pickleall.owner@gmail.com', 'pickleall.admin@gmail.com', 'pickleall.testuser@gmail.com'];
  
  for (const email of emails) {
    const [user] = await db.execute(sql`SELECT id, raw_user_meta_data FROM auth.users WHERE email = ${email}`);
    if (!user) continue;
    
    // Check if identity exists
    const [existing] = await db.execute(sql`SELECT id FROM auth.identities WHERE user_id = ${user.id}`);
    if (existing) {
      console.log(`Identity exists for ${email}`);
      continue;
    }
    
    await db.execute(sql`
      INSERT INTO auth.identities (
        id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        ${user.id},
        ${user.id},
        ${JSON.stringify(user.raw_user_meta_data)},
        'email',
        now(),
        now(),
        now()
      )
    `);
    console.log(`Inserted identity for ${email}`);
  }
  
  console.log('Done!');
  process.exit(0);
}

run();
