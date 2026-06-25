import { fetchFromNinja } from "./ninjaClient";

export async function getDevicesData() {
  try {
    const rawDevices = await fetchFromNinja("/v2/devices-detailed");

    // กรอง Null SystemName
    const filteredDevices = rawDevices.filter(
      (d) => d.systemName && d.systemName !== ""
    );

    // ลบ Duplicates ด้วย Device ID
    const uniqueDevicesMap = new Map();
    filteredDevices.forEach((d) => uniqueDevicesMap.set(d.id, d));
    const uniqueDevices = Array.from(uniqueDevicesMap.values());

    const transformedData = uniqueDevices.map((device) => {
      const nodeClass = String(device.nodeClass || "").toUpperCase();

      // จัดกลุ่ม OS จาก nodeClass
      let osGroup = "other";

      if (nodeClass === "WINDOWS_SERVER") {
        osGroup = "windowsSrv";
      } else if (
        nodeClass === "WINDOWS_WORKSTATION" ||
        nodeClass === "WINDOWS"
      ) {
        osGroup = "windows";
      } else if (
        nodeClass === "LINUX_WORKSTATION" ||
        nodeClass === "LINUX_SERVER" ||
        nodeClass === "LINUX"
      ) {
        osGroup = "linux";
      } else if (
        nodeClass === "MAC" ||
        nodeClass === "APPLE_MAC" ||
        nodeClass.includes("MAC")
      ) {
        osGroup = "macOS";
      }

      return {
        id: device.id,
        uid: device.uid,
        organizationId: device.organizationId,
        locationId: device.locationId,
        systemName: device.systemName,
        displayName: device.displayName,
        nodeClass: device.nodeClass,
        osGroup,
        created: device.created
          ? new Date(device.created * 1000)
          : null,
        lastContact: device.lastContact
          ? new Date(device.lastContact * 1000)
          : null,
        lastUpdate: device.lastUpdate
          ? new Date(device.lastUpdate * 1000)
          : null,
        ipAddresses: device.ipAddresses || [],
        macAddresses: device.macAddresses || [],
        publicIP: device.publicIP || null,
        notes: device.notes?.[0]?.text || null,
        tags: device.tags || [],
        approvalStatus: device.approvalStatus || null,
        offline: device.offline ?? null,
        system: device.system || null,
        os: device.os || null,
      };
    });

    return transformedData;
  } catch (error) {
    console.error("Device Fetch Error:", error);
    throw error;
  }
}