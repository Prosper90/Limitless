import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./contexts/Web3Context";
import Layout from "./components/Layout";
import Landing from "./components/Landing";
import Dashboard from "./components/Dashboard";
import BuyNFT from "./components/BuyNFT";
import MyTokens from "./components/MyTokens";
import MyTeam from "./components/MyTeam";

// Landing Page (Home) - No wallet or referral required
const HomePage: React.FC = () => {
  return (
    <Layout showWalletRequired={false} showReferralRequired={false}>
      <Landing />
    </Layout>
  );
};

// Dashboard Page
const DashboardPage: React.FC = () => {
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

// Buy NFT Page
const BuyPage: React.FC = () => {
  return (
    <Layout>
      <BuyNFT />
    </Layout>
  );
};

// My Tokens Page (Claim & Burn)
const TokensPage: React.FC = () => {
  return (
    <Layout>
      <MyTokens />
    </Layout>
  );
};

// My Team Page (Referrals)
const TeamPage: React.FC = () => {
  return (
    <Layout>
      <MyTeam />
    </Layout>
  );
};

// Main App Router
const MainApp: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/buy" element={<BuyPage />} />
        <Route path="/tokens" element={<TokensPage />} />
        <Route path="/team" element={<TeamPage />} />
      </Routes>
    </Router>
  );
};

// Root App with Providers
const App: React.FC = () => {
  return (
    <Web3Provider>
      <MainApp />
    </Web3Provider>
  );
};

export default App;
