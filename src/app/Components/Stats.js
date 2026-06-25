import React from "react";

// =========================
// Main Card
// =========================
const StatMain = ({
  value,
  label,
  icon: Icon,
  iconBg,
  iconColor,
  barColor,
}) => {
  return (
    // 1. เอา justify-between ออก เพื่อไม่ให้มันดันเนื้อหาไปติดขอบบนสุด
    <div className="w-[145px] h-full rounded-lg border border-gray-200 bg-white p-3 shadow-sm flex flex-col shrink-0">
      
      {/* 2. เติม flex-1 เพื่อให้คลุมพื้นที่ว่างตรงกลางทั้งหมด และเอา mt-1 ออก เนื้อหาจะถูกจัดกึ่งกลางแนวตั้งพอดี */}
      <div className="flex-1 flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center ${iconBg} shrink-0`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>

        <div className="flex flex-col min-w-0 w-full">
          <div 
            className={`font-bold text-slate-900 leading-tight break-words ${
              typeof value === 'string' && value.length > 5
                ? value.length > 10 ? 'text-[12px]' : 'text-[14px]'
                : 'text-[24px]'
            }`}
          >
            {value}
          </div>
          <div className="text-[10.5px] text-slate-500 mt-1.5 truncate">
            {label}
          </div>
        </div>
      </div>


    </div>
  );
};

// =========================
// Small Card
// =========================
const StatCell = ({
  value,
  label,
  icon: Icon,
  iconColor,
}) => {
  return (
    <div className="h-[59px] rounded-lg border border-gray-200 bg-white shadow-sm p-2 flex items-center gap-1.5 overflow-hidden">
      <div className="flex items-center justify-center shrink-0 w-6">
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-w-0">
        <div className="text-[14px] font-bold leading-none text-slate-900 truncate w-full text-center">
          {value}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5 truncate w-full text-center">
          {label}
        </div>
      </div>
    </div>
  );
};

// =========================
// Summary Component
// =========================
const Summary = ({
  mainStats = [],
  subStats = [],
}) => {
  return (
    <div className="flex w-full h-full pr-10 gap-3 items-start">
      
      {/* Left - กล่องใหญ่ 2 กล่อง */}
      <div className="flex flex-row gap-3 shrink-0 h-full">
        {mainStats.map((item, index) => (
          <StatMain
            key={item.id || index}
            value={item.value}
            label={item.label}
            icon={item.icon}
            iconBg={item.iconBg}
            iconColor={item.iconColor}
            barColor={item.barColor}
          />
        ))}
      </div>

      {/* Right - กล่องเล็ก 8 กล่อง */}
      <div className="grid flex-1 grid-cols-4 gap-x-2 gap-y-2">
        {subStats.map((item, index) => (
          <StatCell
            key={item.id || index}
            value={item.value}
            label={item.label}
            icon={item.icon}
            iconColor={item.iconColor}
          />
        ))}
      </div>

    </div>
  );
};

export default Summary;