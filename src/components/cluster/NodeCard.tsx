import React, { useState } from 'react';
import { Server, Lock, AlertTriangle, MoreVertical, RefreshCw } from 'lucide-react';
import type { Node, Pod } from '../../types';
import { useCluster } from '../../context/ClusterContext';
import { ResourceBar } from '../ui/ResourceBar';
import { PodItem } from './PodItem';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

interface NodeCardProps {
  node: Node;
  pods: Pod[];
  onContextMenu: (e: React.MouseEvent) => void;
  onPodContextMenu: (e: React.MouseEvent, pod: Pod) => void;
  onPodClick: (e: React.MouseEvent, pod: Pod) => void;
  selectedPodId?: string;
}

export const NodeCard = ({ node, pods, onContextMenu, onPodContextMenu, onPodClick, selectedPodId }: NodeCardProps) => {
  const { addLog, setPods } = useCluster();
  const [isDragOver, setIsDragOver] = useState(false);

  const totalCpu = pods.reduce((acc, p) => acc + (p.cpuUsage || 0), 0);
  const totalMem = pods.reduce((acc, p) => acc + (p.memUsage || 0), 0);
  const isOverloaded = totalCpu > 90 || totalMem > 90;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const podId = e.dataTransfer.getData('podId');

    if (node.status !== 'ready') {
      addLog('Scheduler', `Cannot schedule on ${node.name}: Node not ready/cordoned.`, 'error');
      return;
    }

    // Logic here is a bit duplicated from Context/App, but since we have `setPods` we can move it here or keep in context
    // Ideally we call a context method `movePod(podId, nodeId)`
    // But for now let's reuse valid logic if possible or just emit event?
    // Using context setters directly is fine for now but refactor later.

    setPods(prev => {
      const pod = prev.find(p => p.id === podId);
      if (!pod) return prev;

      // Taint check
      if (node.taints.length > 0) {
        const hasToleration = pod.tolerations.some(t => node.taints.includes(t));
        if (!hasToleration) {
          addLog('Scheduler', `Forbidden: Node ${node.name} has taints [${node.taints}]`, 'error');
          return prev;
        }
      }

      if (pod.nodeId !== node.id) {
        addLog('K8s Controller', `Manual Reschedule: Moving ${pod.name} to ${node.name}`, 'info');
        // We need to simulate the pending -> running transition
        // This is a bit tricky inside a setter. 
        // Better to use an effect or just simple timeout logic in a real function.
        // We will just do it optimistically here? No, let's keep it simple.
        // Triggering a "move" action in context would be cleaner.

        // Hacky side-effect in render/handler:
        setTimeout(() => {
          setPods(curr => curr.map(p => p.id === podId ? { ...p, status: 'running' } : p));
        }, 1000);

        return prev.map(p => p.id === podId ? { ...p, nodeId: node.id, status: 'pending' } : p);
      }
      return prev;
    });
  };

  return (
    <motion.div
      layout
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onContextMenu={onContextMenu}
      className={cn(
        "relative transition-all duration-300 rounded-xl border-2 group flex flex-col",
        node.status === 'ready' ? 'border-slate-800 bg-slate-900/80 hover:border-slate-600' : '',
        node.status === 'cordoned' ? 'border-orange-500/30 bg-orange-900/10' : '',
        node.status === 'not-ready' ? 'border-red-500/30 bg-red-900/10 shadow-[0_0_30px_-5px_rgba(239,68,68,0.2)]' : '',
        node.status === 'provisioning' ? 'border-blue-500/30 bg-blue-900/10 border-dashed animate-pulse' : '',
        isDragOver && node.status === 'ready' ? 'border-blue-400 bg-blue-900/20 scale-[1.02] shadow-xl shadow-blue-500/10' : ''
      )}
    >
      {/* Node Header */}
      <div className="p-4 border-b border-slate-800/50 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            node.status === 'ready' ? 'bg-slate-800 text-blue-400' : 'bg-red-900/20 text-red-500'
          )}>
            <Server size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              {node.name}
              {node.taints.length > 0 && <Lock size={12} className="text-orange-400" />}
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-mono mt-0.5 text-slate-500">
              <span>{node.type}</span>
              {isOverloaded && <span className="text-red-400 flex items-center gap-1"><AlertTriangle size={10} /> High Load</span>}
            </div>
          </div>
        </div>
        <button onClick={onContextMenu} className="text-slate-600 hover:text-white transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Pods Container */}
      <div className="flex-1 p-3 min-h-[160px] space-y-2">
        {node.status === 'provisioning' ? (
          <div className="h-full flex flex-col items-center justify-center text-blue-400 animate-pulse">
            <RefreshCw className="w-6 h-6 animate-spin mb-2 opacity-50" />
            <span className="text-xs font-mono opacity-70">Provisioning...</span>
          </div>
        ) : (
          <>
            {pods.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 border-2 border-dashed border-slate-800/50 rounded-lg">
                <span className="text-[10px] font-medium uppercase tracking-wide">Empty</span>
              </div>
            )}
            {pods.map(pod => (
              <PodItem
                key={pod.id}
                pod={pod}
                selected={selectedPodId === pod.id}
                onClick={(e) => onPodClick(e, pod)}
                onContextMenu={(e) => onPodContextMenu(e, pod)}
              />
            ))}
          </>
        )}
      </div>

      {/* Node Footer Metrics */}
      <div className="p-4 pt-2 border-t border-slate-800/50 grid grid-cols-2 gap-3 bg-slate-900/30 rounded-b-xl">
        <ResourceBar label="CPU" usage={totalCpu} colorClass={totalCpu > 90 ? 'bg-red-500' : 'bg-blue-500'} />
        <ResourceBar label="MEM" usage={totalMem} colorClass={totalMem > 90 ? 'bg-red-500' : 'bg-purple-500'} />
      </div>
    </motion.div>
  );
};
