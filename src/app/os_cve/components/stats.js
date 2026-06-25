import React from 'react';
import { Activity, AlertOctagon, ShieldAlert, AlertTriangle, Star } from 'lucide-react';
import Summary from '../../Components/Summary_six';
import { getOsCveData } from '../../lib/os_cve';

export default async function CveStats() {
  try {
    const cves = await getOsCveData();

    let criticalCount = 0;
    let highCount     = 0;
    let mediumCount   = 0;
    let lowCount      = 0;

    cves.forEach(c => {
      const lvl = c.CVSS_Level;
      if      (lvl === "Critical") criticalCount++;
      else if (lvl === "High")     highCount++;
      else if (lvl === "Medium")   mediumCount++;
      else if (lvl === "Low")      lowCount++;
    });

    const mainStats = [
      {
        id: 1,
        label: "Results",
        value: cves.length,
        icon: Activity,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        barColor: "bg-blue-600",
      },
      {
        id: 2,
        label: "Critical",
        value: criticalCount,
        icon: AlertOctagon,
        iconBg: "bg-red-50",
        iconColor: "text-red-600",
        barColor: "bg-red-600",
      },
      {
        id: 3,
        label: "High",
        value: highCount,
        icon: ShieldAlert,
        iconBg: "bg-red-50",
        iconColor: "text-red-500",
        barColor: "bg-red-500",
      },
      {
        id: 4,
        label: "Medium",
        value: mediumCount,
        icon: AlertTriangle,
        iconBg: "bg-orange-50",
        iconColor: "text-orange-500",
        barColor: "bg-orange-500",
      },
      {
        id: 5,
        label: "Low",
        value: lowCount,
        icon: Star,
        iconBg: "bg-yellow-50",
        iconColor: "text-yellow-500",
        barColor: "bg-yellow-500",
      },
    ];


    return (
      <div className="w-full pt-2.5 pb-1">
        <Summary mainStats={mainStats} />
      </div>
    );
  } catch (error) {
    console.error("❌ CveStats Error:", error);
    return <div className="p-4 text-red-500">Failed to load CVE stats.</div>;
  }
}
