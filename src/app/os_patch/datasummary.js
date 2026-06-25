import { Package, CheckCircle, Wrench, ThumbsUp, XCircle } from 'lucide-react';

export const getSummaryData = (counts) => ({
  mainStats: [
    { id: 1, label: "Total Patch", value: counts.total     ?? 0, icon: Package,     iconBg: "bg-blue-50",   iconColor: "text-blue-600",   barColor: "bg-blue-600"   },
    { id: 2, label: "Installed",   value: counts.installed ?? 0, icon: CheckCircle, iconBg: "bg-green-50",  iconColor: "text-green-600",  barColor: "bg-green-600"  },
    { id: 3, label: "Manual",      value: counts.manual    ?? 0, icon: Wrench,      iconBg: "bg-orange-50", iconColor: "text-orange-600", barColor: "bg-orange-600" },
    { id: 4, label: "Approved",    value: counts.approved  ?? 0, icon: ThumbsUp,    iconBg: "bg-purple-50", iconColor: "text-purple-600", barColor: "bg-purple-600" },
    { id: 5, label: "Rejected",    value: counts.rejected  ?? 0, icon: XCircle,     iconBg: "bg-red-50",    iconColor: "text-red-600",    barColor: "bg-red-600"    },
  ],
});