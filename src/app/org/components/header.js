import Header from '../../Components/Header';
import { reportData } from '../data';

// นำเข้า API
import { getDevicesData } from '../../lib/device';
import { getOrganizationsData } from '../../lib/organizations';

export default async function OrganizationsHeader() {
  // 1. ดึงข้อมูลจาก API
  const devices = await getDevicesData();
  const orgs = await getOrganizationsData();

  // 2. สร้างตัวจับคู่ ID -> ชื่อ Organization
  const orgNameMap = {};
  orgs.forEach(org => {
    orgNameMap[org['ORGANIZATION ID']] = org['ORGANIZATION NAME'];
  });

  // 3. นับจำนวน Device แยกตาม Organization ID
  const deviceCountsByOrg = {};
  devices.forEach(device => {
    const orgId = device.organizationId;
    if (orgId) {
      deviceCountsByOrg[orgId] = (deviceCountsByOrg[orgId] || 0) + 1;
    }
  });

  // 4. แปลงเป็น Array และเรียงลำดับจากมากไปน้อย
  const sortedOrganizations = Object.entries(deviceCountsByOrg)
    .map(([orgId, count]) => ({
      orgId: orgId,
      name: orgNameMap[orgId] || "Unknown Organization",
      count: count
    }))
    .sort((a, b) => b.count - a.count); // เรียงจากมากไปน้อย

  // 5. ดึงชื่อ Organization อันดับ 1 (ที่มี Device มากที่สุด)
  // ถ้าไม่มีข้อมูลเลย ให้แสดงเป็นค่าว่างเผื่อไว้ก่อน
  const topOrganizationName = sortedOrganizations.length > 0 ? sortedOrganizations[0].name : "";

  return (
    <Header 
      title={reportData.title} 
      // นำชื่อที่หาได้มาต่อท้าย subtitle จากแม่แบบ data.js
      subtitle={`${reportData.subtitle}${topOrganizationName}`} 
    />
  );
}