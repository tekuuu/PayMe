import React, { ReactNode } from 'react';

type PayMeConfig = {
    merchantAddress: string;
    network?: string;
    appUrl?: string;
};
declare class PayMeClient {
    config: PayMeConfig;
    constructor(config: PayMeConfig);
}
declare function loadPayMe(merchantAddress: string, network?: string, appUrl?: string): Promise<PayMeClient>;

declare const PayMeProvider: ({ payme, children }: {
    payme: Promise<PayMeClient> | PayMeClient | null;
    children: ReactNode;
}) => React.JSX.Element;
declare const usePayMeContext: () => PayMeClient | null;

interface PayMeElementProps {
    onReady?: () => void;
}
declare const PayMeElement: ({ onReady }: PayMeElementProps) => React.JSX.Element | null;

declare const usePayMe: () => {
    confirmSubscription: ({ amount }: {
        amount: string | number;
    }) => Promise<{
        error: Error | null;
        receipt: any | null;
    }>;
};

export { PayMeClient, type PayMeConfig, PayMeElement, PayMeProvider, loadPayMe, usePayMe, usePayMeContext };
