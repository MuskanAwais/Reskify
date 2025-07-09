import { useState } from "react";
import SwmsForm from "@/components/swms-form";
import SwmsPreview from "@/components/swms-preview";
import type { SwmsFormData } from "@shared/schema";
import { defaultSwmsData } from "@shared/schema";

export default function SwmsGenerator() {
  const [formData, setFormData] = useState<SwmsFormData>(defaultSwmsData);

  const handleFormChange = (data: SwmsFormData) => {
    setFormData(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-riskify-green">Riskify</div>
              <div className="ml-4 text-gray-600">SWMS Generator</div>
            </div>
            <div className="text-sm text-gray-500">Safe Work Method Statement</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Form Panel */}
          <div className="w-full lg:w-1/2 bg-white border-r border-gray-200 no-print">
            <SwmsForm 
              initialData={formData}
              onChange={handleFormChange}
            />
          </div>

          {/* Preview Panel */}
          <div className="w-full lg:w-1/2 bg-gray-100 overflow-auto">
            <SwmsPreview data={formData} />
          </div>
        </div>
      </div>
    </div>
  );
}
