'use client';

import { useBalance, useReadContract } from 'wagmi';
import { formatEther } from 'viem';

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

export function useTokenBalances(address?: string) {
  const { data: ethBalance, isError: ethError } = useBalance({
    address: address as `0x${string}`,
    enabled: !!address,
  });

  const { data: usdcBalance, isError: usdcError } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    enabled: !!address,
  });

  const { data: wethBalance, isError: wethError } = useReadContract({
    address: WETH_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    enabled: !!address,
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
      balance: ethBalance?.value,
      formatted: ethBalance && !ethError ? formatEther(ethBalance.value) : '0.00',
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