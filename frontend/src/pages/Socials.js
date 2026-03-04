import React from 'react';
import { Instagram, Youtube } from 'lucide-react';
import { Button } from '../components/ui/button';

export const Socials = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight mb-4" data-testid="socials-title">
            Connect With Us
          </h1>
          <p className="text-lg text-muted-foreground">
            Join our community and stay updated with the latest drops and sustainable fashion tips
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="https://www.instagram.com/slowfashionsociety_/"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="instagram-card"
            className="bg-white rounded-xl p-8 shadow-sm border border-border/50 hover:shadow-md transition-shadow text-center group"
          >
            <Instagram className="h-16 w-16 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="font-heading text-2xl font-medium mb-2">Instagram</h2>
            <p className="text-muted-foreground mb-4">@slowfashionsociety_</p>
            <Button className="rounded-full" variant="outline">
              Follow Us
            </Button>
          </a>

          <a
            href="https://www.threads.com/@slowfashionsociety_"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="threads-card"
            className="bg-white rounded-xl p-8 shadow-sm border border-border/50 hover:shadow-md transition-shadow text-center group"
          >
            <svg className="h-16 w-16 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 14.476c-.518 2.069-2.043 3.648-4.045 4.191-2.003.543-4.133.094-5.664-1.192-1.531-1.286-2.263-3.234-1.945-5.176.318-1.942 1.566-3.605 3.314-4.422 1.749-.817 3.792-.689 5.425.34 1.633 1.03 2.637 2.805 2.666 4.716.002.146.003.291.003.437 0 1.828-.754 3.482-1.974 4.678-1.22 1.196-2.892 1.869-4.674 1.869-1.782 0-3.454-.673-4.674-1.869-1.22-1.196-1.974-2.85-1.974-4.678 0-3.314 2.686-6 6-6s6 2.686 6 6c0 .146-.001.291-.003.437z"/>
            </svg>
            <h2 className="font-heading text-2xl font-medium mb-2">Threads</h2>
            <p className="text-muted-foreground mb-4">@slowfashionsociety_</p>
            <Button className="rounded-full" variant="outline">
              Follow Us
            </Button>
          </a>

          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="youtube-card"
            className="bg-white rounded-xl p-8 shadow-sm border border-border/50 hover:shadow-md transition-shadow text-center group"
          >
            <Youtube className="h-16 w-16 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="font-heading text-2xl font-medium mb-2">YouTube</h2>
            <p className="text-muted-foreground mb-4">@slowfashionsociety</p>
            <Button className="rounded-full" variant="outline">
              Subscribe
            </Button>
          </a>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Tag us in your posts with</p>
          <p className="font-heading text-2xl text-primary">#SlowFashionSociety</p>
        </div>
      </div>
    </div>
  );
};