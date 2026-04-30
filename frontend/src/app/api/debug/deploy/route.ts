import { NextResponse } from 'next/server';

function mask(value: string | undefined): string | null {
  if (!value) return null;
  if (value.length <= 12) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

export async function GET() {
  const resolvedBundlerUrl = process.env.NEXT_PUBLIC_BUNDLER_URL;

  const requiredEnv = {
    NEXT_PUBLIC_RPC_ENDPOINT: !!process.env.NEXT_PUBLIC_RPC_ENDPOINT,
    NEXT_PUBLIC_BUNDLER_URL: !!resolvedBundlerUrl,
    NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS: !!process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS,
    NEXT_PUBLIC_PRIVATE_CARD_FACTORY_ADDRESS: !!process.env.NEXT_PUBLIC_PRIVATE_CARD_FACTORY_ADDRESS,
    NEXT_PUBLIC_CUSDC_WRAPPER_ADDRESS: !!process.env.NEXT_PUBLIC_CUSDC_WRAPPER_ADDRESS,
    NEXT_PUBLIC_REAL_USDC_ADDRESS: !!process.env.NEXT_PUBLIC_REAL_USDC_ADDRESS,
    RELAYER_PRIVATE_KEY: !!process.env.RELAYER_PRIVATE_KEY,
  };

  return NextResponse.json({
    runtime: {
      nodeEnv: process.env.NODE_ENV || null,
      vercel: !!process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV || null,
      vercelRegion: process.env.VERCEL_REGION || null,
      gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
      gitCommitRef: process.env.VERCEL_GIT_COMMIT_REF || null,
    },
    publicConfig: {
      rpcEndpoint: mask(process.env.NEXT_PUBLIC_RPC_ENDPOINT),
      bundlerUrl: mask(resolvedBundlerUrl),
      factory: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS || null,
      privateCardFactory: process.env.NEXT_PUBLIC_PRIVATE_CARD_FACTORY_ADDRESS || null,
      cusdcWrapper: process.env.NEXT_PUBLIC_CUSDC_WRAPPER_ADDRESS || null,
      realUsdc: process.env.NEXT_PUBLIC_REAL_USDC_ADDRESS || null,
    },
    requiredEnv,
  });
}
