import React from 'react';
import { ShieldAlert, Server, Monitor, AlertTriangle, Activity } from 'lucide-react';
import { getCveDeviceMapping, getDeviceCveSummary } from '../../lib/os_cve';

export default async function CveDevicesTable() {
  try {
    const cveMapping = await getCveDeviceMapping();
    const deviceSummary = await getDeviceCveSummary();

    // 1. Compute Executive Insights
    const totalVulnerableDevices = deviceSummary.length;
    
    // Find the single CVE that affects the most devices (most widespread)
    const mostWidespreadCve = cveMapping.length > 0
      ? cveMapping.reduce((max, c) => c.deviceCount > max.deviceCount ? c : max, cveMapping[0])
      : null;

    // Find the device with the highest number of active CVEs (most vulnerable)
    const mostVulnerableDevice = deviceSummary.length > 0
      ? deviceSummary[0]
      : null;

    // Get Top 4 widespread vulnerabilities to fit neatly
    const topWidespread = cveMapping
      .sort((a, b) => b.deviceCount - a.deviceCount || b.CVSS_Base_Score - a.CVSS_Base_Score)
      .slice(0, 4);

    // Get Top 4 most vulnerable devices to fit neatly
    const topDevices = deviceSummary.slice(0, 4);

    return (
      <div className="w-full pr-10 mt-4 flex flex-col gap-5">
        
        {/* Executive Insights Cards Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Card 1: Vulnerability Scope */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl border border-red-100 bg-red-50/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-650">
              <Monitor className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Affected Devices</span>
              <span className="text-base font-extrabold text-slate-800">
                {totalVulnerableDevices} {totalVulnerableDevices === 1 ? 'Device' : 'Devices'}
              </span>
            </div>
          </div>

          {/* Card 2: Highest Threat Device */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl border border-amber-100 bg-amber-50/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-650">
              <Activity className="h-5 w-5" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Highest Risk Host</span>
              <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                {mostVulnerableDevice ? `${mostVulnerableDevice.name} (${mostVulnerableDevice.cveCount} CVEs)` : 'None'}
              </span>
            </div>
          </div>

          {/* Card 3: Top Threat Definition */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Most Widespread CVE</span>
              <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                {mostWidespreadCve ? `${mostWidespreadCve.CVE_ID} (${mostWidespreadCve.deviceCount} hosts)` : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Most Widespread Vulnerabilities across Devices */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-4 w-4 text-red-650" />
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Top 4 Widespread Vulnerabilities (CVE Distribution)
            </h4>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            <table className="w-full border-collapse text-left text-xs text-gray-500">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-650">
                <tr>
                  <th scope="col" className="px-4 py-2">CVE ID</th>
                  <th scope="col" className="px-4 py-2 text-center">CVSS Score</th>
                  <th scope="col" className="px-4 py-2 text-center">Severity</th>
                  <th scope="col" className="px-4 py-2 text-center">Hosts</th>
                  <th scope="col" className="px-4 py-2">Vulnerable Device Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 border-t border-gray-100">
                {topWidespread.map((c, index) => {
                  let badgeBg = "bg-gray-100 text-gray-800";
                  if (c.CVSS_Level === "Critical") badgeBg = "bg-red-100 text-red-700 font-bold";
                  else if (c.CVSS_Level === "High") badgeBg = "bg-orange-100 text-orange-700 font-semibold";
                  else if (c.CVSS_Level === "Medium") badgeBg = "bg-yellow-100 text-yellow-800";
                  else if (c.CVSS_Level === "Low") badgeBg = "bg-blue-100 text-blue-800";

                  return (
                    <tr key={c.CVE_ID || index} className="hover:bg-gray-50/30 transition-colors">
                      <td className="whitespace-nowrap px-4 py-2 font-bold text-slate-900">{c.CVE_ID}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-center font-extrabold text-slate-800">
                        {c.CVSS_Base_Score?.toFixed(1) || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-center">
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] ${badgeBg}`}>
                          {c.CVSS_Level}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-center font-extrabold text-slate-700">{c.deviceCount}</td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-1 max-w-[380px]">
                          {c.devices.map((dev, dIndex) => (
                            <span 
                              key={dIndex}
                              className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-700"
                            >
                              <Server className="h-2 w-2 text-slate-450" />
                              {dev}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Monitored Devices Risk Matrix */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Server className="h-4 w-4 text-blue-650" />
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Top 4 Vulnerable Monitored Devices (Risk Profile)
            </h4>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            <table className="w-full border-collapse text-left text-xs text-gray-500">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-650">
                <tr>
                  <th scope="col" className="px-4 py-2">Device Name</th>
                  <th scope="col" className="px-4 py-2">OS Category</th>
                  <th scope="col" className="px-4 py-2 text-center">Pending Patches</th>
                  <th scope="col" className="px-4 py-2 text-center">Total CVEs</th>
                  <th scope="col" className="px-4 py-2 text-center">Critical CVEs</th>
                  <th scope="col" className="px-4 py-2 text-center">High CVEs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 border-t border-gray-100">
                {topDevices.map((d, index) => (
                  <tr key={d.id || index} className="hover:bg-gray-50/30 transition-colors">
                    <td className="whitespace-nowrap px-4 py-2 font-bold text-slate-900">{d.name}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-slate-600 font-medium">{d.osGroup}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-center font-bold text-slate-700">{d.patchCount}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-center font-extrabold text-red-650">{d.cveCount}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-center font-bold">
                      {d.criticalCount > 0 ? (
                        <span className="inline-flex items-center rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700">
                          {d.criticalCount}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-center font-bold">
                      {d.highCount > 0 ? (
                        <span className="inline-flex items-center rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold text-orange-700">
                          {d.highCount}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  } catch (error) {
    console.error("❌ CveDevicesTable Redesign Error:", error);
    return <div className="p-4 text-red-500">Failed to load Vulnerability Executive Dashboard.</div>;
  }
}
