import React from 'react';
import SummarySix from '../../Components/Summary_six';
import { getSeverityPendingSummaryData, countBySeverity } from '../dataseverity_pen';
import { getOsPatchesNo } from '../../lib/os_patches_no';

export default async function PatchSeverityPendingSummary() {
  try {
    const pendingPatches = await getOsPatchesNo();
    const counts = countBySeverity(pendingPatches);


    const { mainStats } = getSeverityPendingSummaryData(counts);

    return (
      <div className="w-full pt-2.5 pb-1 mt-3">
        <SummarySix mainStats={mainStats} />
      </div>
    );

  } catch (error) {
    console.error("Error loading Patch Severity Pending Summary:", error);
    return <div className="p-4 text-red-500">Failed to load severity summary data.</div>;
  }
}