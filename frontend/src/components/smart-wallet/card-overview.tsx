import React, { useState, useMemo, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
    IconEye,
    IconCopy,
    IconWallet,
    IconSend
} from '@tabler/icons-react';
import { Hex, encodeFunctionData, parseUnits, toHex } from 'viem';
import { toast } from 'sonner';
import { useConfidentialBalance } from '@/hooks/use-confidential-balance';
import { CHAIN } from '@/config/constants';
import { smartWallet } from '@/lib/smart-wallet';
import { UserOpBuilder } from '@/lib/smart-wallet/service/userOps';
import { ensureUserOpPrefund } from '@/lib/smart-wallet/service/userOps/prefund';
import { useMe } from '@/providers/auth-provider';
import { useFhevmContext } from '@/providers/fhevm-provider';
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

function sameAddress(left?: string, right?: string) {
    return !!left && !!right && left.toLowerCase() === right.toLowerCase();
}

function shortenAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function maxBigInt(values: bigint[]) {
    let best = values[0] ?? 0n;
    for (const value of values) {
        if (value > best) best = value;
    }
    return best;
}

function withGasFloors(
    userOp: any,
    floors: { callGasLimit: bigint; verificationGasLimit: bigint; preVerificationGas: bigint }
) {
    return {
        ...userOp,
        callGasLimit: toHex(maxBigInt([BigInt(userOp.callGasLimit), floors.callGasLimit])),
        verificationGasLimit: toHex(maxBigInt([BigInt(userOp.verificationGasLimit), floors.verificationGasLimit])),
        preVerificationGas: toHex(maxBigInt([BigInt(userOp.preVerificationGas), floors.preVerificationGas])),
    };
}

function bumpGas(userOp: any) {
    const bump = (value: bigint, bps: bigint, extra: bigint) =>
        ((value * (10_000n + bps) + 9_999n) / 10_000n) + extra;

    const call = BigInt(userOp.callGasLimit);
    const verification = BigInt(userOp.verificationGasLimit);
    const pre = BigInt(userOp.preVerificationGas);

    return {
        ...userOp,
        callGasLimit: toHex(maxBigInt([bump(call, 3500n, 50_000n), 650_000n])),
        verificationGasLimit: toHex(maxBigInt([bump(verification, 7000n, 200_000n), 1_600_000n])),
        preVerificationGas: toHex(maxBigInt([bump(pre, 4000n, 20_000n), 220_000n])),
    };
}

function isRetryableGasSimulationError(error: unknown) {
    const message = String((error as any)?.message || '').toLowerCase();
    return (
        message.includes('aa40') ||
        message.includes('over verificationgaslimit') ||
        message.includes('aa23') ||
        message.includes('reverted (or oog)') ||
        message.includes('out of gas')
    );
}

