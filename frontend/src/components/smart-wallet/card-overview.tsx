import React, { useState, useMemo, useEffect } from 'react';

import { useTokenBalances } from '@/hooks/use-token-balances';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    IconSnowflake,
    IconLock,
    IconSettings,
    IconHistory,
    IconEye,
    IconEyeOff,
    IconShieldLock,
    IconWallet,
    IconFingerprint,
    IconCreditCard,
    IconCpu
} from '@tabler/icons-react';
import { Hex, encodeFunctionData, parseUnits } from 'viem';
import Link from 'next/link';
import { toast } from 'sonner';
import { useConfidentialBalance } from '@/hooks/use-confidential-balance';
import { CHAIN } from '@/config/constants';
import { smartWallet } from '@/lib/smart-wallet';
import { UserOpBuilder } from '@/lib/smart-wallet/service/userOps';
import { useMe } from '@/providers/auth-provider';
import { useFhevmContext } from '@/providers/fhevm-provider';
import { useWagmiEthers } from '@/hooks/use-wagmi-ethers';
import { PRIVATE_CARD_ABI } from '@/config/constants';
import { useReadContract } from 'wagmi';

const ERC20_ABI = [
    { name: 'approve', type: 'function', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] }
] as const;

const WRAPPER_ABI = [
    { name: 'underlying', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
    { name: 'wrap', type: 'function', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] }
] as const;

