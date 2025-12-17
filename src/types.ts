export type Status = 'running' | 'pending' | 'failed' | 'unknown' | 'terminating';
export type Namespace = 'default' | 'kube-system' | 'production';

export interface Pod {
  id: string;
  name: string;
  status: Status;
  appType: 'nginx' | 'api' | 'db' | 'daemon';
  namespace: Namespace;
  nodeId: string | null; // Null if pending
  cpuUsage: number; // % of a single node's capacity
  memUsage: number; // % of a single node's capacity
  tolerations: string[];
}

export interface Node {
  id: string;
  name: string;
  status: 'ready' | 'not-ready' | 'provisioning' | 'cordoned';
  isDraining?: boolean;
  taints: string[];
  labels: Record<string, string>;
  type: 'e2-medium' | 'g2-standard-nvidia' | 'e2-small';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: 'K8s Controller' | 'GKE Manager' | 'Node' | 'Pod' | 'System' | 'HPA' | 'Scheduler';
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
}

export interface ContextMenuData {
  x: number;
  y: number;
  type: 'node' | 'pod';
  targetId: string;
  parentId?: string;
}
