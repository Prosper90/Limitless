import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

interface LayoutProps {
  children: React.ReactNode;
  showWalletRequired?: boolean;
  showReferralRequired?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  showWalletRequired = true,
  showReferralRequired = true,
}) => {
  const location = useLocation();
  const { isConnected, address } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasReferral, setHasReferral] = useState(false);

  // Check URL for referral param and persist to localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");

    if (ref && ref.startsWith("0x") && ref.length === 42) {
      localStorage.setItem("limitless_referral", ref);
      setHasReferral(true);
    } else {
      const storedRef = localStorage.getItem("limitless_referral");
      if (storedRef && storedRef.startsWith("0x") && storedRef.length === 42) {
        setHasReferral(true);
      }
    }
  }, [location.search]);

  // Exempt admin (contract deployer) from referral requirement
  const adminAddress = import.meta.env.VITE_OG_ADDRESS?.toLowerCase();
  const isAdmin = !!address && address.toLowerCase() === adminAddress;

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/buy", label: "Buy NFT" },
    { path: "/tokens", label: "My Tokens" },
    { path: "/team", label: "My Team" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Toggle state based on 50px scroll threshold
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0F051D] text-white">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 ${isScrolled ? "bg-[#0F051D]/80 backdrop-blur-md border-b border-white/5" : "bg-transparent border-none"}`}
      >
        <div className="container">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              {/* <img src="/site_logo_2.svg" alt="LIMITLESS" className="h-10" /> */}
              <span className="font-bold text-xl hidden sm:block">
                LIMITLESS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                    location.pathname === item.path
                      ? "text-purple-400"
                      : "text-gray-300"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* RainbowKit Button with custom styling */}
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  mounted,
                }) => {
                  const ready = mounted;
                  const connected = ready && account && chain;

                  return (
                    <div
                      {...(!ready && {
                        "aria-hidden": true,
                        style: {
                          opacity: 0,
                          pointerEvents: "none",
                          userSelect: "none",
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <button
                              onClick={openConnectModal}
                              type="button"
                              className="bg-transparent border border-white px-4 sm:px-6 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer hover:bg-white/10"
                            >
                              Connect Wallet
                            </button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <button
                              onClick={openChainModal}
                              type="button"
                              className="bg-red-600 border border-red-500 px-4 sm:px-6 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
                            >
                              Wrong Network
                            </button>
                          );
                        }

                        return (
                          <button
                            onClick={openAccountModal}
                            type="button"
                            className="bg-white/5 border border-white/10 hover:border-purple-500/30 px-4 sm:px-6 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="hidden sm:inline">
                              {account.ensName ?? account.displayName}
                            </span>
                            <span className="sm:hidden">
                              {account.displayName}
                            </span>
                          </button>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0F051D]/95 backdrop-blur-md border-t border-white/5">
            <nav className="container py-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 text-sm font-medium transition-colors hover:text-purple-400 ${
                    location.pathname === item.path
                      ? "text-purple-400"
                      : "text-gray-300"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20">
        {showReferralRequired && !hasReferral && !isAdmin ? (
          /* Tier 1: Referral required but missing */
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center px-4">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Referral Required
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                You need a referral link to access the LIMITLESS platform.
                Please ask someone in the community to share their referral link
                with you.
              </p>
            </div>
          </div>
        ) : showWalletRequired && !isConnected ? (
          /* Tier 2: Wallet connection required */
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center px-4">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Please connect your wallet to access the LIMITLESS platform and
                start earning
              </p>
              <ConnectButton.Custom>
                {({ openConnectModal, mounted }) => (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    disabled={!mounted}
                    className="btn btn-gradient btn-gradient-lg"
                  >
                    Connect Wallet
                    <svg
                      className="ml-2 w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>
                )}
              </ConnectButton.Custom>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-white/5 py-16 mt-16">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Logo & Description */}
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-4">
                {/* <img src="/site_logo_2.svg" alt="LIMITLESS" className="h-10" /> */}
                <span className="font-bold text-xl">LIMITLESS</span>
              </Link>
              <p className="text-gray-400 text-sm mb-6">
                The future of DeFi NFT earnings on BSC. Earn daily rewards,
                build your team, and grow limitlessly.
              </p>
              <div className="flex gap-4">
                {/* <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-purple-600 flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a> */}
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-purple-600 flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-purple-600 flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.96 6.504-1.36 8.629-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/buy"
                    className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
                  >
                    Buy NFT
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tokens"
                    className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
                  >
                    My Tokens
                  </Link>
                </li>
                <li>
                  <Link
                    to="/team"
                    className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
                  >
                    My Team
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
                  >
                    Smart Contracts
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
                  >
                    Tokenomics
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:support@limitless.io"
                    className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
                  >
                    support@limitless.io
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
                  >
                    Join Discord
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
                  >
                    Telegram Group
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/5 py-6">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} LIMITLESS. All rights
                reserved.
              </p>
              <div className="flex gap-6">
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
