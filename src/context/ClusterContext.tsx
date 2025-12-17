import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import type { Node, Pod, LogEntry, Namespace, ContextMenuData } from '../types';

export interface Service {
  id: string;
  name: string;
  type: 'ClusterIP' | 'LoadBalancer' | 'NodePort';
  selector: string; // e.g., 'app=nginx'
  clusterIP: string;
  externalIP?: string;
  namespace: Namespace;
}

interface ClusterContextType {
  nodes: Node[];
  pods: Pod[];
  services: Service[];
  logs: LogEntry[];
  activeNamespace: Namespace;
  desiredReplicas: number;
  clusterLoad: number;
  isAutoRepairEnabled: boolean;
  isAutopilot: boolean;
  contextMenu: ContextMenuData | null;
  selectedPod: Pod | null;
  isAcademyActive: boolean;
  academyStep: number;

  // Actions
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setPods: React.Dispatch<React.SetStateAction<Pod[]>>;
  setActiveNamespace: (ns: Namespace) => void;
  setDesiredReplicas: React.Dispatch<React.SetStateAction<number>>;
  setClusterLoad: React.Dispatch<React.SetStateAction<number>>;
  setIsAutoRepairEnabled: (enabled: boolean) => void;
  setIsAutopilot: (enabled: boolean) => void;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuData | null>>;
  setSelectedPod: React.Dispatch<React.SetStateAction<Pod | null>>;
  setIsAcademyActive: React.Dispatch<React.SetStateAction<boolean>>;
  setAcademyStep: React.Dispatch<React.SetStateAction<number>>;
  addLog: (source: LogEntry['source'], message: string, type?: LogEntry['type']) => void;

  // High Level Actions
  killPod: (podId: string) => void;
  crashNode: (nodeId: string) => void;
  cordonNode: (nodeId: string) => void;
  scheduleNewPods: (count: number, namespace: Namespace) => void;
  terminatePods: (count: number, namespace: Namespace) => void;
}

const ClusterContext = createContext<ClusterContextType | undefined>(undefined);

const getAppSpecs = (type: string): { cpu: number, mem: number, tolerations: string[] } => {
  switch (type) {
    case 'db': return { cpu: 20 + Math.random() * 10, mem: 35 + Math.random() * 10, tolerations: [] };
    case 'api': return { cpu: 10 + Math.random() * 5, mem: 15 + Math.random() * 5, tolerations: [] };
    case 'daemon': return { cpu: 2, mem: 5, tolerations: ['gpu=true', 'critical=true'] };
    default: return { cpu: 4 + Math.random() * 2, mem: 5 + Math.random() * 2, tolerations: [] };
  }
};

