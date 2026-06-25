import React from 'react';
import Summary from '../../Components/Summary_tree';
import { getDeviceSummaryData } from '../datadevicesummary';
import { getDevicesData } from '../../lib/device';
import { getOsPatchesNo } from '../../lib/os_patches_no';
import { getOsPatchInstalls } from '../../lib/os_patch_installs';

export default async function DevicePatchSummary() {
  try {
    // 1. ดึงข้อมูล 3 เส้นพร้อมกัน
    const [devices, uninstalledPatches, installedPatches] = await Promise.all([
      getDevicesData(),
      getOsPatchesNo(),
      getOsPatchInstalls()
    ]);

    // 2. Build Set: deviceId ที่มี pending patch อยู่
    const pendingDeviceIds = new Set();
    uninstalledPatches.forEach(patch => {
      const id = String(patch.deviceId || "");
      if (!id) return;
      pendingDeviceIds.add(id);
    });

    // 3. Build Set: deviceId ที่มี installed record อย่างน้อย 1 ตัว
    const devicesWithInstalled = new Set(
      installedPatches
        .map(p => String(p.deviceId ?? ""))
        .filter(Boolean)
    );

    // 4. Loop ทุก device แบ่ง 3 กลุ่ม
    const allDeviceIds = new Set(devices.map(d => String(d.id)));

    let healthyCount     = 0;
    let noPatchDataCount = 0;

    allDeviceIds.forEach(id => {
      const hasInstalled = devicesWithInstalled.has(id);
      const hasPending   = pendingDeviceIds.has(id);

      if (hasInstalled && !hasPending) {
        // ✅ Healthy: ติด patch ครบ ไม่มีค้าง
        healthyCount++;
      } else if (!hasInstalled && !hasPending) {
        // ❓ No Patch Data: NinjaOne ไม่รู้สถานะ patch
        noPatchDataCount++;
      }
      // hasPending → นับอยู่ใน pendingDeviceIds.size แล้ว
    });

    // 5. ส่งตัวเลขให้ Summary Component
    const counts = {
      totalDevices:    devices.length,
      healthyDevices:  healthyCount,
      pendingDevices:  pendingDeviceIds.size,
      noPatchData:     noPatchDataCount,
    };

    const { mainStats } = getDeviceSummaryData(counts);

    return (
      <div className="w-full pt-2.5 pb-1 mt-3">
        <Summary mainStats={mainStats} />
      </div>
    );

  } catch (error) {
    console.error("Error loading Device Patch Summary:", error);
    return <div className="p-4 text-red-500">Failed to load device summary.</div>;
  }
}