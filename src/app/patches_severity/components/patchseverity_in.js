import React from 'react';
import SummarySix from '../../Components/Summary_six';
import { getSeverityInstalledSummaryData, countBySeverity } from '../dataseverity_in';
import { getOsPatchInstalls } from '../../lib/os_patch_installs';

export default async function PatchSeverityInstalledSummary() {
  try {
    const installedPatches = await getOsPatchInstalls();

    // ✅ ใช้ countBySeverity แทน forEach ที่เขียนซ้ำ
    const counts = countBySeverity(installedPatches);
    const { mainStats } = getSeverityInstalledSummaryData(counts);

    return (
      <div className="w-full pt-2.5 pb-1">
        <SummarySix mainStats={mainStats} />
      </div>
    );

  } catch (error) {
    console.error("Error loading Patch Severity Summary:", error);
    return <div className="p-4 text-red-500">Failed to load severity summary data.</div>;
  }
}