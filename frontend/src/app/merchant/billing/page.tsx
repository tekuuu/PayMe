import { redirect } from 'next/navigation';

export default function MerchantBillingLegacyRedirect() {
  redirect('/merchant/billing-cycles');
}
