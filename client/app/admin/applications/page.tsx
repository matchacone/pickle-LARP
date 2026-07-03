'use client'

import { useState } from 'react'
import { Search, Eye, X, Check, FileText, Image as ImageIcon, MapPin, Mail, Phone, XCircle, UserCircle } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

export default function ApplicationsPage() {
  const toast = useToast()
  
  const [applications] = useState([
    { id: 'app_501', businessName: 'Rally Pickleball Club', applicant: 'John Doe', date: '2026-07-03', status: 'Pending', location: '123 Main St, Metro Manila', email: 'john@rallyclub.ph', phone: '+63 912 345 6789', docs: ['Business Permit', 'ID'], photos: ['Court 1', 'Lobby'] },
    { id: 'app_502', businessName: 'Smash Haven', applicant: 'Jane Smith', date: '2026-07-01', status: 'In Review', location: '45 BGC Avenue, Taguig', email: 'jane@smashhaven.com', phone: '+63 998 765 4321', docs: ['Business Permit'], photos: ['Main View'] },
  ])

  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)

  const handleApprove = () => {
    toast('Application Approved', `Successfully approved ${selectedApp.businessName}. They can now list their courts.`, 'success')
    setSelectedApp(null)
  }

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast('Missing Reason', 'Please provide a reason for rejection to send to the applicant.', 'error')
      return
    }
    toast('Application Rejected', `Rejection email sent to ${selectedApp.applicant}.`, 'info')
    setSelectedApp(null)
    setIsRejecting(false)
    setRejectReason('')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Business Applications</h1>
        <p className="text-on-surface-variant text-sm mt-1">Review queue for court owners applying to list their venues.</p>
      </div>

      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-low/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input 
              type="text" 
              placeholder="Search applications..." 
              className="input py-2 pl-9 w-full bg-surface"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-low border-b border-outline">
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Business Name</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Applicant</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Submitted</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-surface-low/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-sm">{app.businessName}</p>
                    <p className="text-xs text-on-surface-variant font-mono mt-0.5">{app.id}</p>
                  </td>
                  <td className="p-4 text-sm font-semibold">{app.applicant}</td>
                  <td className="p-4 text-sm font-medium">{app.date}</td>
                  <td className="p-4">
                    <span className={`badge ${
                      app.status === 'Pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      app.status === 'In Review' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-surface-dim text-on-surface'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => setSelectedApp(app)} className="btn btn-primary py-1.5 px-4 text-xs">
                      <Eye size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide Panel Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-asphalt/50 backdrop-blur-sm" onClick={() => { setSelectedApp(null); setIsRejecting(false); setRejectReason(''); }}></div>
          
          <div className="relative w-full max-w-lg bg-surface h-full shadow-lift animate-slide-from-right flex flex-col border-l border-outline overflow-y-auto">
            <div className="p-6 border-b border-outline flex justify-between items-center bg-surface-low sticky top-0 z-10">
              <h2 className="text-xl font-bold">Review Application</h2>
              <button onClick={() => { setSelectedApp(null); setIsRejecting(false); setRejectReason(''); }} className="p-2 text-on-surface-variant hover:bg-surface-dim rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex-1 space-y-8">
              {/* Header Info */}
              <div>
                <h3 className="text-2xl font-black">{selectedApp.businessName}</h3>
                <p className="text-sm text-on-surface-variant font-medium mt-1">Application ID: {selectedApp.id}</p>
              </div>

              {/* Applicant Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline pb-2">Applicant Info</h4>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-surface-low flex items-center justify-center text-on-surface-variant"><UserCircle size={16} /></div>
                    <span className="font-semibold">{selectedApp.applicant}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-surface-low flex items-center justify-center text-on-surface-variant"><Mail size={16} /></div>
                    <a href={`mailto:${selectedApp.email}`} className="text-primary hover:underline font-medium">{selectedApp.email}</a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-surface-low flex items-center justify-center text-on-surface-variant"><Phone size={16} /></div>
                    <span className="font-medium">{selectedApp.phone}</span>
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline pb-2">Business Details</h4>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-surface-low flex items-center justify-center text-on-surface-variant shrink-0"><MapPin size={16} /></div>
                  <span className="font-medium mt-1.5">{selectedApp.location}</span>
                </div>
              </div>

              {/* Attached Docs */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline pb-2">Verification Documents</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedApp.docs.map((doc: string, idx: number) => (
                    <div key={idx} className="border border-outline rounded-lg p-3 flex flex-col items-center justify-center gap-2 bg-surface-low hover:bg-surface cursor-pointer transition-colors text-center">
                      <FileText size={24} className="text-primary" />
                      <span className="text-xs font-bold">{doc}</span>
                    </div>
                  ))}
                  {selectedApp.photos.map((photo: string, idx: number) => (
                    <div key={idx} className="border border-outline rounded-lg p-3 flex flex-col items-center justify-center gap-2 bg-surface-low hover:bg-surface cursor-pointer transition-colors text-center">
                      <ImageIcon size={24} className="text-blue-500" />
                      <span className="text-xs font-bold">{photo}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="p-6 border-t border-outline bg-surface sticky bottom-0 flex flex-col gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
              {isRejecting ? (
                <div className="space-y-3 animate-fade-up">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Reason for Rejection</label>
                    <textarea 
                      className="input min-h-[100px] resize-none" 
                      placeholder="Explain what is missing or why they are denied. This will be sent to the applicant."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleReject} className="btn bg-red-600 hover:bg-red-700 text-white flex-1">
                      Send Rejection
                    </button>
                    <button onClick={() => setIsRejecting(false)} className="btn btn-outline">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => setIsRejecting(true)} className="btn btn-outline flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <XCircle size={16} /> Reject
                  </button>
                  <button onClick={handleApprove} className="btn btn-primary flex-1 bg-green-600 hover:bg-green-700 text-white border-transparent">
                    <Check size={16} /> Approve & Publish
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
