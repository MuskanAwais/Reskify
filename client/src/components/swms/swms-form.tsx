import FinalStepComponent from "./FinalStepComponent";

interface SwmsFormProps {
  step: number;
  data: any;
  onDataChange: (data: any) => void;
  onNext?: () => void;
  userData?: any;
  isLoadingCredits?: boolean;
  creditsError?: any;
  setIsProcessingCredit?: (value: boolean) => void;
}

export default function SwmsForm({ 
  step, 
  data, 
  onDataChange, 
  onNext, 
  userData, 
  isLoadingCredits, 
  creditsError, 
  setIsProcessingCredit 
}: SwmsFormProps) {
  
  // Handle step 9 specifically with the new FinalStepComponent
  if (step === 9) {
    return (
      <FinalStepComponent 
        formData={data} 
        onDataChange={onDataChange} 
        onNext={onNext}
      />
    );
  }

  // For other steps, return a placeholder
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Step {step}</h1>
        <p className="text-gray-600">Step {step} content will be implemented here</p>
      </div>
      
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <p className="text-gray-600">
          Step {step} content is being developed. 
          This is a placeholder that will be replaced with the actual step content.
        </p>
      </div>
    </div>
  );
}