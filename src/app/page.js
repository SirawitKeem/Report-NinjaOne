import React from 'react'
import SummaryHeader from './summary/components/header'
import SummaryStats from './summary/components/stats'
import SummaryBarGraph from './summary/components/bargraphorg'
import SummaryOsBarGraph from './summary/components/bargraphos'
import SummaryModelBarGraph from './summary/components/bargraphmodel'

import OrganizationsHeader from './org/components/header'
import OrgSummaryStats from './org/components/stats'
import OrgSummaryOsBarGraph from './org/components/bargraphos'
import OrgSummaryModelBarGraph from './org/components/bargraphmodel'

import SummaryHeaderOsPatch from './os_patch/components/header'
import PatchSummary from './os_patch/components/patchsummary'
import PatchOverviewBarGraph from './os_patch/components/bargraphoverview'
import DevicePatchSummary from './os_patch/components/devicesummary'
import DevicePieChartOverview from './os_patch/components/piechartdeviceoverview'

import PatchSummaryInstalled from './os_patch_device/components/patchsummary_in'
import PatchInstalledBarGraph_Devices from './os_patch_device/components/bargrap_in'
import PatchSummaryPending from './os_patch_device/components/patchsummary_pen'
import PatchPendingBarGraph_Devices from './os_patch_device/components/bargrap_pen'


import OSPatchSummaryInstalled from './ospatch/components/ospatchsummary_in'
import TopOsPatchInstalledBarGraph from './ospatch/components/osbargrap_in'
import OSPatchSummaryPending from './ospatch/components/ospatchsummary_pen'
import TopOsPatchPendingBarGraph from './ospatch/components/osbargrap_pen'


import SummaryHeaderSeverity from './patches_severity/components/header'
import PatchSeverityInstalledSummary from './patches_severity/components/patchseverity_in'
import PatchSeverityInstalledBarGraph from './patches_severity/components/bargrappatchseverity_in'
import PatchSeverityPendingSummary from './patches_severity/components/patchseverity_pen'
import PatchSeverityPendingBarGraph from './patches_severity/components/bargrappatchseverity_pen'


import SummaryHeaderSoftware from './software/components/header'
import SoftwareSummaryInstalled from './software/components/software_in'
import SoftwareInstalledBarGraph from './software/components/bargrapsoftware_in'
import SoftwareSummaryPending from './software/components/software_pen'
import SoftwarePendingBarGraph from './software/components/bargrapsoftware_pne'


import HeaderSoftwareDevice from './software_device/components/header'
import SoftwareDeviceInstalled from './software_device/components/softwaredevice_in'
import BargraphSoftwareInstalled from './software_device/components/bargraphsoftware_in'
import SoftwareDevicePending from './software_device/components/softwaredevice_pne'
import BargraphSoftwarePending from './software_device/components/bargraphsoftware_pen'

import HeaderSoftwareSecurity from './software_security/components/header'
import SecuritySummaryInstalled from './software_security/components/security_in'
import BargraphSecurityInstalled from './software_security/components/bargraph_in'
import SecuritySummaryPending from './software_security/components/security_pen'
import BargraphSecurityPending from './software_security/components/bargraph_pen'
import SecuritySummaryApproved from './software_security/components/security_app'
import BargraphSecurityApproved from './software_security/components/bargraph_app'
import SecuritySummaryRejected from './software_security/components/security_rej'
import BargraphSecurityRejected from './software_security/components/bargraph_rej'

import CveHeader from './os_cve/components/header'
import CveStats from './os_cve/components/stats'
import CveBarGraph from './os_cve/components/bargraph'
import TopCvesTable from './os_cve/components/topcves'
import CveDevicesTable from './os_cve/components/cve_devices'

import CoverPage from './cover/components/cover'
import BackCoverPage from './back_cover/components/back_cover'
import Footer from './Components/Footer'
import ReportNavbar from './Components/ReportNavbar'
import { getActiveOrg } from './lib/ninjaClient'

