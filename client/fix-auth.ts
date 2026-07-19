import { createClient } from '@supabase/supabase-js';
import { db } from './lib/db/index.js';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

async function run() {
  console.log('Generating pristine password hashes via Supabase Auth...');
  
  // 1. Sign up temporary users to get perfectly formatted password hashes and metadata
  const emails = ['temp2.owner@gmail.com', 'temp2.admin@gmail.com', 'temp2.testuser@gmail.com'];
  const targets = ['pickleall.owner@gmail.com', 'pickleall.admin@gmail.com', 'pickleall.testuser@gmail.com'];
  
  for (let i = 0; i < emails.length; i++) {
    const tempEmail = emails[i];
    const targetEmail = targets[i];
    
    console.log(`Signing up ${tempEmail}...`);
    const { data: { user }, error } = await supabase.auth.signUp({
      email: tempEmail,
      password: 'password'
    });
    
    if (error || !user) {
      console.error('Failed to sign up:', error);
      continue;
    }
    
    // 2. Extract the pristine encrypted_password and instance_id etc from the database
    const [pristineUser] = await db.execute(sql`
      SELECT encrypted_password, instance_id, aud, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
      FROM auth.users
      WHERE id = ${user.id}
    `);
    
    if (!pristineUser) continue;
    
    // 3. Apply these exact fields to our seeded users
    console.log(`Applying pristine fields to ${targetEmail}...`);
    await db.execute(sql`
      UPDATE auth.users
      SET 
        encrypted_password = ${pristineUser.encrypted_password},
        instance_id = ${pristineUser.instance_id},
        aud = ${pristineUser.aud},
        raw_app_meta_data = ${JSON.stringify(pristineUser.raw_app_meta_data)},
        raw_user_meta_data = jsonb_build_object(
          'sub', id::text,
          'email', email,
          'username', raw_user_meta_data->>'username',
          'email_verified', true,
          'phone_verified', false
        ),
        is_sso_user = ${pristineUser.is_sso_user},
        is_anonymous = ${pristineUser.is_anonymous},
        email_confirmed_at = now()
      WHERE email = ${targetEmail}
    `);
    
    // 4. Delete the temp user
    await db.execute(sql`DELETE FROM auth.users WHERE id = ${user.id}`);
  }
  
  console.log('Done fixing users!');
  process.exit(0);
}

run().catch(console.error);
