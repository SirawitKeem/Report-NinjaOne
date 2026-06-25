import React from 'react';
import { Shield } from 'lucide-react';
import { getOsCveData } from '../../lib/os_cve';

export default async function TopCvesTable() {
  try {
    const cves = await getOsCveData();

    // Sort by CVSS Base Score descending, and get top 10
    const top10 = cves
      .sort((a, b) => b.CVSS_Base_Score - a.CVSS_Base_Score)
      .slice(0, 10);

    return (
      <div className="w-full pr-10 mt-6 flex flex-col">
        {/* Table Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Shield className="h-4 w-4" />
          </div>
          <h3 className="text-[15px] font-bold text-slate-900">Top 10 Critical Vulnerabilities (CVE)</h3>
        </div>

        {/* Table Layout */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-xs text-gray-500">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-700">
              <tr>
                <th scope="col" className="px-4 py-2.5">CVE ID</th>
                <th scope="col" className="px-4 py-2.5 text-center">KB Article</th>
                <th scope="col" className="px-4 py-2.5 text-center">CVSS Score</th>
                <th scope="col" className="px-4 py-2.5 text-center">Severity</th>
                <th scope="col" className="px-4 py-2.5">Vulnerability Impact / Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border-t border-gray-100">
              {top10.map((c, index) => {
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
                    <td className="whitespace-nowrap px-4 py-2 font-semibold text-slate-900">
                      {c.CVE_ID}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-center text-slate-600">
                      {c.KB_Number}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-center font-bold text-slate-800">
                      {c.CVSS_Base_Score?.toFixed(1) || "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-center">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] ${badgeBg}`}>
                        {c.CVSS_Level}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-600 truncate max-w-[280px]">
                      <span className="font-medium text-slate-800">{c.Impact}</span>
                      <span className="mx-1 text-gray-300">|</span>
                      <span className="text-gray-400">{c.Product}</span>
                    </td>
                  </tr>
                );
              })}

              {top10.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                    No vulnerabilities found in pending updates.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ TopCvesTable Error:", error);
    return <div className="p-4 text-red-500">Failed to load CVE details table.</div>;
  }
}
