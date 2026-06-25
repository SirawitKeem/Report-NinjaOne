import React from 'react';
import { BarChart3 } from 'lucide-react';
import BarGraph from '../../Components/BarGraph';
import { getOsCveData } from '../../lib/os_cve';

const colors = {
  Critical: "bg-red-800",
  High: "bg-red-500",
  Medium: "bg-orange-500",
  Low: "bg-yellow-400",
};

export default async function CveBarGraph() {
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

    const rawData = [
      { label: "High",     value: highCount,     color: colors.High },
      { label: "Medium",   value: mediumCount,   color: colors.Medium },
      { label: "Critical", value: criticalCount, color: colors.Critical },
      { label: "Low",      value: lowCount,      color: colors.Low },
    ];

    // Sort by count descending (like the screenshot where High > Medium > Critical > Low)
    const sortedData = rawData
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        id: index + 1,
        label: item.label,
        value: item.value,
        color: item.color,
      }));

    return (
      <div className="w-full h-[350px] pr-10 mt-4">
        <BarGraph
          title="Summary Vulnerabilities (CVE) by Severity"
          icon={BarChart3}
          data={sortedData}
        />
      </div>
    );
  } catch (error) {
    console.error("❌ CveBarGraph Error:", error);
    return <div className="p-4 text-red-500">Failed to load CVE bar graph.</div>;
  }
}
