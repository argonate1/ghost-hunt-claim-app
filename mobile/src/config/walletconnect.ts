import { defaultWagmiConfig } from '@reown/appkit-wagmi-react-native';
import { mainnet } from 'viem/chains';

// WalletConnect Project ID - same as web app
const projectId = '027efd2a4133d09404e7c6a72e32c314';

// Define metadata for your dApp
const metadata = {
  name: 'Ghost Hunt Claim',
  description: 'Hunt for ghost drops and claim rewards with your GHOX tokens',
  url: 'https://preview--ghost-hunt-claim.lovable.app',
  icons: ['https://preview--ghost-hunt-claim.lovable.app/favicon.ico'],
  redirect: {
    native: 'ghosthunt://',
    universal: 'https://preview--ghost-hunt-claim.lovable.app'
  }
};

// Define the chains your dApp supports
export const chains = [mainnet] as const;

// Create wagmi config
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

export { projectId }; 