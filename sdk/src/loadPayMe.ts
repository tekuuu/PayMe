export type PayMeConfig = {
  merchantAddress: string;
  network?: string;
  appUrl?: string;
};

export class PayMeClient {
  config: PayMeConfig;
  constructor(config: PayMeConfig) {
    this.config = config;
  }
}

export function loadPayMe(
  merchantAddress: string,
  network = 'sepolia',
  appUrl = 'http://localhost:3000'
): Promise<PayMeClient> {
  return Promise.resolve(new PayMeClient({ merchantAddress, network, appUrl }));
}
