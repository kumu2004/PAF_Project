import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export function SlaBadge({ slaDeadline, slaBreached, status }) {
    if (status === 'RESOLVED' || status === 'CLOSED') {
        return (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                <CheckCircle className="w-3 h-3" />
                <span>Resolved</span>
            </div>
        );
    }

    if (slaBreached) {
        return (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                <AlertTriangle className="w-3 h-3" />
                <span>SLA Breached</span>
            </div>
        );
    }

    if (slaDeadline) {
        return (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                <Clock className="w-3 h-3" />
                <span>Due {new Date(slaDeadline).toLocaleDateString()}</span>
            </div>
        );
    }

    return null;
}