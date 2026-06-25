import { Monitor, ShieldCheck, AlertTriangle, HelpCircle } from 'lucide-react';

export const getDeviceSummaryData = (counts) => ({
  mainStats: [
    {
      id: 1,
      label: "Total Devices",
      value: counts.totalDevices   ?? 0,
      icon: Monitor,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      barColor: "bg-blue-600",
    },
    {
      id: 2,
      label: "Installed Complete",
      value: counts.healthyDevices ?? 0,
      icon: ShieldCheck,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      barColor: "bg-green-600",
    },
    {
      id: 3,
      label: "Pending Devices",
      value: counts.pendingDevices ?? 0,
      icon: AlertTriangle,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      barColor: "bg-orange-600",
    },
    {
      id: 4,
      label: "None",
      value: counts.noPatchData    ?? 0,
      icon: HelpCircle,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
      barColor: "bg-gray-500",
    },
  ],
});