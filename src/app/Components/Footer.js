import React from 'react';
import { Calendar } from 'lucide-react';

export default function Footer({ pageNumber }) {
  // Format current date dynamically: e.g., "24 Jun, 2026"
  const dateStr = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="mt-auto w-full pr-10 pb-3 flex items-center justify-between text-slate-600 text-xs shrink-0 select-none">
      {/* Calendar Icon + Date */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
        <span className="font-semibold text-slate-700">{dateStr}</span>
      </div>

      {/* Horizontal Divider */}
      <div className="flex-1 border-t border-gray-200 mx-4" />

      {/* Page Number Badge */}
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 font-bold text-white text-[11px] shadow-sm">
        {pageNumber}
      </div>
    </div>
  );
}
