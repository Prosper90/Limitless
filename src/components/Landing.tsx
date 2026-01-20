import React from "react";
import { Link } from "react-router-dom";
import { useLiquidityPool, useLimitlessNFT } from "../hooks/useLimitless";

// Hero Section
const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-32 md:pt-40 pb-20 md:pb-32 overflow-hidden">
      {/* Background gradient effects (No need for background gradients since banners exists*/}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-30 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
      </div> */}

      <div className="container relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-fade-in-up">
            <span className="badge badge-primary mb-4">NFT Platform</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Build Your <span className="gradient-text">Limitless</span> NFT
              Portfolio
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-lg">
              Earn daily token rewards, build your referral network, and grow
              your wealth with our revolutionary NFT ecosystem on BSC.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/buy" className="btn btn-gradient btn-gradient-lg">
                Buy NFT Now
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
              </Link>
              <Link to="/tokens" className="btn btn-outline">
                My Tokens
              </Link>
            </div>
          </div>

          {/* Right Content - NFT Image */}
          <div className="relative animate-fade-in-up delay-200">
            <div className="relative">
              <img
                src="/art_01.jpg"
                alt="NFT Collection"
                className="rounded-3xl shadow-2xl shadow-purple-500/20 animate-float"
              />
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-[#0F051D]/90 backdrop-blur-sm border border-white/10 rounded-2xl p-4 animate-fade-in delay-400">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <span className="text-xl">$</span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Price</p>
                    <p className="font-bold text-xl">$100 USDT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Stats Section
const StatsSection: React.FC = () => {
  const { tvl, tokenPrice, circulatingSupply } = useLiquidityPool();
  const { totalMinted } = useLimitlessNFT();

  const stats = [
    {
      value: `$${parseFloat(tvl || "0").toLocaleString()}`,
      label: "Total Value Locked",
    },
    { value: totalMinted || "0", label: "NFTs Minted" },
    {
      value: `$${parseFloat(tokenPrice || "0").toFixed(4)}`,
      label: "Token Price",
    },
    {
      value: parseFloat(circulatingSupply || "0").toLocaleString(),
      label: "Tokens Circulating",
    },
  ];

  return (
    <section className="py-16 border-y border-white/5">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="stat-value text-white">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Connect Wallet",
      description:
        "Connect your BSC wallet to get started. We support MetaMask, Trust Wallet, and more.",
      image: "/mint-01.png",
    },
    {
      number: "02",
      title: "Buy NFT",
      description:
        "Purchase an NFT for $100 USDT. Each NFT earns you 1 token per day forever.",
      image: "/mint-02.png",
    },
    {
      number: "03",
      title: "Earn Daily",
      description:
        "Claim your daily LIMITLESS tokens. The more NFTs you own, the more you earn.",
      image: "/mint-03.png",
    },
    {
      number: "04",
      title: "Build Team",
      description:
        "Refer friends and earn up to $25 commission per NFT sale across 6 levels.",
      image: "/mint-04.png",
    },
  ];

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <span className="badge badge-primary mb-4">How It Works</span>
          <h2 className="section-title">
            Start Your <span>Journey</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Follow these simple steps to join the LIMITLESS ecosystem and start
            earning
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="nerko-card text-center hover-lift animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative mb-6">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-24 h-24 mx-auto"
                />
                <span className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-sm font-bold">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-gray-400 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Daily Token Rewards",
      description:
        "Earn 1 LIMITLESS token per day for each NFT you own. Rewards accumulate and can be claimed anytime.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: "6-Level Referral System",
      description:
        "Build your network and earn commissions: $10 L1, $5 L2, $4 L3, $3 L4, $2 L5, $1 L6 per sale.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
          />
        </svg>
      ),
      title: "Burn & Redeem",
      description:
        "Burn your tokens anytime to redeem USDT from the liquidity pool at the current market price.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: "Secure & Audited",
      description:
        "Built on BSC with battle-tested smart contracts. Your funds are protected by blockchain security.",
    },
  ];

  return (
    <section className="py-20 bg-white/[0.02]">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Image */}
          <div className="relative animate-fade-in-up">
            <img
              src="/features-02.png"
              alt="Features"
              className="rounded-3xl"
            />
            <img
              src="/features-03.png"
              alt="Features"
              className="absolute -bottom-10 -right-10 w-48 rounded-2xl shadow-2xl shadow-purple-500/20 animate-float"
            />
          </div>

          {/* Right - Features */}
          <div>
            <span className="badge badge-primary mb-4">Features</span>
            <h2 className="section-title mb-8">
              Why Choose <span>LIMITLESS</span>?
            </h2>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 flex items-center justify-center text-purple-400 shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// NFT Collection Preview
// const CollectionSection: React.FC = () => {
//   const nfts = [
//     { image: "/art_02.jpg", name: "LIMITLESS #001" },
//     { image: "/art_03.jpg", name: "LIMITLESS #002" },
//     { image: "/art_04.jpg", name: "LIMITLESS #003" },
//     { image: "/art_05.jpg", name: "LIMITLESS #004" },
//   ];

//   return (
//     <section className="py-20">
//       <div className="container">
//         <div className="text-center mb-16">
//           <span className="badge badge-primary mb-4">Collection</span>
//           <h2 className="section-title">
//             Explore <span>NFTs</span>
//           </h2>
//           <p className="text-gray-400 max-w-2xl mx-auto">
//             Each NFT gives you lifetime daily token rewards. Own more, earn
//             more!
//           </p>
//         </div>

