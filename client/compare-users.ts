import { db } from './lib/db/index.js';
import { sql } from 'drizzle-orm';

async function run() {
  const [pristine] = await db.execute(sql`SELECT * FROM auth.users WHERE email = 'jb.machacon@gmail.com'`);
  const [seeded] = await db.execute(sql`SELECT * FROM auth.users WHERE email = 'pickleall.owner@gmail.com'`);
  
  const differences = [];
  for (const key in pristine) {
    if (key === 'id' || key === 'email' || key === 'created_at' || key === 'updated_at' || key === 'encrypted_password' || key === 'raw_user_meta_data' || key === 'last_sign_in_at' || key === 'confirmed_at' || key === 'email_confirmed_at' || key === 'identity_data' || key === 'provider_id' || key === 'user_id' || key === 'confirmation_token' || key === 'recovery_token' || key === 'email_change_token_new' || key === 'email_change' || key === 'phone' || key === 'phone_confirmed_at' || key === 'phone_change' || key === 'phone_change_token' || key === 'email_change_token_current' || key === 'email_change_confirm_status' || key === 'banned_until' || key === 'reauthentication_token' || key === 'reauthentication_sent_at' || key === 'is_super_admin' || key === 'deleted_at') {
      continue; // Ignore unique/timestamp fields
    }
    
    const pVal = JSON.stringify(pristine[key]);
    const sVal = JSON.stringify(seeded[key]);
    if (pVal !== sVal) {
      differences.push({ key, pristine: pVal, seeded: sVal });
    }
  }
  
  console.log(differences);
  process.exit(0);
}

run();