async function page() {
  const activeOrg = await getActiveOrg();

  return (
    <div className="print-wrapper flex flex-col items-center justify-center bg-gray-900 min-h-screen">
      <ReportNavbar activeOrg={activeOrg} />
      
            {/* Page 1: Cover Page */}
            <CoverPage />

            {/* Page 2: Summary OS & Model */}
            <div className="flex flex-col h-[1150px] w-[794px] overflow-hidden bg-white pl-10 shadow-[0_0_10px_rgba(0,0,0,0.1)] break-before-page bg-[url('/gbb.png')] bg-cover bg-center bg-no-repeat mt-5 mb-5">
              <SummaryHeader />
              <SummaryStats />
              <SummaryBarGraph />
              <SummaryOsBarGraph />
              <SummaryModelBarGraph />
              <Footer pageNumber={2} />
            </div>

            {/* Page 3: Organizations */}
            <div className="flex flex-col h-[1150px] w-[794px] overflow-hidden bg-white pl-10 shadow-[0_0_10px_rgba(0,0,0,0.1)] break-before-page bg-[url('/gbb.png')] bg-cover bg-center bg-no-repeat mb-5">
              <OrganizationsHeader />
              <OrgSummaryStats />
              <OrgSummaryOsBarGraph />
              <OrgSummaryModelBarGraph />
              <Footer pageNumber={3} />
            </div>
            
            {/* Page 4: OS Patch Overview */}
            <div className="flex flex-col h-[1150px] w-[794px] overflow-hidden bg-white pl-10 shadow-[0_0_10px_rgba(0,0,0,0.1)] break-before-page bg-[url('/gbb.png')] bg-cover bg-center bg-no-repeat mb-5">
              <SummaryHeaderOsPatch />
              <PatchSummary />
              <PatchOverviewBarGraph />
              <DevicePatchSummary />
              <DevicePieChartOverview />
              <Footer pageNumber={4} />
            </div>

            {/* Page 5: OS Patch Installed/Pending */}
            <div className="flex flex-col h-[1150px] w-[794px] overflow-hidden bg-white pl-10 shadow-[0_0_10px_rgba(0,0,0,0.1)] break-before-page bg-[url('/gbb.png')] bg-cover bg-center bg-no-repeat mb-5">
              <SummaryHeaderOsPatch />
              <PatchSummaryInstalled />
              <PatchInstalledBarGraph_Devices />
              <PatchSummaryPending />
              <PatchPendingBarGraph_Devices />
              <Footer pageNumber={5} />
            </div>

            {/* Page 6: Top OS Patches Installed/Pending */}
            <div className="flex flex-col h-[1150px] w-[794px] overflow-hidden bg-white pl-10 shadow-[0_0_10px_rgba(0,0,0,0.1)] break-before-page bg-[url('/gbb.png')] bg-cover bg-center bg-no-repeat mb-5">
              <SummaryHeaderOsPatch />
              <OSPatchSummaryInstalled />
              <TopOsPatchInstalledBarGraph />
              <OSPatchSummaryPending />
              <TopOsPatchPendingBarGraph />
              <Footer pageNumber={6} />
            </div>
          
            {/* Page 7: OS Patch Severity */}
            <div className="flex flex-col h-[1150px] w-[794px] overflow-hidden bg-white pl-10 shadow-[0_0_10px_rgba(0,0,0,0.1)] break-before-page bg-[url('/gbb.png')] bg-cover bg-center bg-no-repeat mb-5">
              <SummaryHeaderSeverity />
              <PatchSeverityInstalledSummary />
              <PatchSeverityInstalledBarGraph />
              <PatchSeverityPendingSummary />
              <PatchSeverityPendingBarGraph />
              <Footer pageNumber={7} />
            </div>

            {/* Page 8: Software Summary */}
            <div className="flex flex-col h-[1150px] w-[794px] overflow-hidden bg-white pl-10 shadow-[0_0_10px_rgba(0,0,0,0.1)] break-before-page bg-[url('/gbb.png')] bg-cover bg-center bg-no-repeat mb-5">
              <SummaryHeaderSoftware />
              <SoftwareSummaryInstalled />
              <SoftwareInstalledBarGraph />
              <SoftwareSummaryPending />
              <SoftwarePendingBarGraph />
              <Footer pageNumber={8} />
            </div>

            {/* Page 9: Software Device Summary */}
            <div className="flex flex-col h-[1150px] w-[794px] overflow-hidden bg-white pl-10 shadow-[0_0_10px_rgba(0,0,0,0.1)] break-before-page bg-[url('/gbb.png')] bg-cover bg-center bg-no-repeat mb-5">
              <HeaderSoftwareDevice />
              <SoftwareDeviceInstalled />
              <BargraphSoftwareInstalled />
              <SoftwareDevicePending />
              <BargraphSoftwarePending />
              <Footer pageNumber={9} />
            </div>

            {/* Page 10: Software Security Installed/Pending */}
            <div className="flex flex-col h-[1150px] w-[794px] overflow-hidden bg-white pl-10 shadow-[0_0_10px_rgba(0,0,0,0.1)] break-before-page bg-[url('/gbb.png')] bg-cover bg-center bg-no-repeat mb-5">
              <HeaderSoftwareSecurity />
              <SecuritySummaryInstalled />
              <BargraphSecurityInstalled />
              <SecuritySummaryPending />
              <BargraphSecurityPending />
              <Footer pageNumber={10} />
            </div>

            {/* Page 11: Software Security Approved/Rejected */}
            <div className="flex flex-col h-[1150px] w-[794px] overflow-hidden bg-white pl-10 shadow-[0_0_10px_rgba(0,0,0,0.1)] break-before-page bg-[url('/gbb.png')] bg-cover bg-center bg-no-repeat mb-5">
              <HeaderSoftwareSecurity />
              <SecuritySummaryApproved />
              <BargraphSecurityApproved />
              <SecuritySummaryRejected />
              <BargraphSecurityRejected />
              <Footer pageNumber={11} />
            </div>

            {/* Page 12: OS Vulnerabilities (CVE) */}
            <div className="flex flex-col h-[1150px] w-[794px] overflow-hidden bg-white pl-10 shadow-[0_0_10px_rgba(0,0,0,0.1)] break-before-page bg-[url('/gbb.png')] bg-cover bg-center bg-no-repeat mb-5">
              <CveHeader />
              <CveStats />
              <CveBarGraph />
              <TopCvesTable />
              <Footer pageNumber={12} />
            </div>

            <div className="flex flex-col h-[1150px] w-[794px] overflow-hidden bg-white pl-10 shadow-[0_0_10px_rgba(0,0,0,0.1)] break-before-page bg-[url('/gbb.png')] bg-cover bg-center bg-no-repeat mb-5">
              <CveHeader />
              <CveStats />
              <CveDevicesTable />
              <Footer pageNumber={13} />
            </div>


            {/* Page 13: Back Cover Page */}
            <BackCoverPage />

        </div>
  )
}

export default page



