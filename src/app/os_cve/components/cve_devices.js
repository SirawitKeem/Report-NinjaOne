import React from 'react';
import { Server, ShieldAlert } from 'lucide-react';
import { getCveDeviceMapping } from '../../lib/os_cve';

export default async function CveDevicesTable() {
  try {
    const mapping = await getCveDeviceMapping();

    // Display the top 8 CVEs to fit neatly within Page 13 height guidelines
    const top8 = mapping.slice(0, 8);

    return (
      <div className="w-full pr-10 mt-5 flex flex-col">
        {/* Section Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <h3 className="text-[15px] font-bold text-slate-900">Vulnerability Device Mapping (CVE Details)</h3>
        </div>

        {/* Table Layout */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-xs text-gray-500">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-700">
              <tr>
                <th scope="col" className="px-4 py-3">CVE ID</th>
                <th scope="col" className="px-4 py-3 text-center">Score</th>
                <th scope="col" className="px-4 py-3 text-center">Severity</th>
                <th scope="col" className="px-4 py-3 text-center">Devices</th>
                <th scope="col" className="px-4 py-3">Affected Devices List</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border-t border-gray-100">
              {top8.map((c, index) => {
                let badgeBg = "bg-gray-100 text-gray-800";
                if (c.CVSS_Level === "Critical") {
                  badgeBg = "bg-red-100 text-red-700 font-bold";
                } else if (c.CVSS_Level === "High") {
                  badgeBg = "bg-orange-100 text-orange-700 font-semibold";
                } else if (c.CVSS_Level === "Medium") {
                  badgeBg = "bg-yellow-100 text-yellow-800";
                } else if (c.CVSS_Level === "Low") {
                  badgeBg = "bg-blue-100 text-blue-800";
                }

                return (
                  <tr key={c.CVE_ID || index} className="hover:bg-gray-50/50 transition-colors">
                    {/* CVE ID */}
                    <td className="whitespace-nowrap px-4 py-2.5 font-bold text-slate-900">
                      {c.CVE_ID}
                    </td>
                    {/* CVSS Score */}
                    <td className="whitespace-nowrap px-4 py-2.5 text-center font-extrabold text-slate-800">
                      {c.CVSS_Base_Score?.toFixed(1) || "N/A"}
                    </td>
                    {/* Severity Badge */}
                    <td className="whitespace-nowrap px-4 py-2.5 text-center">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] ${badgeBg}`}>
                        {c.CVSS_Level}
                      </span>
                    </td>
                    {/* Devices Count */}
                    <td className="whitespace-nowrap px-4 py-2.5 text-center font-bold text-slate-700">
                      {c.deviceCount}
                    </td>
                    {/* Inline Device Tags */}
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1.5 max-w-[380px]">
                        {c.devices.map((device, dIndex) => (
                          <span 
                            key={dIndex}
                            className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-750"
                          >
                            <Server className="h-2.5 w-2.5 text-slate-450" />
                            {device}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {top8.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                    No active vulnerabilities found on monitored devices.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ CveDevicesTable Error:", error);
    return <div className="p-4 text-red-500">Failed to load CVE device mapping.</div>;
  }
}
