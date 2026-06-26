import React from 'react';

const Returns = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-8 md:px-16 max-w-[1000px] mx-auto">
      <h1 className="font-editorial text-5xl md:text-7xl mb-8 text-[--c-void]">Return & Refund Policy</h1>
      <p className="text-sm text-[--c-warmgray] mb-8">Last Updated: June 2026</p>
      
      <div className="space-y-8 text-[--c-stone] font-light leading-relaxed">
        <p>At The Style Yard, customer satisfaction is important to us. Due to the nature of fashion and personal-use products, the following return policy applies.</p>
        
        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Eligibility for Returns</h2>
          <p className="mb-2">Returns may be accepted within 3 days of delivery only if:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>The item received is damaged upon delivery</li>
            <li>The wrong item was shipped</li>
            <li>The item has a manufacturing defect</li>
          </ul>
          
          <p className="mb-2">To qualify for a return:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The item must be unused, unworn, unwashed, and in its original condition</li>
            <li>Original tags and packaging must be intact</li>
            <li>Proof of purchase must be provided</li>
            <li>Clear photos or videos of the issue must be submitted</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Non-Returnable Items</h2>
          <p className="mb-2">For hygiene and safety reasons, the following items cannot be returned or exchanged except where required by applicable law:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Perfumes that have been opened or used</li>
            <li>Earrings and certain jewelry items</li>
            <li>Sale, clearance, or discounted items</li>
            <li>Gift cards</li>
            <li>Items showing signs of wear, alteration, washing, or misuse</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Size-Related Issues</h2>
          <p>Customers are encouraged to review the Size Guide before placing an order. Returns or refunds will generally not be approved for incorrect size selection by the customer unless otherwise stated by The Style Yard.</p>
        </section>
        
        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Refunds</h2>
          <p>Where a return is approved, refunds may be issued through the original payment method or as store credit at the discretion of The Style Yard. Original shipping charges are non-refundable except where the error was caused by The Style Yard.</p>
        </section>
        
        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Return Shipping Costs</h2>
          <p>Customers are responsible for return shipping costs unless the return results from an error made by The Style Yard.</p>
        </section>
        
        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Inspection and Approval</h2>
          <p>All returned items are subject to inspection upon receipt. The Style Yard reserves the right to deny any return or refund request that does not comply with this policy.</p>
        </section>
        
        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Policy Changes</h2>
          <p>The Style Yard reserves the right to modify this policy at any time without prior notice. Updates will be posted on this page.</p>
        </section>
        
        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Contact Us</h2>
          <p>To initiate a return request, please contact our customer support team within 3 days of receiving your order.</p>
        </section>
      </div>
    </div>
  );
};

export default Returns;
