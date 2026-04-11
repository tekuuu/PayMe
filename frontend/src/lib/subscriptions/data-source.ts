import type { Hex } from 'viem';
import type { MerchantControlPlaneState, MerchantPlan, PlanInterval } from '@/lib/merchant/types';
import type {
  BeginBillingAttemptInput,
  BeginBillingAttemptResult,
  RegisterSubscriptionApprovalInput,
  RegisterSubscriptionApprovalResult,
} from '@/lib/merchant/control-plane-store';
import {
  archivePlanTemplate,
  beginBillingAttempt,
  createPlanTemplate,
  finalizeBillingAttemptFailure,
  finalizeBillingAttemptSuccess,
  readMerchantState,
  registerSubscriptionApproval,
  updatePlanTemplate,
} from '@/lib/merchant/control-plane-store';

export interface SubscriptionDataSource {
  readMerchantState(merchantAddress: Hex): MerchantControlPlaneState;

  createPlanTemplate(input: {
    merchantAddress: Hex;
    name: string;
    description?: string;
    interval: PlanInterval;
    billingIntervalSeconds: number;
    amountRefMicros: string;
  }): MerchantPlan;

  updatePlanTemplate(
    merchantAddress: Hex,
    planId: string,
    patch: Partial<Pick<MerchantPlan, 'name' | 'description' | 'interval' | 'billingIntervalSeconds' | 'amountRefMicros' | 'status'>>
  ): MerchantControlPlaneState;

  archivePlanTemplate(merchantAddress: Hex, planId: string): MerchantControlPlaneState;

  registerSubscriptionApproval(input: RegisterSubscriptionApprovalInput): RegisterSubscriptionApprovalResult;

  beginBillingAttempt(input: BeginBillingAttemptInput): BeginBillingAttemptResult;

  finalizeBillingAttemptSuccess(input: Parameters<typeof finalizeBillingAttemptSuccess>[0]): MerchantControlPlaneState;
  finalizeBillingAttemptFailure(input: Parameters<typeof finalizeBillingAttemptFailure>[0]): MerchantControlPlaneState;
}

export const localSubscriptionDataSource: SubscriptionDataSource = {
  readMerchantState: (merchantAddress) => readMerchantState(merchantAddress),
  createPlanTemplate: (input) => createPlanTemplate(input),
  updatePlanTemplate: (merchantAddress, planId, patch) => updatePlanTemplate(merchantAddress, planId, patch),
  archivePlanTemplate: (merchantAddress, planId) => archivePlanTemplate(merchantAddress, planId),
  registerSubscriptionApproval: (input) => registerSubscriptionApproval(input),
  beginBillingAttempt: (input) => beginBillingAttempt(input),
  finalizeBillingAttemptSuccess: (input) => finalizeBillingAttemptSuccess(input),
  finalizeBillingAttemptFailure: (input) => finalizeBillingAttemptFailure(input),
};

