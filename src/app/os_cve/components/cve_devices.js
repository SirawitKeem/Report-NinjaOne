import React from 'react';
import { Server, ShieldAlert, AlertTriangle, Info, ShieldX } from 'lucide-react';
import { getCveDeviceMapping, getDeviceCveSummary } from '../../lib/os_cve';

export default async function CveDevicesTable() {
  try {
    const cveMapping = await getCveDeviceMapping();
    const deviceSummary = await getDeviceCveSummary();

    // Group CVEs by severity class
    const criticalCves = cveMapping.filter(c => c.CVSS_Level === 'Critical');
    const highCves = cveMapping.filter(c => c.CVSS_Level === 'High');
    const mediumLowCves = cveMapping.filter(c => c.CVSS_Level === 'Medium' || c.CVSS_Level === 'Low' || c.CVSS_Level === 'None');

    // Slice groups to fit the A4 page height perfectly without overflow
    const displayedCritical = criticalCves.slice(0, 6);
    const displayedHigh = highCves.slice(0, 6);
    const displayedMediumLow = mediumLowCves.slice(0, 3);

    // Get Top 6 vulnerable devices for the Risk Profile section
    const topDevices = deviceSummary.slice(0, 6);

    return (
      <div className="w-full pr-10 mt-4 flex flex-col gap-6 font-sans">
        
        {/* Section A: CVEs Grouped by Severity */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-slate-850" />
            <h4 className="text-[13px] font-bold text-slate-900 uppercase tracking-wide">
              Active CVEs Grouped by Severity
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-3">
            
            {/* Group 1: Critical (Score 9.0 - 10.0) -> Dark Red */}
            <div className="flex flex-col border-l-4 border-red-700 bg-red-50/15 p-3 rounded-r-xl border border-y-slate-100 border-r-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldX className="h-4 w-4 text-red-700" />
                  <span className="text-[11px] font-bold text-red-950 font-sans">Critical Severity Vulnerabilities (CVSS 9.0+)</span>
                </div>
                <span className="text-[9px] font-extrabold bg-red-100 text-red-700 px-2 py-0.5 rounded-full leading-none">
                  {criticalCves.length} Active
                </span>
              </div>
              
              {displayedCritical.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {displayedCritical.map((c, i) => (
                    <div key={c.CVE_ID || i} className="flex items-center justify-between text-xs py-1 border-b border-red-100/30 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{c.CVE_ID}</span>
                        <span className="font-extrabold text-red-700 bg-red-50 px-1.5 py-0.5 rounded text-[9px] leading-none">
                          {c.CVSS_Base_Score?.toFixed(1)}
                        </span>
                        <span className="text-[9px] text-slate-500 font-medium ml-1">
                          {c.deviceCount} {c.deviceCount === 1 ? 'Host' : 'Hosts'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 items-center justify-end">
                        {c.devices.slice(0, 5).map((dev, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 rounded bg-white border border-red-200 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700 leading-none">
                            <Server className="h-2 w-2 text-red-600" />
                            {dev}
                          </span>
                        ))}
                        {c.devices.length > 5 && (
                          <span className="text-[9px] text-slate-400 font-bold ml-1 leading-none">+{c.devices.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic py-1">No active critical severity vulnerabilities found.</span>
              )}
            </div>

            {/* Group 2: High (Score 7.0 - 8.9) -> Red */}
            <div className="flex flex-col border-l-4 border-red-500 bg-red-50/5 p-3 rounded-r-xl border border-y-slate-100 border-r-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-[11px] font-bold text-red-900 font-sans">High Severity Vulnerabilities (CVSS 7.0 - 8.9)</span>
                </div>
                <span className="text-[9px] font-extrabold bg-red-50 text-red-500 px-2 py-0.5 rounded-full leading-none border border-red-100">
                  {highCves.length} Active
                </span>
              </div>

              {displayedHigh.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {displayedHigh.map((c, i) => (
                    <div key={c.CVE_ID || i} className="flex items-center justify-between text-xs py-1 border-b border-red-100/30 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{c.CVE_ID}</span>
                        <span className="font-extrabold text-red-500 bg-red-50/50 px-1.5 py-0.5 rounded text-[9px] leading-none">
                          {c.CVSS_Base_Score?.toFixed(1)}
                        </span>
                        <span className="text-[9px] text-slate-500 font-medium ml-1">
                          {c.deviceCount} {c.deviceCount === 1 ? 'Host' : 'Hosts'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 items-center justify-end">
                        {c.devices.slice(0, 5).map((dev, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 rounded bg-white border border-red-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700 leading-none">
                            <Server className="h-2 w-2 text-red-400" />
                            {dev}
                          </span>
                        ))}
                        {c.devices.length > 5 && (
                          <span className="text-[9px] text-slate-400 font-bold ml-1 leading-none">+{c.devices.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic py-1">No active high severity vulnerabilities found.</span>
              )}
            </div>

            {/* Group 3: Medium & Low (Score < 7.0) -> Orange */}
            <div className="flex flex-col border-l-4 border-orange-500 bg-orange-50/10 p-3 rounded-r-xl border border-y-slate-100 border-r-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-orange-500" />
                  <span className="text-[11px] font-bold text-orange-900 font-sans">Medium & Low Severity Vulnerabilities (CVSS &lt; 7.0)</span>
                </div>
                <span className="text-[9px] font-extrabold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full leading-none">
                  {mediumLowCves.length} Active
                </span>
              </div>

              {displayedMediumLow.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {displayedMediumLow.map((c, i) => (
                    <div key={c.CVE_ID || i} className="flex items-center justify-between text-xs py-1 border-b border-orange-100/30 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{c.CVE_ID}</span>
                        <span className="font-extrabold text-orange-650 bg-orange-50 px-1.5 py-0.5 rounded text-[9px] leading-none">
                          {c.CVSS_Base_Score?.toFixed(1)}
                        </span>
                        <span className="text-[9px] text-slate-500 font-medium ml-1">
                          {c.deviceCount} {c.deviceCount === 1 ? 'Host' : 'Hosts'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 items-center justify-end">
                        {c.devices.slice(0, 5).map((dev, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 rounded bg-white border border-orange-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700 leading-none">
                            <Server className="h-2 w-2 text-orange-400" />
                            {dev}
                          </span>
                        ))}
                        {c.devices.length > 5 && (
                          <span className="text-[9px] text-slate-400 font-bold ml-1 leading-none">+{c.devices.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic py-1">No active medium or low severity vulnerabilities found.</span>
              )}
            </div>

          </div>
        </div>

        {/* Section B: Vulnerable Monitored Devices (Risk Profile) */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2.5">
            <Server className="h-4.5 w-4.5 text-slate-800" />
            <h4 className="text-[13px] font-bold text-slate-900 uppercase tracking-wide">
              Vulnerable Monitored Devices (Risk Profile)
            </h4>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full border-collapse text-left text-xs text-gray-500">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-655">
                <tr>
                  <th scope="col" className="px-4 py-2.5">Device Name</th>
                  <th scope="col" className="px-4 py-2.5">OS Category</th>
                  <th scope="col" className="px-4 py-2.5 text-center">Pending Patches</th>
                  <th scope="col" className="px-4 py-2.5 text-center">Total CVEs</th>
                  <th scope="col" className="px-4 py-2.5 text-center">Critical CVEs</th>
                  <th scope="col" className="px-4 py-2.5 text-center">High CVEs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 border-t border-gray-100">
                {topDevices.map((d, index) => (
                  <tr key={d.id || index} className="hover:bg-gray-50/30 transition-colors">
                    <td className="whitespace-nowrap px-4 py-2.5 font-bold text-slate-900">{d.name}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-605 font-medium">{d.osGroup}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-center font-bold text-slate-700">{d.patchCount}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-center font-extrabold text-red-650">{d.cveCount}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-center font-bold">
                      {d.criticalCount > 0 ? (
                        <span className="inline-flex items-center rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700">
                          {d.criticalCount}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-center font-bold">
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
