import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!)

async function setup() {
  try {
    // Create bucket
    await sql`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('court_images', 'court_images', true)
      ON CONFLICT (id) DO NOTHING;
    `
    console.log('Bucket created')

    // Create INSERT policy
    try {
      await sql`
        CREATE POLICY "Allow authenticated users to upload court images"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK ( bucket_id = 'court_images' );
      `
      console.log('INSERT policy created')
    } catch (e: any) {
      console.log('INSERT policy might exist:', e.message)
    }

    // Create SELECT policy (Public can read)
    try {
      await sql`
        CREATE POLICY "Allow public read access to court images"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'court_images' );
      `
      console.log('SELECT policy created')
    } catch (e: any) {
      console.log('SELECT policy might exist:', e.message)
    }

    // Create DELETE policy (Authenticated users can delete)
    try {
      await sql`
        CREATE POLICY "Allow authenticated users to delete court images"
        ON storage.objects FOR DELETE
        TO authenticated
        USING ( bucket_id = 'court_images' );
      `
      console.log('DELETE policy created')
    } catch (e: any) {
      console.log('DELETE policy might exist:', e.message)
    }

  } catch (e) {
    console.error('Error:', e)
  }
  process.exit(0)
}

setup()
