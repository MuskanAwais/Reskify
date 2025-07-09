import SwmsComplete from '../components/swms/SwmsComplete';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

export default function SwmsCompletePage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const draftId = searchParams.get('draftId');
  
  // Fetch SWMS data if draftId is provided
  const { data: swmsData, isLoading } = useQuery({
    queryKey: ['/api/swms/draft', draftId],
    queryFn: async () => {
      if (!draftId) return null;
      const response = await fetch(`/api/swms/draft/${draftId}`, {
        credentials: 'include'
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!draftId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading SWMS data...</p>
        </div>
      </div>
    );
  }

  return <SwmsComplete initialData={swmsData} />;
}