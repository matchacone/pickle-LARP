import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function testLogin() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  console.log('Testing login for owner account...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'pickleall.admin@gmail.com',
    password: 'password'
  });
  
  if (error) {
    console.error('Login Failed:', error);
    console.error('Error stringified:', JSON.stringify(error));
  } else {
    console.log('Login Succeeded for:', data.user?.email);
  }
}

testLogin();
