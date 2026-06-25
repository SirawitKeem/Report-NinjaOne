import { Monitor } from 'lucide-react';
import { FaWindows, FaApple, FaLinux } from 'react-icons/fa';

export const getPatchInstalledSummaryData = (counts) => ({
  mainStats: [
    { 
      id: 1, 
      label: "Installed Complete", 
      value: counts.total      ?? 0, 
      icon: Monitor, 
      iconBg: "bg-green-50", 
      iconColor: "text-green-600", 
      barColor: "bg-green-600" 
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