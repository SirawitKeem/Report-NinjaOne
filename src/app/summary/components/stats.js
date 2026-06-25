import Summary from '../../Components/Stats';
import { getStatsData } from '../datastats';
import { getDevicesData } from '../../lib/device';
import { getOrganizationsData } from '../../lib/organizations';

export default async function SummaryStats() {

  // 1. ดึงข้อมูลพร้อมกัน
  const [devices, orgs] = await Promise.all([
    getDevicesData(),
    getOrganizationsData()
  ]);

  // 2. ตัวแปรนับจำนวน
  let windowsCount    = 0;
  let windowsSrvCount = 0;
  let linuxCount      = 0;
  let macOSCount      = 0;
  let androidCount    = 0;
  let guestVmCount    = 0;
  let networkCount    = 0;
  let othersCount     = 0;

  // 3. วนลูปจัดกลุ่มจาก osGroup และ nodeClass
  devices.forEach(d => {
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

  // 4. รวมตัวเลข
  const counts = {
    totalOrgs:    orgs.length,
    totalDevices: devices.length,
    windows:      windowsCount,
    windowsSrv:   windowsSrvCount,
    linux:        linuxCount,
    macOS:        macOSCount,
    android:      androidCount,
    guestVm:      guestVmCount,
    network:      networkCount,
    others:       othersCount,
  };

  // 5. ส่งให้ datastats.js
  const { mainStats, osDistribution } = getStatsData(counts);

  return (
    <div className="w-full pt-3 pb-1">
      <Summary mainStats={mainStats} subStats={osDistribution} />
    </div>
  );
}