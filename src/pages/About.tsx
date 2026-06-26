import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-8 md:px-16 max-w-[1000px] mx-auto">
      <h1 className="font-editorial text-5xl md:text-7xl mb-8">About Us</h1>
      <div className="space-y-6 text-[--c-stone] font-light leading-relaxed">
        <p>
          Welcome to The Style Yard, your premier fashion house located in the heart of Lagos.
          Established in 2024, we aim to redefine luxury and elegance through our curated collections
          of clothes, jewelry, bags, and perfumes.
        </p>
        <p>
          Our mission is to empower individuals to express their unique identities and feel confident
          in every piece they wear. Every item in our store is carefully selected to guarantee the highest
          quality and most refined aesthetics.
        </p>
        <p>
          Join us on a journey of style and sophistication.
        </p>
      </div>
    </div>
  );
};

export default About;
