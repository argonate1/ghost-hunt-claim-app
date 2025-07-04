import { defaultWagmiConfig } from '@web3modal/wagmi';
import { mainnet } from 'viem/chains';

// WalletConnect Project ID
const projectId = '027efd2a4133d09404e7c6a72e32c314';

// Define metadata for your dApp
const metadata = {
  name: 'Ghost Hunt Claim',
  description: 'Hunt for ghost drops and claim rewards with your GHOX tokens',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://preview--ghost-hunt-claim.lovable.app',
  icons: [typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : 'https://preview--ghost-hunt-claim.lovable.app/favicon.ico']
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