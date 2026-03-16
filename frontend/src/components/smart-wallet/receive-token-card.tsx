'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Copy, Download, Share2 } from 'lucide-react';
import { IconQrcode, IconWallet } from '@tabler/icons-react';
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
            <Card className="w-full border-primary/10 bg-gradient-to-b from-background to-muted/20">
                <CardContent className="pt-6 text-center text-muted-foreground p-8">
                    <IconWallet className="mx-auto mb-4 opacity-50 text-primary" size={48} />
                    <p className="font-medium">Connect your wallet to receive funds.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full border-primary/10 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden shadow-md dark:shadow-primary/5">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none transition-opacity group-hover:opacity-10 text-primary">
                <Download size={140} />
            </div>
            <CardHeader className="pb-4 relative z-10">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Download className="h-5 w-5" />
                    </div>
                    Receive Funds
                </CardTitle>
                <CardDescription className="text-sm">
                    Share your smart wallet address to receive payments.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
                <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-muted/30 rounded-xl shadow-inner border border-primary/5">
                    <div className="p-3 bg-white rounded-xl shadow-sm hover:scale-105 transition-transform">
                        <QRCodeSVG
                            id="qr-code-svg"
                            value={address}
                            size={180}
                            level="H"
                            includeMargin={false}
                            className="rounded-sm"
                        />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <IconQrcode size={14}/> Scan to pay me
                    </p>
                </div>

                <div className="space-y-1.5 pt-2">
                    <Label htmlFor="address" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Your Wallet Address</Label>
                    <div className="flex gap-2">
                        <Input
                            id="address"
                            value={address}
                            readOnly
                            className="font-mono text-xs md:text-sm bg-muted/50 shadow-inner"
                        />
                        <Button
                            variant="secondary"
                            onClick={copyToClipboard}
                            className="shrink-0 shadow-sm transition-all active:scale-95"
                        >
                            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                            <span className="sr-only">Copy address</span>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button variant="outline" className="w-full gap-2 shadow-sm border-primary/20 hover:bg-primary/5" onClick={downloadQRCode}>
                        <Download className="h-4 w-4" />
                        Save QR
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full gap-2 shadow-sm border-primary/20 hover:bg-primary/5"
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
                        Share Link
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
