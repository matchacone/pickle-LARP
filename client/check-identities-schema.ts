import { db } from './lib/db/index.js';
import { sql } from 'drizzle-orm';

async function run() {
  const identities = await db.execute(sql`SELECT * FROM auth.identities LIMIT 1`);
  console.log(identities);
  process.exit(0);
}

run();
