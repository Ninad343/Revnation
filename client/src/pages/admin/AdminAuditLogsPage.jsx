import React, { useState, useEffect } from 'react';
import { FileText, Shield, Clock } from 'lucide-react';
import api from '../../services/api';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/audit-logs');
        if (res.data.success) {
          setLogs(res.data.logs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
          <FileText className="w-6 h-6 text-purple-400 mr-2.5" />
          <span>Security Audit Trail</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Immutable administrative action logs for governance and compliance</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-950 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {log.admin?.name || 'Administrator'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-purple-950 text-purple-300 border border-purple-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {log.targetType} (#{log.targetId?.slice(-6)})
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate font-mono text-[11px]">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-500">No audit logs recorded yet.</div>
        )}
      </div>
    </div>
  );
}
