import React from 'react';

export const Terms = () => {
  const terms = [
    {
      title: "Introduction",
      content: "By accessing or purchasing from Slow Fashion Society, you agree to comply with these Terms & Conditions. Please read carefully before placing an order."
    },
    {
      title: "Nature of Products",
      content: "All items are preloved, thrifted, vintage, or upcycled unless stated otherwise. Minor signs of wear may be present. Major flaws (if any) will be clearly mentioned in the description."
    },
    {
      title: "Product Representation",
      content: "Product colors may slightly vary due to lighting and screen differences. Measurements are approximate. Customers are advised to check size details carefully before purchase."
    },
    {
      title: "Single Stock Policy",
      content: "Most products are one-of-a-kind pieces. Once sold, they will not be restocked. Adding to cart does not reserve the item."
    },
    {
      title: "Pricing",
      content: "All prices are listed in INR. Slow Fashion Society reserves the right to update pricing without prior notice. Shipping charges (if applicable) are calculated at checkout."
    },
    {
      title: "Payments",
      content: "Orders are confirmed only after successful payment. Accepted payment methods include UPI, Debit/Credit Cards, and Online Payment Gateways. No Cash on Delivery (if applicable)."
    },
    {
      title: "Order Processing",
      content: "Orders are processed within 2–4 business days unless stated otherwise. Customers will receive shipping confirmation once dispatched."
    },
    {
      title: "Shipping",
      content: "Delivery timelines depend on courier partners. Slow Fashion Society is not responsible for courier delays. Customers must provide accurate shipping details."
    },
    {
      title: "Returns & Exchanges",
      content: "Due to the nature of thrifted items, all sales are final. Returns are accepted only if the wrong item was shipped or major undisclosed damage is proven with unboxing video within 48 hours of delivery."
    },
    {
      title: "Non-Returnable Conditions",
      content: "No returns for size issues, minor wear, change of mind, or incorrect expectations. Please review product descriptions carefully before purchasing."
    },
    {
      title: "Cancellations",
      content: "Orders cannot be cancelled once shipped. Slow Fashion Society reserves the right to cancel orders due to suspicious activity, stock errors, or payment issues."
    },
    {
      title: "Intellectual Property",
      content: "All website content including logos, images, product photography, graphics, and branding belongs to Slow Fashion Society and may not be reused without written permission."
    },
    {
      title: "Limitation of Liability",
      content: "Slow Fashion Society is not liable for indirect damages, improper garment care, allergic reactions to materials, or courier delays."
    },
    {
      title: "Governing Law",
      content: "These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the jurisdiction of Mumbai courts."
    },
    {
      title: "Policy Updates",
      content: "Slow Fashion Society reserves the right to update these Terms & Conditions at any time without prior notice."
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight mb-8" data-testid="terms-title">
          Terms & Conditions
        </h1>
        <p className="text-lg text-muted-foreground mb-12">
          Last updated: January 2026
        </p>

        <div className="space-y-8">
          {terms.map((term, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
              <h2 className="font-heading text-xl font-medium mb-3">
                {idx + 1}. {term.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {term.content}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-primary/5 rounded-xl border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <strong>Note on Shipment & Replacement:</strong> For any issues related to shipment or product replacement, please contact our support team within 48 hours of delivery with unboxing video proof. Email: support@slowfashionsociety.com
          </p>
        </div>
      </div>
    </div>
  );
};