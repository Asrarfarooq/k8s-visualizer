import React, { useEffect } from 'react';
import { Zap, Lock, HardDrive, Trash2, Terminal, FileText } from 'lucide-react';
import { useCluster } from '../../context/ClusterContext';
import { Node } from '../../types';

export const ContextMenu = () => {
    const { 
        contextMenu, setContextMenu, 
        nodes, pods, 
        crashNode, cordonNode, killPod, addLog, setSelectedPod 
    } = useCluster();

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [setContextMenu]);

    if (!contextMenu) return null;

    return (
        <div 
            className="fixed bg-slate-800 border border-slate-700 shadow-2xl rounded-lg w-52 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
            style={{ top: contextMenu.y, left: contextMenu.x }}
        >
            {contextMenu.type === 'node' ? (
                <>
                    <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700/50 mb-1 bg-slate-800/50">
                        Node Operations
                    </div>
                    <button 
                        onClick={() => { crashNode(contextMenu.targetId); setContextMenu(null); }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-red-400 hover:bg-slate-700 flex items-center gap-2 transition-colors"
                    >
                        <Zap className="w-4 h-4" /> Simulate Failure (Crash)
                    </button>
                    <button 
                        onClick={() => { cordonNode(contextMenu.targetId); setContextMenu(null); }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 flex items-center gap-2 transition-colors"
                    >
                        <Lock className="w-4 h-4" /> 
                        {nodes.find(n => n.id === contextMenu.targetId)?.status === 'cordoned' ? 'Uncordon' : 'Cordon (Maintenance)'}
                    </button>
                    <button 
                        onClick={() => { setContextMenu(null); }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 flex items-center gap-2 transition-colors"
                    >
                        <HardDrive className="w-4 h-4" /> View Hardware Specs
                    </button>
                </>
            ) : (
                <>
                    <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700/50 mb-1 bg-slate-800/50">
                        Pod Operations
                    </div>
                    <button 
                        onClick={() => { killPod(contextMenu.targetId); setContextMenu(null); }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-red-400 hover:bg-slate-700 flex items-center gap-2 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" /> Terminate
                    </button>
                    <button 
                        onClick={() => { 
                            const pod = pods.find(p => p.id === contextMenu.targetId);
                            if(pod) {
                                addLog('Pod', `Logs for ${pod.name}:\n> Starting application...\n> Connection established to DB.\n> Listening on port 8080.`, 'info');
                            }
                            setContextMenu(null); 
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 flex items-center gap-2 transition-colors"
                    >
                        <Terminal className="w-4 h-4" /> Fetch Logs
                    </button>
                    <button 
                        onClick={() => { 
                             const pod = pods.find(p => p.id === contextMenu.targetId);
                             // We probably need setSelectedPod in context context if we want to support this
                             // Ah, I missed setSelectedPod in ClusterContextType!
                             // I will add it now or assume it exists and fix context later.
                             // Let's assume it exists and I'll update context if needed or it was just missing in my mental model.
                             // Wait, I updated Context in previous step. Did I include it?
                             // I did NOT include `selectedPod` logic in context. 
                             // I need to add `selectedPod` to context.
                             // I'll update Context after this tool call.
                             setSelectedPod(pod || null);
                             setContextMenu(null);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-blue-400 hover:bg-slate-700 flex items-center gap-2 transition-colors"
                    >
                        <FileText className="w-4 h-4" /> View YAML
                    </button>
                </>
            )}
        </div>
    );
};
