import { db } from './lib/db/index.js';
import { sql } from 'drizzle-orm';

async function run() {
  const [testuser] = await db.execute(sql`SELECT * FROM auth.users WHERE email = 'pickleall.testuser@gmail.com'`);
  const [owner] = await db.execute(sql`SELECT * FROM auth.users WHERE email = 'pickleall.owner@gmail.com'`);
  
  const differences = [];
  for (const key in testuser) {
    if (key === 'id' || key === 'email' || key === 'created_at' || key === 'updated_at' || key === 'last_sign_in_at') {
      continue;
    }
    
    const tVal = JSON.stringify(testuser[key]);
    const oVal = JSON.stringify(owner[key]);
    if (tVal !== oVal) {
      differences.push({ key, testuser: tVal, owner: oVal });
    }
  }
  
  console.log(differences);
  process.exit(0);
}

run();
