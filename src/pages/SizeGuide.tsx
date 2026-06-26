import React from 'react';

const SizeGuide = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-8 md:px-16 max-w-[1000px] mx-auto">
      <h1 className="font-editorial text-5xl md:text-7xl mb-8">Size Guide</h1>
      <div className="space-y-8 text-[--c-stone] font-light leading-relaxed">
        <p>
          Use the chart below to find your perfect fit. If you're on the borderline between two sizes,
          order the smaller size for a tighter fit or the larger size for a looser fit.
        </p>

        <div className="overflow-x-auto mt-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.1)] text-[--c-ivory]">
                <th className="py-4 px-4 font-medium">Size</th>
                <th className="py-4 px-4 font-medium">Bust (cm)</th>
                <th className="py-4 px-4 font-medium">Waist (cm)</th>
                <th className="py-4 px-4 font-medium">Hips (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[rgba(255,255,255,0.05)]">
                <td className="py-4 px-4">XS</td>
                <td className="py-4 px-4">82</td>
                <td className="py-4 px-4">62</td>
                <td className="py-4 px-4">90</td>
              </tr>
              <tr className="border-b border-[rgba(255,255,255,0.05)]">
                <td className="py-4 px-4">S</td>
                <td className="py-4 px-4">86</td>
                <td className="py-4 px-4">66</td>
                <td className="py-4 px-4">94</td>
              </tr>
              <tr className="border-b border-[rgba(255,255,255,0.05)]">
                <td className="py-4 px-4">M</td>
                <td className="py-4 px-4">90</td>
                <td className="py-4 px-4">70</td>
                <td className="py-4 px-4">98</td>
              </tr>
              <tr className="border-b border-[rgba(255,255,255,0.05)]">
                <td className="py-4 px-4">L</td>
                <td className="py-4 px-4">96</td>
                <td className="py-4 px-4">76</td>
                <td className="py-4 px-4">104</td>
              </tr>
              <tr className="border-b border-[rgba(255,255,255,0.05)]">
                <td className="py-4 px-4">XL</td>
                <td className="py-4 px-4">102</td>
                <td className="py-4 px-4">82</td>
                <td className="py-4 px-4">110</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <p className="mt-8 text-sm italic">
          Note: This guide provides general sizing information. Specific measurements may vary by product style.
        </p>
      </div>
    </div>
  );
};

export default SizeGuide;
