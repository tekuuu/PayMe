import React, { useState, useMemo, useEffect } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    IconEye,
    IconCopy,
    IconWallet,
    IconSend,
    IconCreditCard
} from '@tabler/icons-react';
import { Hex, encodeFunctionData, parseUnits, toHex } from 'viem';
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
    } = useConfidentialBalance(cardAddress, me?.account as Hex);

    const [isFunding, setIsFunding] = useState(false);
    const [fundAmount, setFundAmount] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isDecryptInProgress, setIsDecryptInProgress] = useState(false);
    const [pendingDecryptAfterSync, setPendingDecryptAfterSync] = useState(false);
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

    useEffect(() => {
        if (!pendingDecryptAfterSync || isDecrypting || !canDecrypt) {
            return;
        }

        setPendingDecryptAfterSync(false);
        decrypt();
        setIsDecryptInProgress(false);
    }, [canDecrypt, decrypt, isDecrypting, pendingDecryptAfterSync]);

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
            return;
        }

        if (!me || !cardAddress) {
            toast.error('Card session is not ready yet. Please retry in a moment.');
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

            const aclSyncUserOp = await builder.buildUserOp({
                calls: [aclSyncCall],
                keyId: me.keyId,
                nonce: BigInt(wrapUserOp.nonce) + 1n
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
        <div className="mx-auto w-full max-w-4xl space-y-4 animate-in fade-in duration-700">
            <Card className="overflow-hidden border-none bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white shadow-2xl">
                <CardHeader className="relative">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl" />
                    <CardTitle className="relative text-xl md:text-2xl">Private Card</CardTitle>
                    <CardDescription>
                        Simple card view with only the details you need.
                    </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                    <div className="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm md:grid-cols-2">
                        <div>
                            <p className="text-xs uppercase text-slate-400">Card address</p>
                            <div className="mt-1 flex items-start justify-between gap-2">
                                <p className="font-mono text-xs break-all">{cardAddress || 'Not available'}</p>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-slate-300 hover:bg-white/10 hover:text-white"
                                    onClick={() => handleCopy(cardAddress, 'Card address')}
                                    aria-label="Copy card address"
                                >
                                    <IconCopy size={14} />
                                </Button>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-slate-400">Owner</p>
                            <div className="mt-1 flex items-start justify-between gap-2">
                                <p className="font-mono text-xs break-all">{me?.account || 'Not available'}</p>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-slate-300 hover:bg-white/10 hover:text-white"
                                    onClick={() => handleCopy(me?.account, 'Owner address')}
                                    aria-label="Copy owner address"
                                >
                                    <IconCopy size={14} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 p-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-xs uppercase text-primary/80">Private balance</p>
                                {(isDecrypting || isDecryptInProgress) && (
                                    <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] font-semibold text-white">
                                        Decrypting...
                                    </span>
                                )}
                            </div>
                            <p className="text-xl font-bold tracking-tight md:text-2xl">{formattedBalance}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={handleDecryptBalance}
                                disabled={isDecrypting || isDecryptInProgress}
                            >
                                <IconEye size={16} />
                                {isDecrypting || isDecryptInProgress ? 'Decrypting...' : 'Decrypt'}
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="mb-2 text-xs uppercase text-slate-400">Add funds</p>
                        <div className="flex flex-col gap-2 md:flex-row">
                            <input
                                type="number"
                                min="0"
                                step="0.000001"
                                placeholder={`Amount in ${underlyingTokenSymbol || 'token'}`}
                                className="h-10 flex-1 rounded-md border border-white/15 bg-black/20 px-3 text-sm text-white placeholder:text-slate-400"
                                value={fundAmount}
                                onChange={(e) => setFundAmount(e.target.value)}
                            />
                            <Button
                                className="gap-2 bg-emerald-500 text-black hover:bg-emerald-400"
                                onClick={handleFundCard}
                                disabled={isFunding}
                            >
                                <IconWallet size={16} />
                                {isFunding ? 'Adding...' : 'Add funds'}
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <Button
                            variant={showSendForm ? 'default' : 'secondary'}
                            className="mb-3 gap-2"
                            onClick={() => setShowSendForm(!showSendForm)}
                        >
                            <IconSend size={16} />
                            {showSendForm ? 'Hide send form' : 'Send money'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Confidential Send Form */}
            {showSendForm && (
                <Card className="animate-in slide-in-from-top-4 duration-300 border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 text-white">
                    <div className="space-y-4 p-4 md:p-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold md:text-lg">Send money</h3>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Recipient Address</label>
                                <input
                                    type="text"
                                    placeholder="0x..."
                                    className="h-10 w-full rounded-lg border border-white/15 bg-black/20 px-3 text-sm text-white placeholder:text-slate-400"
                                    value={sendTo}
                                    onChange={(e) => setSendTo(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-tight text-slate-400">Amount</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="h-10 w-full rounded-lg border border-white/15 bg-black/20 px-3 text-sm text-white placeholder:text-slate-400"
                                    value={sendAmount}
                                    onChange={(e) => setSendAmount(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button
                            className="h-11 w-full bg-primary font-bold text-black hover:bg-primary/90"
                            onClick={handleSendConfidential}
                            disabled={isSending || !sendTo || !sendAmount}
                        >
                            {isSending ? (
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            ) : (
                                'Send money'
                            )}
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
