import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ownerApplication, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/adminAuth'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdmin()
    if (!adminCheck.ok) return adminCheck.response

    const { id } = await params
    const body = await req.json()
    const { status, rejectReason } = body

    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const [application] = await db
      .select()
      .from(ownerApplication)
      .where(eq(ownerApplication.id, id))
      .limit(1)

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Begin a mock transaction using sequential updates for now
    await db
      .update(ownerApplication)
      .set({ status, updatedAt: new Date() })
      .where(eq(ownerApplication.id, id))

    if (status === 'approved') {
      await db
        .update(profiles)
        .set({ role: 'owner', updatedAt: new Date() })
        .where(eq(profiles.id, application.userId))
    }

    // In a real app, send an email to application.userId here using rejectReason if rejected.
    
    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
