import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-8 md:px-16 max-w-[1000px] mx-auto">
      <h1 className="font-editorial text-5xl md:text-7xl mb-8 text-[--c-void]">Shipping Policy</h1>
      <p className="text-sm text-[--c-warmgray] mb-8">Last Updated: June 2026</p>
      
      <div className="space-y-8 text-[--c-stone] font-light leading-relaxed">
        <p>Thank you for shopping with The Style Yard.</p>
        
        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Order Processing</h2>
          <p>All orders are processed within 1 to 3 business days after payment confirmation. Orders placed on weekends or public holidays may be processed on the next business day.</p>
        </section>
        
        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Shipping Time</h2>
          <p className="mb-2">Estimated delivery timelines are:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Lagos: 1 to 3 business days</li>
            <li>Other Nigerian States: 2 to 7 business days</li>
            <li>International Orders (if available): Delivery times vary by destination</li>
          </ul>
          <p>Please note that delivery timelines are estimates and are not guaranteed.</p>
        </section>
        
        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Shipping Fees</h2>
          <p>Shipping charges are calculated and displayed during checkout before payment is completed.</p>
        </section>
        
        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Order Tracking</h2>
          <p>Where tracking is available, customers will receive tracking information after the order has been dispatched.</p>
        </section>
        
        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Delivery Delays</h2>
          <p>The Style Yard is not responsible for delays caused by courier services, weather conditions, public holidays, security situations, incorrect shipping information provided by customers, or other circumstances beyond our reasonable control.</p>
        </section>
        
        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Incorrect Addresses</h2>
          <p>Customers are responsible for providing accurate delivery information. Additional shipping fees may apply if an order needs to be resent due to incorrect or incomplete address details.</p>
        </section>
        
        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Lost or Stolen Packages</h2>
          <p>Once an order has been delivered to the address provided by the customer and marked as delivered by the courier, The Style Yard shall not be liable for loss, theft, or damage occurring thereafter.</p>
        </section>
        
        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Order Changes</h2>
          <p>Requests to modify shipping details must be submitted before the order is dispatched. Once an order has been shipped, modifications may not be possible.</p>
        </section>
        
        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Contact Us</h2>
          <p>For shipping-related questions, please contact our customer support team through the contact information provided on our website.</p>
        </section>
      </div>
    </div>
  );
};

export default ShippingPolicy;
