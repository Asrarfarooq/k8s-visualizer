import { Cloud, Layers, Activity, ShieldAlert, Zap, BookOpen, Network } from 'lucide-react';
import { useCluster } from '../../context/ClusterContext';
import { cn } from '../../utils/cn';
import { type Namespace } from '../../types';

const NAMESPACES: Namespace[] = ['default', 'production', 'kube-system'];

export const Sidebar = () => {
    const {
        pods, activeNamespace, setActiveNamespace,
        clusterLoad, setClusterLoad,
        desiredReplicas, setDesiredReplicas,
        isAutoRepairEnabled, setIsAutoRepairEnabled,
        isAutopilot, setIsAutopilot,
        isAcademyActive, setIsAcademyActive,
        services
    } = useCluster();

    const activeServices = services.filter(s => s.namespace === activeNamespace);

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-xl">
            {/* Title Area */}
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                        <Cloud className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight text-white">GKE Visualizer</h1>
                        <p className="text-[10px] text-slate-400">v1.29.3-gke.1</p>
                    </div>
                </div>

                {/* Namespace Nav */}
                <nav className="space-y-1">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Namespaces</p>
                    </div>
                    {NAMESPACES.map(ns => (
                        <button
                            key={ns}
                            onClick={() => { setActiveNamespace(ns); }}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                                activeNamespace === ns ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            )}
                        >
                            <div className="flex items-center gap-2.5">
                                <Layers className={cn("w-4 h-4", activeNamespace === ns ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300')} />
                                {ns}
                            </div>
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded font-mono",
                                activeNamespace === ns ? 'bg-blue-600/20 text-blue-300' : 'bg-slate-800 text-slate-500'
                            )}>
                                {pods.filter(p => p.namespace === ns).length}
                            </span>
                        </button>
                    ))}
                </nav>

                {/* Services List */}
                <div className="mt-6">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-2 flex items-center gap-2">
                        <Network size={12} /> Services
                    </p>
                    {activeServices.length === 0 && <span className="text-[10px] text-slate-600 px-1 italic">No services in {activeNamespace}</span>}
                    {activeServices.map(s => (
                        <div key={s.id} className="px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-help group">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300">{s.name}</span>
                                <span className={cn(
                                    "text-[9px] px-1 rounded uppercase font-bold",
                                    s.type === 'LoadBalancer' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700 text-slate-400'
                                )}>{s.type}</span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>{s.selector}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Configuration Controls */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">

                {/* Academy Toggle */}
                <div className="p-4 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-xl border border-blue-500/30">
                    <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2 text-xs font-bold text-blue-100 uppercase tracking-wider">
                            <BookOpen size={14} className="text-blue-400" /> Academy
                        </span>
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            isAcademyActive ? "bg-green-400 animate-pulse" : "bg-slate-600"
                        )} />
                    </div>
                    <p className="text-[10px] text-blue-200/70 mb-3 leading-tight">
                        Learn Kubernetes concepts with interactive lessons.
                    </p>
                    <button
                        onClick={() => setIsAcademyActive(!isAcademyActive)}
                        className={cn(
                            "w-full py-2 rounded-lg text-xs font-bold transition-all",
                            isAcademyActive
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                        )}
                    >
                        {isAcademyActive ? 'Exit Academy' : 'Start Lesson'}
                    </button>
                </div>

                {/* HPA Control */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Activity size={12} /> HPA Load Sim
                        </label>
                        <span className={cn("text-xs font-mono font-bold", clusterLoad > 80 ? 'text-red-400' : 'text-blue-400')}>{clusterLoad}%</span>
                    </div>
                    <input
                        type="range"
                        min="0" max="100"
                        value={clusterLoad}
                        onChange={(e) => setClusterLoad(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                    />
                    <p className="text-[10px] text-slate-500 leading-tight">
                        Increasing load {'>'} 80% triggers HPA to scale up 'Production' replicas.
                    </p>
                </div>

                {/* Manual Scaling (Only visible for production) */}
                {activeNamespace === 'production' && (
                    <div className="space-y-3 pt-4 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Desired Replicas</label>
                            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-white font-mono">{desiredReplicas}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDesiredReplicas(r => Math.max(0, r - 1))}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded-md text-xs font-medium border border-slate-700 transition-colors"
                            >
                                - Scale Down
                            </button>
                            <button
                                onClick={() => setDesiredReplicas(r => r + 1)}
                                className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 py-1.5 rounded-md text-xs font-medium transition-colors"
                            >
                                + Scale Up
                            </button>
                        </div>
                    </div>
                )}

                {/* Feature Toggles */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Cluster Settings</label>

                    <button
                        onClick={() => setIsAutoRepairEnabled(!isAutoRepairEnabled)}
                        className={cn(
                            "w-full flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all",
                            isAutoRepairEnabled ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                        )}
                    >
                        <span className="flex items-center gap-2"><ShieldAlert size={14} /> Auto-Repair</span>
                        <div className={cn("w-2 h-2 rounded-full", isAutoRepairEnabled ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-600')} />
                    </button>

                    <button
                        onClick={() => setIsAutopilot(!isAutopilot)}
                        className={cn(
                            "w-full flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all",
                            isAutopilot ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                        )}
                    >
                        <span className="flex items-center gap-2"><Zap size={14} /> GKE Autopilot</span>
                        <span className="font-mono font-bold">{isAutopilot ? 'ON' : 'OFF'}</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};
