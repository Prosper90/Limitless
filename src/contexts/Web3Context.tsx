import "@rainbow-me/rainbowkit/styles.css";
import React, { createContext, useContext } from "react";
import { WagmiProvider, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { bsc, bscTestnet, sepolia } from "wagmi/chains";

// Use testnet for development, mainnet for production
const activeChain = import.meta.env.VITE_USE_MAINNET === "true" ? bsc : sepolia;

// Create wagmi config with RainbowKit
const config = getDefaultConfig({
  appName: "LIMITLESS",
  projectId:
    import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ||
    "8897acdd1a57d5021ad08b901938ae48",
  chains: [activeChain],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: false,
});

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});

interface Web3ContextType {
  chainId: number;
  isTestnet: boolean;
}

const Web3Context = createContext<Web3ContextType>({
  chainId: activeChain.id,
  isTestnet: activeChain.id === sepolia.id,
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
    isTestnet: activeChain.id === sepolia.id,
  };

  // || activeChain.id === bscTestnet.id

  return (
    <Web3Context.Provider value={contextValue}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: "#9333ea",
              accentColorForeground: "white",
              borderRadius: "medium",
              fontStack: "system",
            })}
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </Web3Context.Provider>
  );
};
