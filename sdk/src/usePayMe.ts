import { usePayMeContext } from './PayMeProvider';

export const usePayMe = () => {
  const client = usePayMeContext();
  const appUrl = client?.config.appUrl ?? 'http://localhost:3000';

  const confirmSubscription = async ({ amount }: { amount: string | number }) => {
    return new Promise<{ error: Error | null; receipt: any | null }>((resolve) => {
      if (!client) {
        return resolve({ error: new Error('PayMe client not initialized'), receipt: null });
      }

      const iframe = document.getElementById('payme-element-iframe') as HTMLIFrameElement;
      
      if (!iframe || !iframe.contentWindow) {
        return resolve({ error: new Error('PayMeElement not mounted'), receipt: null });
      }

      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== appUrl) return;
        
        if (event.data?.type === 'SUBSCRIPTION_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          resolve({ error: null, receipt: event.data.receipt });
        } else if (event.data?.type === 'SUBSCRIPTION_ERROR') {
          window.removeEventListener('message', handleMessage);
          resolve({ error: new Error(event.data.error), receipt: null });
        }
      };
      
      window.addEventListener('message', handleMessage);

      // Trigger the iframe to execute the FHE Transaction
      iframe.contentWindow.postMessage({
        type: 'INITIATE_SUBSCRIPTION',
        payload: {
          merchantAddress: client.config.merchantAddress,
          amount: amount
        }
      }, appUrl);
    });
  };

  return { confirmSubscription };
};
