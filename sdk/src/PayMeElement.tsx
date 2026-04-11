import React, { useEffect, useRef } from 'react';
import { usePayMeContext } from './PayMeProvider';

interface PayMeElementProps {
  onReady?: () => void;
}

export const PayMeElement = ({ onReady }: PayMeElementProps) => {
  const client = usePayMeContext();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const appUrl = client?.config.appUrl ?? 'http://localhost:3000';

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== appUrl) return;
      if (event.data?.type === 'PAYME_IFRAME_READY') {
        onReady?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [appUrl, onReady]);

  if (!client) return null;

  return (
    <div style={{ width: '100%', minHeight: '400px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        id="payme-element-iframe"
        src={`${appUrl}/embed/checkout?merchant=${client.config.merchantAddress}`}
        style={{ width: '100%', height: '100%', minHeight: '400px', border: 'none' }}
        allow="publickey-credentials-get *" // Critical: allows Passkey access inside the iframe
      />
    </div>
  );
};
