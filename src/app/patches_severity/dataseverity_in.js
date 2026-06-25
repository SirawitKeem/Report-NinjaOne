import { CheckCircle, AlertOctagon, AlertTriangle, ShieldAlert, Puzzle, HelpCircle } from 'lucide-react';

export function countBySeverity(patches) {
  let total = 0, critical = 0, important = 0, security = 0, optional = 0, none = 0;

  patches.forEach(patch => {
    total++;
    const severity = (patch.severity || "NONE").toUpperCase().trim();

    if (severity === "CRITICAL")       critical++;
    else if (severity === "IMPORTANT") important++;
    else if (severity === "SECURITY")  security++;
    else if (severity === "OPTIONAL")  optional++;
    else                               none++;
  });

  return { total, critical, important, security, optional, none };
}

export const getSeverityInstalledSummaryData = (counts) => ({
  mainStats: [
    { id: 1, label: "Total Installed", value: counts.total    ?? 0, icon: CheckCircle,  iconBg: "bg-emerald-50", iconColor: "text-emerald-600", barColor: "bg-emerald-600" },
    { id: 2, label: "Critical",        value: counts.critical ?? 0, icon: AlertOctagon,  iconBg: "bg-red-50",     iconColor: "text-red-600",     barColor: "bg-red-600"     },
    { id: 3, label: "Important",       value: counts.important?? 0, icon: AlertTriangle, iconBg: "bg-orange-50",  iconColor: "text-orange-500",  barColor: "bg-orange-500"  },
    { id: 4, label: "Security",        value: counts.security ?? 0, icon: ShieldAlert,   iconBg: "bg-blue-50",    iconColor: "text-blue-600",    barColor: "bg-blue-600"    },
    { id: 5, label: "Optional",        value: counts.optional ?? 0, icon: Puzzle,        iconBg: "bg-purple-50",  iconColor: "text-purple-600",  barColor: "bg-purple-600"  },
    { id: 6, label: "None",            value: counts.none     ?? 0, icon: HelpCircle,    iconBg: "bg-gray-100",   iconColor: "text-gray-500",    barColor: "bg-gray-500"    },
  ],
});