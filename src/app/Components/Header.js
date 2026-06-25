import React from 'react';

function Header({ title = 'Asset Summary', subtitle = 'Top 10 Devices' }) {
  return (
    <div className="relative flex items-center pt-6 pb-2 w-full overflow-hidden">

      <div className="flex items-center shrink-0">
        <img 
          src="/officemate_logo.png" 
          alt="Office Mate Logo" 
          className="h-14 w-auto object-contain"
        />
      </div>

      {/* === Vertical Divider === */}
      <div className="w-[1.5px] h-11 bg-gray-300 mx-3.5 shrink-0" />

      {/* === Title Block (Dynamic) === */}
      <div className="flex flex-col justify-center">
        <h1 className="m-0 text-[28px] font-extrabold text-[#1A1A2E] leading-tight tracking-tight">
          {title}
        </h1>
        <p className="m-0 mt-0.5 text-[16px] font-normal text-gray-500">
          {subtitle}
        </p>
      </div>

    </div>
  );
}

export default Header;