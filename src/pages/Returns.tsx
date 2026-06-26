import React from 'react';

const Returns = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-8 md:px-16 max-w-[1000px] mx-auto">
      <h1 className="font-editorial text-5xl md:text-7xl mb-8">Returns & Exchanges</h1>
      <div className="space-y-8 text-[--c-stone] font-light leading-relaxed">
        <section>
          <h2 className="text-2xl text-[--c-ivory] mb-4">Our Return Policy</h2>
          <p>
            We accept returns within 14 days of delivery. To be eligible for a return, your item must be unused,
            in the same condition that you received it, and in its original packaging with all tags attached.
          </p>
        </section>
        <section>
          <h2 className="text-2xl text-[--c-ivory] mb-4">Non-Returnable Items</h2>
          <p>
            Certain types of items cannot be returned, including intimate apparel, earrings (for hygiene reasons),
            custom products, and final sale items.
          </p>
        </section>
        <section>
          <h2 className="text-2xl text-[--c-ivory] mb-4">Refund Process</h2>
          <p>
            Once your return is received and inspected, we will notify you of the approval or rejection of your refund.
            If approved, a credit will automatically be applied to your original method of payment within 5-7 business days.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Returns;
