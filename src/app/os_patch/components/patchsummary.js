import Summary from '../../Components/Summary';
import { getSummaryData } from '../datasummary';
import { getOsPatchInstalls } from '../../lib/os_patch_installs';
import { getOsPatchesNo } from '../../lib/os_patches_no';

export default async function PatchSummary() {
  try {
    const [installedPatches, uninstalledPatches] = await Promise.all([
      getOsPatchInstalls(), // กรอง INSTALLED มาแล้ว
      getOsPatchesNo()      // กรอง non-INSTALLED มาแล้ว
    ]);

    const counts = {
      // ✅ total = installed + ที่เหลือทั้งหมด ไม่ซ้ำกันแล้ว
      total:    installedPatches.length + uninstalledPatches.length,
      installed: installedPatches.length,

      // นับแยก status จาก uninstalledPatches
      manual:   uninstalledPatches.filter(p => p.status === "MANUAL").length,
      approved: uninstalledPatches.filter(p => p.status === "APPROVED").length,
      rejected: uninstalledPatches.filter(p => p.status === "REJECTED").length,
    };

    // Debug — ลบออกได้ภายหลัง

    const { mainStats } = getSummaryData(counts);

    return (
      <div className="w-full pt-2.5 pb-1">
        <Summary mainStats={mainStats} />
      </div>
    );

  } catch (error) {
    console.error("Error loading Patch Summary:", error);
    return <div className="p-4 text-red-500">Failed to load patch statistics.</div>;
  }
}