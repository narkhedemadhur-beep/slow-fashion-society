import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-accent-charcoal text-secondary py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-heading text-3xl font-light mb-4">Slow Fashion Society</h3>
            <p className="text-sm leading-relaxed text-secondary/80 mb-6">
              Curating unique, sustainable, and timeless fashion pieces that tell a story. Each item is carefully selected to bring you the best of vintage and thrifted fashion.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" data-testid="instagram-link" className="hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://threads.net" target="_blank" rel="noopener noreferrer" data-testid="threads-link" className="hover:text-primary transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 14.476c-.518 2.069-2.043 3.648-4.045 4.191-2.003.543-4.133.094-5.664-1.192-1.531-1.286-2.263-3.234-1.945-5.176.318-1.942 1.566-3.605 3.314-4.422 1.749-.817 3.792-.689 5.425.34 1.633 1.03 2.637 2.805 2.666 4.716.002.146.003.291.003.437 0 1.828-.754 3.482-1.974 4.678-1.22 1.196-2.892 1.869-4.674 1.869-1.782 0-3.454-.673-4.674-1.869-1.22-1.196-1.974-2.85-1.974-4.678 0-3.314 2.686-6 6-6s6 2.686 6 6c0 .146-.001.291-.003.437z"/>
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" data-testid="youtube-link" className="hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body text-sm uppercase tracking-widest font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-primary transition-colors">Shop</Link></li>
              <li><Link to="/new-arrivals" className="hover:text-primary transition-colors">New Arrivals</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/feedback" className="hover:text-primary transition-colors">Feedback</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-body text-sm uppercase tracking-widest font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/support" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/socials" className="hover:text-primary transition-colors">Connect With Us</Link></li>
              <li><Link to="/orders" className="hover:text-primary transition-colors">Track Order</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary/20 mt-12 pt-8 text-center text-sm text-secondary/60">
          <p>© 2026 Slow Fashion Society. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};