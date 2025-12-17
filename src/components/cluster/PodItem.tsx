import React from 'react';
import { GripHorizontal } from 'lucide-react';
import type { Pod } from '../../types';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

interface PodItemProps {
  pod: Pod;
  selected?: boolean;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const PodItem = ({ pod, selected, onClick, onContextMenu }: PodItemProps) => {

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('podId', pod.id);
    e.dataTransfer.effectAllowed = 'move';
    // addLog('Pod', `Dragging ${pod.name}...`, 'info');
  };

  return (
    <motion.div
      layoutId={pod.id}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      draggable={pod.status === 'running'}
      onDragStart={handleDragStart as any}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={cn(
        "group flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200 cursor-pointer relative overflow-hidden",
        selected ? 'ring-1 ring-blue-500 bg-blue-500/10' : '',
        pod.status === 'running' ? 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750 shadow-sm' : '',
        pod.status === 'pending' ? 'bg-yellow-900/10 border-yellow-500/30' : '',
        pod.status === 'failed' ? 'bg-red-900/10 border-red-500/50' : '',
        pod.status === 'terminating' ? 'opacity-50 scale-95 bg-slate-800' : ''
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          pod.status === 'running' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]' :
            pod.status === 'pending' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
        )} />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-200">{pod.name}</span>
          <span className="text-[10px] text-slate-500 font-mono uppercase">{pod.appType}</span>
        </div>
      </div>
      <GripHorizontal size={14} className="text-slate-700 group-hover:text-slate-500" />
    </motion.div>
  );
};
