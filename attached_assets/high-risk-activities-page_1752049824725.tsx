import { Checkbox } from "@/components/ui/checkbox";
import type { SwmsFormData, HighRiskActivity } from "@/types/swms";

interface HighRiskActivitiesPageProps {
  formData: SwmsFormData;
  updateFormData: (updates: Partial<SwmsFormData>) => void;
}

const defaultHighRiskActivities: HighRiskActivity[] = [
  {
    id: "telecom-tower",
    title: "Work on a telecommunication tower",
    description: "Work on a telecommunication tower",
    selected: false,
    riskLevel: 'extreme'
  },
  {
    id: "fall-risk",
    title: "Risk of a person falling more than 2 metres",
    description: "Risk of a person falling more than 2 metres (e.g. work on ladders, scaffolding, roofs, etc.)",
    selected: true,
    riskLevel: 'extreme'
  },
  {
    id: "demolition",
    title: "Work involving demolition",
    description: "Work involving demolition of an element that is load-bearing or otherwise related to the physical integrity of the structure",
    selected: false,
    riskLevel: 'high'
  },
  {
    id: "asbestos",
    title: "Work involving the disturbance of asbestos",
    description: "Work involving the disturbance of asbestos",
    selected: false,
    riskLevel: 'extreme'
  },
  {
    id: "structural-alterations",
    title: "Work involving structural alterations",
    description: "Work involving structural alterations or repairs that require temporary support to prevent collapse",
    selected: false,
    riskLevel: 'high'
  },
  {
    id: "confined-space",
    title: "Work carried out in or near a confined space",
    description: "Work carried out in or near a confined space",
    selected: false,
    riskLevel: 'extreme'
  },
  {
    id: "shaft-trench",
    title: "Work carried our in or near a shaft or trench",
    description: "Work carried our in or near a shaft or trench deeper than 1.5 metres or a tunnel",
    selected: false,
    riskLevel: 'high'
  },
  {
    id: "explosives",
    title: "Work involving the use of explosives",
    description: "Work involving the use of explosives",
    selected: false,
    riskLevel: 'extreme'
  },
  {
    id: "gas-lines",
    title: "Work on or near pressurised gas",
    description: "Work on or near pressurised gas distribution mains or piping",
    selected: false,
    riskLevel: 'high'
  },
  {
    id: "chemical-lines",
    title: "Work on or near chemical, fuel or refrigerant lines",
    description: "Work on or near chemical, fuel or refrigerant lines",
    selected: true,
    riskLevel: 'extreme'
  },
  {
    id: "electrical-work",
    title: "Work on or near energised electrical installations",
    description: "Work on or near energised electrical installations or services (includes live electrical work)",
    selected: true,
    riskLevel: 'extreme'
  },
  {
    id: "contaminated-atmosphere",
    title: "Work in an area that may have a contaminated atmosphere",
    description: "Work in an area that may have a contaminated or flammable atmosphere",
    selected: false,
    riskLevel: 'high'
  },
  {
    id: "tilt-up-concrete",
    title: "Work involving tilt-up or precast concrete elements",
    description: "Work involving tilt-up or precast concrete elements",
    selected: false,
    riskLevel: 'medium'
  },
  {
    id: "traffic-corridor",
    title: "Work carried on, in or adjacent to a road",
    description: "Work carried on, in or adjacent to a road, railway, or other traffic corridor that is in use",
    selected: true,
    riskLevel: 'extreme'
  },
  {
    id: "mobile-plant",
    title: "Work in an area at a workplace with powered mobile plant",
    description: "Work in an area at a workplace in which there is any movement of powered mobile plant (e.g. forklifts, excavators, cranes)",
    selected: false,
    riskLevel: 'high'
  },
  {
    id: "temperature-extremes",
    title: "Work in areas where there are artificial extremes of temperature",
    description: "Work in areas where there are artificial extremes of temperature (e.g. cold rooms, furnace areas)",
    selected: false,
    riskLevel: 'medium'
  },
  {
    id: "water-drowning",
    title: "Work carries out in or near water",
    description: "Work carries out in or near water or other liquid that involves a risk of drowning",
    selected: false,
    riskLevel: 'high'
  },
  {
    id: "live-electrical",
    title: "Work carried out on or near live electrical conductors",
    description: "Work carried out on or near live electrical conductors",
    selected: false,
    riskLevel: 'extreme'
  }
];

export default function HighRiskActivitiesPage({ formData, updateFormData }: HighRiskActivitiesPageProps) {
  const activities = formData.highRiskActivities.length > 0 ? formData.highRiskActivities : defaultHighRiskActivities;

  const toggleActivity = (activityId: string) => {
    const updatedActivities = activities.map(activity => 
      activity.id === activityId 
        ? { ...activity, selected: !activity.selected }
        : activity
    );
    updateFormData({ highRiskActivities: updatedActivities });
  };

  const getRiskColorClass = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'extreme':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-blue-500 bg-blue-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-medium text-gray-900 mb-4">High Risk Activities</h2>
        <p className="text-sm text-gray-600 mb-6">
          Select the high-risk activities that apply to this project. Activities highlighted in red require immediate attention.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`border rounded-lg p-4 transition-colors ${
                activity.selected 
                  ? getRiskColorClass(activity.riskLevel)
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={activity.id}
                  checked={activity.selected}
                  onCheckedChange={() => toggleActivity(activity.id)}
                  className="mt-1"
                />
                <label
                  htmlFor={activity.id}
                  className="text-sm font-medium text-gray-900 cursor-pointer flex-1"
                >
                  {activity.description}
                  {activity.riskLevel === 'extreme' && (
                    <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
