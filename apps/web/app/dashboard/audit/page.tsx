'use client';

import React, { useEffect, useState } from 'react';
import { Activity, FileText, Filter, LogIn, Shield, User, UserCheck } from 'lucide-react';
import { AuditLogItem, store } from '@/lib/store';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>(store.auditLogs);
  const [filterAction, setFilterAction] = useState<string>('all');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setLogs([...store.auditLogs]);
    });
    return () => unsub();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filterAction === 'all') return true;
    return log.action === filterAction;
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight">System Audit Trail</h1>
        <p className="text-sm text-muted-foreground">
          Tamper-evident record of administrative approvals, broadcasts, and privilege changes
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { id: 'all', label: 'All Activity' },
          { id: 'USER_LOGIN', label: 'User Logins' },
          { id: 'ROLE_ASSIGNMENT', label: 'Role Changes' },
          { id: 'APPROVE_EVENT', label: 'Event Approvals' },
          { id: 'CREATE_BULLETIN', label: 'Bulletins' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterAction(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterAction === tab.id
                ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-md shadow-sky-500/20'
                : 'bg-slate-900/60 text-slate-400 border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl overflow-hidden shadow-xl">
        <div className="divide-y divide-white/10">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No audit records matching this filter.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-white/[0.02] transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        log.action === 'USER_LOGIN'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : log.action === 'ROLE_ASSIGNMENT'
                          ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                          : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="font-semibold text-foreground">{log.entity}</span>
                  </div>
                  <p className="text-muted-foreground">{log.details}</p>
                </div>

                <div className="text-left sm:text-right text-muted-foreground space-y-0.5 shrink-0">
                  <div className="font-medium text-foreground flex items-center sm:justify-end gap-1">
                    <User className="h-3 w-3 text-sky-400" /> {log.actor}
                  </div>
                  <div className="text-slate-500 text-[11px]">{log.timestamp}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
