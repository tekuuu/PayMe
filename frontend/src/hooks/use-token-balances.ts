'use client';

import { useBalance, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { useQuery } from '@tanstack/react-query';
import { CHAIN, ENTRYPOINT_ADDRESS, PUBLIC_CLIENT } from '@/config/constants';

// Sepolia testnet token addresses
const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; // USDC on Sepolia
const WETH_ADDRESS = '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9'; // WETH on Sepolia

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const;

const ENTRYPOINT_READ_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export function useTokenBalances(address?: string) {
  const { data: ethBalance, isError: ethError } = useBalance({
    address: address as `0x${string}`,
    chainId: CHAIN.id,
    query: {
      enabled: !!address,
    }
  });

  const { data: fallbackEthBalance } = useQuery({
    queryKey: ['native-balance', address],
    queryFn: async () => {
      return await PUBLIC_CLIENT.getBalance({ address: address as `0x${string}` });
    },
    enabled: !!address,
    refetchInterval: 15_000,
  });

  const { data: entryPointDeposit, isError: entryPointDepositError } = useReadContract({
    address: ENTRYPOINT_ADDRESS,
    abi: ENTRYPOINT_READ_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    chainId: CHAIN.id,
    query: {
      enabled: !!address,
    },
  });

  const { data: usdcBalance, isError: usdcError } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    chainId: CHAIN.id,
    query: {
      enabled: !!address,
    }
  });

  const { data: wethBalance, isError: wethError } = useReadContract({
    address: WETH_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    chainId: CHAIN.id,
    query: {
      enabled: !!address,
    }
  });

  const formatBalance = (balance: bigint | undefined, decimals: number = 18) => {
    if (!balance) return '0.00';
    try {
      return (Number(balance) / Math.pow(10, decimals)).toFixed(4);
    } catch {
      return '0.00';
    }
  };

  return {
    eth: {
      // ERC-4337 often moves prefund into EntryPoint deposit, leaving wallet ETH near-zero.
      walletBalance: ethBalance?.value ?? fallbackEthBalance,
      depositBalance: (entryPointDeposit as bigint | undefined) ?? 0n,
      balance: (ethBalance?.value ?? fallbackEthBalance ?? 0n) + ((entryPointDeposit as bigint | undefined) ?? 0n),
      formatted: formatEther((ethBalance?.value ?? fallbackEthBalance ?? 0n) + ((entryPointDeposit as bigint | undefined) ?? 0n)),
      walletFormatted: formatEther(ethBalance?.value ?? fallbackEthBalance ?? 0n),
      depositFormatted:
        !entryPointDepositError && entryPointDeposit !== undefined
          ? formatEther(entryPointDeposit as bigint)
          : '0.00',
      symbol: 'ETH',
    },
    usdc: {
      balance: usdcBalance,
      formatted: usdcBalance && !usdcError ? formatBalance(usdcBalance as bigint, 6) : '0.00',
      symbol: 'USDC',
    },
    weth: {
      balance: wethBalance,
      formatted: wethBalance && !wethError ? formatBalance(wethBalance as bigint, 18) : '0.00',
      symbol: 'WETH',
    },
  };
}