import { useRef, type MouseEvent } from 'react';
import { Globe, AlertTriangle } from 'lucide-react';
import { useCluster } from '../../context/ClusterContext';
import { NodeCard } from './NodeCard';

export const ClusterMap = () => {
    const { 
        nodes, pods, activeNamespace, 
        setContextMenu, 
        setSelectedPod,
    } = useCluster();

    const clusterRef = useRef<HTMLDivElement>(null);

    const handleContextMenu = (e: MouseEvent, type: 'node' | 'pod', targetId: string, parentId?: string) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, type, targetId, parentId });
    };

    const pendingPods = pods.filter(p => !p.nodeId && p.namespace === activeNamespace);

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scroll-smooth" ref={clusterRef}>
          <div className="max-w-6xl mx-auto pb-32">
             
             {/* Header Metrics / Breadcrumbs */}
             <div className="flex items-center justify-between mb-6 px-1">
                 <div className="flex items-center gap-2 text-slate-600 text-xs font-mono">
                    <Globe className="w-3 h-3"/>
                    <span>us-west1 (Oregon)</span>
                    <span className="text-slate-700">/</span>
                    <span>vpc-production-net</span>
                 </div>
                 {/* Optional top-right extras */}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {nodes.map(node => {
                 const nodePods = pods.filter(p => p.nodeId === node.id);
                 // Filter visible pods inside the node based on namespace
                 const visiblePods = nodePods.filter(p => p.namespace === activeNamespace);
                 
                 return (
                    <NodeCard 
                        key={node.id}
                        node={node}
                        pods={visiblePods}
                        onContextMenu={(e) => handleContextMenu(e, 'node', node.id)}
                        onPodContextMenu={(e, pod) => handleContextMenu(e, 'pod', pod.id, node.id)}
                        onPodClick={(e, pod) => { e.stopPropagation(); setSelectedPod(pod); }}
                    />
                 );
               })}
             </div>

             {/* Unscheduled / Pending Pods Area */}
             {pendingPods.length > 0 && (
                <div className="mt-8 border border-yellow-500/20 bg-yellow-900/5 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/50" />
                    <h3 className="text-yellow-500 text-xs font-bold uppercase mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4"/> Pending Scheduling Queue
                    </h3>
                    <div className="flex gap-3 flex-wrap">
                        {pendingPods.map(p => (
                            <div 
                                key={p.id} 
                                onClick={() => setSelectedPod(p)}
                                className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-3 cursor-pointer hover:border-yellow-500/50 transition-colors"
                            >
                                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                <span className="text-xs font-bold text-slate-300">{p.name}</span>
                                <span className="text-[10px] text-slate-500 bg-slate-800 px-1 rounded">{p.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
             )}

          </div>
        </div>
    );
};
