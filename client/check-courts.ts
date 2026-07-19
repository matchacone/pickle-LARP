import { db } from './lib/db/index.js';
import { sql } from 'drizzle-orm';

async function run() {
  const courts = await db.execute(sql`SELECT * FROM court`);
  console.log('Courts:', courts);
  
  const owner = await db.execute(sql`SELECT id FROM auth.users WHERE email = 'pickleall.owner@gmail.com'`);
  console.log('Owner User ID:', owner);
  
  const ownerProfile = await db.execute(sql`SELECT * FROM profiles WHERE id = ${owner[0]?.id}`);
  console.log('Owner Profile:', ownerProfile);
  
  process.exit(0);
}

run();