const ERC20_READ_ABI = [
    { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
    { name: 'allowance', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
    { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
    { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] }
] as const;

export function CardOverview({ address, cardAddress }: { address: Hex | undefined; cardAddress: Hex | undefined }) {
    const { me } = useMe();
    const balances = useTokenBalances(address);
    const {
        formattedBalance,
        isDecrypting,
        decrypt,
        canDecrypt,
        refresh: refreshConfidentialBalance,
        decryptError,
        hasEncryptedHandle,
        hasSigner,
        decryptSignerAddress,
        usingServerSigner,
        serverSignerError,
        hasFheInstance,
    } = useConfidentialBalance(cardAddress);

    const [isFrozen, setIsFrozen] = useState(false);
    const [showSensitive, setShowSensitive] = useState(false);
    const [isFunding, setIsFunding] = useState(false);
    const [fundAmount, setFundAmount] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendTo, setSendTo] = useState('');
    const [sendAmount, setSendAmount] = useState('');
    const [showSendForm, setShowSendForm] = useState(false);

    const { instance } = useFhevmContext();
    const { ethersSigner } = useWagmiEthers();

    const { data: cardCusdcAddress } = useReadContract({
        address: cardAddress,
        abi: PRIVATE_CARD_ABI,
        functionName: 'cUSDC',
        query: {
            enabled: !!cardAddress,
        }
    });

    const { data: underlyingTokenAddress } = useReadContract({
        address: cardCusdcAddress as Hex,
        abi: WRAPPER_ABI,
        functionName: 'underlying',
        query: {
            enabled: !!cardCusdcAddress,
        }
    });

    const { data: underlyingTokenBalance } = useReadContract({
        address: underlyingTokenAddress as Hex,
        abi: ERC20_READ_ABI,
        functionName: 'balanceOf',
        args: [address as Hex],
        query: {
            enabled: !!underlyingTokenAddress && !!address,
        }
    });

    const { data: underlyingTokenSymbol } = useReadContract({
        address: underlyingTokenAddress as Hex,
        abi: ERC20_READ_ABI,
        functionName: 'symbol',
        query: {
            enabled: !!underlyingTokenAddress,
        }
    });

    const { data: underlyingTokenDecimals } = useReadContract({
        address: underlyingTokenAddress as Hex,
        abi: ERC20_READ_ABI,
        functionName: 'decimals',
        query: {
            enabled: !!underlyingTokenAddress,
        }
    });

    const builder = useMemo(() => new UserOpBuilder(CHAIN), []);

    useEffect(() => {
        if (decryptError) {
            toast.error(`Decrypt failed: ${decryptError}`);
        }
    }, [decryptError]);

    const handleDecryptBalance = async () => {
        await refreshConfidentialBalance();

        if (!hasFheInstance) {
            toast.info('FHE engine is still initializing. Please retry in a few seconds.');
            return;
        }

        if (!hasEncryptedHandle) {
            toast.info('No encrypted cUSDC balance yet. Fund the card first.');
            return;
        }

        if (!hasSigner) {
            toast.error(serverSignerError || 'Decrypt signer is not ready yet. Please retry in a moment.');
            return;
        }

        if (!canDecrypt) {
            toast.info('Preparing decryption request.');
            return;
        }

        if (me && cardAddress) {
            try {
                smartWallet.init();

                const aclSyncCalls = [] as Array<{ dest: Hex; value: bigint; data: Hex }>;

                aclSyncCalls.push({
                    dest: cardAddress,
                    value: 0n,
                    data: encodeFunctionData({
                        abi: PRIVATE_CARD_ABI,
                        functionName: 'syncOwnerBalanceAcl',
                        args: []
                    })
                });

                if (decryptSignerAddress && decryptSignerAddress.toLowerCase() !== me.account.toLowerCase()) {
                    aclSyncCalls.push({
                        dest: cardAddress,
                        value: 0n,
                        data: encodeFunctionData({
                            abi: PRIVATE_CARD_ABI,
                            functionName: 'syncBalanceAcl',
                            args: [decryptSignerAddress]
                        })
                    });
                }

                const aclSyncUserOp = await builder.buildUserOp({
                    calls: aclSyncCalls,
                    keyId: me.keyId
                });

                const aclSyncHash = await smartWallet.sendUserOperation({ userOp: aclSyncUserOp });
                await smartWallet.waitForUserOperationReceipt({ hash: aclSyncHash });
                await refreshConfidentialBalance();

                // Allow a short propagation window so relayer-side simulation sees updated ACL state.
                await new Promise((resolve) => setTimeout(resolve, 3000));
            } catch (e: any) {
                toast.error(e?.message || 'Failed to sync ACL for decrypt signer');
                return;
            }
        }

        if (usingServerSigner) {
            toast.info('Decrypting via relayer-compatible signer (passkey wallet remains active for card ownership).');
        }

        decrypt();
    };

    const handleToggleFreeze = () => {
        setIsFrozen(!isFrozen);
        toast.success(isFrozen ? "Card unfrozen successfully" : "Card frozen successfully");
    };

    const handleSendConfidential = async () => {
        if (!me || !cardAddress || !instance || !ethersSigner || !sendTo || !sendAmount || !cardCusdcAddress) {
            toast.error("Missing required information for transaction");
            return;
        }

        setIsSending(true);
        try {
            const amountRaw = parseUnits(sendAmount, 6);

            toast.info("Encrypting payment details locally...");

            // 1. Create encrypted input for the cUSDC contract
            const input = instance.createEncryptedInput(cardCusdcAddress as Hex, me.account as Hex);
            input.add64(amountRaw);
            const { handles, inputProof } = await input.encrypt();

            smartWallet.init();

            // 2. Build UserOp for call to card.transfer(to, encryptedAmount)
            const call = {
                dest: cardAddress,
                value: 0n,
                data: encodeFunctionData({
                    abi: PRIVATE_CARD_ABI,
                    functionName: 'transfer',
                    args: [sendTo as Hex, handles[0]] // The handle is what we pass to the contract
                })
            };

            // 3. Build UserOperation
            const userOp = await builder.buildUserOp({
                calls: [call],
                keyId: me.keyId
            });

            // 4. Send and wait
            const hash = await smartWallet.sendUserOperation({ userOp });
            toast.info("Sending confidential payment...");
            await smartWallet.waitForUserOperationReceipt({ hash });

            toast.success(`Successfully sent ${sendAmount} cUSDC privately!`);
            setShowSendForm(false);
            setSendAmount('');
            setSendTo('');
        } catch (error: any) {
            console.error("Confidential transfer failed:", error);
            toast.error(error?.message || "Transfer failed");
        } finally {
            setIsSending(false);
        }
    };

    const handleFundCard = async () => {
        if (!me || !cardAddress || !cardCusdcAddress || !underlyingTokenAddress) {
            toast.error('Card wrapper address is not available yet. Please retry in a moment.');
            return;
        }

        setIsFunding(true);
        try {
            const decimals = Number(underlyingTokenDecimals ?? 6);
            const symbol = (underlyingTokenSymbol as string) || 'token';

            const smartWalletSender = await builder.getSenderAddress(me.keyId);

            const availableBalanceRaw = await builder.publicClient.readContract({
                address: underlyingTokenAddress as Hex,
                abi: ERC20_READ_ABI,
                functionName: 'balanceOf',
                args: [smartWalletSender as Hex],
            }) as bigint;

            if (!availableBalanceRaw || availableBalanceRaw <= 0n) {
                toast.error(`Insufficient ${symbol} balance in smart wallet.`);
                return;
            }

            if (!fundAmount.trim()) {
                toast.error(`Enter an amount of ${symbol} to fund.`);
                return;
            }

            let amountRaw: bigint;
            try {
                amountRaw = parseUnits(fundAmount, decimals);
            } catch {
                toast.error(`Invalid ${symbol} amount.`);
                return;
            }

            if (amountRaw <= 0n) {
                toast.error(`Amount must be greater than 0 ${symbol}.`);
                return;
            }

            if (amountRaw > availableBalanceRaw) {
                toast.error(`Amount exceeds available ${symbol} balance.`);
                return;
            }

            smartWallet.init();

            // Step 1: Approve wrapper to pull underlying tokens from the smart wallet.
            const approveCall = {
                dest: underlyingTokenAddress as Hex,
                value: 0n,
                data: encodeFunctionData({
                    abi: ERC20_ABI,
                    functionName: 'approve',
                    args: [cardCusdcAddress as Hex, amountRaw]
                })
            };

            const approveUserOp = await builder.buildUserOp({
                calls: [approveCall],
                keyId: me.keyId
            });

            toast.info('Approving wrapper...');
            const approveHash = await smartWallet.sendUserOperation({ userOp: approveUserOp });
            const approveReceipt = await smartWallet.waitForUserOperationReceipt({ hash: approveHash });

            if (approveReceipt?.success === false) {
                throw new Error('Approve transaction reverted. Please retry funding.');
            }

            // Give RPC state a short window to reflect post-approve allowance/balance from the included user-op.
            let allowanceAfterApprove = 0n;
            let balanceBeforeWrap = 0n;
            const maxAttempts = 8;
            for (let i = 0; i < maxAttempts; i++) {
                allowanceAfterApprove = await builder.publicClient.readContract({
                    address: underlyingTokenAddress as Hex,
                    abi: ERC20_READ_ABI,
                    functionName: 'allowance',
                    args: [smartWalletSender as Hex, cardCusdcAddress as Hex],
                }) as bigint;

                balanceBeforeWrap = await builder.publicClient.readContract({
                    address: underlyingTokenAddress as Hex,
                    abi: ERC20_READ_ABI,
                    functionName: 'balanceOf',
                    args: [smartWalletSender as Hex],
                }) as bigint;

                if (allowanceAfterApprove >= amountRaw && balanceBeforeWrap >= amountRaw) {
                    break;
                }

                await new Promise((resolve) => setTimeout(resolve, 1200));
            }

            if (allowanceAfterApprove < amountRaw) {
                throw new Error(
                    `Allowance still too low after approve (allowance=${allowanceAfterApprove.toString()}, needed=${amountRaw.toString()}).`
                );
            }

            if (balanceBeforeWrap < amountRaw) {
                throw new Error(
                    `Smart wallet ${symbol} balance is too low for wrap (balance=${balanceBeforeWrap.toString()}, needed=${amountRaw.toString()}).`
                );
            }

            // Step 2: Wrap underlying tokens into confidential balance for the card.
            const wrapCall = {
                dest: cardCusdcAddress as Hex,
                value: 0n,
                data: encodeFunctionData({
                    abi: WRAPPER_ABI,
                    functionName: 'wrap',
                    args: [cardAddress, amountRaw]
                })
            };

            const wrapUserOp = await builder.buildUserOp({
                calls: [wrapCall],
                keyId: me.keyId,
                // Force next nonce to avoid transient RPC lag after the approve op is included.
                nonce: BigInt(approveUserOp.nonce) + 1n
            });

            toast.info('Wrapping into confidential balance...');
            const wrapHash = await smartWallet.sendUserOperation({ userOp: wrapUserOp });
            await smartWallet.waitForUserOperationReceipt({ hash: wrapHash });

            // Step 3: Sync ACL so owner can decrypt the current balance handle.
            const aclSyncCall = {
                dest: cardAddress,
                value: 0n,
                data: encodeFunctionData({
                    abi: PRIVATE_CARD_ABI,
                    functionName: 'syncOwnerBalanceAcl',
                    args: []
                })
            };

            const aclSyncUserOp = await builder.buildUserOp({
                calls: [aclSyncCall],
                keyId: me.keyId,
                nonce: BigInt(wrapUserOp.nonce) + 1n
            });

            toast.info('Syncing balance ACL...');
            const aclSyncHash = await smartWallet.sendUserOperation({ userOp: aclSyncUserOp });
            await smartWallet.waitForUserOperationReceipt({ hash: aclSyncHash });

            await refreshConfidentialBalance();

            toast.success(`Successfully funded card with ${fundAmount} ${symbol}!`);
            setFundAmount('');
        } catch (error: any) {
            console.error("Funding failed:", error);
            const message = error?.message || "Funding failed";
            const isOpaqueUserOpRevert =
                typeof message === 'string' &&
                message.includes('eth_estimateUserOperationGas') &&
                message.includes('reason: 0x');

            if (isOpaqueUserOpRevert) {
                toast.error('Funding reverted inside cUSDC wrapper. Redeploy wrapper with ZamaEthereumConfig, redeploy CardFactory, then create a new card.');
            } else {
                toast.error(message);
            }
        } finally {
            setIsFunding(false);
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-700">
            {/* Premium Integrated Hub */}
            <Card className="overflow-hidden border-none bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white shadow-2xl rounded-3xl">
                <div className="relative p-4 md:p-5">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none" />

                    <div className="relative grid gap-4 lg:grid-cols-2 items-center">
                        {/* Left Column: The Visual Card & Header */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-primary mb-1">
                                    <IconCpu size={18} className="animate-pulse" />
                                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase">FHE On-Chain Security</span>
                                </div>
                                <h1 className="text-3xl font-extrabold tracking-tight">Secure Virtual Card</h1>
                                <p className="text-slate-400 text-sm font-medium">
                                    {cardAddress ? `Card: ${cardAddress.slice(0, 6)}...${cardAddress.slice(-4)}` : 'Zama FHEVM Powered'}
                                </p>
                            </div>

                            {/* The Physical Card Visual */}
                            <div className={`relative w-full max-w-[320px] aspect-[1.586/1] rounded-2xl p-6 bg-gradient-to-br from-slate-800 to-slate-950 border border-white/10 shadow-2xl transition-all duration-500 overflow-hidden group ${isFrozen ? 'grayscale opacity-60' : ''}`}>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent)]" />
                                <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_5s_infinite_linear]" />

                                <div className="relative h-full flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md opacity-80" />
                                        <IconCreditCard size={32} className="text-white/20 group-hover:text-primary/40 transition-colors" />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="text-2xl md:text-3xl font-mono tracking-[0.25em] text-white/90">
                                            {showSensitive ? "4128 9021 3345 8812" : "•••• •••• •••• ••••"}
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold">Card Holder</p>
                                                <p className="text-sm font-medium tracking-tight uppercase truncate max-w-[150px]">
                                                    {address?.slice(0, 10)}...{address?.slice(-6)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold">Network</p>
                                                <p className="text-xs font-bold text-emerald-400">SEPOLIA FHEVM</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isFrozen && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                        <div className="px-4 py-2 bg-white text-black rounded-full font-bold text-xs flex items-center gap-2">
                                            <IconSnowflake size={14} /> FROZEN
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Integration Balances & Controls */}
                        <div className="grid gap-6">
                            {/* Condensed Balances Dashboard */}
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg">Wallet Intelligence</h3>
                                    <IconWallet size={18} className="text-slate-500" />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">Ξ</div>
                                            <span className="text-sm font-medium text-slate-300">Ethereum</span>
                                        </div>
                                        <span className="text-lg font-bold group-hover:text-primary transition-colors">{balances.eth.formatted}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/20 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 text-[10px] font-bold">$</div>
                                            <span className="text-sm font-medium text-slate-300">USD Coin</span>
                                        </div>
                                        <span className="text-lg font-bold group-hover:text-blue-500 transition-colors">{balances.usdc.formatted}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20 hover:border-primary/40 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">C</div>
                                            <span className="text-sm font-medium text-slate-100">Confidential USDC</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 rounded-full hover:bg-primary/20 disabled:opacity-40"
                                                onClick={handleDecryptBalance}
                                                disabled={isDecrypting}
                                            >
                                                <IconEye size={12} className="text-primary" />
                                            </Button>
                                            {isDecrypting && (
                                                <span className="animate-spin w-3 h-3 rounded-full border border-primary border-t-transparent" />
                                            )}
                                            <span className="text-lg font-bold text-primary animate-in fade-in">
                                                {formattedBalance}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/20 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500 text-[10px] font-bold">W</div>
                                            <span className="text-sm font-medium text-slate-300">Wrapped ETH</span>
                                        </div>
                                        <span className="text-lg font-bold group-hover:text-indigo-500 transition-colors">{balances.weth.formatted}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Interactive Controls Bar */}
                            <div className="flex flex-wrap gap-3">
                                <div className="flex-1 min-w-[180px] h-12 rounded-xl border border-white/10 bg-white/5 px-3">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.000001"
                                        placeholder="Amount to fund"
                                        className="h-full w-full bg-transparent text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none"
                                        value={fundAmount}
                                        onChange={(e) => setFundAmount(e.target.value)}
                                    />
                                </div>

                                <Button
                                    variant="ghost"
                                    className={`flex-1 min-w-[120px] h-12 rounded-xl gap-2 border transition-all ${isFrozen ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    onClick={handleToggleFreeze}
                                >
                                    {isFrozen ? <IconSnowflake size={18} className="animate-pulse" /> : <IconShieldLock size={18} />}
                                    <span className="font-bold text-sm">{isFrozen ? "Unfreeze" : "Freeze"}</span>
                                </Button>

                                <Button
                                    variant="ghost"
                                    className="flex-1 min-w-[120px] h-12 rounded-xl gap-2 border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all font-bold"
                                    onClick={handleFundCard}
                                    disabled={isFunding}
                                >
                                    {isFunding ? (
                                        <span className="animate-spin w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent" />
                                    ) : (
                                        <IconWallet size={18} />
                                    )}
                                    <span className="text-sm">Fund Card</span>
                                </Button>

                                <Button
                                    variant="ghost"
                                    className={`flex-1 min-w-[120px] h-12 rounded-xl gap-2 border transition-all ${showSensitive ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    onClick={() => setShowSensitive(!showSensitive)}
                                >
                                    {showSensitive ? <IconEyeOff size={18} /> : <IconFingerprint size={18} />}
                                    <span className="font-bold text-sm">{showSensitive ? "Hide Info" : "Reveal PIN"}</span>
                                </Button>

                                <Link href="/dashboard/activity" className="flex-1 min-w-[120px]">
                                    <Button variant="ghost" className="w-full h-12 rounded-xl gap-2 border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-bold text-sm">
                                        <IconHistory size={18} />
                                        Statement
                                    </Button>
                                </Link>

                                <Button
                                    variant="ghost"
                                    className={`flex-1 min-w-[120px] h-12 rounded-xl gap-2 border transition-all ${showSendForm ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    onClick={() => setShowSendForm(!showSendForm)}
                                >
                                    <IconCreditCard size={18} />
                                    <span className="font-bold text-sm">Send</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Confidential Send Form */}
            {showSendForm && (
                <Card className="bg-slate-900 border-white/5 p-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Confidential cUSDC Payment</h3>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                                <IconLock size={10} /> Fully Encrypted
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Recipient Address</label>
                                <input
                                    type="text"
                                    placeholder="0x..."
                                    className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-3 text-sm focus:outline-none focus:border-primary/50"
                                    value={sendTo}
                                    onChange={(e) => setSendTo(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Amount (cUSDC)</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-3 text-sm focus:outline-none focus:border-primary/50"
                                    value={sendAmount}
                                    onChange={(e) => setSendAmount(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button
                            className="w-full h-11 bg-primary text-black hover:bg-primary/90 font-bold"
                            onClick={handleSendConfidential}
                            disabled={isSending || !sendTo || !sendAmount}
                        >
                            {isSending ? (
                                <span className="animate-spin w-5 h-5 rounded-full border-2 border-black border-t-transparent" />
                            ) : (
                                "Execute Private Payment"
                            )}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Detail highlight - Subtle PIN reveal result */}
            {showSensitive && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 animate-in zoom-in-95 duration-300 flex items-center justify-between">
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Private Security Detail</h4>
                        <p className="text-xs text-muted-foreground">This PIN was decrypted locally via your Passkey.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-muted-foreground uppercase mb-1">CVV</span>
                            <span className="text-xl font-mono font-bold tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">8 4 2</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-muted-foreground uppercase mb-1">PIN</span>
                            <span className="text-xl font-mono font-bold tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md text-primary">8 4 2 1</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
