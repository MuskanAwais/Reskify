import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface SubscriptionInfo {
  subscriptionType: string;
  subscriptionStatus: string;
  swmsGenerated: number;
  swmsCredits: number;
  trialUsed: boolean;
}

export function useSubscription() {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const { data: subscriptionInfo } = useQuery({
    queryKey: ['/api/user/subscription-info'],
    enabled: !!user,
  });

  const checkSubscriptionLimits = async (): Promise<boolean> => {
    if (!user || !subscriptionInfo) return false;

    // If user is on trial and has already generated 1 SWMS, require subscription
    if (subscriptionInfo.subscriptionStatus === 'trial' && subscriptionInfo.swmsGenerated >= 1) {
      setShowSubscriptionModal(true);
      return false;
    }

    return true;
  };

  const isTrialUser = () => {
    return subscriptionInfo?.subscriptionStatus === 'trial';
  };

  const shouldShowDemoWatermark = () => {
    return isTrialUser();
  };

  const getSwmsCount = () => {
    return subscriptionInfo?.swmsGenerated || 0;
  };

  const subscribeToplan = async (planType: string) => {
    try {
      const response = await apiRequest('POST', '/api/subscription/subscribe', {
        planType
      });
      
      if (response.ok) {
        // Redirect to payment or update subscription status
        setShowSubscriptionModal(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Subscription error:', error);
      return false;
    }
  };

  return {
    user,
    isLoading,
    subscriptionInfo,
    showSubscriptionModal,
    setShowSubscriptionModal,
    checkSubscriptionLimits,
    isTrialUser,
    shouldShowDemoWatermark,
    getSwmsCount,
    subscribeToplan
  };
}