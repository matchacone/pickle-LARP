import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!)

async function setup() {
  try {
    // Create bucket
    await sql`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('owner_applications', 'owner_applications', false)
      ON CONFLICT (id) DO NOTHING;
    `
    console.log('Bucket created')

    // Create INSERT policy
    try {
      await sql`
        CREATE POLICY "Allow authenticated users to upload owner applications"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK ( bucket_id = 'owner_applications' );
      `
      console.log('INSERT policy created')
    } catch (e: any) {
      console.log('INSERT policy might exist:', e.message)
    }

    // Create SELECT policy
    try {
      await sql`
        CREATE POLICY "Allow authenticated users to read owner applications"
        ON storage.objects FOR SELECT
        TO authenticated
        USING ( bucket_id = 'owner_applications' );
      `
      console.log('SELECT policy created')
    } catch (e: any) {
      console.log('SELECT policy might exist:', e.message)
    }
  } catch (e) {
    console.error('Error:', e)
  }
  process.exit(0)
}

setup()
