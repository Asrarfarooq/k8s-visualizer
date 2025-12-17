

const colors: Record<string, string> = {
  running: 'bg-green-500',
  ready: 'bg-green-500',
  pending: 'bg-yellow-400 animate-pulse',
  provisioning: 'bg-blue-400 animate-pulse',
  failed: 'bg-red-500',
  'not-ready': 'bg-red-500',
  unknown: 'bg-gray-400',
  terminating: 'bg-gray-500 animate-pulse',
  cordoned: 'bg-orange-500'
};

export const StatusIndicator = ({ status }: { status: string }) => {
  return <div className={`w-3 h-3 rounded-full ${colors[status] || 'bg-gray-500'} shadow-sm border border-white/10`} />;
};
