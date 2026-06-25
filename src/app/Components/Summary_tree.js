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
    // จุดสำคัญที่แก้ไข: เปลี่ยนจาก w-[145px] เป็น flex-1 min-w-[145px]
    <div className="flex-1 min-w-[145px] max-w-full h-[127px] rounded-lg border border-gray-200 bg-white p-3 shadow-sm flex flex-col shrink-0">
      
      <div className="flex-1 flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center ${iconBg} shrink-0`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>

        <div className="flex flex-col min-w-0 w-full">
          <div className="text-[24px] font-bold leading-none text-slate-900 truncate">
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
// Summary Component
// =========================
const Summary = ({
  mainStats = [],
}) => {
  return (
    // เพิ่ม w-full ให้กล่องแม่กางเต็มที่
    <div className="flex w-full pr-10 gap-3 items-start flex-wrap">
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
  );
};

export default Summary;