import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-8 md:px-16 max-w-[1000px] mx-auto">
      <h1 className="font-editorial text-5xl md:text-7xl mb-8">Shipping Policy</h1>
      <div className="space-y-8 text-[--c-stone] font-light leading-relaxed">
        <section>
          <h2 className="text-2xl text-[--c-ivory] mb-4">Processing Time</h2>
          <p>
            All orders are processed within 1-3 business days. Orders are not shipped or delivered on weekends or holidays.
            If we are experiencing a high volume of orders, shipments may be delayed by a few days.
          </p>
        </section>
        <section>
          <h2 className="text-2xl text-[--c-ivory] mb-4">Shipping Rates & Delivery Estimates</h2>
          <p>
            Shipping charges for your order will be calculated and displayed at checkout.
            Delivery delays can occasionally occur, especially during peak seasons or due to unforeseen circumstances.
          </p>
        </section>
        <section>
          <h2 className="text-2xl text-[--c-ivory] mb-4">International Shipping</h2>
          <p>
            We currently ship worldwide. Please note that international shipments may be subject to customs duties and taxes,
            which are the responsibility of the customer.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ShippingPolicy;
