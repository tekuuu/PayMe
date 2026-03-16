const fs = require('fs');

const path = 'src/components/smart-wallet/card-overview.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /return \([\s\S]*\}\;/m;

const newReturn = `return (
        <div className="mx-auto w-full max-w-xl space-y-4 animate-in fade-in duration-700">
            <Card className="w-full border-primary/10 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden shadow-md dark:shadow-primary/5">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none transition-opacity group-hover:opacity-10 text-primary">
                    <IconCreditCard size={140} />
                </div>
                <CardHeader className="pb-4 relative z-10">
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <IconCreditCard className="h-5 w-5" />
                        </div>
                        Private Card
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Simple card view with securely encrypted details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                    <div className="grid gap-3 rounded-xl border border-primary/5 bg-muted/30 p-4 shadow-inner md:grid-cols-2">
                        <div>
                            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-1">Card address</p>
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-mono text-xs break-all text-foreground/80">{cardAddress || 'Not available'}</p>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors shrink-0 shadow-sm"
                                    onClick={() => handleCopy(cardAddress, 'Card address')}
                                    aria-label="Copy card address"
                                >
                                    <IconCopy size={14} />
                                </Button>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-1">Owner</p>
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-mono text-xs break-all text-foreground/80">{me?.account || 'Not available'}</p>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors shrink-0 shadow-sm"
                                    onClick={() => handleCopy(me?.account, 'Owner address')}
                                    aria-label="Copy owner address"
                                >
                                    <IconCopy size={14} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-inner">
                        <div>
                            <p className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Private balance</p>
                            <p className="text-xl font-bold tracking-tight text-foreground md:text-2xl">{formattedBalance}</p>
                        </div>
                        <Button
                            size="sm"
                            className="gap-2 shadow-md border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            onClick={handleDecryptBalance}
                            disabled={isDecrypting}
                            variant="outline"
                        >
                            <IconEye size={16} />
                            {isDecrypting ? 'Decrypting...' : 'Decrypt'}
                        </Button>
                    </div>

                    <div className="rounded-xl border border-primary/5 bg-muted/30 p-4 shadow-inner">
                        <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-2">Fund Card</p>
                        <div className="flex flex-col gap-2 md:flex-row">
                            <input
                                type="number"
                                min="0"
                                step="0.000001"
                                placeholder={\`Amount in \${underlyingTokenSymbol || 'token'}\`}
                                className="h-10 flex-1 rounded-md border border-primary/10 bg-background/50 px-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={fundAmount}
                                onChange={(e) => setFundAmount(e.target.value)}
                            />
                            <Button
                                className="gap-2 shadow-md whitespace-nowrap"
                                onClick={handleFundCard}
                                disabled={isFunding}
                            >
                                <IconWallet size={16} />
                                {isFunding ? 'Funding...' : 'Add funds'}
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-primary/5 bg-muted/30 p-4 shadow-inner">
                        <Button
                            variant={showSendForm ? 'secondary' : 'default'}
                            className="w-full gap-2 shadow-md transition-all font-semibold"
                            onClick={() => setShowSendForm(!showSendForm)}
                        >
                            <IconSend size={16} />
                            {showSendForm ? 'Hide send form' : 'Transfer Confidential Balance'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Confidential Send Form */}
            {showSendForm && (
                <Card className="animate-in slide-in-from-top-4 duration-300 border-primary/10 bg-gradient-to-b from-background to-muted/20 relative shadow-md overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none transition-opacity group-hover:opacity-10 text-primary">
                        <IconSend size={140} />
                    </div>
                    <div className="space-y-4 p-4 md:p-5 relative z-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold md:text-lg flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <IconSend size={16} />
                                </div>
                                <span className="font-semibold text-foreground">Send Securely</span>
                            </h3>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Recipient Address</label>
                                <input
                                    type="text"
                                    placeholder="0x..."
                                    className="h-10 w-full font-mono rounded-lg border border-primary/10 bg-background/50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                                    value={sendTo}
                                    onChange={(e) => setSendTo(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Amount</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="h-10 w-full font-mono rounded-lg border border-primary/10 bg-background/50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                                    value={sendAmount}
                                    onChange={(e) => setSendAmount(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button
                            className="h-11 w-full gap-2 shadow-md font-semibold mt-2"
                            onClick={handleSendConfidential}
                            disabled={isSending || !sendTo || !sendAmount}
                        >
                            {isSending ? (
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                            ) : (
                                <>
                                    <IconSend size={18} />
                                    Send Private Payment
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}`;

content = content.replace(regex, newReturn);
fs.writeFileSync(path, content);
console.log('Successfully updated the My Card UI');
