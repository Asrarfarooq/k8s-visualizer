import React, { useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import { useCluster } from '../../context/ClusterContext';
import { cn } from '../../utils/cn';

export const LogsPanel = () => {
  const { logs } = useCluster();
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-48 bg-slate-950 border-t border-slate-800 flex flex-col z-10">
      <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-900">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal size={14} className="text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Cluster Events</span>
        </div>
        {/* Clear logs not exposed in context yet, skipping or we can add it */}
      </div>
      <div ref={logContainerRef} className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono">
        {logs.length === 0 && <span className="text-slate-700 text-xs italic">Waiting for events...</span>}
        {logs.map(log => (
          <div key={log.id} className="text-[11px] flex gap-3 hover:bg-slate-900/50 p-0.5 rounded">
            <span className="text-slate-600 shrink-0">{log.timestamp}</span>
            <span className={cn("font-bold shrink-0 w-24 uppercase",
              log.source === 'K8s Controller' ? 'text-blue-400' : '',
              log.source === 'GKE Manager' ? 'text-purple-400' : '',
              log.source === 'HPA' ? 'text-pink-400' : '',
              log.source === 'Scheduler' ? 'text-yellow-400' : '',
              (log.source === 'Pod' || log.source === 'Node') ? 'text-slate-300' : ''
            )}>{log.source}</span>
            <span className={cn(
              log.type === 'error' ? 'text-red-400' : '',
              log.type === 'success' ? 'text-green-400' : '',
              log.type === 'warning' ? 'text-orange-300' : 'text-slate-400'
            )}>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
