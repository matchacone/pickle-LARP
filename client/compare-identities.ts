import { db } from './lib/db/index.js';
import { sql } from 'drizzle-orm';

async function run() {
  const [testuserIdentity] = await db.execute(sql`SELECT * FROM auth.identities WHERE email = 'pickleall.testuser@gmail.com'`);
  const [ownerIdentity] = await db.execute(sql`SELECT * FROM auth.identities WHERE email = 'pickleall.owner@gmail.com'`);
  
  console.log('Testuser:', testuserIdentity);
  console.log('Owner:', ownerIdentity);
  process.exit(0);
}

run();
