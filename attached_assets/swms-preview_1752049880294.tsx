import type { SwmsFormData } from "@shared/schema";

interface SwmsPreviewProps {
  data: SwmsFormData;
}

export default function SwmsPreview({ data }: SwmsPreviewProps) {
  return (
    <div className="h-full overflow-auto bg-gray-100">
      <div className="p-6">
        {/* Document Preview - Exact Figma Match */}
        <div className="bg-white shadow-lg mx-auto" style={{ width: '794px', minHeight: '1123px' }}>
          {/* Page Content with exact padding */}
          <div style={{ padding: '60px 50px' }}>
            
            {/* Header Section - Exact layout */}
            <div className="flex items-start justify-between mb-12">
              {/* Riskify Logo */}
              <div className="flex-shrink-0">
                <div className="text-[32px] font-bold leading-none" style={{ color: '#2c5530' }}>
                  Riskify
                </div>
              </div>
              
              {/* Center Company Info */}
              <div className="text-center mx-8 flex-1">
                <div className="text-[14px] leading-[20px] text-gray-700 space-y-0">
                  <div className="font-medium">{data.companyName}</div>
                  <div>{data.projectName}</div>
                  <div>{data.projectNumber}</div>
                  <div>{data.projectAddress}</div>
                </div>
              </div>
              
              {/* Company Logo Placeholder */}
              <div className="flex-shrink-0">
                <div 
                  className="border-2 border-gray-300 flex items-center justify-center text-[12px] text-gray-500 text-center leading-tight"
                  style={{ width: '120px', height: '80px' }}
                >
                  Insert company logo here
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-12">
              <h1 className="text-[36px] font-bold leading-none" style={{ color: '#2c5530' }}>
                Safe Work Method Statement
              </h1>
            </div>

            {/* Project Information Section */}
            <div className="mb-8">
              <h2 className="text-[20px] font-semibold mb-6 text-black">
                Project Information
              </h2>
              
              <div className="grid grid-cols-2 gap-8">
                {/* Left Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="space-y-4">
                    <div className="text-[14px] leading-[20px]">
                      <div className="font-semibold text-black mb-1">Job Name: <span className="font-normal">{data.jobName}</span></div>
                    </div>
                    <div className="text-[14px] leading-[20px]">
                      <div className="font-semibold text-black mb-1">Job Number: <span className="font-normal">{data.jobNumber}</span></div>
                    </div>
                    <div className="text-[14px] leading-[20px]">
                      <div className="font-semibold text-black mb-1">Project Address: <span className="font-normal">{data.projectAddress}</span></div>
                    </div>
                    <div className="text-[14px] leading-[20px]">
                      <div className="font-semibold text-black mb-1">Start Date: <span className="font-normal">{data.startDate}</span></div>
                    </div>
                    <div className="text-[14px] leading-[20px]">
                      <div className="font-semibold text-black mb-1">Duration: <span className="font-normal">{data.duration}</span></div>
                    </div>
                    <div className="text-[14px] leading-[20px]">
                      <div className="font-semibold text-black mb-1">Date Created: <span className="font-normal">{data.dateCreated}</span></div>
                    </div>
                  </div>
                </div>

                {/* Right Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="space-y-4">
                    <div className="text-[14px] leading-[20px]">
                      <div className="font-semibold text-black mb-1">Company Name: <span className="font-normal">{data.companyName}</span></div>
                    </div>
                    <div className="text-[14px] leading-[20px]">
                      <div className="font-semibold text-black mb-1">Principal Contractor's Name: <span className="font-normal italic">{data.principalContractor}</span></div>
                    </div>
                    <div className="text-[14px] leading-[20px]">
                      <div className="font-semibold text-black mb-1">Project Manager: <span className="font-normal italic">{data.projectManager}</span></div>
                    </div>
                    <div className="text-[14px] leading-[20px]">
                      <div className="font-semibold text-black mb-1">Site Supervisor: <span className="font-normal italic">{data.siteSupervisor}</span></div>
                    </div>
                    <div className="text-[14px] leading-[20px] mb-4">
                      <div className="font-semibold text-black underline mb-2">Person Authorising SWMS</div>
                      <div>Name: <span className="italic">{data.authorisingPerson}</span></div>
                      <div>Position: <span className="italic">Test authorising person position</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scope of Works Section */}
            <div className="mt-12">
              <h2 className="text-[20px] font-semibold mb-6 text-black">
                Scope of Works
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="text-[14px] leading-[20px] text-gray-700 whitespace-pre-line">
                  {data.scopeOfWorks}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
