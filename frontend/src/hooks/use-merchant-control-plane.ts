'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { isAddress } from 'viem';
import {
  MERCHANT_CONTROL_PLANE_EVENT,
  buildRecoveryQueue,
  cancelSubscription,
  computeMerchantMetrics,
  markBillingCycleUncollectible,
  pauseSubscription,
  readMerchantState,
  resumeSubscription,
  retryBillingCycleNow,
  upsertRecoveryPolicy,
} from '@/lib/merchant/control-plane-store';
import type { MerchantControlPlaneState, RecoveryPolicy } from '@/lib/merchant/types';

export function useMerchantControlPlane(merchantAddress?: string) {
  const [state, setState] = useState<MerchantControlPlaneState | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const normalizedMerchantAddress = useMemo(() => {
    if (!merchantAddress || !isAddress(merchantAddress)) {
      return null;
    }
    return merchantAddress;
  }, [merchantAddress]);

  const refresh = useCallback(() => {
    if (!normalizedMerchantAddress) {
      setState(null);
      setIsHydrated(true);
      return;
    }

    setState(readMerchantState(normalizedMerchantAddress));
    setIsHydrated(true);
  }, [normalizedMerchantAddress]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!normalizedMerchantAddress || typeof window === 'undefined') {
      return;
    }

    const onStorage = (event: StorageEvent) => {
      if (!event.key || !event.key.includes(normalizedMerchantAddress.toLowerCase())) {
        return;
      }
      refresh();
    };

    const onMerchantEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ merchantAddress?: string }>;
      if (
        customEvent.detail?.merchantAddress &&
        customEvent.detail.merchantAddress.toLowerCase() !== normalizedMerchantAddress.toLowerCase()
      ) {
        return;
      }
      refresh();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener(MERCHANT_CONTROL_PLANE_EVENT, onMerchantEvent as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(MERCHANT_CONTROL_PLANE_EVENT, onMerchantEvent as EventListener);
    };
  }, [normalizedMerchantAddress, refresh]);

  const metrics = useMemo(() => {
    if (!state) {
      return null;
    }
    return computeMerchantMetrics(state);
  }, [state]);

  const recoveryQueue = useMemo(() => {
    if (!state) {
      return [];
    }
    return buildRecoveryQueue(state);
  }, [state]);

  const updateRecoveryPolicy = useCallback(
    (patch: Partial<RecoveryPolicy>) => {
      if (!normalizedMerchantAddress) return;
      upsertRecoveryPolicy(normalizedMerchantAddress, patch);
      refresh();
    },
    [normalizedMerchantAddress, refresh]
  );

  const requestCycleRetry = useCallback(
    (cycleId: string) => {
      if (!normalizedMerchantAddress) return;
      retryBillingCycleNow(normalizedMerchantAddress, cycleId);
      refresh();
    },
    [normalizedMerchantAddress, refresh]
  );

  const setCycleUncollectible = useCallback(
    (cycleId: string) => {
      if (!normalizedMerchantAddress) return;
      markBillingCycleUncollectible(normalizedMerchantAddress, cycleId);
      refresh();
    },
    [normalizedMerchantAddress, refresh]
  );

  const setSubscriptionPaused = useCallback(
    (subscriptionId: string) => {
      if (!normalizedMerchantAddress) return;
      pauseSubscription(normalizedMerchantAddress, subscriptionId);
      refresh();
    },
    [normalizedMerchantAddress, refresh]
  );

  const setSubscriptionResumed = useCallback(
    (subscriptionId: string) => {
      if (!normalizedMerchantAddress) return;
      resumeSubscription(normalizedMerchantAddress, subscriptionId);
      refresh();
    },
    [normalizedMerchantAddress, refresh]
  );

  const setSubscriptionCanceled = useCallback(
    (subscriptionId: string, atPeriodEnd: boolean) => {
      if (!normalizedMerchantAddress) return;
      cancelSubscription(normalizedMerchantAddress, subscriptionId, atPeriodEnd);
      refresh();
    },
    [normalizedMerchantAddress, refresh]
  );

  return {
    state,
    isHydrated,
    metrics,
    recoveryQueue,
    refresh,
    updateRecoveryPolicy,
    requestCycleRetry,
    setCycleUncollectible,
    setSubscriptionPaused,
    setSubscriptionResumed,
    setSubscriptionCanceled,
  };
}
