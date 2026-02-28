import React from 'react';
import { Mail, MessageCircle, HelpCircle } from 'lucide-react';

export const Support = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight mb-12" data-testid="support-title">
          Support
        </h1>

        <div className="space-y-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
            <div className="flex gap-4 items-start">
              <Mail className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="font-heading text-xl font-medium mb-2">Email Support</h2>
                <p className="text-muted-foreground mb-2">Get in touch with our support team</p>
                <a href="mailto:support@slowfashionsociety.com" data-testid="email-link" className="text-primary hover:underline">
                  support@slowfashionsociety.com
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
            <div className="flex gap-4 items-start">
              <MessageCircle className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="font-heading text-xl font-medium mb-2">Live Chat</h2>
                <p className="text-muted-foreground mb-2">Available Monday - Friday, 9AM - 6PM EST</p>
                <button data-testid="chat-button" className="text-primary hover:underline">
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="font-heading text-3xl font-medium tracking-tight mb-8" data-testid="faq-title">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
              <h3 className="font-medium mb-2">How do I track my order?</h3>
              <p className="text-muted-foreground">
                You can track your order by visiting the "My Orders" page in your profile. You'll receive email updates at each stage of delivery.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
              <h3 className="font-medium mb-2">What is your return policy?</h3>
              <p className="text-muted-foreground">
                We accept returns within 14 days of delivery for items in their original condition. Please contact our support team to initiate a return.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
              <h3 className="font-medium mb-2">Are the items authentic?</h3>
              <p className="text-muted-foreground">
                Yes! Every item is carefully authenticated and inspected by our team before being listed. We guarantee the quality and authenticity of all our products.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
              <h3 className="font-medium mb-2">Do you ship internationally?</h3>
              <p className="text-muted-foreground">
                Currently, we ship within the United States. International shipping will be available soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};