export const ClusterProvider = ({ children }: { children: ReactNode }) => {
  // --- State ---
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'n1', name: 'gke-pool-1-a1', status: 'ready', type: 'e2-medium', taints: [], labels: { 'zone': 'us-west1-a' } },
    { id: 'n2', name: 'gke-pool-1-a2', status: 'ready', type: 'e2-medium', taints: [], labels: { 'zone': 'us-west1-a' } },
    { id: 'n3', name: 'gke-gpu-pool-b1', status: 'ready', type: 'g2-standard-nvidia', taints: ['gpu=true'], labels: { 'accelerator': 'nvidia-t4' } },
  ]);

  const [pods, setPods] = useState<Pod[]>([
    { id: 'p-sys-1', name: 'kube-proxy-x92', status: 'running', appType: 'daemon', namespace: 'kube-system', nodeId: 'n1', cpuUsage: 2, memUsage: 5, tolerations: ['gpu=true'] },
    { id: 'p-sys-2', name: 'kube-proxy-d81', status: 'running', appType: 'daemon', namespace: 'kube-system', nodeId: 'n2', cpuUsage: 2, memUsage: 5, tolerations: ['gpu=true'] },
    { id: 'p-ng-1', name: 'nginx-web-01', status: 'running', appType: 'nginx', namespace: 'default', nodeId: 'n1', cpuUsage: 5, memUsage: 8, tolerations: [] },
  ]);

  const [services] = useState<Service[]>([
    { id: 's-1', name: 'kubernetes', type: 'ClusterIP', selector: 'component=apiserver', clusterIP: '10.96.0.1', namespace: 'default' },
    { id: 's-2', name: 'nginx-svc', type: 'LoadBalancer', selector: 'app=nginx', clusterIP: '10.96.0.25', externalIP: '34.102.10.1', namespace: 'default' },
    { id: 's-3', name: 'api-internal', type: 'ClusterIP', selector: 'app=api', clusterIP: '10.96.0.44', namespace: 'production' }
  ]);

  const [desiredReplicas, setDesiredReplicas] = useState(2);
  const [activeNamespace, setActiveNamespace] = useState<Namespace>('default');
  const [isAutoRepairEnabled, setIsAutoRepairEnabled] = useState(true);
  const [isAutopilot, setIsAutopilot] = useState(false);
  const [clusterLoad, setClusterLoad] = useState(20);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);
  const [isAcademyActive, setIsAcademyActive] = useState(false);
  const [academyStep, setAcademyStep] = useState(0);

  // --- Logic Helpers ---
  const addLog = useCallback((source: LogEntry['source'], message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      source, message, type
    }]);
  }, []);

  const scheduleNewPods = useCallback((count: number, namespace: Namespace) => {
    addLog('K8s Controller', `ReplicaSet mismatch in ${namespace}. Scheduling ${count} new pod(s)...`, 'info');

    const newPods: Pod[] = [];
    for (let i = 0; i < count; i++) {
      const id = `p-${Math.random().toString(36).substr(2, 5)}`;
      const appType = Math.random() > 0.7 ? 'api' : 'nginx';
      const specs = getAppSpecs(appType);

      const validNodes = nodes.filter(n => {
        if (n.status !== 'ready') return false;
        if (n.taints.length > 0) {
          const hasToleration = specs.tolerations.some(t => n.taints.includes(t));
          if (!hasToleration) return false;
        }
        return true;
      });

      let targetNodeId: string | null = null;
      if (validNodes.length > 0) {
        targetNodeId = validNodes[Math.floor(Math.random() * validNodes.length)].id;
      } else {
        addLog('Scheduler', `Failed to schedule ${appType}: No ready/untanted nodes available.`, 'error');
      }

      newPods.push({
        id,
        name: `${appType}-${Math.random().toString(36).substr(2, 4)}`,
        status: 'pending',
        appType: appType as any,
        namespace,
        nodeId: targetNodeId,
        cpuUsage: specs.cpu,
        memUsage: specs.mem,
        tolerations: specs.tolerations
      });
    }

    setPods(prev => [...prev, ...newPods]);

    setTimeout(() => {
      setPods(prev => prev.map(p => {
        const isNew = newPods.find(np => np.id === p.id);
        if (isNew && p.nodeId) {
          return { ...p, status: 'running' };
        }
        return p;
      }));
      const successCount = newPods.filter(p => p.nodeId).length;
      if (successCount > 0) addLog('K8s Controller', `${successCount} pod(s) started successfully.`, 'success');
    }, 1500);
  }, [nodes, addLog]);

  const terminatePods = useCallback((count: number, namespace: Namespace) => {
    setPods(currentPods => {
      const running = currentPods.filter(p => p.status === 'running' && p.namespace === namespace);
      const toKill = running.slice(0, count);

      if (toKill.length > 0) {
        addLog('K8s Controller', `Scaling down ${namespace}: Terminating ${count} pod(s)...`, 'warning');

        setTimeout(() => {
          setPods(prev => prev.filter(p => !toKill.find(tk => tk.id === p.id)));
          addLog('K8s Controller', `Cleanup complete.`, 'info');
        }, 1000);

        return currentPods.map(p =>
          toKill.find(tk => tk.id === p.id) ? { ...p, status: 'terminating' } : p
        );
      }
      return currentPods;
    });
  }, [addLog]);

  const killPod = useCallback((podId: string) => {
    setPods(prev => {
      const pod = prev.find(p => p.id === podId);
      if (pod) addLog('Pod', `Pod ${pod.name} crashed (Exit Code 137).`, 'error');
      return prev.map(p => p.id === podId ? { ...p, status: 'failed' } : p);
    });
    setTimeout(() => {
      setPods(prev => prev.filter(p => p.id !== podId));
    }, 2000);
  }, [addLog]);

  const crashNode = useCallback((nodeId: string) => {
    setNodes(prev => {
      const node = prev.find(n => n.id === nodeId);
      if (node) addLog('Node', `Node ${node.name} stopped sending heartbeats.`, 'error');
      return prev.map(n => n.id === nodeId ? { ...n, status: 'not-ready' } : n);
    });

    setTimeout(() => {
      addLog('K8s Controller', `Node Unhealthy > 1min. Evicting pods...`, 'warning');
      setPods(prev => prev.map(p => {
        if (p.nodeId === nodeId) {
          return { ...p, nodeId: null, status: 'pending' };
        }
        return p;
      }));
    }, 2500);
  }, [addLog]);

  const cordonNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        const matches = n.status === 'cordoned';
        addLog('K8s Controller', `Node ${n.name} marked as ${matches ? 'Schedulable' : 'Unschedulable'}`, 'info');
        return { ...n, status: matches ? 'ready' : 'cordoned' };
      }
      return n;
    }));
  }, [addLog]);

  // --- Controller Loop ---
  useEffect(() => {
    const runningProdPods = pods.filter(p => p.namespace === 'production' && ['running', 'pending'].includes(p.status));

    if (clusterLoad > 80 && desiredReplicas < 12) {
      const timer = setTimeout(() => {
        setDesiredReplicas(prev => Math.min(prev + 1, 12));
        addLog('HPA', `High CPU Load (${clusterLoad}%). Scaling up replicas to ${desiredReplicas + 1}.`, 'warning');
      }, 1000);
      return () => clearTimeout(timer);
    } else if (clusterLoad < 30 && desiredReplicas > 2) {
      const timer = setTimeout(() => {
        setDesiredReplicas(prev => Math.max(prev - 1, 2));
        addLog('HPA', `Low CPU Load (${clusterLoad}%). Scaling down replicas to ${desiredReplicas - 1}.`, 'info');
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (runningProdPods.length < desiredReplicas) {
      const needed = desiredReplicas - runningProdPods.length;
      const timer = setTimeout(() => scheduleNewPods(needed, 'production'), 500);
      return () => clearTimeout(timer);
    }

    if (runningProdPods.length > desiredReplicas) {
      const toRemove = runningProdPods.length - desiredReplicas;
      const timer = setTimeout(() => terminatePods(toRemove, 'production'), 500);
      return () => clearTimeout(timer);
    }

  }, [desiredReplicas, pods, clusterLoad, scheduleNewPods, terminatePods, addLog]);

  // Auto Repair Loop
  useEffect(() => {
    if (!isAutoRepairEnabled) return;
    const brokenNodes = nodes.filter(n => n.status === 'not-ready');
    brokenNodes.forEach(node => {
      const timer = setTimeout(() => {
        setNodes(prev => prev.map(n => n.id === node.id && n.status === 'not-ready' ? { ...n, status: 'provisioning' } : n));
        addLog('GKE Manager', `Auto-Repair detected unhealthy node: ${node.name}`, 'error');

        setTimeout(() => {
          setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'ready' } : n));
          addLog('GKE Manager', `Node ${node.name} repaired and ready.`, 'success');
        }, 5000);
      }, 5000);
      return () => clearTimeout(timer);
    });
  }, [nodes, isAutoRepairEnabled, addLog]);

  return (
    <ClusterContext.Provider value={{
      nodes, pods, logs, activeNamespace, desiredReplicas, clusterLoad, isAutoRepairEnabled, isAutopilot, contextMenu, selectedPod, isAcademyActive, academyStep, services,
      setNodes, setPods, setActiveNamespace, setDesiredReplicas, setClusterLoad, setIsAutoRepairEnabled, setIsAutopilot, setContextMenu, setSelectedPod, setIsAcademyActive, setAcademyStep, addLog,
      killPod, crashNode, cordonNode, scheduleNewPods, terminatePods
    }}>
      {children}
    </ClusterContext.Provider>
  );
};

export const useCluster = () => {
  const context = useContext(ClusterContext);
  if (context === undefined) {
    throw new Error('useCluster must be used within a ClusterProvider');
  }
  return context;
};
