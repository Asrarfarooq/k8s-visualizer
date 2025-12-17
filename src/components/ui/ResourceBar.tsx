import { cn } from '../../utils/cn';

interface ResourceBarProps {
  label: string;
  usage: number;
  colorClass: string;
}

export const ResourceBar = ({ label, usage, colorClass }: ResourceBarProps) => (
  <div className="flex flex-col gap-1 w-full">
    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
      <span>{label}</span>
      <span>{Math.min(usage, 100).toFixed(0)}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
      <div className={cn("h-full transition-all duration-500", colorClass)} style={{ width: `${Math.min(usage, 100)}%` }} />
    </div>
  </div>
);
