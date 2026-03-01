import React from 'react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 md:py-32 bg-secondary">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <p className="text-sm uppercase tracking-widest font-bold text-muted-foreground mb-4">About Us</p>
          <h1 className="font-heading text-5xl md:text-7xl font-light tracking-tight mb-6" data-testid="about-title">
            Slow Fashion Society
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Fashion should live longer, not faster.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1769107805528-964f4de0e342?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Sustainable Fashion"
                className="rounded-2xl shadow-lg"
              />
            </div>
            <div>
              <h2 className="font-heading text-4xl md:text-5xl font-medium tracking-tight mb-6">
                Our Story
              </h2>
              <p className="text-lg leading-relaxed mb-6">
                Slow Fashion Society was created with a simple belief: fashion should live longer, not faster.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                We curate preloved, vintage, and brand-new fashion pieces that align with our philosophy of slow, intentional style. In a world driven by fast trends, we choose to slow down.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                Every item at Slow Fashion Society is handpicked. No mass drops. No trend chasing. Just thoughtful curation.
              </p>
              <p className="text-lg leading-relaxed mb-8 font-medium text-primary">
                Welcome to the Society.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-32 bg-secondary">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-medium tracking-tight" data-testid="values-title">
              Our Values
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="font-heading text-2xl font-medium mb-4">Sustainability</h3>
              <p className="text-muted-foreground">
                Every purchase reduces fashion waste and extends the life of quality garments.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="font-heading text-2xl font-medium mb-4">Quality</h3>
              <p className="text-muted-foreground">
                Each piece is carefully inspected and selected for its craftsmanship.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="font-heading text-2xl font-medium mb-4">Uniqueness</h3>
              <p className="text-muted-foreground">
                Express your individual style with one-of-a-kind pieces that tell a story.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-medium tracking-tight mb-6">
            Join Our Community
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover unique fashion pieces and be part of the sustainable fashion movement.
          </p>
          <Button onClick={() => navigate('/shop')} data-testid="shop-now-button" className="rounded-full px-8 py-6 text-lg">
            Shop Now
          </Button>
        </div>
      </section>
    </div>
  );
};