import React from 'react';
import { Monitor, AlertOctagon, HelpCircle, Star, BarChart2, Puzzle } from 'lucide-react';
import Summary from '../Components/Summary_six';
import BarGraph from '../Components/BarGraph';
import { getAllSoftwareData } from '../lib/software';

// 1. Normalize impact string from NinjaOne API
export const normalizeImpact = (impact) => {
  const val = String(impact || "").toUpperCase();
  if (val === "CRITICAL")    return "critical";
  if (val === "RECOMMENDED") return "recommended";
  if (val === "OPTIONAL")    return "optional";
  return "unknown"; // Default everything else (like unknown or empty) to unknown
};

// 2. Styling configurations for each software status type
export const STATUS_THEMES = {
  Installed: {
    label: "Total Installed Items",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    barColor: "bg-green-600",
  },
  Approved: {
    label: "Total Approved Items",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    barColor: "bg-teal-600",
  },
  Pending: {
    label: "Total Pending Items",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    barColor: "bg-orange-500",
  },
  Rejected: {
    label: "Total Rejected Items",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    barColor: "bg-red-600",
  },
};

// 3. Main Stats generation helper (exactly 5 cards: Total, Critical, Recommended, Optional, Unknown)
export const getSoftwareSecurityStatsData = (statusType, counts) => {
  const theme = STATUS_THEMES[statusType] || STATUS_THEMES.Installed;
  
  return {
    mainStats: [
      {
        id: 1,
        label: theme.label,
        value: counts.total ?? 0,
        icon: Monitor,
        iconBg: theme.iconBg,
        iconColor: theme.iconColor,
        barColor: theme.barColor,
      },
      {
        id: 2,
        label: "Critical",
        value: counts.critical ?? 0,
        icon: AlertOctagon,
        iconBg: "bg-red-50",
        iconColor: "text-red-600",
        barColor: "bg-red-600",
      },
      {
        id: 3,
        label: "Recommended",
        value: counts.recommended ?? 0,
        icon: Star,
        iconBg: "bg-yellow-50",
        iconColor: "text-yellow-500",
        barColor: "bg-yellow-500",
      },
      {
        id: 4,
        label: "Optional",
        value: counts.optional ?? 0,
        icon: Puzzle,
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
        barColor: "bg-purple-600",
      },
      {
        id: 5,
        label: "Unknown",
        value: counts.unknown ?? 0,
        icon: HelpCircle,
        iconBg: "bg-gray-50",
        iconColor: "text-gray-500",
        barColor: "bg-gray-500",
      },
    ],
  };
};

// 4. Color mappings for bar charts
export const IMPACT_COLOR_MAP = {
  critical:    "bg-red-600",
  recommended: "bg-yellow-500",
  optional:    "bg-purple-600",
  unknown:     "bg-gray-500",
};

// Priority list for sorting bar charts
export const IMPACT_PRIORITY = ["critical", "recommended", "optional", "unknown"];

// ==========================================
// Generic Components
// ==========================================

// Shared Summary component that fetches data, aggregates, and renders layout
export async function SecuritySummary({ statusType }) {
  try {
    const softwareData = await getAllSoftwareData();
    const filteredItems = softwareData.filter(s => s.softwareStatus === statusType);

    let totalCount       = 0;
    let criticalCount    = 0;
    let recommendedCount = 0;
    let optionalCount    = 0;
    let unknownCount     = 0;

    filteredItems.forEach(s => {
      totalCount++;
      const key = normalizeImpact(s.impact);
      if      (key === "critical")    criticalCount++;
      else if (key === "recommended") recommendedCount++;
      else if (key === "optional")    optionalCount++;
      else                            unknownCount++;
    });

    const counts = {
      total:       totalCount,
      critical:    criticalCount,
      recommended: recommendedCount,
      optional:    optionalCount,
      unknown:     unknownCount,
    };


    const { mainStats } = getSoftwareSecurityStatsData(statusType, counts);

    const isSecond = statusType === "Pending" || statusType === "Rejected";
    return (
      <div className={`w-full pt-2.5 pb-1 ${isSecond ? "mt-3" : ""}`}>
        <Summary mainStats={mainStats} />
      </div>
    );
  } catch (error) {
    console.error(`❌ SECURITY_${statusType.toUpperCase()} Error:`, error);
    return <div className="p-4 text-red-500">Failed to load security {statusType.toLowerCase()} summary.</div>;
  }
}

// Shared BarGraph component that fetches data, formats top 10, and renders layout
export async function BargraphSecurity({ statusType, title }) {
  try {
    const softwareData = await getAllSoftwareData();
    const filteredItems = softwareData.filter(s => s.softwareStatus === statusType);

    const softwareMap = {};

    filteredItems.forEach(s => {
      const name   = s.softwareName || "Unknown";
      const impact = normalizeImpact(s.impact);
      const devId  = String(s.deviceId ?? "");

      if (!softwareMap[name]) {
        softwareMap[name] = { devices: new Set(), impact };
      }

      if (devId) softwareMap[name].devices.add(devId);

      const current  = IMPACT_PRIORITY.indexOf(softwareMap[name].impact);
      const incoming = IMPACT_PRIORITY.indexOf(impact);
      if (incoming < current) softwareMap[name].impact = impact;
    });

    const top10 = Object.entries(softwareMap)
      .sort((a, b) => {
        const idxA = IMPACT_PRIORITY.indexOf(a[1].impact);
        const idxB = IMPACT_PRIORITY.indexOf(b[1].impact);
        if (idxA !== idxB) return idxA - idxB;
        return b[1].devices.size - a[1].devices.size;
      })
      .slice(0, 10)
      .map(([name, data], index) => ({
        id:    index + 1,
        label: name,
        value: data.devices.size,
        color: IMPACT_COLOR_MAP[data.impact] || "bg-gray-500",
      }));


    return (
      <div className="w-full h-[350px] pr-10 mt-4">
        <BarGraph
          title={title}
          icon={BarChart2}
          data={top10}
        />
      </div>
    );
  } catch (error) {
    console.error(`❌ BARGRAPH_${statusType.toUpperCase()} Error:`, error);
    return <div className="p-4 text-red-500">Failed to load security {statusType.toLowerCase()} chart.</div>;
  }
}