export function CardOverview({ cardAddress }: { cardAddress: Hex | undefined }) {
    const { me } = useMe();

    const { data: cardOwnerAddress } = useReadContract({
        address: cardAddress,
        abi: PRIVATE_CARD_ABI,
        functionName: 'owner',
        query: {
            enabled: !!cardAddress,
        }
    });

    const {
        formattedBalance,
        isDecrypting,
        decrypt,
        canDecrypt,
        refresh: refreshConfidentialBalance,
        decryptError,
        hasSigner,
        decryptSignerAddress,
        usingServerSigner,
        serverSignerError,
        hasFheInstance,
    } = useConfidentialBalance(cardAddress, cardOwnerAddress as Hex | undefined);

    const [isFunding, setIsFunding] = useState(false);
    const [fundAmount, setFundAmount] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isDecryptInProgress, setIsDecryptInProgress] = useState(false);
    const [pendingDecryptAfterSync, setPendingDecryptAfterSync] = useState(false);
    const [sendTo, setSendTo] = useState('');
    const [sendAmount, setSendAmount] = useState('');
    const [showSendForm, setShowSendForm] = useState(false);

    const { instance } = useFhevmContext();

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
    const resolvedOwnerAddress = cardOwnerAddress as Hex | undefined;
    const isCurrentUserOwner = sameAddress(me?.account, resolvedOwnerAddress);
    const ownerGuardMessage = resolvedOwnerAddress && !isCurrentUserOwner
        ? `This card belongs to ${shortenAddress(resolvedOwnerAddress)}. Decrypt, funding, and private send stay locked until that owner wallet signs in.`
        : null;

    useEffect(() => {
        if (decryptError) {
            toast.error(`Decrypt failed: ${decryptError}`);
        }
    }, [decryptError]);

    useEffect(() => {
        if (!pendingDecryptAfterSync || isDecrypting || !canDecrypt) {
            return;
        }

        setPendingDecryptAfterSync(false);
        decrypt();
        setIsDecryptInProgress(false);
    }, [canDecrypt, decrypt, isDecrypting, pendingDecryptAfterSync]);

    useEffect(() => {
        if (!isCurrentUserOwner) {
            setShowSendForm(false);
        }
    }, [isCurrentUserOwner]);

    const handleCopy = async (value: string | undefined, label: string) => {
        if (!value) {
            toast.error(`${label} is not available yet.`);
            return;
        }

        try {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} copied.`);
        } catch {
            toast.error(`Failed to copy ${label.toLowerCase()}.`);
        }
    };

    const handleDecryptBalance = async () => {
        setIsDecryptInProgress(true);
        await refreshConfidentialBalance();

        if (!hasFheInstance) {
            toast.info('FHE engine is still initializing. Please retry in a few seconds.');
            setIsDecryptInProgress(false);
            return;
        }

        if (!hasSigner) {
            toast.error(serverSignerError || 'Decrypt signer is not ready yet. Please retry in a moment.');
            setIsDecryptInProgress(false);
            return;
        }

        if (!me || !cardAddress) {
            toast.error('Card session is not ready yet. Please retry in a moment.');
            setIsDecryptInProgress(false);
            return;
        }

        if (!resolvedOwnerAddress) {
            toast.error('Card owner is still loading. Please retry in a moment.');
            setIsDecryptInProgress(false);
            return;
        }

        if (!isCurrentUserOwner) {
            toast.error('Only the card owner can decrypt this balance.');
            setIsDecryptInProgress(false);
            return;
        }

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

            await ensureUserOpPrefund({
                account: me.account as Hex,
                userOp: aclSyncUserOp,
            });

            const aclSyncHash = await smartWallet.sendUserOperation({ userOp: aclSyncUserOp });
            await smartWallet.waitForUserOperationReceipt({ hash: aclSyncHash });
            await refreshConfidentialBalance();

            // Allow a short propagation window so relayer-side simulation sees updated ACL state.
            await new Promise((resolve) => setTimeout(resolve, 3000));
        } catch (e: any) {
            toast.error(e?.message || 'Failed to sync ACL for decrypt signer');
            setIsDecryptInProgress(false);
            return;
        }

        if (usingServerSigner) {
            toast.info('Decrypting via relayer-compatible signer (passkey wallet remains active for card ownership).');
        }

        const latestBalanceHandle = await builder.publicClient.readContract({
            address: cardAddress as Hex,
            abi: PRIVATE_CARD_ABI,
            functionName: 'getEncryptedBalance',
            account: me.account as Hex,
        }) as bigint | Hex;

        const latestHandleIsZero =
            typeof latestBalanceHandle === 'bigint'
                ? latestBalanceHandle === 0n
                : latestBalanceHandle === '0x' + '0'.repeat(64) || latestBalanceHandle === '0x0';

        if (latestHandleIsZero) {
            toast.info('No encrypted cUSDC balance yet. Fund the card first.');
            setIsDecryptInProgress(false);
            return;
        }

        setPendingDecryptAfterSync(true);
    };

    const handleSendConfidential = async () => {
        if (!me) {
            toast.error("User session not found. Please reconnect your wallet.");
            return;
        }
        if (!cardAddress) {
            toast.error("Card address is missing.");
            return;
        }
        if (!resolvedOwnerAddress) {
            toast.error('Card owner is still loading. Please retry in a moment.');
            return;
        }
        if (!isCurrentUserOwner) {
            toast.error('Only the card owner can send funds from this card.');
            return;
        }
        if (!instance) {
            toast.error("FHE instance is not ready. Please refresh FHE and try again.");
            return;
        }
        if (!sendTo || sendTo.trim().length === 0) {
            toast.error("Recipient address is required.");
            return;
        }
        if (!sendAmount || isNaN(Number(sendAmount)) || Number(sendAmount) <= 0) {
            toast.error("Enter a valid amount to send.");
            return;
        }
        setIsSending(true);
        try {
            let amountRaw: bigint;
            try {
                amountRaw = parseUnits(sendAmount, 6);
            } catch {
                toast.error("Invalid amount format.");
                return;
            }

            toast.info("Encrypting payment details locally...");

            // 1. Create encrypted input for the PrivateCard contract.
            // The card consumes the proof before forwarding the transfer to cUSDC.
            const input = instance.createEncryptedInput(cardAddress, me.account as Hex);
            input.add64(amountRaw);
            const { handles, inputProof } = await input.encrypt();

            smartWallet.init();

            // 2. Build UserOp for call to card.transferWithProof(to, encryptedAmount, inputProof)
            const inputProofHex = `0x${Array.from(inputProof).map((byte) => byte.toString(16).padStart(2, '0')).join('')}` as Hex;

            const call = {
                dest: cardAddress,
                value: 0n,
                data: encodeFunctionData({
                    abi: PRIVATE_CARD_ABI,
                    functionName: 'transferWithProof',
                    args: [sendTo as Hex, toHex(handles[0]), inputProofHex]
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
            const receipt = await smartWallet.waitForUserOperationReceipt({ hash });

            if (!receipt || receipt.success === false || receipt.receipt?.status !== '0x1') {
                const reason = receipt?.receipt?.revertReason || 'unknown';
                throw new Error(`Confidential transfer failed: success=${receipt?.success ?? 'null'} status=${receipt?.receipt?.status ?? 'null'} reason=${reason}`);
            }

            await refreshConfidentialBalance();
            await new Promise((resolve) => setTimeout(resolve, 1500));
            await refreshConfidentialBalance();

            toast.success(`Successfully sent ${sendAmount} cUSDC privately!`);
            setShowSendForm(false);
            setSendAmount('');
            setSendTo('');
        } catch (error: any) {
            console.error("Confidential transfer failed:", error);
            if (error?.message?.includes('invalid address')) {
                toast.error("Invalid recipient address.");
            } else {
                toast.error(error?.message || "Transfer failed");
            }
        } finally {
            setIsSending(false);
        }
    };

    const handleFundCard = async () => {
        if (!me || !cardAddress || !cardCusdcAddress || !underlyingTokenAddress) {
            toast.error('Card wrapper address is not available yet. Please retry in a moment.');
            return;
        }
        if (!resolvedOwnerAddress) {
            toast.error('Card owner is still loading. Please retry in a moment.');
            return;
        }
        if (!isCurrentUserOwner) {
            toast.error('Only the card owner can fund this card.');
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

            let approveUserOp = await builder.buildUserOp({
                calls: [approveCall],
                keyId: me.keyId
            });
            approveUserOp = withGasFloors(approveUserOp, {
                callGasLimit: 240_000n,
                verificationGasLimit: 700_000n,
                preVerificationGas: 120_000n,
            });

            await ensureUserOpPrefund({
                account: me.account as Hex,
                userOp: approveUserOp,
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

            let wrapUserOp = await builder.buildUserOp({
                calls: [wrapCall],
                keyId: me.keyId,
                // Force next nonce to avoid transient RPC lag after the approve op is included.
                nonce: BigInt(approveUserOp.nonce) + 1n
            });
            wrapUserOp = withGasFloors(wrapUserOp, {
                callGasLimit: 520_000n,
                verificationGasLimit: 1_300_000n,
                preVerificationGas: 180_000n,
            });

            await ensureUserOpPrefund({
                account: me.account as Hex,
                userOp: wrapUserOp,
            });

            toast.info('Wrapping into confidential balance...');
            let wrapHash: string;
            try {
                wrapHash = await smartWallet.sendUserOperation({ userOp: wrapUserOp });
            } catch (error) {
                if (!isRetryableGasSimulationError(error)) {
                    throw error;
                }

                const bumpedWrapUserOp = bumpGas(wrapUserOp);
                await ensureUserOpPrefund({
                    account: me.account as Hex,
                    userOp: bumpedWrapUserOp,
                });
                wrapHash = await smartWallet.sendUserOperation({ userOp: bumpedWrapUserOp });
            }
            const wrapReceipt = await smartWallet.waitForUserOperationReceipt({ hash: wrapHash });
            if (!wrapReceipt || wrapReceipt.success === false || wrapReceipt.receipt?.status !== '0x1') {
                const reason = wrapReceipt?.receipt?.revertReason || 'unknown';
                throw new Error(`Wrap failed: success=${wrapReceipt?.success ?? 'null'} status=${wrapReceipt?.receipt?.status ?? 'null'} reason=${reason}`);
            }

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

            let aclSyncUserOp = await builder.buildUserOp({
                calls: [aclSyncCall],
                keyId: me.keyId,
                nonce: BigInt(wrapUserOp.nonce) + 1n
            });
            aclSyncUserOp = withGasFloors(aclSyncUserOp, {
                callGasLimit: 260_000n,
                verificationGasLimit: 700_000n,
                preVerificationGas: 120_000n,
            });

            await ensureUserOpPrefund({
                account: me.account as Hex,
                userOp: aclSyncUserOp,
            });

            toast.info('Syncing balance ACL...');
            const aclSyncHash = await smartWallet.sendUserOperation({ userOp: aclSyncUserOp });
            await smartWallet.waitForUserOperationReceipt({ hash: aclSyncHash });

            await refreshConfidentialBalance();
            await new Promise((resolve) => setTimeout(resolve, 3000));
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
        <div className='mx-auto w-full max-w-3xl space-y-4 animate-in fade-in duration-700'>
            {/* Card visualization */}
            <div className='rounded-2xl border border-border/60 bg-gradient-to-br from-muted/60 to-muted/20 p-4 sm:p-6'>
                <div className='mx-auto w-full max-w-sm'>
                    {/* The card */}
                    <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-foreground to-foreground/80 p-5 text-background shadow-lg'>
                        {/* Subtle grid pattern */}
                        <div className='absolute inset-0 opacity-[0.03]' style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '12px 12px' }} />

                        <div className='relative space-y-4'>
                            {/* Top row */}
                            <div className='flex items-center justify-between'>
                                <span className='text-sm font-bold tracking-[0.2em]'>PAYME</span>
                                <span className='rounded-full bg-background/10 px-2 py-0.5 text-[10px] font-medium tracking-wide'>
                                    FHE
                                </span>
                            </div>

                            {/* Card number */}
                            <div className='space-y-1'>
                                <p className='font-mono text-sm tracking-[0.15em] opacity-60'>
                                    {cardAddress ? `${cardAddress.slice(0, 6)}  ${cardAddress.slice(6, 12)}  ${cardAddress.slice(12, 18)}  ${cardAddress.slice(-4)}` : '••••  ••••  ••••  ••••'}
                                </p>
                                <button
                                    onClick={() => handleCopy(cardAddress, 'Card address')}
                                    className='flex items-center gap-1 text-[11px] opacity-40 hover:opacity-80 transition-opacity'
                                >
                                    <IconCopy size={12} />
                                    <span>copy</span>
                                </button>
                            </div>

                            {/* Bottom row */}
                            <div className='flex items-end justify-between'>
                                <div className='space-y-0.5'>
                                    <p className='text-[10px] uppercase tracking-wide opacity-40'>Owner</p>
                                    <p className='font-mono text-xs'>
                                        {resolvedOwnerAddress ? `${resolvedOwnerAddress.slice(0, 6)}...${resolvedOwnerAddress.slice(-4)}` : '••••••••••'}
                                    </p>
                                </div>
                                {ownerGuardMessage ? (
                                    <span className='rounded-md bg-amber-500/20 px-2 py-1 text-[10px] text-amber-200'>
                                        External
                                    </span>
                                ) : (
                                    <span className='rounded-md bg-background/10 px-2 py-1 text-[10px]'>
                                        Owned
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Private balance */}
            <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-4'>
                <div className='flex items-center justify-between'>
                    <div>
                        <div className='flex items-center gap-2'>
                            <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>Private balance</p>
                            {(isDecrypting || isDecryptInProgress) && (
                                <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary'>
                                    Decrypting...
                                </span>
                            )}
                        </div>
                        <p className='text-xl font-bold tracking-tight text-foreground'>{formattedBalance}</p>
                    </div>
                    <Button
                        size='sm'
                        variant='outline'
                        className='gap-2 rounded-full border-border/60 text-foreground hover:bg-muted'
                        onClick={handleDecryptBalance}
                        disabled={isDecrypting || isDecryptInProgress || !isCurrentUserOwner}
                    >
                        <IconEye size={16} />
                        {!isCurrentUserOwner ? 'Owner only' : isDecrypting || isDecryptInProgress ? 'Decrypting...' : 'Decrypt'}
                    </Button>
                </div>
            </div>

            {/* Add funds */}
            <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-4'>
                <p className='text-[11px] uppercase tracking-wide text-muted-foreground mb-2'>Add funds</p>
                <div className='flex flex-col gap-2 md:flex-row'>
                    <input
                        type='number'
                        min='0'
                        step='0.000001'
                        placeholder={`Amount in ${underlyingTokenSymbol || 'token'}`}
                        className='h-10 flex-1 rounded-lg border border-border/60 bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30'
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                    />
                    <Button
                        variant='outline'
                        className='gap-2 rounded-full border-border/60 text-foreground hover:bg-muted'
                        onClick={handleFundCard}
                        disabled={isFunding || !isCurrentUserOwner}
                    >
                        <IconWallet size={16} />
                        {!isCurrentUserOwner ? 'Owner only' : isFunding ? 'Adding...' : 'Add funds'}
                    </Button>
                </div>
            </div>

            {/* Send money toggle */}
            <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-4'>
                <Button
                    variant='outline'
                    className='gap-2 rounded-full border-border/60 text-foreground hover:bg-muted'
                    onClick={() => setShowSendForm(!showSendForm)}
                    disabled={!isCurrentUserOwner}
                >
                    <IconSend size={16} />
                    {!isCurrentUserOwner ? 'Owner only' : showSendForm ? 'Hide send form' : 'Send money'}
                </Button>
            </div>

            {/* Confidential Send Form */}
            {showSendForm && (
                <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-6 animate-in fade-in duration-300 space-y-4'>
                    <h3 className='text-lg font-semibold'>Send money</h3>
                    <div className='grid gap-4 md:grid-cols-2'>
                        <div className='space-y-1.5'>
                            <label className='text-[11px] uppercase tracking-wide text-muted-foreground'>Recipient Address</label>
                            <input
                                type='text'
                                placeholder='0x...'
                                className='h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30'
                                value={sendTo}
                                onChange={(e) => setSendTo(e.target.value)}
                            />
                        </div>
                        <div className='space-y-1.5'>
                            <label className='text-[11px] uppercase tracking-wide text-muted-foreground'>Amount</label>
                            <input
                                type='number'
                                placeholder='0.00'
                                className='h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30'
                                value={sendAmount}
                                onChange={(e) => setSendAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button
                        className='h-10 w-full rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90'
                        onClick={handleSendConfidential}
                        disabled={isSending || !sendTo || !sendAmount || !isCurrentUserOwner}
                    >
                        {isSending ? (
                            <span className='h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
                        ) : (
                            'Send money'
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
