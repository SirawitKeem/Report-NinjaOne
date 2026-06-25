import Summary from '../../Components/Stats';
import { getStatsData } from '../datastats';
import { getDevicesData } from '../../lib/device';
import { getOrganizationsData } from '../../lib/organizations';

export default async function OrgSummaryStats() {
  const [devices, orgs] = await Promise.all([
    getDevicesData(),
    getOrganizationsData()
  ]);

  // A: นับจำนวน Device แยกตาม Org หา Org ที่มีเครื่องมากที่สุด
  const deviceCountsByOrg = {};
  devices.forEach(device => {
    const orgId = device.organizationId;
    if (orgId) {
      deviceCountsByOrg[orgId] = (deviceCountsByOrg[orgId] || 0) + 1;
    }
  });

  let topOrgId = null;
  let maxCount = 0;
  for (const [orgId, count] of Object.entries(deviceCountsByOrg)) {
    if (count > maxCount) {
      maxCount = count;
      topOrgId = orgId;
    }
  }

  const topOrg = orgs.find(o => String(o['ORGANIZATION ID']) === String(topOrgId));
  const topOrgName = topOrg ? topOrg['ORGANIZATION NAME'] : `Org ${topOrgId}`;

  // B: กรองเฉพาะ Device ขององค์กรอันดับ 1
  const orgDevices = devices.filter(d => String(d.organizationId) === String(topOrgId));

  // C: นับแยกหมวดหมู่ — ใช้ osGroup และ nodeClass จาก device.js ใหม่
  let windowsCount    = 0;
  let windowsSrvCount = 0;
  let linuxCount      = 0;
  let macOSCount      = 0;
  let androidCount    = 0;
  let guestVmCount    = 0;
  let networkCount    = 0;
  let othersCount     = 0;

  orgDevices.forEach(d => {
    const nodeClass = String(d.nodeClass || "").toUpperCase();

    if (d.osGroup === "windows") {
      windowsCount++;
    } else if (d.osGroup === "windowsSrv") {
      windowsSrvCount++;
    } else if (d.osGroup === "linux") {
      linuxCount++;
    } else if (d.osGroup === "macOS") {
      macOSCount++;
    } else if (nodeClass.includes("ANDROID")) {
      androidCount++;
    } else if (
      nodeClass === "VMWARE_VM"  ||
      nodeClass === "HYPERV_VM"  ||
      nodeClass === "VIRTUALBOX" ||
      nodeClass.includes("VM")
    ) {
      guestVmCount++;
    } else if (
      nodeClass.includes("NETWORK")  ||
      nodeClass.includes("SWITCH")   ||
      nodeClass.includes("ROUTER")   ||
      nodeClass.includes("FIREWALL") ||
      nodeClass.includes("NMS")
    ) {
      networkCount++;
    } else {
      othersCount++;
    }
  });

  // D: รวมตัวเลข
  const counts = {
    totalOrgs:    topOrgName,
    totalDevices: orgDevices.length,
    windows:      windowsCount,
    windowsSrv:   windowsSrvCount,
    linux:        linuxCount,
    macOS:        macOSCount,
    android:      androidCount,
    guestVm:      guestVmCount,
    network:      networkCount,
    others:       othersCount,
  };

  const { mainStats, osDistribution } = getStatsData(counts);

  return (
    <div className="w-full pt-2.5 pb-1">
      <Summary mainStats={mainStats} subStats={osDistribution} />
    </div>
  );
}