//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
//           {nfts.map((nft, index) => (
//             <div
//               key={index}
//               className="nerko-card p-4 hover-lift animate-fade-in-up"
//               style={{ animationDelay: `${index * 100}ms` }}
//             >
//               <div className="relative rounded-2xl overflow-hidden mb-4">
//                 <img
//                   src={nft.image}
//                   alt={nft.name}
//                   className="w-full aspect-square object-cover"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
//                   <Link
//                     to="/buy"
//                     className="btn btn-gradient text-sm py-2 px-4"
//                   >
//                     Buy Now
//                   </Link>
//                 </div>
//               </div>
//               <h3 className="font-bold">{nft.name}</h3>
//               <div className="flex justify-between items-center mt-2">
//                 <span className="text-gray-400 text-sm">Price</span>
//                 <span className="font-bold text-purple-400">$100</span>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="text-center mt-12">
//           <Link to="/buy" className="btn btn-gradient btn-gradient-lg">
//             View All & Buy
//             <svg
//               className="ml-2 w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M13 7l5 5m0 0l-5 5m5-5H6"
//               />
//             </svg>
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// };

// Commission Structure Section
const CommissionSection: React.FC = () => {
  const levels = [
    { level: 1, commission: "$10", description: "Direct Referral" },
    { level: 2, commission: "$5", description: "2nd Generation" },
    { level: 3, commission: "$4", description: "3rd Generation" },
    { level: 4, commission: "$3", description: "4th Generation" },
    { level: 5, commission: "$2", description: "5th Generation" },
    { level: 6, commission: "$1", description: "6th Generation" },
  ];

  return (
    <section className="py-20 bg-white/[0.02]">
      <div className="container">
        <div className="text-center mb-16">
          <span className="badge badge-primary mb-4">Referral Program</span>
          <h2 className="section-title">
            Earn <span>$25</span> Per Sale
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Build your team and earn passive income through our 6-level referral
            system
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
          {levels.map((level, index) => (
            <div
              key={index}
              className="nerko-card text-center hover-lift animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold
                ${
                  index === 0
                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                    : index === 1
                      ? "bg-blue-600"
                      : index === 2
                        ? "bg-green-600"
                        : index === 3
                          ? "bg-yellow-600"
                          : index === 4
                            ? "bg-orange-600"
                            : "bg-red-600"
                }`}
              >
                L{level.level}
              </div>
              <div className="text-3xl font-bold gradient-text mb-2">
                {level.commission}
              </div>
              <p className="text-gray-400 text-sm">{level.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 nerko-card max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Start Building Your Team
              </h3>
              <p className="text-gray-400">
                Get your referral link and start earning today
              </p>
            </div>
            <Link to="/team" className="btn btn-gradient">
              My Referral Link
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
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

// FAQ Section
const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const faqs = [
    {
      question: "What is LIMITLESS?",
      answer:
        "LIMITLESS is a DeFi NFT platform on BSC where you can purchase NFTs that earn you daily token rewards forever. Each NFT costs $100 USDT and generates 1 LIMITLESS token per day.",
    },
    {
      question: "How do I earn daily rewards?",
      answer:
        "Simply hold NFTs in your wallet. Each NFT earns 1 LIMITLESS token per day. You can claim your accumulated rewards anytime from the My Tokens page.",
    },
    {
      question: "How does the referral system work?",
      answer:
        "When someone purchases an NFT using your referral link, $25 from their purchase is distributed across 6 levels: $10 to L1, $5 to L2, $4 to L3, $3 to L4, $2 to L5, and $1 to L6.",
    },
    {
      question: "What can I do with LIMITLESS tokens?",
      answer:
        "You can burn (redeem) your LIMITLESS tokens for USDT from the liquidity pool at the current token price, or hold them as the value grows with the ecosystem.",
    },
    {
      question: "Is this safe and audited?",
      answer:
        "Yes, our smart contracts are deployed on BSC (Binance Smart Chain) and follow industry best practices. The liquidity pool is transparent and on-chain.",
    },
  ];

  return (
    <section className="py-20">
      <div className="container max-w-4xl">
        <div className="text-center mb-16">
          <span className="badge badge-primary mb-4">FAQ</span>
          <h2 className="section-title">
            Frequently <span>Asked</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="nerko-card cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg pr-4">{faq.question}</h3>
                <div
                  className={`w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                >
                  <svg
                    className="w-5 h-5 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              {openIndex === index && (
                <p className="text-gray-400 mt-4 pt-4 border-t border-white/10">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/20 p-12 md:p-16 text-center">
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/30 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Go <span className="gradient-text">LIMITLESS</span>?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of users earning daily rewards. Start your journey
              today with just $100 USDT.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/buy" className="btn btn-gradient btn-gradient-lg">
                Buy NFT Now
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
              </Link>
              <Link to="/team" className="btn btn-outline">
                Join Referral Program
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Main Landing Component
const Landing: React.FC = () => {
  return (
    <main>
      {/* Banner - fixed to viewport top so it sits behind transparent header */}
      <div className="fixed w-full h-screen pointer-events-none z-0 left-0 top-0">
        <div
          className="absolute bg-[50%_50%] bg-no-repeat bg-cover opacity-10 inset-0"
          style={{
            backgroundImage: 'url("/gradient_bg01.png")',
          }}
        />
      </div>

      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <FeaturesSection />
      {/* <CollectionSection /> */}
      <CommissionSection />
      <FAQSection />
      <CTASection />
    </main>
  );
};

export default Landing;
