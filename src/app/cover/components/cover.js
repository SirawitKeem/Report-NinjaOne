import React from 'react';

export default function CoverPage() {
  // Format current date: e.g. "24 Jun, 2026"
  const dateStr = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const yearStr = new Date().getFullYear();

  return (
    <div className="flex flex-col h-[1150px] w-[794px] overflow-hidden p-14 bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)] break-before-page bg-[url('/bg.jpg')] bg-cover bg-[position:40%_50%] bg-no-repeat mt-5 mb-5 relative text-white font-sans">
      
      {/* Top Right Logos (OfficeMate and NinjaOne, no Power BI) */}
      <div className="flex items-center justify-end gap-6 shrink-0 mt-2 mr-2">
        <img 
          src="/ofm.png" 
          alt="OfficeMate Logo" 
          className="h-12 w-auto object-contain"
        />
        <img 
          src="/ninjaone.png" 
          alt="NinjaOne Logo" 
          className="h-10 w-auto object-contain translate-y-1.5 "
        />
      </div>

      {/* Center Titles & rotated year */}
      <div className="flex-1 flex items-center justify-center -mt-16">
        <div className="flex items-center gap-8">
          
          {/* Rotated Year */}
          <div className="text-[38px] translate-y-6 font-extrabold tracking-widest text-slate-100 select-none transform -rotate-90 origin-center leading-none w-16 text-center">
            {yearStr}
          </div>

          {/* Vertical Divider */}
          <div className="w-[2px] h-[110px] bg-white/80 shrink-0" />

          {/* Titles */}
          <div className="flex flex-col">
            <h1 className="text-[76px] font-black text-white leading-none tracking-tight select-none">
              NinjaOne
            </h1>
            <h2 className="text-[34px] font-semibold text-slate-100/90 mt-3 select-none leading-none">
              Asset Summary
            </h2>
          </div>

        </div>
      </div>

      {/* Bottom Right Date */}
      <div className="flex items-center justify-end font-bold text-slate-100 text-lg tracking-wide select-none mb-2 mr-4">
        {dateStr}
      </div>

    </div>
  );
}
