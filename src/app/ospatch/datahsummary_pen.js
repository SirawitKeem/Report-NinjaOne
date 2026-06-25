import { AlertCircle } from 'lucide-react';
import { FaWindows, FaApple, FaLinux } from 'react-icons/fa';

export const getOsPatchPendingSummaryData = (counts) => ({
  mainStats: [
    { 
      id: 1, 
      label: "Total Patches Pending", 
      value: counts.total      ?? 0, 
      icon: AlertCircle, 
      iconBg: "bg-orange-50", 
      iconColor: "text-orange-500", 
      barColor: "bg-orange-500" 
    },
    { 
      id: 2, 
      label: "Windows", 
      value: counts.windows    ?? 0, 
      icon: FaWindows, 
      iconBg: "bg-blue-50", 
      iconColor: "text-blue-500", 
      barColor: "bg-blue-500" 
    }, 
    { 
      id: 3, 
      label: "Mac OS", 
      value: counts.macOS      ?? 0, 
      icon: FaApple, 
      iconBg: "bg-gray-100", 
      iconColor: "text-gray-800", 
      barColor: "bg-gray-800" 
    },
    { 
      id: 4, 
      label: "Windows SRV", 
      value: counts.windowsSrv ?? 0, 
      icon: FaWindows, 
      iconBg: "bg-blue-50", 
      iconColor: "text-blue-800", 
      barColor: "bg-blue-800" 
    },
    { 
      id: 5, 
      label: "Linux", 
      value: counts.linux      ?? 0, 
      icon: FaLinux, 
      iconBg: "bg-slate-100", 
      iconColor: "text-slate-800", 
      barColor: "bg-slate-800" 
    },
  ],
});