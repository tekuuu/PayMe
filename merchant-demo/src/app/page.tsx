'use client';

import { useMemo, useState } from 'react';
import { PayMeElement, PayMeProvider, loadPayMe, usePayMe } from '@payme/sdk';

function MerchantCheckout() {
  const { confirmSubscription } = usePayMe();
  const [amount, setAmount] = useState('5');
  const [status, setStatus] = useState<string>('Idle');

  const handleCharge = async () => {
    setStatus('Waiting for passkey signature...');
    const { error, receipt } = await confirmSubscription({ amount });
    if (error) {
      setStatus(`Failed: ${error.message}`);
      return;
    }

    setStatus(`Success: ${receipt?.transactionHash ?? 'subscription confirmed'}`);
  };

  return (
    <div className='mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-6'>
      <header className='space-y-2'>
        <h1 className='text-2xl font-semibold'>PayMe Merchant Demo</h1>
        <p className='text-sm text-gray-600'>
          This page embeds the PayMe checkout and triggers a passkey-backed subscription confirmation.
        </p>
      </header>

      <div className='rounded-lg border border-gray-200 p-4'>
        <label htmlFor='amount' className='mb-2 block text-sm font-medium'>
          Amount
        </label>
        <input
          id='amount'
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm'
          placeholder='5'
        />
        <button
          type='button'
          onClick={handleCharge}
          className='mt-3 rounded-md bg-black px-4 py-2 text-sm font-medium text-white'
        >
          Confirm Subscription
        </button>
        <p className='mt-2 text-sm text-gray-700'>Status: {status}</p>
      </div>

      <PayMeElement />
    </div>
  );
}

export default function Home() {
  const merchantAddress =
    process.env.NEXT_PUBLIC_PAYME_MERCHANT_ADDRESS ?? '0x0000000000000000000000000000000000000001';
  const appUrl = process.env.NEXT_PUBLIC_PAYME_APP_URL ?? 'http://localhost:3000';

  const payme = useMemo(() => loadPayMe(merchantAddress, 'sepolia', appUrl), [merchantAddress, appUrl]);

  return (
    <PayMeProvider payme={payme}>
      <MerchantCheckout />
    </PayMeProvider>
  );
}
