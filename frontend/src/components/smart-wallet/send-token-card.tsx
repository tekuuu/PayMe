'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { CHAIN, ENTRYPOINT_ADDRESS } from '@/config/constants';
import { useTokenBalances } from '@/hooks/use-token-balances';
import { smartWallet } from '@/lib/smart-wallet';
import { emptyHex, UserOpBuilder } from '@/lib/smart-wallet/service/userOps';
import { ensureUserOpPrefund } from '@/lib/smart-wallet/service/userOps/prefund';
import { Me } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { CryptoInput } from '@/components/ui/crypto-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { IconWallet, IconCoins, IconHistory } from '@tabler/icons-react';
import { encodeFunctionData, Hex, isAddress, parseEther, parseUnits, zeroAddress } from 'viem';
import { recordCustomerActivity, confirmCustomerActivity, addConfirmedActivity } from '@/lib/merchant/control-plane-store';
import { toast } from 'sonner';

type RecentRecipient = {
  address: Hex;
  timestamp: number;
};

type TokenOption = {
  symbol: 'ETH' | 'USDC';
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
    decimals: 6,
  },
];

const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
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
  const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 6).replace(/0+$/, '');
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
  const [step, setStep] = useState<string | null>(null);
  const [recentRecipients, setRecentRecipients] = useState<RecentRecipient[]>([]);

  useMemo(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('payme_recent_recipients');
      if (saved) {
        try {
          setRecentRecipients(JSON.parse(saved));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const saveRecipient = (address: Hex) => {
    const newRecent = [
      { address, timestamp: Date.now() },
      ...recentRecipients.filter((r) => r.address.toLowerCase() !== address.toLowerCase()),
    ].slice(0, 5);
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

  const setMaxAmount = () => {
    if (!selectedBalanceRaw) return;
    const display = formatBalanceDisplay(selectedBalanceRaw, selectedToken.decimals);
    setAmount(display);
  };

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

    const sender = me.account as Hex;
    console.log('[Send] Starting send to:', recipient, 'amount:', amount);

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
      setStep('prepare');
      smartWallet.init();

      // Yield to browser so React can render the loading state
      await new Promise((r) => setTimeout(r, 0));

      const transferCall =
        selectedToken.address === null
          ? {
              dest: recipient as Hex,
              value: amountRaw,
              data: emptyHex,
            }
          : {
              dest: selectedToken.address,
              value: 0n,
              data: encodeFunctionData({
                abi: ERC20_ABI,
                functionName: 'transfer',
                args: [recipient as Hex, amountRaw],
              }),
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
        keyId: me.keyId,
      });

      setStep('fund');
      await ensureUserOpPrefund({
        account: me.account as Hex,
        userOp: baseUserOp,
      });

      setStep('send');

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
      addConfirmedActivity(sender, {
        type: 'send',
        amount: amount,
        token: selectedToken.symbol,
        counterpartyAddress: recipient,
        txHash,
        userOpHash: hash,
      });
      saveRecipient(recipient as Hex);
      toast.success(`${amount} ${selectedToken.symbol} sent successfully`);
    } catch (err: any) {
      console.error('Send error:', err);
      setError(err.message || 'Transaction failed');
      toast.error('Transaction failed');
    } finally {
      setIsSubmitting(false);
      setStep(null);
    }
  }

  if (successTxHash) {
    return (
      <div className='flex flex-col items-center gap-3 py-6 text-center'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10'>
          <CheckCircle2 className='h-6 w-6 text-emerald-500' />
        </div>
        <p className='text-sm font-medium text-foreground'>Transaction Successful</p>
        <a
          href={`${CHAIN.blockExplorers?.default.url}/tx/${successTxHash}`}
          target='_blank'
          rel='noopener noreferrer'
          className='text-xs text-primary underline underline-offset-2 hover:no-underline'
        >
          View on explorer
        </a>
        <Button
          variant='outline'
          size='sm'
          className='rounded-full mt-2'
          onClick={() => {
            setSuccessTxHash(null);
            setRecipient('');
            setAmount('');
          }}
        >
          Send Again
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      {/* Token selector with balance */}
      <div>
        <label className='text-xs font-medium text-muted-foreground mb-1.5 block'>
          Asset
        </label>
        <div className='rounded-lg bg-muted/30 border border-border/60 p-1'>
          <Select
            value={tokenSymbol}
            onValueChange={(value) => {
              setTokenSymbol(value as TokenOption['symbol']);
              setAmount('');
            }}
          >
            <SelectTrigger className='border-0 bg-transparent shadow-none focus:ring-0 font-medium h-9'>
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
                  <SelectItem
                    key={token.symbol}
                    value={token.symbol}
                    disabled={!hasBalance && token.symbol !== 'ETH'}
                    className='font-medium'
                  >
                    <div className='flex items-center justify-between w-full min-w-[120px]'>
                      <span>{token.symbol}</span>
                      <span className='text-muted-foreground text-xs'>{balanceLabel}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className='flex items-center justify-between mt-1.5'>
          <p className='text-[10px] text-muted-foreground opacity-80 flex items-center gap-1'>
            <IconWallet size={12} />
            Available: {selectedBalanceLabel} {selectedToken.symbol}
          </p>
          <p className='text-[10px] text-muted-foreground opacity-80 flex items-center gap-1'>
            <IconCoins size={12} />
            Gas: {formatBalanceDisplay(ethBalanceRaw, 18)} ETH
          </p>
        </div>
      </div>

      {/* Recipient */}
      <div className='space-y-1.5'>
        <label className='text-xs font-medium text-muted-foreground'>
          Recipient Address
        </label>
        <CryptoInput
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder='0x...'
          autoComplete='off'
          className='font-mono text-sm'
          required
        />
        {recentRecipients.length > 0 && (
          <div className='pt-1 flex items-center gap-2'>
            <IconHistory size={12} className='text-muted-foreground' />
            <div className='flex flex-wrap gap-1.5'>
              {recentRecipients.map((r) => (
                <button
                  key={r.address}
                  type='button'
                  onClick={() => setRecipient(r.address)}
                  className='px-2 py-0.5 text-[10px] font-mono bg-primary/5 hover:bg-primary/15 text-primary rounded-md border border-primary/10 transition-colors'
                >
                  {r.address.slice(0, 6)}...{r.address.slice(-4)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Amount */}
      <div className='space-y-1.5'>
        <label className='text-xs font-medium text-muted-foreground'>
          Amount
        </label>
        <CryptoInput
          type='number'
          min='0'
          step='any'
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder='0.00'
          suffix={
            <span className='text-sm font-semibold text-foreground'>
              {selectedToken.symbol}
            </span>
          }
          showMaxButton
          onMaxClick={setMaxAmount}
          required
        />
      </div>

      {/* Step indicator */}
      {step && (
        <div className='flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary'>
          <Loader2 size={14} className='animate-spin' />
          {step === 'prepare' && 'Preparing transaction...'}
          {step === 'fund' && 'Funding wallet gas...'}
          {step === 'send' && 'Sending...'}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className='flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-500'>
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        type='submit'
        disabled={isSubmitting || !recipient || !amount}
        className='w-full rounded-lg h-10 font-medium gap-2'
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className='animate-spin' />
            Sending...
          </>
        ) : (
          <>
            <Send size={16} />
            Send
          </>
        )}
      </Button>
    </form>
  );
}
