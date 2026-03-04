import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Sparkles, TrendingUp, Users, Zap } from 'lucide-react';

export const GenZ = () => {
  const navigate = useNavigate();

  const trends = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Vintage Vibes",
      description: "Curated Y2K and 90s pieces that define your aesthetic",
      link: "/category/vintage-vibes"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Trending Now",
      description: "What's hot in sustainable fashion right now",
      link: "/category/trending-now"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community First",
      description: "Join thousands styling their way to sustainability",
      link: "/category/community-first"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Fast Drops",
      description: "New drops every week. Blink and you'll miss it",
      link: "/category/fast-drops"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 opacity-90" />
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1633194288700-ff1001c3b2a6?crop=entropy&cs=srgb&fm=jpg&q=85)',
          }}
        />
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium uppercase tracking-wider animate-pulse">
            ✨ Gen Z Exclusive
          </div>
          <h1 className="font-heading text-6xl md:text-8xl font-bold tracking-tight leading-none text-white mb-6 drop-shadow-2xl" data-testid="genz-hero-title">
            Your Vibe.
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              Your Style.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-8 font-medium drop-shadow-lg">
            Thrift smarter. Style bolder. Be iconic.
          </p>
          <Button 
            onClick={() => navigate('/category/gen-z')} 
            data-testid="genz-shop-button"
            className="rounded-full bg-white text-purple-600 hover:bg-white/90 px-10 py-6 text-lg font-bold transition-all shadow-2xl hover:shadow-3xl hover:scale-105 transform"
          >
            Shop The Vibe
          </Button>
        </div>
      </section>

      {/* Trend Cards */}
      <section className="py-24 bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl md:text-6xl font-bold tracking-tight mb-4" data-testid="trends-title">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Why We're Different
              </span>
            </h2>
            <p className="text-xl text-gray-600">No cap, we're actually sustainable</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trends.map((trend, idx) => (
              <div
                key={idx}
                onClick={() => navigate(trend.link)}
                className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-purple-300 cursor-pointer"
                data-testid={`trend-card-${idx}`}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  {trend.icon}
                </div>
                <h3 className="font-heading text-2xl font-bold mb-3">{trend.title}</h3>
                <p className="text-gray-600">{trend.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="font-heading text-5xl md:text-6xl font-bold mb-6" data-testid="culture-title">
                Style That Speaks
              </h2>
              <p className="text-xl md:text-2xl mb-6 leading-relaxed">
                Every piece tells a story. Every fit is a statement. This isn't just fashion, it's a movement.
              </p>
              <p className="text-lg mb-8 opacity-90">
                Join the community redefining sustainable style. No gatekeeping, just good vibes and even better fits.
              </p>
              <Button 
                onClick={() => navigate('/socials')} 
                data-testid="join-community-button"
                className="rounded-full bg-white text-purple-600 hover:bg-white/90 px-8 py-6 text-lg font-bold transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform"
              >
                Join the Squad
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square rounded-3xl bg-white/10 backdrop-blur-lg border-2 border-white/20 hover:scale-105 transition-transform" />
              <div className="aspect-square rounded-3xl bg-white/10 backdrop-blur-lg border-2 border-white/20 hover:scale-105 transition-transform mt-8" />
              <div className="aspect-square rounded-3xl bg-white/10 backdrop-blur-lg border-2 border-white/20 hover:scale-105 transition-transform -mt-8" />
              <div className="aspect-square rounded-3xl bg-white/10 backdrop-blur-lg border-2 border-white/20 hover:scale-105 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50" />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <h2 className="font-heading text-6xl md:text-7xl font-bold mb-8" data-testid="final-cta-title">
            Ready to Slay?
          </h2>
          <p className="text-2xl mb-12 opacity-90">
            Your next iconic fit is waiting
          </p>
          <Button 
            onClick={() => navigate('/new-arrivals')} 
            data-testid="new-arrivals-button"
            className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-8 text-xl font-bold transition-all shadow-2xl hover:shadow-3xl hover:scale-110 transform"
          >
            Shop New Drops
          </Button>
        </div>
      </section>
    </div>
  );
};