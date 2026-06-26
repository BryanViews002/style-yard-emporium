import React from 'react';

const SizeGuide = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-8 md:px-16 max-w-[1000px] mx-auto">
      <h1 className="font-editorial text-5xl md:text-7xl mb-8 text-[--c-void]">Size Guide</h1>
      <div className="space-y-8 text-[--c-stone] font-light leading-relaxed">
        <p>Finding the right fit is important. Use the chart below as a general guide before placing your order.</p>

        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">How to Measure</h2>
          <ul className="space-y-2">
            <li><strong className="text-[--c-void]">Bust:</strong> Measure around the fullest part of your bust while keeping the tape comfortably snug.</li>
            <li><strong className="text-[--c-void]">Waist:</strong> Measure around the narrowest part of your natural waist.</li>
            <li><strong className="text-[--c-void]">Hips:</strong> Measure around the fullest part of your hips.</li>
          </ul>
          <p className="mt-4">If your measurements fall between two sizes, we recommend choosing the larger size for a more comfortable fit.</p>
        </section>

        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Women's Clothing Size Chart</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-black/10">
              <thead>
                <tr className="border-b border-black/10 text-[--c-void] bg-black/5">
                  <th className="py-4 px-4 font-medium border-r border-black/10">Size</th>
                  <th className="py-4 px-4 font-medium border-r border-black/10">UK</th>
                  <th className="py-4 px-4 font-medium border-r border-black/10">US</th>
                  <th className="py-4 px-4 font-medium border-r border-black/10">Bust (cm)</th>
                  <th className="py-4 px-4 font-medium border-r border-black/10">Waist (cm)</th>
                  <th className="py-4 px-4 font-medium">Hips (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black/10"><td className="py-4 px-4 border-r border-black/10">XS</td><td className="py-4 px-4 border-r border-black/10">6</td><td className="py-4 px-4 border-r border-black/10">2</td><td className="py-4 px-4 border-r border-black/10">80-84</td><td className="py-4 px-4 border-r border-black/10">60-64</td><td className="py-4 px-4">86-90</td></tr>
                <tr className="border-b border-black/10"><td className="py-4 px-4 border-r border-black/10">S</td><td className="py-4 px-4 border-r border-black/10">8</td><td className="py-4 px-4 border-r border-black/10">4</td><td className="py-4 px-4 border-r border-black/10">84-88</td><td className="py-4 px-4 border-r border-black/10">64-68</td><td className="py-4 px-4">90-94</td></tr>
                <tr className="border-b border-black/10"><td className="py-4 px-4 border-r border-black/10">M</td><td className="py-4 px-4 border-r border-black/10">10</td><td className="py-4 px-4 border-r border-black/10">6</td><td className="py-4 px-4 border-r border-black/10">88-92</td><td className="py-4 px-4 border-r border-black/10">68-72</td><td className="py-4 px-4">94-98</td></tr>
                <tr className="border-b border-black/10"><td className="py-4 px-4 border-r border-black/10">L</td><td className="py-4 px-4 border-r border-black/10">12</td><td className="py-4 px-4 border-r border-black/10">8</td><td className="py-4 px-4 border-r border-black/10">92-97</td><td className="py-4 px-4 border-r border-black/10">72-77</td><td className="py-4 px-4">98-103</td></tr>
                <tr className="border-b border-black/10"><td className="py-4 px-4 border-r border-black/10">XL</td><td className="py-4 px-4 border-r border-black/10">14</td><td className="py-4 px-4 border-r border-black/10">10</td><td className="py-4 px-4 border-r border-black/10">97-103</td><td className="py-4 px-4 border-r border-black/10">77-83</td><td className="py-4 px-4">103-109</td></tr>
                <tr className="border-b border-black/10"><td className="py-4 px-4 border-r border-black/10">XXL</td><td className="py-4 px-4 border-r border-black/10">16</td><td className="py-4 px-4 border-r border-black/10">12</td><td className="py-4 px-4 border-r border-black/10">103-109</td><td className="py-4 px-4 border-r border-black/10">83-89</td><td className="py-4 px-4">109-115</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Men's Clothing Size Chart</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-black/10">
              <thead>
                <tr className="border-b border-black/10 text-[--c-void] bg-black/5">
                  <th className="py-4 px-4 font-medium border-r border-black/10">Size</th>
                  <th className="py-4 px-4 font-medium border-r border-black/10">Chest (cm)</th>
                  <th className="py-4 px-4 font-medium">Waist (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black/10"><td className="py-4 px-4 border-r border-black/10">S</td><td className="py-4 px-4 border-r border-black/10">88-94</td><td className="py-4 px-4">74-80</td></tr>
                <tr className="border-b border-black/10"><td className="py-4 px-4 border-r border-black/10">M</td><td className="py-4 px-4 border-r border-black/10">95-101</td><td className="py-4 px-4">81-87</td></tr>
                <tr className="border-b border-black/10"><td className="py-4 px-4 border-r border-black/10">L</td><td className="py-4 px-4 border-r border-black/10">102-108</td><td className="py-4 px-4">88-94</td></tr>
                <tr className="border-b border-black/10"><td className="py-4 px-4 border-r border-black/10">XL</td><td className="py-4 px-4 border-r border-black/10">109-115</td><td className="py-4 px-4">95-101</td></tr>
                <tr className="border-b border-black/10"><td className="py-4 px-4 border-r border-black/10">XXL</td><td className="py-4 px-4 border-r border-black/10">116-122</td><td className="py-4 px-4">102-108</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Shoe Size Conversion</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-black/10">
              <thead>
                <tr className="border-b border-black/10 text-[--c-void] bg-black/5">
                  <th className="py-4 px-4 font-medium border-r border-black/10">UK</th>
                  <th className="py-4 px-4 font-medium border-r border-black/10">EU</th>
                  <th className="py-4 px-4 font-medium border-r border-black/10">US (Women's)</th>
                  <th className="py-4 px-4 font-medium">Foot Length (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black/10"><td className="py-4 px-4 border-r border-black/10">3</td><td className="py-4 px-4 border-r border-black/10">36</td><td className="py-4 px-4 border-r border-black/10">5</td><td className="py-4 px-4">22.5</td></tr>
                <tr className="border-b border-black/10"><td className="py-4 px-4 border-r border-black/10">4</td><td className="py-4 px-4 border-r border-black/10">37</td><td className="py-4 px-4 border-r border-black/10">6</td><td className="py-4 px-4">23.0</td></tr>
                <tr className="border-b border-black/10"><td className="py-4 px-4 border-r border-black/10">5</td><td className="py-4 px-4 border-r border-black/10">38</td><td className="py-4 px-4 border-r border-black/10">7</td><td className="py-4 px-4">24.0</td></tr>
                <tr className="border-b border-black/10"><td className="py-4 px-4 border-r border-black/10">6</td><td className="py-4 px-4 border-r border-black/10">39</td><td className="py-4 px-4 border-r border-black/10">8</td><td className="py-4 px-4">24.5</td></tr>
                <tr className="border-b border-black/10"><td className="py-4 px-4 border-r border-black/10">7</td><td className="py-4 px-4 border-r border-black/10">40</td><td className="py-4 px-4 border-r border-black/10">9</td><td className="py-4 px-4">25.5</td></tr>
                <tr className="border-b border-black/10"><td className="py-4 px-4 border-r border-black/10">8</td><td className="py-4 px-4 border-r border-black/10">41</td><td className="py-4 px-4 border-r border-black/10">10</td><td className="py-4 px-4">26.0</td></tr>
                <tr className="border-b border-black/10"><td className="py-4 px-4 border-r border-black/10">9</td><td className="py-4 px-4 border-r border-black/10">42</td><td className="py-4 px-4 border-r border-black/10">11</td><td className="py-4 px-4">27.0</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl text-[--c-void] mb-4">Notes</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Measurements are provided as a general guide and may vary slightly depending on the product and manufacturer.</li>
            <li>Some items are designed for a slim, regular, or oversized fit. Please read the product description carefully before purchasing.</li>
            <li>If a product has a specific size chart, that chart takes precedence over this general guide.</li>
            <li>If you are unsure about your size, contact us before placing your order. We’ll be happy to help you choose the best fit.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default SizeGuide;
