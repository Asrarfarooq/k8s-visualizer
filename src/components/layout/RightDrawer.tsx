import { Archive, Code, Trash2 } from 'lucide-react';
import { useCluster } from '../../context/ClusterContext';
import { StatusIndicator } from '../ui/StatusIndicator';
import type { Pod } from '../../types';
import { cn } from '../../utils/cn';

// Helper for generating YAML (moved from App.tsx or just duplicated/imported)
const generateYaml = (pod: Pod) => `
apiVersion: v1
kind: Pod
metadata:
  name: ${pod.name}
  namespace: ${pod.namespace}
  labels:
    app: ${pod.appType}
spec:
  containers:
  - name: ${pod.appType}
    image: ${pod.appType}:1.24.0
    resources:
      requests:
        cpu: "${pod.cpuUsage * 10}m"
        memory: "${pod.memUsage * 10}Mi"
  ${pod.tolerations.length > 0 ? `tolerations:
  - key: "${pod.tolerations[0]}"
    operator: "Exists"
    effect: "NoSchedule"` : ''}
  nodeSelector:
    kubernetes.io/os: linux
`;

export const RightDrawer = () => {
    const { selectedPod, setSelectedPod, nodes, killPod } = useCluster();

    // Arrow icon
    const ArrowRightIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    );

    return (
        <aside className={cn(
            "w-96 bg-slate-900 border-l border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col z-30 absolute right-0 h-full",
            selectedPod ? 'translate-x-0' : 'translate-x-full'
        )}>
             {selectedPod && (
                <>
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                        <div>
                            <h2 className="font-bold text-lg text-white">{selectedPod.name}</h2>
                            <span className="text-xs font-mono text-slate-500">{selectedPod.id}</span>
                        </div>
                        <button onClick={() => setSelectedPod(null)} className="text-slate-500 hover:text-white transition-colors">
                            <ArrowRightIcon /> 
                            <div className="bg-slate-800 p-1 rounded hover:bg-slate-700"><Archive size={16} /></div>
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Status Card */}
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-slate-500 uppercase">Health Status</span>
                                <StatusIndicator status={selectedPod.status} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] text-slate-500 block mb-1">Namespace</span>
                                    <span className="text-sm font-mono text-blue-300">{selectedPod.namespace}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 block mb-1">Node</span>
                                    <span className="text-sm font-mono text-slate-300">{selectedPod.nodeId ? nodes.find(n => n.id === selectedPod.nodeId)?.name : 'Pending...'}</span>
                                </div>
                            </div>
                        </div>
    
                        {/* YAML View */}
                        <div className="flex flex-col h-64">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                                <Code size={14} /> Live Manifest
                            </div>
                            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 overflow-auto custom-scrollbar group relative">
                                <pre className="text-[10px] font-mono leading-relaxed text-blue-200/80">
                                    {generateYaml(selectedPod)}
                                </pre>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-1 rounded">Read-only</span>
                                </div>
                            </div>
                        </div>
    
                        {/* Actions */}
                        <div className="space-y-3">
                            <button 
                                 onClick={() => { killPod(selectedPod.id); setSelectedPod(null); }}
                                 className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} /> Delete Pod
                            </button>
                        </div>
                    </div>
                </>
             )}
          </aside>
    );
};
