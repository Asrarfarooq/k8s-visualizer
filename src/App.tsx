
import { Sidebar } from './components/layout/Sidebar';
import { LogsPanel } from './components/layout/LogsPanel';
import { ClusterMap } from './components/cluster/ClusterMap';
import { RightDrawer } from './components/layout/RightDrawer';
import { ContextMenu } from './components/ui/ContextMenu';
import { AcademyOverlay } from './components/academy/AcademyOverlay';
import { LayoutGrid } from 'lucide-react';
import { useCluster } from './context/ClusterContext';

function App() {
  const { activeNamespace, clusterLoad } = useCluster();

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30">

      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 relative">

        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <h2 className="font-bold flex items-center gap-2 text-slate-200">
              <LayoutGrid size={18} className="text-slate-400" />
              <span className="text-slate-500">Namespace:</span>
              <span className="text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700/50">{activeNamespace}</span>
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cluster CPU</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${Math.min(clusterLoad, 100)}%` }} />
                </div>
                <span className="text-xs font-mono text-blue-400">{clusterLoad}%</span>
              </div>
            </div>
          </div>
        </header>

        <ClusterMap />
        <LogsPanel />

      </main>

      <RightDrawer />
      <ContextMenu />
      <AcademyOverlay />

    </div>
  );
}

export default App;
