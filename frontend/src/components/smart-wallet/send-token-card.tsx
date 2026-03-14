'use client';

import { useMemo, useState } from 'react';
import { CHAIN } from '@/config/constants';
import { useTokenBalances } from '@/hooks/use-token-balances';
import { smartWallet } from '@/lib/smart-wallet';
import { emptyHex, UserOpBuilder } from '@/lib/smart-wallet/service/userOps';
import { Me } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import { encodeFunctionData, Hex, isAddress, parseEther, parseUnits, zeroAddress } from 'viem';

type TokenOption = {
  symbol: 'ETH' | 'USDC' | 'WETH';
  name: string;
  address: Hex | null;
  decimals: number;
};

const TOKENS: TokenOption[] = [
  { symbol: 'ETH', name: 'Ethereum', address: null, decimals: 18 },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as Hex,
    decimals: 6
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9' as Hex,
    decimals: 18
  }
];

const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const;

function formatBalanceDisplay(raw: bigint | undefined, decimals: number): string {
  if (!raw || raw <= 0n) return '0';
  const base = 10n ** BigInt(decimals);
  const whole = raw / base;
  const fraction = raw % base;
  if (fraction === 0n) return whole.toString();
  const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 4).replace(/0+$/, '');
  return fractionStr ? `${whole.toString()}.${fractionStr}` : whole.toString();
}

export function SendTokenCard({ me }: { me: Me }) {
  const balances = useTokenBalances(me.account);
  const builder = useMemo(() => new UserOpBuilder(CHAIN), []);

  const [tokenSymbol, setTokenSymbol] = useState<TokenOption['symbol']>('ETH');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successHash, setSuccessHash] = useState<string | null>(null);

  const selectedToken = TOKENS.find((token) => token.symbol === tokenSymbol) || TOKENS[0];

  const selectedBalanceRaw =
    tokenSymbol === 'ETH'
      ? (balances.eth.balance as bigint | undefined)
      : tokenSymbol === 'USDC'
        ? (balances.usdc.balance as bigint | undefined)
        : (balances.weth.balance as bigint | undefined);

  const selectedBalanceLabel = formatBalanceDisplay(selectedBalanceRaw, selectedToken.decimals);
  const ethBalanceRaw = balances.eth.balance as bigint | undefined;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessHash(null);

    if (!isAddress(recipient)) {
      setError('Please enter a valid wallet address.');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    let amountRaw: bigint;
    try {
      amountRaw = selectedToken.symbol === 'ETH' ? parseEther(amount) : parseUnits(amount, selectedToken.decimals);
    } catch {
      setError('Invalid amount format.');
      return;
    }

    if (!selectedBalanceRaw || amountRaw > selectedBalanceRaw) {
      setError(`Insufficient ${selectedToken.symbol} balance.`);
      return;
    }

    try {
      setIsSubmitting(true);
      smartWallet.init();

      let maxFeePerGas: bigint;
      let maxPriorityFeePerGas: bigint;
      try {
        const gasPrice = await smartWallet.client.request({
          method: 'pimlico_getUserOperationGasPrice' as never
        } as never);
        maxFeePerGas = BigInt((gasPrice as any).fast.maxFeePerGas);
        maxPriorityFeePerGas = BigInt((gasPrice as any).fast.maxPriorityFeePerGas);
      } catch {
        const fees = await smartWallet.client.estimateFeesPerGas();
        maxFeePerGas = fees.maxFeePerGas || 0n;
        maxPriorityFeePerGas = fees.maxPriorityFeePerGas || 0n;
      }

      const call =
        selectedToken.address === null
          ? {
              dest: recipient as Hex,
              value: amountRaw,
              data: emptyHex
            }
          : {
              dest: selectedToken.address,
              value: 0n,
              data: encodeFunctionData({
                abi: ERC20_ABI,
                functionName: 'transfer',
                args: [recipient as Hex, amountRaw]
              })
            };

      const userOp = await builder.buildUserOp({
        calls: [call],
        maxFeePerGas,
        maxPriorityFeePerGas,
        keyId: me.keyId
      });

      const hash = await smartWallet.sendUserOperation({ userOp });
      const receipt = await smartWallet.waitForUserOperationReceipt({ hash });
      setSuccessHash(receipt?.userOpHash || hash);
      setAmount('');
      setRecipient('');
    } catch (submitError: any) {
      const message = submitError?.message || 'Failed to send transaction.';
      if (message.includes("AA21 didn't pay prefund")) {
        setError('Transaction simulation failed: wallet cannot prefund gas. Top up ETH in this smart wallet, then retry.');
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className='max-w-xl border'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <Send className='h-4 w-4' />
          Send Payment
        </CardTitle>
        <CardDescription>Send ETH, USDC, or WETH from your smart card wallet.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='token'>Token</Label>
            <Select value={tokenSymbol} onValueChange={(value) => setTokenSymbol(value as TokenOption['symbol'])}>
              <SelectTrigger id='token'>
                <SelectValue placeholder='Select token' />
              </SelectTrigger>
              <SelectContent>
                {TOKENS.map((token) => {
                  const raw =
                    token.symbol === 'ETH'
                      ? (balances.eth.balance as bigint | undefined)
                      : token.symbol === 'USDC'
                        ? (balances.usdc.balance as bigint | undefined)
                        : (balances.weth.balance as bigint | undefined);
                  const hasBalance = Boolean(raw && raw > 0n);
                  const balanceLabel = formatBalanceDisplay(raw, token.decimals);

                  return (
                    <SelectItem key={token.symbol} value={token.symbol} disabled={!hasBalance && token.symbol !== 'ETH'}>
                      {token.symbol} ({balanceLabel})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className='text-xs text-muted-foreground'>Available: {selectedBalanceLabel} {selectedToken.symbol}</p>
            <p className='text-xs text-muted-foreground'>ETH for gas: {formatBalanceDisplay(ethBalanceRaw, 18)} ETH</p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='recipient'>Recipient Address</Label>
            <Input
              id='recipient'
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder='0x...'
              autoComplete='off'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='amount'>Amount</Label>
            <Input
              id='amount'
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder={`Amount in ${selectedToken.symbol}`}
              inputMode='decimal'
            />
          </div>

          {error && (
            <div className='flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
              <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
              <span>{error}</span>
            </div>
          )}

          {successHash && (
            <div className='flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600'>
              <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0' />
              <a
                className='underline underline-offset-2'
                href={`${CHAIN.blockExplorers?.default.url}/tx/${successHash}`}
                target='_blank'
                rel='noreferrer'
              >
                Transaction sent. View on explorer
              </a>
            </div>
          )}

          <Button
            type='submit'
            className='w-full'
            disabled={isSubmitting || me.account === zeroAddress}
          >
            {isSubmitting ? 'Sending...' : `Send ${selectedToken.symbol}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
