'use client'

import { useState } from 'react'
import { Search, Filter, Shield, Eye, X, AlertOctagon } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

export default function ReportsPage() {
  const toast = useToast()
  
  const [reports] = useState([
    { id: 'rpt_1042', reporter: 'Diana Prince', offender: 'User usr_009', category: 'Harassment', date: '2026-07-03', status: 'Pending', details: 'User was sending abusive messages in the booking chat.' },
    { id: 'rpt_1041', reporter: 'Bob Jones', offender: 'Court crt_88', category: 'False Info', date: '2026-07-02', status: 'In Review', details: 'Court description says indoor but photos clearly show it is outdoors.' },
    { id: 'rpt_1040', reporter: 'Alice Smith', offender: 'Review rev_55', category: 'Spam', date: '2026-07-01', status: 'Resolved', details: 'Review contains links to external shady websites.' },
  ])

  const [selectedReport, setSelectedReport] = useState<any>(null)

  const handleAction = (action: string) => {
    toast(`Action: ${action}`, `Successfully processed report ${selectedReport?.id}`, 'success')
    setSelectedReport(null)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">User Reports</h1>
          <p className="text-on-surface-variant text-sm mt-1">Moderation queue for platform safety and disputes.</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-low/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input 
              type="text" 
              placeholder="Search reports..." 
              className="input py-2 pl-9 w-full bg-surface"
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <select className="input py-2 bg-surface appearance-none pr-8 cursor-pointer">
                <option value="">All Categories</option>
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="false_info">False Info</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={14} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-low border-b border-outline">
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Report ID</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Reporter</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Offender/Content</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Category</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-surface-low/50 transition-colors">
                  <td className="p-4 text-sm font-mono text-on-surface-variant">{report.id}</td>
                  <td className="p-4 text-sm font-semibold">{report.reporter}</td>
                  <td className="p-4 text-sm font-medium">{report.offender}</td>
                  <td className="p-4">
                    <span className="badge bg-surface-dim text-on-surface">
                      {report.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium">{report.date}</td>
                  <td className="p-4">
                    <span className={`badge ${
                      report.status === 'Pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      report.status === 'In Review' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => setSelectedReport(report)} className="btn btn-outline py-1 px-3 text-xs bg-surface border-outline hover:border-asphalt">
                      <Eye size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-asphalt/50 backdrop-blur-sm" onClick={() => setSelectedReport(null)}></div>
          
          <div className="relative w-full max-w-md bg-surface h-full shadow-lift animate-slide-from-right flex flex-col border-l border-outline overflow-y-auto">
            <div className="p-6 border-b border-outline flex justify-between items-center bg-surface-low sticky top-0">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <AlertOctagon className="text-alert-pink" /> 
                Report Details
              </h2>
              <button onClick={() => setSelectedReport(null)} className="p-2 text-on-surface-variant hover:bg-surface-dim rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex-1 space-y-6">
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Report ID</p>
                <p className="font-mono text-sm">{selectedReport.id}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Status</p>
                <span className="badge bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">{selectedReport.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Reporter</p>
                  <p className="font-semibold">{selectedReport.reporter}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Date</p>
                  <p className="font-medium">{selectedReport.date}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Offending Target</p>
                <p className="font-semibold p-3 bg-surface-low rounded-md border border-outline">{selectedReport.offender}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Category</p>
                <p className="font-medium">{selectedReport.category}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Description / Evidence</p>
                <p className="text-sm leading-relaxed p-4 bg-surface-low rounded-md border border-outline">
                  "{selectedReport.details}"
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-outline bg-surface sticky bottom-0 flex flex-col gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
              <button onClick={() => handleAction('Issue Warning')} className="btn btn-outline w-full justify-center text-orange-600 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                <Shield size={16} /> Issue Warning
              </button>
              <button onClick={() => handleAction('Suspend Offender')} className="btn btn-primary w-full justify-center bg-red-600 hover:bg-red-700 text-white border-transparent">
                Suspend Offender
              </button>
              <button onClick={() => handleAction('Dismiss Report')} className="btn btn-ghost w-full justify-center mt-2">
                Dismiss Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
