import React from 'react';
import { Mail, Phone, Globe } from 'lucide-react';
import { getActiveOrg } from '../../lib/ninjaClient';

const orgBranding = {
  officemate: {
    logoAlt: "OfficeMate Logo",
    email: "contact@officemate.co.th",
    phone: "02-783-5555",
    website: "https://www.ofm.co.th",
    name: "OfficeMate"
  },
  tracthai: {
    logoAlt: "TracThai Logo",
    email: "sales@tracthai.com",
    phone: "02-101-9884",
    website: "www.tracthai.com",
    name: "TracThai"
  }
};

export default async function BackCoverPage() {
  const activeOrg = await getActiveOrg();
  const branding = orgBranding[activeOrg] || orgBranding.officemate;

  // Format current date: e.g. "24 Jun, 2026"
  const dateStr = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const yearStr = new Date().getFullYear();

  return (
    <div className="flex flex-col h-[1150px] w-[794px] overflow-hidden p-14 bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)] break-before-page bg-[url('/bg.jpg')] bg-cover bg-[position:40%_50%] bg-no-repeat mb-5 relative text-white font-sans">
      
      {/* Top Right Logos */}
      <div className="flex items-center justify-end gap-6 shrink-0 mt-2 mr-2">
        <img 
          src={`/org/${activeOrg}/cover_logo.png`} 
          alt={branding.logoAlt} 
          className="h-12 w-auto object-contain"
        />
        <img 
          src="/org/shared/ninjaone.png" 
          alt="NinjaOne Logo" 
          className="h-10 w-auto object-contain translate-y-1.5"
        />
      </div>

      {/* Center Thank You */}
      <div className="flex-1 flex items-center justify-center -mt-16">
        <div className="flex items-center gap-8">
          
          {/* Rotated Year */}
          <div className="text-[38px] translate-y-6 font-extrabold tracking-widest text-slate-100 select-none transform -rotate-90 origin-center leading-none w-16 text-center">
            {yearStr}
          </div>

          {/* Vertical Divider */}
          <div className="w-[2px] h-[110px] bg-white/70 shrink-0" />

          {/* Titles */}
          <div className="flex flex-col">
            <h1 className="text-[76px] font-black text-white leading-none tracking-tight select-none">
              Thank You
            </h1>
            <h2 className="text-[34px] font-semibold text-slate-100/90 mt-3 select-none leading-none">
              for Your Attention
            </h2>
          </div>

        </div>
      </div>

      {/* Bottom Right Contacts & Date */}
      <div className="flex flex-col items-end shrink-0 select-none">
        
        {/* Contact list aligned to left inside a right-aligned container */}
        <div className="flex flex-col items-start gap-5 mb-13 mr-5">
          
          {/* Email */}
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1A1A2E] shrink-0 shadow-md">
              <Mail className="h-4 w-4" />
            </div>
            <span className="text-[15px] text-slate-100">
              {branding.email}
            </span>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1A1A2E] shrink-0 shadow-md">
              <Phone className="h-4 w-4" />
            </div>
            <span className="text-[15px] text-slate-100">
              {branding.phone}
            </span>
          </div>

          {/* Website */}
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1A1A2E] shrink-0 shadow-md">
              <Globe className="h-4 w-4" />
            </div>
            <span className="text-[15px] text-slate-100">
              {branding.website}
            </span>
          </div>

        </div>
        
        {/* Date */}
        <div className="font-bold text-slate-100 text-lg tracking-wide mr-4 mb-2">
          {dateStr}
        </div>

      </div>

    </div>
  );
}
