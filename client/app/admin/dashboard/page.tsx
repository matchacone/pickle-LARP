'use client'

import { Activity, Users, Zap, Clock, AlertTriangle, AlertCircle, Database, CheckCircle } from 'lucide-react'

export default function AdminDashboardPage() {
  const metrics = [
    { title: 'Total Active Users', value: '12,450', change: '+12%', icon: Users, color: 'text-blue-500' },
    { title: 'Daily New Signups', value: '342', change: '+5%', icon: Zap, color: 'text-green-500' },
    { title: 'Server Uptime', value: '99.99%', change: 'Stable', icon: Activity, color: 'text-primary' },
    { title: 'Avg API Response', value: '124ms', change: '-12ms', icon: Clock, color: 'text-orange-500' },
  ]

  const alerts = [
    { id: 1, type: 'error', message: 'Failed to process background job: send_booking_reminders', time: '10 mins ago', icon: AlertCircle },
    { id: 2, type: 'warning', message: 'Database connection pool reached 80% capacity', time: '1 hour ago', icon: Database },
    { id: 3, type: 'error', message: 'Stripe webhook verification failed for event evt_123', time: '2 hours ago', icon: AlertTriangle },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Website Overview</h1>
        <p className="text-on-surface-variant text-sm mt-1">Real-time metrics and system telemetry.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon
          return (
            <div key={i} className="card p-5 flex flex-col gap-4 relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-on-surface-variant">{m.title}</p>
                  <h3 className="text-3xl font-black tracking-tighter mt-1">{m.value}</h3>
                </div>
                <div className={`p-2 rounded-lg bg-surface-low ${m.color}`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="text-xs font-bold text-on-surface-variant">
                <span className={m.change.startsWith('+') ? 'text-green-500' : m.change.startsWith('-') ? 'text-blue-500' : 'text-on-surface-variant'}>
                  {m.change}
                </span>
                {' '}from last month
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Charts Area */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="card p-6 flex flex-col min-h-[320px]">
            <h3 className="text-lg font-bold mb-6">Traffic & API Requests (30 Days)</h3>
            
            {/* CSS Mocked Line Chart */}
            <div className="flex-1 flex items-end justify-between gap-1 mt-auto h-48 border-b border-outline pb-2 relative">
              {/* Y-axis lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[1,2,3,4].map(i => <div key={i} className="w-full h-px bg-outline/50 border-dashed" />)}
              </div>
              
              {/* Mock Bars to simulate line points */}
              {Array.from({ length: 30 }).map((_, i) => {
                const height = 20 + Math.random() * 80; // random height between 20-100%
                return (
                  <div key={i} className="w-full relative group h-full flex items-end">
                    <div 
                      className="w-full bg-primary/40 hover:bg-primary transition-all rounded-t-sm"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-asphalt text-surface text-[10px] py-1 px-2 rounded font-bold pointer-events-none transition-opacity z-10">
                      {Math.floor(height * 100)}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-on-surface-variant mt-2 font-semibold">
              <span>Day 1</span>
              <span>Day 15</span>
              <span>Day 30</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="card p-6 flex flex-col items-center justify-center min-h-[250px]">
              <h3 className="text-lg font-bold mb-6 self-start w-full">Device Usage</h3>
              
              {/* CSS Mocked Pie Chart using conic-gradient */}
              <div className="w-40 h-40 rounded-full relative" 
                   style={{ background: 'conic-gradient(var(--app-primary) 0% 65%, var(--app-outline) 65% 100%)' }}>
                <div className="absolute inset-4 bg-surface rounded-full flex items-center justify-center">
                  <span className="font-bold text-lg">65%</span>
                </div>
              </div>
              
              <div className="flex gap-4 mt-6 text-sm font-semibold text-on-surface-variant w-full justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  Mobile
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-outline"></div>
                  Desktop
                </div>
              </div>
            </div>
            
            <div className="card p-6 flex flex-col min-h-[250px]">
               <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
               <div className="space-y-2 w-full">
                 <button className="btn btn-outline w-full justify-start border-outline text-on-surface">Purge Cache</button>
                 <button className="btn btn-outline w-full justify-start border-outline text-on-surface">Restart Workers</button>
                 <button className="btn btn-outline w-full justify-start border-outline text-on-surface">Export Data Dump</button>
               </div>
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="card p-0 flex flex-col h-full">
          <div className="p-5 border-b border-outline">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="text-orange-500" size={20} />
              System Alerts
            </h3>
          </div>
          <div className="divide-y divide-outline flex-1">
            {alerts.map((alert) => {
              const Icon = alert.icon
              return (
                <div key={alert.id} className="p-5 hover:bg-surface-low transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <Icon 
                      className={`shrink-0 mt-0.5 ${alert.type === 'error' ? 'text-red-500' : 'text-orange-500'}`} 
                      size={18} 
                    />
                    <div>
                      <p className="text-sm font-semibold leading-snug">{alert.message}</p>
                      <span className="text-xs text-on-surface-variant font-medium mt-1 inline-block">{alert.time}</span>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {alerts.length === 0 && (
              <div className="p-8 text-center text-on-surface-variant flex flex-col items-center justify-center h-full">
                <CheckCircle className="text-green-500 mb-2" size={32} />
                <p className="text-sm font-bold">All systems nominal.</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-outline mt-auto">
            <button className="text-sm font-bold text-primary hover:underline w-full text-center">View All Logs</button>
          </div>
        </div>

      </div>
    </div>
  )
}
