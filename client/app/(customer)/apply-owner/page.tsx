'use client'

import { useState, useTransition } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { UploadCloud, CheckCircle, Store, MapPin, Phone, FileText } from 'lucide-react'

export default function ApplyOwnerPage() {
  const [businessName, setBusinessName] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [location, setLocation] = useState('')
  
  const [permitFile, setPermitFile] = useState<File | null>(null)
  const [idFile, setIdFile] = useState<File | null>(null)
  const [courtFile, setCourtFile] = useState<File | null>(null)
  const [lobbyFile, setLobbyFile] = useState<File | null>(null)
  
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const toast = useToast()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const ext = file.name.split('.').pop()
    const filename = `${folder}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${ext}`
    
    const { data, error } = await supabase.storage
      .from('owner_applications')
      .upload(filename, file)
      
    if (error) throw error
    return data.path
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!permitFile || !idFile || !courtFile || !lobbyFile) {
      toast('Missing Files', 'Please upload all required documents.', 'error')
      return
    }

    startTransition(async () => {
      try {
        // Upload all files concurrently
        const [permitUrl, idUrl, courtPicUrl, lobbyPicUrl] = await Promise.all([
          uploadFile(permitFile, 'permits'),
          uploadFile(idFile, 'ids'),
          uploadFile(courtFile, 'courts'),
          uploadFile(lobbyFile, 'lobbies'),
        ])

        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName,
            contactNumber,
            location,
            permitUrl,
            idUrl,
            courtPicUrl,
            lobbyPicUrl,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to submit application')
        }

        toast('Application Submitted!', 'We will review your application shortly.', 'success')
        router.push('/dashboard')
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        toast('Submission Failed', msg, 'error')
      }
    })
  }

  return (
    <div className="min-h-screen bg-surface-low py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black text-asphalt tracking-tight">Partner with Pick-All</h1>
          <p className="mt-4 text-lg text-on-surface-variant max-w-2xl mx-auto">
            List your courts on our platform and reach thousands of players. Submit your facility details and verification documents to get started.
          </p>
        </div>

        <div className="card p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b border-outline pb-2">Business Details</h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold">Business/Facility Name</label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                    <input
                      required
                      type="text"
                      className="input pl-10 w-full"
                      placeholder="e.g. Rally Pickleball Club"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                    <input
                      required
                      type="tel"
                      className="input pl-10 w-full"
                      placeholder="+63 900 000 0000"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Full Address / Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                    <input
                      required
                      type="text"
                      className="input pl-10 w-full"
                      placeholder="e.g. 123 BGC Avenue, Taguig"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b border-outline pb-2">Verification Documents</h2>
              <p className="text-sm text-on-surface-variant">We require these documents to verify your business and ensure quality listings.</p>
              
              <div className="grid gap-6 md:grid-cols-2">
                {/* Business Permit */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex justify-between">
                    Business Permit (PDF)
                    {permitFile && <CheckCircle size={16} className="text-green-500" />}
                  </label>
                  <div className="border-2 border-dashed border-outline rounded-xl p-4 text-center hover:bg-surface transition-colors relative">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setPermitFile(e.target.files?.[0] || null)}
                    />
                    <FileText className="mx-auto text-on-surface-variant mb-2" size={24} />
                    <p className="text-sm font-medium text-primary">
                      {permitFile ? permitFile.name : 'Click to upload PDF'}
                    </p>
                  </div>
                </div>

                {/* Valid ID */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex justify-between">
                    Owner Valid ID (PDF)
                    {idFile && <CheckCircle size={16} className="text-green-500" />}
                  </label>
                  <div className="border-2 border-dashed border-outline rounded-xl p-4 text-center hover:bg-surface transition-colors relative">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                    />
                    <FileText className="mx-auto text-on-surface-variant mb-2" size={24} />
                    <p className="text-sm font-medium text-primary">
                      {idFile ? idFile.name : 'Click to upload PDF'}
                    </p>
                  </div>
                </div>

                {/* Court Photo */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex justify-between">
                    Court Photo (JPG/PNG)
                    {courtFile && <CheckCircle size={16} className="text-green-500" />}
                  </label>
                  <div className="border-2 border-dashed border-outline rounded-xl p-4 text-center hover:bg-surface transition-colors relative">
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png" 
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setCourtFile(e.target.files?.[0] || null)}
                    />
                    <UploadCloud className="mx-auto text-on-surface-variant mb-2" size={24} />
                    <p className="text-sm font-medium text-primary">
                      {courtFile ? courtFile.name : 'Click to upload Image'}
                    </p>
                  </div>
                </div>

                {/* Lobby Photo */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex justify-between">
                    Lobby/Facility Photo (JPG/PNG)
                    {lobbyFile && <CheckCircle size={16} className="text-green-500" />}
                  </label>
                  <div className="border-2 border-dashed border-outline rounded-xl p-4 text-center hover:bg-surface transition-colors relative">
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png" 
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setLobbyFile(e.target.files?.[0] || null)}
                    />
                    <UploadCloud className="mx-auto text-on-surface-variant mb-2" size={24} />
                    <p className="text-sm font-medium text-primary">
                      {lobbyFile ? lobbyFile.name : 'Click to upload Image'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                className="btn btn-primary w-full py-4 text-lg"
                disabled={isPending}
              >
                {isPending ? 'Uploading & Submitting...' : 'Submit Application'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  )
}
