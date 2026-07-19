import { db } from './lib/db/index.js';
import { sql } from 'drizzle-orm';

async function run() {
  const identities = await db.execute(sql`SELECT count(*) FROM auth.identities WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pickleall.owner@gmail.com')`);
  console.log(identities);
  process.exit(0);
}

run();
