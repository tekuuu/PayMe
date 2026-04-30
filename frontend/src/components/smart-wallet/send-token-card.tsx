'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { CHAIN, ENTRYPOINT_ADDRESS } from '@/config/constants';
import { useTokenBalances } from '@/hooks/use-token-balances';
import { smartWallet } from '@/lib/smart-wallet';
import { emptyHex, UserOpBuilder } from '@/lib/smart-wallet/service/userOps';
import { ensureUserOpPrefund } from '@/lib/smart-wallet/service/userOps/prefund';
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
import { IconCoins, IconWallet, IconHistory } from '@tabler/icons-react';
import { encodeFunctionData, Hex, isAddress, parseEther, parseUnits, zeroAddress } from 'viem';
import { toast } from 'sonner';

type RecentRecipient = {
  address: Hex;
  timestamp: number;
};

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

const ENTRYPOINT_WITHDRAW_ABI = [
  {
    name: 'withdrawTo',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'withdrawAddress', type: 'address' },
      { name: 'withdrawAmount', type: 'uint256' },
    ],
    outputs: [],
  },
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
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null);
  const [recentRecipients, setRecentRecipients] = useState<RecentRecipient[]>([]);

  // Load recent recipients on mount
  useMemo(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('payme_recent_recipients');
      if (saved) {
        try {
          setRecentRecipients(JSON.parse(saved));
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Failed to parse recent recipients', e);
        }
      }
    }
  }, []);

  const saveRecipient = (address: Hex) => {
    const newRecent = [
      { address, timestamp: Date.now() },
      ...recentRecipients.filter(r => r.address.toLowerCase() !== address.toLowerCase())
    ].slice(0, 5); // Keep last 5
    setRecentRecipients(newRecent);
    localStorage.setItem('payme_recent_recipients', JSON.stringify(newRecent));
  };

  const selectedToken = TOKENS.find((token) => token.symbol === tokenSymbol) || TOKENS[0];

  const walletEthBalanceRaw = balances.eth.walletBalance as bigint | undefined;
  const entryPointDepositRaw = balances.eth.depositBalance as bigint | undefined;
  const totalEthBalanceRaw = balances.eth.balance as bigint | undefined;

  const selectedBalanceRaw =
    tokenSymbol === 'ETH'
      ? ((walletEthBalanceRaw ?? 0n) + (entryPointDepositRaw ?? 0n))
      : tokenSymbol === 'USDC'
        ? (balances.usdc.balance as bigint | undefined)
        : (balances.weth.balance as bigint | undefined);

  const selectedBalanceLabel = formatBalanceDisplay(selectedBalanceRaw, selectedToken.decimals);
  const ethBalanceRaw = walletEthBalanceRaw;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessTxHash(null);

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

    if (selectedToken.symbol === 'ETH') {
      const spendableEth = (walletEthBalanceRaw ?? 0n) + (entryPointDepositRaw ?? 0n);
      if (amountRaw > spendableEth) {
        setError('Insufficient ETH balance (wallet + AA deposit).');
        return;
      }
    } else if (!selectedBalanceRaw || amountRaw > selectedBalanceRaw) {
      setError(`Insufficient ${selectedToken.symbol} balance.`);
      return;
    }

    try {
      setIsSubmitting(true);
      smartWallet.init();

      const transferCall =
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

      const calls: Array<{ dest: Hex; value: bigint; data: Hex }> = [transferCall];

      if (selectedToken.address === null) {
        const walletEth = walletEthBalanceRaw ?? 0n;
        const aaDeposit = entryPointDepositRaw ?? 0n;
        if (walletEth < amountRaw && aaDeposit > 0n) {
          const neededFromDeposit = amountRaw - walletEth;
          const withdrawCall = {
            dest: ENTRYPOINT_ADDRESS,
            value: 0n,
            data: encodeFunctionData({
              abi: ENTRYPOINT_WITHDRAW_ABI,
              functionName: 'withdrawTo',
              args: [me.account as Hex, neededFromDeposit],
            }),
          };
          calls.unshift(withdrawCall);
        }
      }

      const baseUserOp = await builder.buildUserOp({
        calls,
        keyId: me.keyId
      });

      await ensureUserOpPrefund({
        account: me.account as Hex,
        userOp: baseUserOp,
      });

      const hash = await smartWallet.sendUserOperation({ userOp: baseUserOp });
      const receipt = await smartWallet.waitForUserOperationReceipt({ hash });

      if (!receipt || receipt.success === false || receipt.receipt?.status !== '0x1') {
        throw new Error('Transaction reverted during execution. No on-chain transfer was finalized.');
      }

      const txHash = receipt.receipt?.transactionHash as string | undefined;
      if (!txHash) {
        throw new Error('Transaction confirmed but transaction hash is missing in receipt.');
      }

      setSuccessTxHash(txHash);
      saveRecipient(recipient as Hex);
      setAmount('');
      setRecipient('');
      toast.success('Payment sent successfully!');
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
    <Card className='w-full border-primary/10 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden shadow-md dark:shadow-primary/5'>
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none transition-opacity group-hover:opacity-10 text-primary">
        <Send size={140} />
      </div>
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className='flex items-center gap-2 text-xl font-semibold'>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Send className='h-5 w-5' />
          </div>
          Send Payment
        </CardTitle>
        <CardDescription className="text-sm">Send your funds securely from your smart card wallet.</CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <form onSubmit={onSubmit} className='space-y-4'>
          <div className='spacing-y-1.5'>
            <Label htmlFor='token' className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Asset</Label>
            <div className="bg-muted/30 p-1 rounded-lg border shadow-inner">
              <Select value={tokenSymbol} onValueChange={(value) => setTokenSymbol(value as TokenOption['symbol'])}>
                <SelectTrigger id='token' className="border-0 bg-transparent shadow-none focus:ring-0 font-medium h-9">
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
                      <SelectItem key={token.symbol} value={token.symbol} disabled={!hasBalance && token.symbol !== 'ETH'} className="font-medium cursor-pointer">
                        <div className="flex items-center justify-between w-full min-w-[120px]">
                          <span>{token.symbol}</span>
                          <span className="text-muted-foreground text-xs">{balanceLabel}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-center justify-between mt-1'>
               <p className='text-[10px] text-muted-foreground opacity-80 flex items-center gap-1'><IconWallet size={12}/> Available: {selectedBalanceLabel} {selectedToken.symbol}</p>
                 <p className='text-[10px] text-muted-foreground opacity-80 flex items-center gap-1'><IconCoins size={12}/> Wallet gas: {formatBalanceDisplay(ethBalanceRaw, 18)} ETH</p>
            </div>
              {tokenSymbol === 'ETH' && totalEthBalanceRaw && totalEthBalanceRaw > (walletEthBalanceRaw ?? 0n) && (
                <p className='text-[10px] text-muted-foreground opacity-80 mt-1'>
                  Note: AA deposit is reserved for account abstraction and cannot be sent as plain ETH.
                </p>
              )}
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='recipient' className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Recipient Address</Label>
            <Input
              id='recipient'
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder='0x...'
              autoComplete='off'
              className="font-mono text-sm shadow-inner bg-muted/30"
            />
            {recentRecipients.length > 0 && (
              <div className='pt-2 flex items-center gap-2'>
                <IconHistory size={12} className="text-muted-foreground" />
                <div className='flex flex-wrap gap-2'>
                  {recentRecipients.map((r) => (
                    <button
                      key={r.address}
                      type='button'
                      onClick={() => setRecipient(r.address)}
                      className='px-2.5 py-1 text-[10px] font-mono bg-primary/5 hover:bg-primary/15 text-primary rounded-md border border-primary/10 transition-colors'
                    >
                      {r.address.slice(0, 6)}...{r.address.slice(-4)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='amount' className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Amount</Label>
            <div className="relative">
              <Input
                id='amount'
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder='0.00'
                inputMode='decimal'
                className="font-mono text-sm shadow-inner bg-muted/30 pr-16"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none">
                {selectedToken.symbol}
              </div>
            </div>
          </div>

          {error && (
            <div className='flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive'>
              <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
              <span>{error}</span>
            </div>
          )}

          {successTxHash && (
            <div className='flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-600'>
              <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0' />
              <a
                className='font-medium hover:underline underline-offset-2'
                href={`${CHAIN.blockExplorers?.default.url}/tx/${successTxHash}`}
                target='_blank'
                rel='noreferrer'
              >
                Transaction successful! View receipt &rarr;
              </a>
            </div>
          )}

          <div className="pt-2">
            <Button
              type='submit'
              className='w-full shadow-md text-sm font-medium'
              disabled={isSubmitting || me.account === zeroAddress}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                   <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                   Sending...
                </div>
              ) : (
                `Send ${selectedToken.symbol}`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
