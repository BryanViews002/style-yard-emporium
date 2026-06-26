import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-8 md:px-16 max-w-[1000px] mx-auto">
      <h1 className="font-editorial text-5xl md:text-7xl mb-8 text-[--c-void]">About Us</h1>
      <div className="space-y-6 text-[--c-stone] font-light leading-relaxed">
        <h2 className="text-2xl text-[--c-void] mb-4">THE STYLE YARD</h2>
        <h3 className="text-xl text-[--c-void] mb-4">Wear It. Mean It.</h3>
        <p>Style is not decoration. It is a statement of presence, of intention, of who you are before you speak a single word.</p>
        <p>The Style Yard was created for individuals who see fashion as more than clothing. We curate pieces that help you express confidence, personality, and individuality without saying a word.</p>
        <p>Based in Lagos, Nigeria, The Style Yard offers carefully selected fashion pieces including ready-to-wear clothing, jewelry, bags, perfumes, and accessories, designed for people who want to stand out and make an impression.</p>
        <p>Our mission is simple: to provide quality, trend-conscious fashion that helps our customers look good, feel confident, and show up authentically wherever they go.</p>
        <p>Every item in our collection is chosen with our community in mind. Whether you’re dressing for everyday confidence, a special occasion, or simply expressing your unique style, we’re here to help you make a statement.</p>
        
        <h3 className="text-xl text-[--c-void] mt-8 mb-4">Why Shop With Us?</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Curated fashion-forward collections</li>
          <li>Secure online shopping experience</li>
          <li>Reliable customer support</li>
          <li>Nationwide delivery across Nigeria</li>
          <li>New arrivals added regularly</li>
        </ul>
        
        <p className="mt-8 italic text-[--c-void]">At The Style Yard, fashion is personal. It is confidence, identity, and self-expression.</p>
        <p className="text-lg text-[--c-void]">Wear It. Mean It.</p>
      </div>
    </div>
  );
};

export default About;
