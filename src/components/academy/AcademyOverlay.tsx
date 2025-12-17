import { motion, AnimatePresence } from 'framer-motion';
import { useCluster } from '../../context/ClusterContext';
import { BookOpen, ChevronRight, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const ACADEMY_STEPS = [
    {
        title: "Welcome to GKE Academy",
        content: "This visualizer helps you understand Kubernetes concepts interactively. Let's start by exploring the Cluster View.",
        target: "cluster-map"
    },
    {
        title: "Nodes: The Workers",
        content: "These large boxes are Nodes. Think of them as individual virtual machines (VMs) that run your workloads. They have CPU and Memory resources.",
        target: "node-card"
    },
    {
        title: "Pods: The Atoms",
        content: "Inside nodes, you see Pods (the small colored items). A Pod is the smallest deployable unit in K8s, usually running one container (like your App).",
        target: "pod-item"
    },
    {
        title: "Namespaces: Virtual Clusters",
        content: "Use the sidebar to switch Namespaces. Namespaces isolate resources. 'kube-system' has critical internal pods, while 'production' is for your apps.",
        target: "namespace-nav"
    },
    {
        title: "Try It: Scale Up",
        content: "Go to the 'production' namespace and try increasing the 'Desired Replicas'. Watch how the Controller schedules new pods to nodes!",
        target: "scale-controls"
    },
    {
        title: "Chaos Engineering",
        content: "Right-click a Node to crash it! See how K8s detects the failure and eventually Reschedules pods to healthy nodes (Self-Healing).",
        target: "chaos-mode"
    }
];

export const AcademyOverlay = () => {
    const { isAcademyActive, academyStep, setAcademyStep, setIsAcademyActive, setActiveNamespace } = useCluster();

    if (!isAcademyActive) return null;

    const currentStep = ACADEMY_STEPS[academyStep];
    const isLastStep = academyStep === ACADEMY_STEPS.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            setIsAcademyActive(false);
            setAcademyStep(0);
        } else {
            setAcademyStep(prev => prev + 1);
            // Auto-actions for specific steps to guide user
            if (academyStep === 3) setActiveNamespace('production');
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed bottom-8 right-8 z-50 w-96 bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 shadow-2xl rounded-2xl overflow-hidden p-6"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 text-blue-400">
                        <BookOpen size={20} />
                        <span className="text-sm font-bold uppercase tracking-wider">Lesson {academyStep + 1}/{ACADEMY_STEPS.length}</span>
                    </div>
                    <button onClick={() => setIsAcademyActive(false)} className="text-slate-500 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{currentStep.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    {currentStep.content}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        {ACADEMY_STEPS.map((_, i) => (
                            <div key={i} className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                i === academyStep ? "bg-blue-500 w-4" : "bg-slate-700"
                            )} />
                        ))}
                    </div>
                    <button
                        onClick={handleNext}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                    >
                        {isLastStep ? 'Finish' : 'Next'} <ChevronRight size={16} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
