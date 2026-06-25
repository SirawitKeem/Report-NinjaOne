import { Building, Monitor, Box, Network, MoreHorizontal } from 'lucide-react';
import { FaWindows, FaApple, FaLinux, FaAndroid } from 'react-icons/fa';

export const getStatsData = (counts) => ({
  mainStats: [
    {
      id: 1,
      label: "Organizations",
      value: counts.totalOrgs    ?? 0,
      icon: Building,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      barColor: "bg-blue-600",
    },
    {
      id: 2,
      label: "Total Devices",
      value: counts.totalDevices ?? 0,
      icon: Monitor,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      barColor: "bg-purple-600",
    },
  ],
  osDistribution: [
    { id: 1, label: "Windows",     value: counts.windows    ?? 0, icon: FaWindows,      iconColor: "text-blue-500"  },
    { id: 2, label: "macOS",       value: counts.macOS      ?? 0, icon: FaApple,        iconColor: "text-gray-800"  },
    { id: 3, label: "Guest VM",    value: counts.guestVm    ?? 0, icon: Box,            iconColor: "text-gray-500"  },
    { id: 4, label: "Android",     value: counts.android    ?? 0, icon: FaAndroid,      iconColor: "text-green-500" },
    { id: 5, label: "Windows SRV", value: counts.windowsSrv ?? 0, icon: FaWindows,      iconColor: "text-blue-800"  },
    { id: 6, label: "Linux",       value: counts.linux      ?? 0, icon: FaLinux,        iconColor: "text-slate-800" },
    { id: 7, label: "Network",     value: counts.network    ?? 0, icon: Network,        iconColor: "text-blue-400"  },
    { id: 8, label: "Others",      value: counts.others     ?? 0, icon: MoreHorizontal, iconColor: "text-gray-400"  },
  ],
});