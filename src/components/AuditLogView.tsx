import React, { useState } from 'react';
import { Shield, Sparkles, User, Terminal, Search, Filter } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogViewProps {
  logs: AuditLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [filterSource, setFilterSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter(log => {
    const matchesSource = filterSource === 'all' || log.source === filterSource;
    const matchesQuery = log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesQuery;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#222] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[10px] text-[#666] font-mono font-black uppercase tracking-[0.2em] mb-2">07 AUDIT & GOVERNANCE</h2>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
            System & AI Audit Log
          </h1>
          <p className="text-sm text-[#888] mt-2 font-medium">
            Immutable audit record of every AI recommendation, location stamp, safety check-in, and rule alert.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#111] border border-[#222] p-2 rounded-sm text-xs font-mono">
          <Terminal className="w-4 h-4 text-white" />
          <span className="text-white font-bold">{logs.length} AUDIT RECORDS</span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="p-4 bg-[#111] border border-[#222] rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-[#666] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#333] pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none rounded-sm"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono w-full sm:w-auto justify-end">
          <span className="text-[#666]">SOURCE:</span>
          {['all', 'user', 'gemini_ai', 'system'].map((src) => (
            <button
              key={src}
              onClick={() => setFilterSource(src)}
              className={`px-3 py-1 uppercase rounded-sm font-bold text-[10px] transition-colors ${
                filterSource === src ? 'bg-white text-black' : 'bg-[#1A1A1A] text-[#888] hover:text-white'
              }`}
            >
              {src.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table / Timeline */}
      <div className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-3">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="p-4 bg-[#0A0A0A] border border-[#222] rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                  log.source === 'gemini_ai' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  log.source === 'user' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-white/10 text-white border border-white/20'
                }`}>
                  {log.source.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-[#666] uppercase">{log.actionType}</span>
                <span className="text-[10px] text-[#555]">•</span>
                <span className="text-[10px] text-[#888]">{new Date(log.timestamp).toLocaleTimeString()} ({new Date(log.timestamp).toLocaleDateString()})</span>
              </div>
              <p className="text-sm font-bold uppercase text-white font-sans mt-1">{log.title}</p>
              <p className="text-xs text-[#AAA] font-sans leading-relaxed">{log.details}</p>
            </div>

            <div className="text-[10px] text-[#666] shrink-0 border-t md:border-t-0 md:border-l border-[#222] md:pl-4 pt-2 md:pt-0">
              <p>ACTOR ID: {log.actorId}</p>
              <p className="mt-0.5">LOG ID: {log.id}</p>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center text-[#666] font-mono text-xs">
            No audit records matching criteria.
          </div>
        )}
      </div>
    </div>
  );
};
