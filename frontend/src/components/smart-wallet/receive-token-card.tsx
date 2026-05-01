'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Copy, Download } from 'lucide-react';
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
      <div className='py-8 text-center text-muted-foreground'>
        <p className='text-sm font-medium'>Connect your wallet to receive funds.</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center gap-5 py-4'>
      {/* QR Code */}
      <div className='rounded-xl border border-border/60 bg-background/50 p-4'>
        <QRCodeSVG
          id='qr-code-svg'
          value={address}
          size={180}
          bgColor='transparent'
          fgColor='currentColor'
          level='M'
          className='text-foreground'
        />
      </div>

      {/* Address */}
      <div className='w-full space-y-2'>
        <label className='text-xs font-medium text-muted-foreground'>
          Wallet Address
        </label>
        <div className='flex items-center gap-2'>
          <Input
            readOnly
            value={address}
            className='rounded-lg bg-background/50 border-border/60 h-10 font-mono text-xs flex-1'
          />
          <Button
            variant='outline'
            size='icon'
            className='rounded-lg h-10 w-10 shrink-0'
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className='h-4 w-4 text-emerald-500' />
            ) : (
              <Copy className='h-4 w-4' />
            )}
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className='flex gap-2'>
        <Button
          variant='outline'
          size='sm'
          className='rounded-lg gap-2'
          onClick={copyToClipboard}
        >
          <Copy size={14} />
          Copy Address
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='rounded-lg gap-2'
          onClick={downloadQRCode}
        >
          <Download size={14} />
          Save QR
        </Button>
      </div>
    </div>
  );
}
