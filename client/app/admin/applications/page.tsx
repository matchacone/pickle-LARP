import { db } from '@/lib/db'
import { ownerApplication, profiles } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { createServerClient } from '@/lib/supabase/server'
import ApplicationsClient, { ApplicationData } from './ClientPage'

export const dynamic = 'force-dynamic'

export default async function ApplicationsPage() {
  const supabase = await createServerClient()
  
  const rawApps = await db
    .select({
      id: ownerApplication.id,
      businessName: ownerApplication.businessName,
      contactNumber: ownerApplication.contactNumber,
      location: ownerApplication.location,
      status: ownerApplication.status,
      permitUrl: ownerApplication.permitUrl,
      idUrl: ownerApplication.idUrl,
      courtPicUrl: ownerApplication.courtPicUrl,
      lobbyPicUrl: ownerApplication.lobbyPicUrl,
      createdAt: ownerApplication.createdAt,
      applicantName: profiles.username,
      applicantEmail: profiles.id, // we don't store email in profiles, so we'll fetch it from auth if needed or just use username. Wait, auth.users has email. For now we use id to lookup email or just show username.
    })
    .from(ownerApplication)
    .innerJoin(profiles, eq(ownerApplication.userId, profiles.id))
    .orderBy(desc(ownerApplication.createdAt))

  // Fetch emails from auth layer (only works if admin has service key, but for now we'll just show username)
  // Actually, we can generate signed URLs for the attachments
  
  const applications: ApplicationData[] = await Promise.all(
    rawApps.map(async (app) => {
      // Helper to generate signed url (expires in 1 hour)
      const getSignedUrl = async (path: string) => {
        const { data } = await supabase.storage.from('owner_applications').createSignedUrl(path, 3600)
        return data?.signedUrl ?? '#'
      }

      return {
        id: app.id,
        businessName: app.businessName,
        applicant: app.applicantName,
        email: app.applicantName + '@example.com', // Placeholder since email is in auth.users
        phone: app.contactNumber,
        location: app.location,
        status: app.status,
        date: new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(new Date(app.createdAt)),
        docs: [
          { name: 'Business Permit', url: await getSignedUrl(app.permitUrl) },
          { name: 'Owner ID', url: await getSignedUrl(app.idUrl) }
        ],
        photos: [
          { name: 'Court Photo', url: await getSignedUrl(app.courtPicUrl) },
          { name: 'Lobby Photo', url: await getSignedUrl(app.lobbyPicUrl) }
        ]
      }
    })
  )

  return <ApplicationsClient initialApplications={applications} />
}
