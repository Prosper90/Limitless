import React, { createContext, useContext } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { bsc, bscTestnet } from "wagmi/chains";

// Use testnet for development, mainnet for production
const activeChain = import.meta.env.VITE_USE_MAINNET === "true" ? bsc : bscTestnet;

// Create wagmi config
const config = createConfig(
  getDefaultConfig({
    appName: "LIMITLESS",
    appDescription: "LIMITLESS-UNLIMITED NFT Platform",
    appUrl: "https://limitless.io",
    appIcon: "/logo.png",
    walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "8897acdd1a57d5021ad08b901938ae48",
    chains: [activeChain],
    transports: {
      [bsc.id]: http(),
      [bscTestnet.id]: http(),
    },
  })
);

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
    },
  },
});

interface Web3ContextType {
  chainId: number;
  isTestnet: boolean;
}

const Web3Context = createContext<Web3ContextType>({
  chainId: activeChain.id,
  isTestnet: activeChain.id === bscTestnet.id,
});

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const contextValue: Web3ContextType = {
    chainId: activeChain.id,
    isTestnet: activeChain.id === bscTestnet.id,
  };

  return (
    <Web3Context.Provider value={contextValue}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider
            theme="midnight"
            customTheme={{
              "--ck-border-radius": "12px",
              "--ck-font-family": "Inter, system-ui, sans-serif",
              "--ck-primary-button-background": "#3B82F6",
              "--ck-primary-button-hover-background": "#2563EB",
              "--ck-primary-button-color": "#FFFFFF",
            }}
          >
            {children}
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </Web3Context.Provider>
  );
};
