'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Copy, Download, Share2 } from 'lucide-react';
import { Hex } from 'viem';
import { toast } from 'sonner';

interface ReceiveTokenCardProps {
    address: Hex | undefined;
}

export function ReceiveTokenCard({ address }: ReceiveTokenCardProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setCopied(true);
        toast.success('Address copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadQRCode = () => {
        const svg = document.getElementById('qr-code-svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `payme-qr-${address?.slice(0, 8)}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    if (!address) {
        return (
            <Card className="border">
                <CardContent className="pt-6 text-center text-muted-foreground">
                    Connect your wallet to receive funds.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-xl border">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Download className="h-4 w-4" />
                    Receive Funds
                </CardTitle>
                <CardDescription className="text-xs">
                    Share your smart wallet address to receive ETH, USDC, or WETH.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-3 bg-white rounded-xl border-4 border-slate-100 shadow-sm">
                        <QRCodeSVG
                            id="qr-code-svg"
                            value={address}
                            size={180}
                            level="H"
                            includeMargin={false}
                            className="rounded-sm"
                        />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground italic">
                        Scan to pay me
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Your Wallet Address</Label>
                    <div className="flex gap-2">
                        <Input
                            id="address"
                            value={address}
                            readOnly
                            className="font-mono text-xs md:text-sm bg-muted/50"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={copyToClipboard}
                            className="shrink-0"
                        >
                            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button variant="outline" className="w-full gap-2" onClick={downloadQRCode}>
                        <Download className="h-4 w-4" />
                        Save QR
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: 'My PayMe Address',
                                    text: `Send me funds on PayMe: ${address}`,
                                    url: window.location.origin,
                                });
                            } else {
                                copyToClipboard();
                            }
                        }}
                    >
                        <Share2 className="h-4 w-4" />
                        Share
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
